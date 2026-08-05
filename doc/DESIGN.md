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
| `source/asset/portfolio/` | 作品集封面 | 建議 1200×675(16:9),≤200 KB |
| `source/_posts/<文章名>/` | 單篇文章配圖 | 由 `post_asset_folder` 機制自動對應 |

#### 壓縮規格(硬性)

| 用途 | 尺寸 | 檔案大小上限 |
|---|---|---|
| 文章配圖 | 寬度 ≤1600px | **300 KB** |
| 作品集封面 | 1200×675 | **200 KB** |
| 頭像 `avatar.jpg` | 512×512 JPEG q86 | 目前 44 KB |
| favicon `favicon.png` | 180×180 | 目前 60 KB |

照片與遊戲截圖動輒數 MB,**進 `source/` 之前一定要壓**。含漸層或照片的圖優先用 JPEG(同畫質下比 PNG 小一個數量級);需要透明背景才用 PNG。

#### 圖片一律隨文章存放,不使用外部圖床

文章配圖**放在文章的同名資料夾裡**,Markdown 直接寫檔名:

```markdown
![調整前的打擊感](before.png)
```

❌ **不採用**「另開一個 public repo 放圖、用 `raw.githubusercontent.com` 外連」的做法。那是在沒有檔案空間的論壇(如巴哈姆特)才需要的變通方案,本站自己就是 host,沒有理由這樣做。理由:

1. **沒有好處** — 圖放另一個 repo 一樣是 GitHub 在服務、一樣計入同一份流量額度
2. **多一個會壞掉的環節** — 改檔名、刪檔、repo 轉 private 都會讓文章變破圖,而且 build 照樣成功、**不會有任何錯誤提示**
3. **本機預覽需要連網** — 目前 `hexo server` 完全離線可用
4. **文章不再自足** — 備份或搬家時圖片不會跟著走
5. **效能沒有比較好** — 實測 `raw.githubusercontent.com` 為 `Cache-Control: max-age=300`,GitHub Pages 為 `max-age=600`

#### 例外:這些情況才走外部

| 情況 | 做法 |
|---|---|
| 影片 | 上傳 YouTube 再嵌入。**影片檔絕不進 repo** |
| 多篇文章共用的圖 | 放 `source/asset/`,用 `/asset/xxx.png` 引用 |
| 超大檔案(遊戲下載、專案原始檔) | GitHub Releases 或 itch.io |

#### 流量與容量額度

GitHub Pages 官方限制:

| 項目 | 限制 |
|---|---|
| 發布後的站台大小 | **1 GB** |
| 每月流量 | **100 GB**(軟上限) |
| 原始碼 repo 建議大小 | 1 GB |
| 單次部署逾時 | 10 分鐘 |

換算感覺:一篇文章配 5 張壓縮過的圖(各 200 KB)約 1 MB,**寫一千篇才會碰到 1 GB**;每頁 2 MB 的話,要每月五萬次瀏覽才會碰到 100 GB。**前提是圖有壓縮**——20 MB 的原圖放五十張就吃光 1 GB。

> 註:「每小時 10 次 build」的限制不適用於本站,因為我們使用自訂 GitHub Actions workflow 部署。

`asset/`(原圖備份)雖然不發布,但仍計入 repo 大小。累積到約 100 MB 時應重新評估——改用 Git LFS,或原圖改放本機/雲端硬碟不進 repo。

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
| 外部圖床 / 另開 repo 放圖外連 | ❌ 不採用 | 本站自己就是 host,沒有好處,且會讓文章破圖時無聲失敗。詳見第 6 節。 |
| 未壓縮的圖片進 `source/` | ❌ 禁止 | 直接拖慢所有訪客載入速度,並快速消耗 1 GB 站台額度。 |
