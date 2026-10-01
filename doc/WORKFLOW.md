# WORKFLOW — 日常更新流程

> 這份是給你自己看的操作手冊。要發新文章、改內容、加作品時,照著這裡做就好。
>
> 最後更新:2026-08-05

---

## 🚀 最速查表

```bash
npx hexo new post "my-article-slug"   # 1. 建立文章(檔名用英文!)
npx hexo server                        # 2. 本機預覽 http://localhost:4000
git add .                              # 3. 確認沒問題後
git commit -m "新增文章:標題"
git push                               # 4. 約 40 秒後線上就更新了
```

---

## 一、寫一篇新文章

### 步驟 1:建立檔案

```bash
npx hexo new post "combat-feel-tuning"
```

會產生 `source/_posts/combat-feel-tuning.md`,同時建立同名資料夾 `source/_posts/combat-feel-tuning/` 放圖片。

> ⚠️ **檔名一定要用英文小寫加連字號。**
> 因為網址會直接取用檔名(`/posts/combat-feel-tuning/`)。用中文檔名的話,網址會變成一長串 `%E6%88%B0...` 的亂碼,難以分享也不利於被搜尋到。
> 中文標題寫在下一步的 `title:` 欄位就好。

### 步驟 2:填寫 frontmatter

打開產生的 `.md` 檔,最上面用 `---` 包起來的部分就是 frontmatter:

```yaml
---
title: 戰鬥手感調整筆記
date: 2026-08-06 21:30:00
categories: 遊戲開發
tags:
  - Unity
  - 遊戲設計
---
```

| 欄位 | 說明 |
|---|---|
| `title` | 中文標題,顯示在網頁上 |
| `date` | 自動帶入,通常不用改 |
| `categories` | **只給一個**。目前用:`讀書心得` / `遊戲開發` / `雜記` |
| `tags` | 想給幾個都行,細分主題用 |

可選欄位:

```yaml
sticky: 100          # 置頂,數字越大越前面
excerpt: 自訂摘要     # 不寫的話會自動抓開頭
banner_img: /asset/default/xxx.jpg   # 這篇文章專用的頂部大圖
```

### 步驟 3:寫內容

frontmatter 底下就是正文,用 Markdown 寫。

**插入圖片** — 把圖檔丟進 `source/_posts/combat-feel-tuning/` 資料夾,然後:

```markdown
![畫面截圖](screenshot.png)
```

直接寫檔名就好,**不用寫路徑、不用寫網址**。這是 `post_asset_folder` 機制在運作。

> 📌 **圖片放進去之前先壓縮。** 寬度不超過 1600px、單張不超過 300 KB。
> 手機拍的照片或遊戲截圖動輒好幾 MB,直接放上去會讓文章在手機上載入很慢。
> 含漸層或照片的圖用 **JPEG**(同畫質比 PNG 小很多);需要透明背景才用 PNG。

> ⚠️ **不要用「另開 repo 放圖再外連」的做法。**
> 那是論壇沒有檔案空間時才需要的變通;你的網站自己就是 host。外連的話,來源檔被改名或刪除時文章會變破圖,而且 **build 仍然會成功、不會有任何錯誤提示**,你不會發現。
> 完整理由見 [DESIGN.md 第 6 節](DESIGN.md#圖片資產)。

**圖片該放哪裡:**

| 情況 | 放哪 | 怎麼引用 |
|---|---|---|
| 這篇文章專用的圖 | `source/_posts/<文章名>/` | `![說明](檔名.png)` |
| 多篇文章共用的圖 | `source/asset/` | `![說明](/asset/檔名.png)` |
| 作品集封面 | `source/asset/portfolio/` | 在 `portfolio.yml` 寫 `/asset/portfolio/檔名.jpg` |
| 影片 | **不要放進 repo** | 上傳 YouTube 後嵌入 |
| 原始大圖備份 | `asset/`(根目錄) | 不發布,純備份 |

**容量夠用嗎?** GitHub Pages 站台上限 1 GB、每月流量 100 GB。一篇文章配 5 張壓縮圖約 1 MB,寫一千篇才會碰到上限——**前提是有壓縮**。一張 20 MB 的原圖,五十張就吃光了。

**摘要分隔線** — 想控制首頁顯示到哪裡為止:

```markdown
這段會出現在首頁的預覽。

<!-- more -->

這段以後只有點進文章才看得到。
```

### 步驟 4:本機預覽

```bash
npx hexo server
```

瀏覽器開 http://localhost:4000。**存檔後會自動重整**,不用重跑指令。

檢查:標題有沒有跑掉、圖片有沒有出來、排版有沒有壞掉。

按 `Ctrl` + `C` 結束預覽。

### 步驟 5:發布

```bash
git add .
git commit -m "新增文章:戰鬥手感調整筆記"
git push
```

推上去後 GitHub Actions 會自動 build 並部署,**約 40 秒**後 https://nate0815.github.io/ 就更新了。

想確認部署狀況:

```bash
gh run list --limit 3
```

看到 `completed  success` 就是成功了。

---

## 二、新增一個作品

**只要改一個檔案:** `source/_data/portfolio.yml`

在清單裡加一段:

```yaml
- title: 你的遊戲名稱
  desc: 一兩句話講這是什麼、你做了什麼。
  cover: /asset/portfolio/mygame.jpg
  year: 2026
  role: solo dev
  featured: true
  tags:
    - Unity
    - 2D
  links:
    - { text: "遊玩", url: "https://你的帳號.itch.io/遊戲" }
    - { text: "原始碼", url: "https://github.com/nate0815/專案" }
```

**封面圖**放到 `source/asset/portfolio/`(資料夾不存在就自己建),然後 `cover` 欄位寫 `/asset/portfolio/檔名.jpg`。建議尺寸 1200×675(16:9),壓到 200 KB 以內。

不想放封面圖就把 `cover:` 留空,會自動顯示漸層底色加作品名,一樣好看。

> ⚠️ **YAML 兩大地雷:**
> 1. 縮排只能用**空格**,不能用 Tab
> 2. 冒號後面要留**一個空格**(`title: 名稱` ✅ / `title:名稱` ❌)
>
> 踩到的話 build 會失敗,錯誤訊息會告訴你第幾行有問題。

改完一樣是預覽 → commit → push。

> ⚠️ **預覽時改 `portfolio.yml` 不會自動更新。** 跟改文章不一樣,作品集要先按 `Ctrl` + `C` 關掉 `npx hexo server`,再重跑一次才會看到新內容。

---

## 三、修改已發布的內容

1. 找到對應檔案直接改
   - 文章 → `source/_posts/`
   - 關於頁 → `source/about/index.md`
   - 作品集 → `source/_data/portfolio.yml`
2. `npx hexo server` 預覽確認
3. commit → push

改標題要注意:**改 frontmatter 的 `title` 不會影響網址**(網址看檔名)。如果連檔名一起改,舊網址就會失效——已經分享出去的連結會變 404。非改不可的話再改。

---

## 四、出問題時

| 症狀 | 先試這個 |
|---|---|
| 改了沒反應、版面怪怪的 | `npx hexo clean` 然後重跑 `npx hexo server` |
| 改了作品集但預覽沒變 | 關掉 `npx hexo server` 再重開(作品集資料不會自動更新) |
| build 失敗,訊息提到 YAML | 檢查 frontmatter 或 `portfolio.yml` 的縮排與冒號空格 |
| 圖片顯示不出來 | 確認圖片在 `source/` 底下;確認檔名大小寫完全一致 |
| 本機好好的,線上沒更新 | `gh run list` 看部署有沒有失敗;確認真的 `git push` 了 |
| 線上還是舊的 | 等 1 分鐘,然後用 `Ctrl` + `F5` 強制重新整理清快取 |

**最重要的一條:本機改完不 push,線上永遠不會變。**

看不懂錯誤訊息就整段複製給 AI,連同 `doc/TECH.md` 一起參考。

---

## 五、寫作習慣建議

不是規定,是幾個會讓你比較不痛苦的做法:

- **先求有再求好。** 草稿寫完先 push,之後隨時可以改——這是靜態網站的好處,改文章跟改檔案一樣簡單。
- **`hexo new draft "slug"` 可以寫草稿**,放在 `source/_drafts/`,不會被發布。想發布時用 `hexo publish draft "slug"` 移過去。
- **圖多的文章先壓圖再寫。** 寫到一半才發現要重壓很煩。
- **commit 訊息寫人話。** 三個月後你會感謝自己。
- **一次做完一件事再 push。** 不要累積十篇文章一起推,出問題時難查是哪篇的問題。
