/* Stop hook：收工前檢查文件是否已回填。
 *
 * 為什麼需要這支：文件分工規則寫在 AGENTS.md「收工前要回填文件」與 doc-sync skill，
 * 但規則只存在於文字裡，靠人（或 AI）在收工時記得 —— 這一定會漏。
 * 這支由 Claude Code 在每輪回答結束前執行，不依賴任何人記得。
 * (移植自 doc-system-kit。kit 版同時給 Codex CLI 用;本站只用 Claude Code,邏輯不變。)
 * 放在工具中立的 `.agents/hooks/`,由 .claude/settings.json 的 Stop hook 呼叫。
 *
 * 判斷很機械：觸發清單有異動 && 閘門檔沒異動 → 擋下並要求回填。
 * 拿 DEVLOG 當唯一閘門，是因為規則本身就要求「全部都要回這裡補一則」。
 *
 * 語意判斷（實作是否牴觸 DESIGN 規格）不在這裡做 —— 那要讀得懂文意，
 * 是 doc-sync skill 的工作；本檔只做「有沒有回填」這種比對得出來的事。
 */

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/* ══════════ 本站的設定,只需要改這一段 ══════════ */

/** 任一有異動就要求回填。順序即回報順序。結尾帶 `/` 視為目錄前綴。
 *  新增會影響網站行為的資料夾或設定檔時,記得加進來。 */
const TRIGGERS = [
  // 網站的程式、樣式、設定與 AI 代改的固定內容。
  // ⚠️ 刻意不含 source/_posts/:使用者自己發文不該被要求寫 DEVLOG。
  'scripts/',
  'source/css/',
  'source/js/',
  'source/_data/',
  'source/about/',
  'source/portfolio/',
  '_config.yml',
  '_config.fluid.yml',
  'package.json',
  '.github/',
  // 規格與文件、AI 守則本身
  'doc/DESIGN.md',
  'doc/TECH.md',
  'doc/WORKFLOW.md',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  '.agents/',
  '.claude/settings.json',
]

/** 閘門:這些**任一**有動就放行,全都沒動才擋。
 *  本站的 DEVLOG 沒有拆檔(時序紀錄直接加在 doc/DEVLOG.md 最上面),所以只有這一項。 */
const GATE = ['doc/DEVLOG.md']
/** 規格正本：出現在異動清單時多帶一段提醒。 */
const SPEC = 'doc/DESIGN.md'

/* ══════════════════ 以下不必改 ══════════════════ */

/** 檢查工具壞掉不該卡住工作 —— 任何意外都靜默放行。 */
function bail() {
  process.exit(0)
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

/** git status --porcelain 的一行 → 檔案路徑。
 *  前 3 字元是狀態碼；改名是 "R  old -> new"，要取右邊那個。 */
function pathOf(line) {
  let p = line.slice(3).trim()
  const arrow = p.indexOf(' -> ')
  if (arrow !== -1) p = p.slice(arrow + 4)
  return p.replace(/^"|"$/g, '')
}

let input
try {
  input = JSON.parse(readStdin())
} catch {
  bail()
}

// 迴圈守門：已經擋過一次就放行。
// Claude Code 連續擋 8 次會強制覆蓋本 hook，這行讓同一批變動只擋一次。
if (input.stop_hook_active === true) bail()

const root = input.cwd || process.cwd()

let changed
try {
  // -uall：未追蹤的目錄要展開成逐檔，否則整個 doc/ 只會是一行 "?? doc/"，抓不到 DEVLOG。
  // core.quotepath=false：否則非 ASCII 檔名會被跳脫成 \345\225\237... 比對不到。
  const out = execFileSync(
    'git',
    ['-c', 'core.quotepath=false', '-C', root, 'status', '--porcelain', '-uall'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
  )
  changed = out.split('\n').filter(Boolean).map(pathOf)
} catch {
  bail() // 不是 git repo、或 git 不在 PATH
}

/** 路徑是否命中清單。結尾帶 `/` 的項目視為目錄前綴，其餘要完全相等。 */
const matches = (f, list) => list.some((t) => (t.endsWith('/') ? f.startsWith(t) : f === t))

const hit = changed.filter((f) => matches(f, TRIGGERS))

if (hit.length === 0) bail()
if (changed.some((f) => matches(f, GATE))) bail()

const lines = [
  '文件還沒回填就想結束。以下檔案有異動，但 ' + GATE.join('／') + ' 都沒動：',
  '',
  ...hit.map((f) => '  - ' + f),
  '',
  '請執行 doc-sync skill 完成回填。重點順序：',
  '  1. 先拿這次變動對 ' + SPEC + ' —— 有牴觸就停下來回報等裁決，不要自行改 DESIGN',
  '  2. 沒牴觸再照路由表回填 TECH／WORKFLOW／README',
  '  3. 最後在 doc/DEVLOG.md 最上面加一段(做了什麼/為什麼/踩到的坑/待辦)',
]

if (hit.includes(SPEC)) {
  lines.push(
    '',
    '⚠ ' + SPEC + ' 被改動了 —— 這是規格正本。請確認：',
    '  (a) 這次改動是人裁決過的，不是 AI 自行對齊實作',
    '  (b) DESIGN 開頭的「最後更新」已改日期,DEVLOG 寫明改了什麼與為什麼'
  )
}

process.stdout.write(JSON.stringify({ decision: 'block', reason: lines.join('\n') }))
