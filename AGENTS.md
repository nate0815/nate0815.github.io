# NA23.Chiao 網站 — 給 AI 的工作守則

個人網站(部落格 + 作品集)。Hexo 8 + Fluid 主題 + GitHub Pages。負責人:Chiao。

> 這份是**工具中立的正本**。Claude Code 讀的 [CLAUDE.md](CLAUDE.md) 只是一行 `@AGENTS.md`
> 匯入加幾句專屬補充。**要改守則就改這裡**,不要在別處複製一份。
> 這套規範移植自 doc-system-kit(ChiaoFlow Core),移植時的取捨見 [doc/DESIGN.md](doc/DESIGN.md)「明確不做的事」。

## 1. 開工前必讀

| 文件 | 內容 |
|---|---|
| [doc/DESIGN.md](doc/DESIGN.md) | **規格的唯一參照**。含「明確不做的事」清單,動手前務必看 |
| [doc/TECH.md](doc/TECH.md) | 技術棧、檔案職責、**已知的坑**、部署流程 |
| [doc/WORKFLOW.md](doc/WORKFLOW.md) | 使用者發文/改內容/合併 PR 的操作流程 |
| [doc/DEVLOG.md](doc/DEVLOG.md) | 開發紀錄,新的加在最上面;彙整的待辦也在這裡 |

## 2. DESIGN.md 是唯一參照

動手**之前**先確認 DESIGN 怎麼寫。發現實作或需求與它牴觸:**停下來問 Chiao**,
列出「規格怎麼寫/實作怎樣/出處(檔名:行號)」,由 Chiao 裁決:改實作、改規格,或列入待辦。

**不得自行改寫 DESIGN 來遷就實作。** TECH/WORKFLOW/README 與 DESIGN 牴觸時不必問,直接改它們對齊 DESIGN,但收工時要列出改了哪幾處。

## 3. 硬性規則

1. **只有 `source/` 底下的檔案會發布到網站。** 根目錄的 `asset/`、`doc/`、`AGENTS.md` 只存在於 repo。
2. **不要修改 `node_modules/hexo-theme-fluid/`。** 擴充一律用 `scripts/`(Hexo tag / filter)、`source/css/custom.css`、`source/js/na23.js`,否則主題升級時會被覆蓋。
3. **主題設定在 `_config.fluid.yml`,不是 `_config.yml`。** 後者是 Hexo 核心設定。
4. **文章檔名用英文小寫加連字號**,中文標題寫在 frontmatter。網址直接取用檔名。
5. **圖片放進 `source/` 前必須壓縮。** 規格見 DESIGN「圖片資產」。原始大圖放根目錄 `asset/`。
6. **改完要實際驗證。** Hexo 有不少靜默失敗(build 成功但內容是空的),跑完 `npx hexo clean && npx hexo generate` 後要檢查 `public/` 裡的 HTML 真的含有預期內容。
7. **顏色一律同時給淺色與深色兩版。** 主題的顏色在 `_config.fluid.yml`;自訂元件與字元 shader 的顏色在 `custom.css` 最上面的 `--na-*` 變數(JS 是去讀這些變數,不要把顏色寫進 JS)。
8. **新增動態效果前先讀 DESIGN「動態效果」。** 每個會動的東西都要有明確的工作;文章內文區不放。使用者否決過「很酷但很花、意義不明」的方案。
9. **不要用自動化瀏覽器(headless Chrome)開 Google 翻譯的網址。** 會讓使用者的 IP 被 Google 要求機器人驗證。翻譯頁只能請使用者用自己的瀏覽器看。
10. **網站上的文字要簡潔。** 作品的細節(玩法、分工、AI 協作標示)留在 itch.io 等原始頁面,網站只放連結。

## 4. 視覺驗證

改到外觀時,build 成功不算驗證完,要截圖看。做法與踩過的坑(深淺色要用參數指定、手機寬度要用 iframe、打開選單要先關掉過場)都寫在 TECH「已知的坑」。使用者回報畫面問題時,**先看對方給的截圖或錄影(含網址列)再改**,不要用猜的。

## 5. 分支與發佈

**`main` 就是線上版**:推上 `main` 約 40 秒後網站就更新(見 TECH「部署流程」)。
所以 kit 裡 `main`(開發)/`stable`(已發佈)兩條線的分工,在這裡合成 `main` 一條。

| 分支 | 用途 | 從哪開 | 合回哪 | 壽命 |
|---|---|---|---|---|
| `main` | **線上版**。任何時候都要能 build | —— | —— | 永久 |
| `feat/<slug>` | 新功能、新元件、新頁面 | `main` | PR → `main` | 合併後刪 |
| `fix/<slug>` | 修畫面或功能的問題 | `main` | PR → `main` | 合併後刪 |
| `content/<slug>` | AI 代為新增/修改的作品、關於頁等內容 | `main` | PR → `main` | 合併後刪 |
| `docs/<slug>` `chore/<slug>` `refactor/<slug>` | 文件、設定、整理 | `main` | PR → `main` | 合併後刪 |

**命名**:`<type>/<英文-kebab-slug>`,type 與 commit message 的 type 共用同一套字彙。

⛔ **AI 不在 `main` 上直接 commit。** 要動手就先開分支,包含只改一行的情況。
推上去後用 `gh pr create` 開 PR,**由 Chiao 在 GitHub 上按 Merge**;使用者沒有明確說「直接推」就不要自己合併。

**例外:使用者自己發文**照 [doc/WORKFLOW.md](doc/WORKFLOW.md) 直接推 `main`,不必走 PR。

**PR 會自動跑 build 檢查**(`.github/workflows/build-check.yml`):失敗就不要請使用者合併,先修好。
這道檢查只擋「build 壞掉、頁面變空」;外觀仍然要靠第 4 節的截圖。

## 6. 收工前要回填文件

動到程式、樣式、設定或規格,收工前用 doc-sync skill 回填(Claude Code:`/doc-sync`)。
**收工檢查會擋**:`.agents/hooks/doc-sync-check.mjs` 看到觸發清單裡的檔案有異動、而 `doc/DEVLOG.md` 沒動,就不讓這一輪結束。
流程與落點見 [.agents/skills/doc-sync/SKILL.md](.agents/skills/doc-sync/SKILL.md)。

三條讓回填不痛的規矩:

1. **commit 當下就寫 `決策:X/因為 Y`** —— DEVLOG 的「為什麼」從 commit body 抄,不是事後從 diff 反推。
2. **踩到的坑當下寫進 TECH「已知的坑」**,不要只留在 DEVLOG。下次會被查的是 TECH。
3. **新寫的跨檔引用寫章節標題,不寫章號**(`DESIGN「動態效果」`,不是 `DESIGN 第 6 節`)—— 章號位移不會有任何工具報錯。既有的不回頭改。

## 7. 常用指令

```bash
npx hexo server                      # 本機預覽 localhost:4000
npx hexo clean && npx hexo generate  # 重建,異常時先做這個
gh run list --limit 3                # 查部署與 build 檢查的狀態
gh pr create --fill                  # 從目前分支開 PR
```

## 8. 語言

使用者的溝通語言是**繁體中文**。程式碼註解與文件也用繁體中文。使用者剛接觸 git/GitHub,說明操作時要給到逐步的程度。
