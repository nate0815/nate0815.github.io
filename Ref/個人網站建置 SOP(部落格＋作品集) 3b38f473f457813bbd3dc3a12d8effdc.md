# 個人網站建置 SOP(部落格＋作品集)

> 參考網站範例:[舔壽司的好日子 (GMTK Game Jam 2025 & BitSummit 2026)](https://qwe321qwe321qwe321.github.io/posts/45789/) — Hexo 6.3.0 + Oranges 主題,可參考其文章排版、目錄、標籤與作品集分類方式
> 

> 技術棧:Hexo(或 Astro,先以 Hexo 為主規劃) + GitHub Pages + GitHub Actions
> 

> 用途:發文(devlog / 心得)＋ 作品集展示,Markdown 撰寫
> 

---

## 一、初期決策(先確認再動工)

- [ ]  確定使用 Hexo 還是 Astro(預設:Hexo,主題參考 Oranges)
- [ ]  確定 GitHub repo 名稱(若用 `<username>.github.io` 可直接當根網域)
- [ ]  確定網址結構:`/posts/`(文章)、`/portfolio/`(作品集)、`/tags/`(標籤)、`/about/`(關於我)
- [ ]  確定是否需要自訂網域(若有,先準備好 DNS 設定)
- [ ]  決定留言系統要不要接(如 Disqus,或先不要)

---

## 二、專案初始化 SOP

1. [ ] 安裝 Node.js(建議 LTS 版本)與 npm
2. [ ] 全域安裝 Hexo CLI:`npm install -g hexo-cli`
3. [ ] 建立專案:`hexo init my-site && cd my-site && npm install`
4. [ ] 安裝並套用主題(如 Oranges):將主題放進 `themes/` 資料夾,修改 `_config.yml` 的 `theme` 欄位
5. [ ] 設定站台基本資訊(`_config.yml`):標題、副標題、作者、網址、語言(zh-TW)
6. [ ] 建立資料夾結構:
    - `source/_posts/`:文章
    - `source/portfolio/`(或依主題規定的作品集路徑)
7. [ ] 本機測試:`hexo server`,確認畫面正常
8. [ ] 初始化 git,建立 GitHub repo,push 上去

---

## 三、部署設定 SOP(GitHub Pages + Actions)

1. [ ] 在 repo 建立 `.github/workflows/deploy.yml`
2. [ ] Workflow 內容需包含:
    - checkout 原始碼
    - 安裝 Node.js
    - `npm install`
    - `hexo generate` 產生靜態檔案
    - 部署 `public/` 資料夾到 GitHub Pages(可用 `peaceiris/actions-gh-pages` 或官方 `actions/deploy-pages`)
3. [ ] 到 repo 的 Settings → Pages,確認來源設定為 GitHub Actions
4. [ ] push 到 main branch,確認 Actions 執行成功
5. [ ] 確認網站可正常瀏覽,檢查圖片、CSS、連結是否正常載入
6. [ ] (若有自訂網域)在 repo 設定 CNAME,並設定 DNS

---

## 四、上線前檢查清單

- [ ]  RWD 確認(手機、平板、桌機畫面都正常)
- [ ]  SEO 基本設定(meta description、og:image、favicon)
- [ ]  網站地圖(sitemap)是否產生
- [ ]  RSS feed 是否正常
- [ ]  分類與標籤頁面是否正常運作
- [ ]  深色/淺色模式(若主題支援)
- [ ]  圖片皆有適當壓縮,避免拖慢載入速度
- [ ]  404 頁面是否正常
- [ ]  Google Analytics / Search Console(若要追蹤流量,選配)

---

## 五、日常內容更新工作流程

### 寫新文章

1. `hexo new post "文章標題"` 產生新的 `.md` 檔於 `source/_posts/`
2. 編輯 frontmatter:`title`、`date`、`tags`、`categories`
3. 用 Markdown 撰寫內文(可搭配圖片,圖片放 `source/images/` 對應資料夾)
4. 本機預覽:`hexo server` 確認排版
5. 確認無誤後:
    
    ```
    git add .
    git commit -m "新增文章:文章標題"
    git push
    ```
    
6. GitHub Actions 自動 build + 部署,幾分鐘後網站更新

### 新增作品集項目

1. 在 `source/portfolio/`(或主題指定路徑)新增對應的 `.md` 或設定檔
2. 填入作品名稱、簡介、連結、封面圖
3. 本機預覽確認 → commit → push

### 修改既有內容

1. 找到對應的 `.md` 檔案直接編輯
2. 本機預覽確認排版沒跑掉
3. commit → push

---

## 六、給 Claude Code 的工作備註

- 專案技術棧:Hexo + Markdown + GitHub Pages + GitHub Actions
- 主要工作內容:協助初始化專案、設定主題、撰寫/修改部署 workflow、除錯 build 失敗問題、協助新增文章/作品集項目的 Markdown 撰寫
- 注意:所有內容變更最終都要 commit + push 才會反映到正式網站,本機修改不會自動同步