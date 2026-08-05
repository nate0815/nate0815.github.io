# DESIGN — 網站設計規格

> **這份文件是網站設計的唯一參考來源(single source of truth)。**
> 規格有變動就更新這裡,不要只改程式碼。
> 若本文件與實際程式碼不一致,以本文件為準,並把程式碼修正回來。
>
> 最後更新:2026-08-05

---

## 1. 這個網站是什麼

| 項目 | 內容 |
|---|---|
| 定位 | 個人網站 = 部落格 + 作品集 |
| 對外品牌 | **NA23** |
| 作者署名 | **Chiao** |
| 目前網址 | https://nate0815.github.io/ |
| 規劃網址 | `https://na23.dev`(尚未購買) |
| 語言 | 繁體中文(`zh-TW`)單語。**目前不做中英雙語。** |

### 內容類型

1. **讀書心得** — 遊戲設計、程式、雜食閱讀
2. **遊戲開發心得 / devlog** — 開發過程、技術筆記
3. **作品集** — 做過的遊戲與小工具,圖文為主

### 設計原則

- **內容優先**。版面服務內容,不喧賓奪主。
- **簡潔**。不加沒有用途的動畫、特效、裝飾。
- **擴充一律走主題外部機制**。詳見 [TECH.md](TECH.md#擴充規則)。

---

## 2. 網址結構

| 路徑 | 用途 | 來源 |
|---|---|---|
| `/` | 首頁,文章列表 | 自動產生 |
| `/posts/<英文代號>/` | 單篇文章 | `source/_posts/*.md` |
| `/portfolio/` | 作品集 | `source/portfolio/index.md` + `source/_data/portfolio.yml` |
| `/about/` | 關於我 | `source/about/index.md` |
| `/archives/` | 文章封存 | 自動產生 |
| `/categories/` | 分類列表 | 自動產生 |
| `/tags/` | 標籤列表 | 自動產生 |
| `/404.html` | 404 頁 | 主題提供 |

**permalink 規則:`posts/:title/`**

`:title` 取自**檔名**,不是 frontmatter 的 `title`。因此:

- 檔名一律用**英文小寫加連字號**,例如 `combat-feel-tuning.md`
- 中文標題寫在 frontmatter 的 `title:` 欄位

> 為什麼:中文檔名會讓網址變成 percent-encoded 亂碼(`/posts/%E6%88%B0%E9%AC%A5.../`),既難分享也不利 SEO。

---

## 3. 導覽選單

順序即為 `_config.fluid.yml` 的 `navbar.menu` 設定:

`首頁` → `作品集` → `文章` → `分類` → `標籤` → `關於`

作品集排在文章之前,因為它是給「來看你能做什麼」的訪客看的,優先級高於瀏覽文章。

---

## 4. 分類與標籤

**分類(categories)** — 每篇文章**只給一個**,用來回答「這是哪一類內容」:

- `讀書心得`
- `遊戲開發`
- `雜記`

**標籤(tags)** — 想給幾個都行,用來標示具體主題:
`Unity`、`C#`、`遊戲設計`、`Game Jam`、`工具`……

> 原則:分類是**粗**的骨架,不要增生;標籤是**細**的索引,可以自由長。

---

## 5. 作品集規格

資料存放於 `source/_data/portfolio.yml`,由 `scripts/portfolio.js` 渲染為卡片網格。

### 欄位定義

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title` | ✅ | 作品名稱 |
| `desc` | ✅ | 一至兩句簡介 |
| `cover` | | 封面圖路徑;留空則顯示漸層底色 + 作品名 |
| `year` | | 年份,顯示於卡片右上 |
| `role` | | 你在專案中的角色 |
| `tags` | | 技術/類型標籤陣列 |
| `links` | | 按鈕陣列,每項含 `text` 與 `url` |
| `featured` | | `true` 則排最前,寬螢幕佔兩欄 |

### 版面行為

- 網格採 `auto-fill, minmax(280px, 1fr)`,依螢幕寬度自動決定欄數,不需 media query
- `featured` 項目在 ≥900px 時 `grid-column: span 2`
- 封面比例 16:9(featured 為 40% padding-top)
- 滑鼠懸停時卡片上浮 4px

### 排序

`featured` 為 `true` 者置頂,其餘維持 YAML 中的書寫順序。

---

## 6. 視覺規格

| 項目 | 設定 |
|---|---|
| 主題 | Fluid(Material Design 風格) |
| 深色模式 | 開啟,預設 `auto`(跟隨系統偏好) |
| 主題設定檔 | `_config.fluid.yml`(根目錄) |
| 自訂樣式 | `source/css/custom.css` |

深色模式的樣式切換依賴 Fluid 在 `<html>` 加上的 `data-user-color-scheme="dark"`。自訂 CSS 若有顏色,**必須同時寫淺色與深色兩版**,用 CSS 變數管理(見 `custom.css` 底部)。

### 圖片資產

| 位置 | 用途 | 規則 |
|---|---|---|
| `asset/` | 原圖備份 | **不會發布到網站**。大尺寸原始檔放這裡 |
| `source/asset/default/` | 站台通用圖 | 頭像、favicon 等 |
| `source/_posts/<文章名>/` | 單篇文章配圖 | 由 `post_asset_folder` 機制自動對應 |

**上傳前必須壓縮。** 目前規格:

- 頭像 `avatar.jpg` — 512×512,JPEG q86,44 KB
- favicon `favicon.png` — 180×180,60 KB
- 文章配圖 — 寬度建議 ≤1600px,單張 ≤300 KB

> 為什麼:網站託管在 GitHub Pages,大圖會直接拖慢所有訪客的載入速度,行動裝置尤其明顯。

---

## 7. SEO 規格

目標關鍵字(務實設定,不搶通用字):

- `NA23`
- `NA23 遊戲開發`
- `Chiao 遊戲開發`

必要措施:

- [x] 每頁有 `title` 與 `description`(Fluid 自動處理,可於 frontmatter 覆寫)
- [x] `og:` 系列 meta(主題內建)
- [x] 站台 `keywords` 含品牌字
- [x] 「關於」頁交叉連結至 GitHub、Email 等外部帳號
- [ ] sitemap.xml
- [ ] RSS feed
- [ ] 提交 Google Search Console
- [ ] 自訂網域 `na23.dev`

---

## 8. 明確不做的事

記錄下來,避免日後重複討論:

| 項目 | 決定 | 理由 |
|---|---|---|
| 中英雙語 | ❌ 不做 | 需維護兩份內容,成本遠高於效益。Butterfly 的「語言切換」實為簡繁轉換,非翻譯。 |
| 改 GitHub 帳號名 | ❌ 不做 | 會破壞舊連結與 commit 歸屬;品牌一致性用自訂網域解決。 |
| Disqus 留言 | ❌ 不採用 | 有廣告、載入慢。若要留言系統,優先評估 giscus(基於 GitHub Discussions)。 |
| 直接修改主題原始碼 | ❌ 禁止 | 主題升級會覆蓋。一律走 `scripts/` 與 `custom_css`。 |
