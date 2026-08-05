# DEVLOG — 開發紀錄

> 每次動工後往**最上面**加一段。新的在上、舊的在下。
> 這份文件記錄「做了什麼、為什麼這樣決定」,規格本身寫在 [DESIGN.md](DESIGN.md)。

格式建議:

```markdown
## YYYY-MM-DD — 這次做的事(一句話)

**做了什麼**
- 條列

**為什麼**
- 有做取捨的地方寫下理由,免得三個月後自己看不懂

**踩到的坑**
- 遇到什麼問題、怎麼解的

**還沒做 / 下次要做**
- 待辦
```

---

## 2026-08-05(下半場)— 建立文件體系、處理圖片資產與外連政策

**做了什麼**

- 建立 `doc/` 四份文件:DESIGN(規格唯一來源)、TECH(技術索引)、WORKFLOW(內容更新流程)、DEVLOG(本檔)
- 新增根目錄 `CLAUDE.md`,讓 AI 助手自動載入專案規則與文件索引
- 處理頭像:原圖 4000×4000 / 20 MB → 網站用 512px JPEG(44 KB)+ 180px favicon(60 KB)
- 建立圖片資產分層:`asset/`(原圖備份、不發布)與 `source/asset/`(網站用圖)
- 「關於」頁填入實際內容(使用者自行編輯)
- 確立**圖片外連政策**並寫入 DESIGN / TECH / WORKFLOW 三份文件

**為什麼**

- **文件要拆成四份而不是一份**:更新頻率與讀者不同。DESIGN 是規格(改規格才動)、TECH 是技術索引(給除錯與 AI 參照)、WORKFLOW 是操作手冊(給使用者日常用)、DEVLOG 是流水帳(只增不改)。混在一起會導致沒人想維護。
- **加 `CLAUDE.md`**:使用者要求的第三份文件目的是「幫助 AI 更快參照」,但資訊只寫在 `doc/` 裡 AI 不會主動去讀。根目錄的 `CLAUDE.md` 會被自動載入,指向那四份文件,目標才真正達成。
- **原圖與網站用圖分離**:原圖有保存價值但不該送到訪客瀏覽器。放在 `source/` 外面既保留備份又不會被發布,規則單純好記。
- **頭像改用 JPEG**:512px PNG 為 397 KB,JPEG q86 只有 44 KB,肉眼無差異(有實際比對)。圖片含漸層與照片時 PNG 沒有優勢。
- **拒絕「另開 repo 放圖外連」**:使用者過去在巴哈姆特發文因為論壇沒有檔案空間,只能外連,那是正確的變通。但本站自己就是 host,外連沒有任何好處,反而引入無聲失敗的風險。已寫入 DESIGN.md 的「明確不做的事」。

**踩到的坑**

- **`asset/` 一開始放在根目錄**:Hexo 只發布 `source/` 底下的檔案,放根目錄的圖在網站上會 404。發現後調整為分層結構。
- **PowerShell 縮圖腳本第一次產出全白圖**:腳本含中文,被 PowerShell 5.1 以 ANSI 解碼而損壞。改寫成純英文後正常。這個坑在建站上半場踩過一次,又踩第二次——已寫入 TECH.md 的已知坑清單。
- **驗證圖片正確性不能只看檔案大小**:第一次產出的 512px PNG 只有 1.1 KB,看起來「壓縮效果很好」,實際是整張全白。必須實際開圖檢視。

**查證到的事實**(寫入 TECH.md)

- GitHub Pages:站台上限 1 GB、每月流量軟上限 100 GB、部署逾時 10 分鐘;「每小時 10 次 build」限制不適用於自訂 Actions workflow
- 實測 `Cache-Control`:`raw.githubusercontent.com` 為 `max-age=300`,GitHub Pages 為 `max-age=600`——外連換不到效能好處

**還沒做 / 下次要做**

- [ ] SEO:sitemap、RSS、Google Search Console(**下次優先做這個,不需使用者提供素材**)
- [ ] 首頁 banner 大圖仍是 Fluid 預設圖
- [ ] 「關於」頁殘留兩行 `<!-- TODO -->` 註解待清除
- [ ] 作品集只有佔位卡片,待填真實作品
- [ ] Hexo 預設的 `hello-world` 範例文章待取代
- [ ] 購買 `na23.dev` 並掛自訂網域(CNAME 要放 `source/CNAME`)
- [ ] 留言系統(giscus)尚未評估
- [ ] `asset/` 原圖備份累積到約 100 MB 時需重新評估存放方式

---

## 2026-08-05 — 建站:從零到上線,套用 Fluid 主題

**做了什麼**

- 建立 Hexo 8 專案骨架,repo 為 `nate0815/nate0815.github.io`
- 設定 GitHub Actions 自動部署(官方 `actions/deploy-pages`),push 到 `main` 即自動上線
- 站台基本資訊:標題 NA23、作者 Chiao、語言 `zh-TW`、時區 `Asia/Taipei`
- permalink 從預設的 `:year/:month/:day/:title/` 改為 `posts/:title/`
- 開啟 `post_asset_folder`,每篇文章擁有獨立圖片資料夾
- 套用 Fluid 主題(取代預設 landscape),選單中文化並新增「作品集」
- 自製資料驅動的作品集系統:`source/_data/portfolio.yml` + `scripts/portfolio.js` + `source/css/custom.css`
- 建立「關於」頁

**為什麼**

- **選 Hexo 不選 Astro**:內容以圖文為主(讀書心得、開發心得),Hexo 的舒適區。文章是純 Markdown,日後要換框架成本低,不會被鎖死。
- **選 Fluid 不選 Butterfly / Stellar**:訴求是「簡潔、專注內容」。Stellar 太花俏;Butterfly 原本吸引人的「一鍵語言切換」查證後是**簡繁轉換**而非中英翻譯,選它的理由消失。
- **先打通部署管線再做主題**:部署是最容易卡住的一步,趁站台還簡單時除錯最省力。事後證明正確——Pages 預設被設成 legacy 模式,早期就發現並改掉了。
- **repo 命名 `nate0815.github.io` 而非改 GitHub 帳號**:改 username 會破壞舊連結與 commit 歸屬,不值得。品牌一致性之後靠自訂網域 `na23.dev` 解決。
- **作品集做成資料驅動**:新增作品只要編輯 YAML,不用碰 HTML,降低長期維護的心理門檻。
- **擴充一律放主題外部**:用 `scripts/` 與 `custom_css`,不動 `node_modules/hexo-theme-fluid/`。主題升級時客製化不會被覆蓋。

**踩到的坑**

- **GitHub Pages 預設是 legacy 模式**:repo 建立後 Pages 自動啟用成「直接發佈 main 分支」,會把 Markdown 原始碼當網站發出去。要改成 `build_type=workflow`。
- **Actions 版本過舊觸發 Node 20 淘汰警告**:一開始用的 `@v4` 系列已過時,升級到 checkout@v7 / setup-node@v7 / configure-pages@v6 / upload-pages-artifact@v5 / deploy-pages@v5 後警告消失。
- **Hexo tag 外掛取不到 `this.site.data`**:必須改用 `hexo.locals.get('data')`,否則資料檔讀不到,頁面會靜靜地顯示空狀態而不報錯。
- **PowerShell 5.1 讀 `.ps1` 預設用 ANSI 編碼**:含中文的腳本會被解碼成亂碼而語法錯誤。工具腳本一律寫純英文。
- **誤植他人作品**:作品集範例一度填入參考網站作者的遊戲,已移除。範例資料要用中性佔位內容。
- **20 MB 頭像**:原圖若直接放進 `source/` 會被原封不動發布,嚴重拖慢載入。已建立「原圖放 `asset/`、網站用圖放 `source/asset/`」的規則。

**還沒做 / 下次要做**

- [ ] SEO:安裝 sitemap 與 RSS 外掛,提交 Google Search Console
- [ ] 首頁 banner 大圖仍是 Fluid 預設圖,需替換
- [ ] 「關於」頁內容仍有 `TODO` 佔位文字待填
- [ ] 作品集只有一張佔位卡片,待填入真實作品
- [ ] Hexo 預設的 `hello-world` 範例文章尚未處理(規劃於撰寫第一篇文章時一併取代)
- [ ] 購買 `na23.dev` 並掛上自訂網域
- [ ] 留言系統(giscus)尚未評估是否要接
