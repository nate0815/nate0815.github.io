# TECH — 技術棧與參考資料

> 給未來的自己與 AI 助手看的技術索引。要改東西之前先看這份,可以少走很多冤枉路。
>
> 最後更新:2026-08-05

---

## 1. 技術棧一覽

| 層 | 用什麼 | 版本 |
|---|---|---|
| 靜態網站產生器 | [Hexo](https://hexo.io/) | 8.x |
| 主題 | [Fluid](https://github.com/fluid-dev/hexo-theme-fluid) | 1.9.9 |
| 內容格式 | Markdown | — |
| 執行環境 | Node.js | 本機 22.13.0 / CI 22 |
| 版本控制 | Git + GitHub | repo `nate0815/nate0815.github.io` |
| CI/CD | GitHub Actions | `.github/workflows/deploy.yml` |
| 託管 | GitHub Pages(官方 Actions 部署模式) | — |

### 已安裝的 Hexo 外掛

| 套件 | 用途 |
|---|---|
| `hexo-generator-index` | 首頁文章列表 |
| `hexo-generator-archive` | `/archives/` 封存頁 |
| `hexo-generator-category` | `/categories/` 分類頁 |
| `hexo-generator-tag` | `/tags/` 標籤頁 |
| `hexo-generator-search` | 主題的本地搜尋功能所需(產生 `local-search.xml`) |
| `hexo-renderer-marked` | Markdown 渲染 |
| `hexo-renderer-ejs` | 主題模板渲染 |
| `hexo-renderer-stylus` | 主題樣式編譯 |
| `hexo-server` | 本機預覽伺服器 |

---

## 2. 檔案結構與各檔職責

```
NA23_web/
├─ _config.yml              Hexo 核心設定(網址、permalink、時區…)
├─ _config.fluid.yml        主題設定 ← 改外觀來這裡
├─ package.json             相依套件
├─ package-lock.json        版本鎖定,CI 用 npm ci 讀它,必須 commit
├─ .github/workflows/
│  └─ deploy.yml            自動部署流程
├─ scripts/
│  └─ portfolio.js          作品集卡片的 Hexo tag 外掛
├─ source/                  ★ 只有這個資料夾底下的東西會被發布
│  ├─ _posts/               文章
│  ├─ _data/portfolio.yml   作品集資料
│  ├─ about/index.md        關於頁
│  ├─ portfolio/index.md    作品集頁(內容只有一行 {% portfolio %})
│  ├─ css/custom.css        自訂樣式
│  └─ asset/default/        站台通用圖(頭像、favicon)
├─ asset/                   原圖備份,不發布
├─ doc/                     本文件所在
└─ public/                  build 產物,已 gitignore,不要手動改
```

**最重要的一條規則:只有 `source/` 底下的檔案會出現在網站上。** 放在根目錄的檔案(例如 `asset/`、`doc/`)只存在於 repo 裡。

---

## 3. 擴充規則

> ⛔ **絕對不要修改 `node_modules/hexo-theme-fluid/` 裡的任何檔案。**
> 那是 npm 安裝的套件,`npm install` 或升級時會被整個覆蓋,你的修改會無聲消失。

要改變主題行為,依需求選擇:

| 想做的事 | 用什麼機制 | 檔案位置 |
|---|---|---|
| 改顏色、間距、版面細節 | 自訂 CSS | `source/css/custom.css`(已由 `custom_css` 掛載) |
| 加 JS 行為 | 自訂 JS | 建立檔案後於 `_config.fluid.yml` 的 `custom_js` 指定 |
| 在頁面產生自訂區塊 | Hexo tag 外掛 | `scripts/*.js`,用 `hexo.extend.tag.register()` |
| 注入 HTML 到主題特定位置 | Fluid 的 `theme_inject` | `scripts/*.js`,用 `hexo.extend.filter.register('theme_inject', ...)` |
| 改主題設定 | 設定檔 | `_config.fluid.yml` |

### 已知的坑

**Hexo tag 外掛裡取不到 `this.site.data`**

```js
// ❌ 錯誤:拿不到資料,而且不會報錯,只會靜靜地變成空的
const items = this.site.data.portfolio;

// ✅ 正確
const items = hexo.locals.get('data').portfolio;
```

**PowerShell 5.1 讀 `.ps1` 檔預設用 ANSI 編碼**

輔助腳本裡若含中文,會被解碼成亂碼並造成語法錯誤。**工具腳本一律寫純英文**,或存成 UTF-8 with BOM。

**GitHub Pages 預設是 legacy 模式**

新 repo 啟用 Pages 時預設為「直接發佈 branch」,會把 Markdown 原始碼當網站送出去。必須切換為 Actions 模式:

```bash
gh api -X PUT repos/nate0815/nate0815.github.io/pages -f build_type=workflow
```

**自訂網域的 CNAME 檔位置**

若日後掛 `na23.dev`,CNAME 檔必須放在 **`source/CNAME`**(內容就一行網域名)。放在 `public/` 會每次 build 被清掉。

**外連圖片會無聲失敗**

若把圖放在別的 repo 用 `raw.githubusercontent.com` 外連,來源檔被改名/刪除/轉 private 時,`hexo generate` **仍會成功**,只是網頁上變成破圖。本專案規定圖片一律隨文章存放,理由與例外見 [DESIGN.md 第 6 節](DESIGN.md#圖片資產)。

---

## 3.5 平台額度

GitHub Pages(2026-08 查證):

| 項目 | 限制 |
|---|---|
| 發布後站台大小 | 1 GB |
| 每月流量 | 100 GB(軟上限) |
| repo 建議大小 | 1 GB |
| 單次部署逾時 | 10 分鐘 |
| 每小時 build 次數 | 10 次(**使用自訂 Actions workflow 時不適用**,本站屬此類) |

實測資源快取標頭:

| 來源 | `Cache-Control` |
|---|---|
| `raw.githubusercontent.com` | `max-age=300` |
| `nate0815.github.io`(Pages) | `max-age=600` |

超出流量軟上限時 GitHub 的處置依 [Acceptable Use Policies](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies) 第 9 條:「保留暫停帳號、限制檔案託管或限制活動的權利」。以本站規模不會接近,但這是為什麼圖片壓縮被列為硬性規格。

---

## 4. 常用指令

```bash
npx hexo server            # 本機預覽 http://localhost:4000,存檔自動重整
npx hexo generate          # 產生靜態檔到 public/
npx hexo clean             # 清掉 public/ 與快取(版面異常時先跑這個)
npx hexo new post "slug"   # 建立新文章(slug 用英文)
npx hexo new page "name"   # 建立新頁面

gh run list --limit 5      # 看最近的部署狀況
gh run watch <run-id>      # 盯著某次部署跑完
```

排版怪怪的、改了沒反應時,第一個動作永遠是 `npx hexo clean` 再 `npx hexo server`。

---

## 5. 部署流程

`git push` 到 `main` → GitHub Actions 觸發 → `npm ci` → `npx hexo generate` → 上傳 `public/` → 部署到 Pages。全程約 40 秒。

`.github/workflows/deploy.yml` 使用的 action 版本(2026-08 更新):

| Action | 版本 |
|---|---|
| `actions/checkout` | v7 |
| `actions/setup-node` | v7 |
| `actions/configure-pages` | v6 |
| `actions/upload-pages-artifact` | v5 |
| `actions/deploy-pages` | v5 |

workflow 需要這組權限,少了會 403:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

> 若 Actions 出現 Node 版本淘汰警告,表示 action 版本該升了。查最新版:
> `gh api repos/actions/checkout/releases/latest --jq .tag_name`

---

## 6. 參考文件連結

### 核心

- **Hexo 官方文件** — https://hexo.io/docs/
- **Hexo 設定檔說明** — https://hexo.io/docs/configuration
- **Hexo Front-matter** — https://hexo.io/docs/front-matter
- **Hexo 標籤外掛(寫 `scripts/`)** — https://hexo.io/api/tag
- **Hexo 資料檔(`source/_data/`)** — https://hexo.io/docs/data-files
- **Hexo 資源資料夾(post_asset_folder)** — https://hexo.io/docs/asset-folders

### 主題

- **Fluid GitHub** — https://github.com/fluid-dev/hexo-theme-fluid
- **Fluid 配置指南** — https://fluid-dev.github.io/hexo-fluid-docs/guide/
- **Fluid 進階用法(theme_inject)** — https://fluid-dev.github.io/hexo-fluid-docs/advance/
- **Fluid 圖示清單** — https://fluid-dev.github.io/hexo-fluid-docs/icon/

> ⚠️ Fluid 官方站 `hexo.fluid-dev.com` 的 SSL 憑證已過期(2026-08 實測),請用上面的 `fluid-dev.github.io` 備援站。

### 部署

- **GitHub Pages 官方文件** — https://docs.github.com/pages
- **用 Actions 部署 Pages** — https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- **actions/deploy-pages** — https://github.com/actions/deploy-pages
- **設定自訂網域** — https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- **GitHub Pages 使用限制(容量/流量)** — https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- **GitHub 使用條款(流量限制條款)** — https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies

### 之後可能會用到

- **giscus(留言系統)** — https://giscus.app/zh-TW
- **hexo-generator-sitemap** — https://github.com/hexojs/hexo-generator-sitemap
- **hexo-generator-feed(RSS)** — https://github.com/hexojs/hexo-generator-feed
- **Google Search Console** — https://search.google.com/search-console
- **Cloudflare Registrar(買網域)** — https://www.cloudflare.com/products/registrar/

---

## 7. 給 AI 助手的提示

要在這個專案工作時:

1. **先讀 [DESIGN.md](DESIGN.md)** — 那是規格的唯一真實來源,包含「明確不做的事」清單。
2. **改動前確認檔案位置** — 只有 `source/` 會被發布;主題設定在 `_config.fluid.yml` 不在 `_config.yml`。
3. **不要碰 `node_modules/`** — 擴充走 `scripts/` 與 `custom_css`,理由見上方「擴充規則」。
4. **改完要驗證** — 跑 `npx hexo clean && npx hexo generate`,確認沒有 error,再檢查產出的 HTML 確實包含預期內容(Hexo 很多錯誤是靜默的,不會讓 build 失敗)。
5. **動到規格就更新 DESIGN.md**,動完手就在 [DEVLOG.md](DEVLOG.md) 補一段紀錄。
6. **圖片一定要壓縮**才放進 `source/`,規格見 DESIGN.md 第 6 節。
