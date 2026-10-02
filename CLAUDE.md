# CLAUDE.md

個人網站 **NA23**(部落格 + 作品集)。Hexo 8 + Fluid 主題 + GitHub Pages。

## 開工前必讀

| 文件 | 內容 |
|---|---|
| [doc/DESIGN.md](doc/DESIGN.md) | **規格的唯一真實來源**。含「明確不做的事」清單,動手前務必看 |
| [doc/TECH.md](doc/TECH.md) | 技術棧、檔案職責、已知的坑、官方文件連結 |
| [doc/WORKFLOW.md](doc/WORKFLOW.md) | 使用者發文/改內容的操作流程 |
| [doc/DEVLOG.md](doc/DEVLOG.md) | 開發紀錄,新的加在最上面 |

## 硬性規則

1. **只有 `source/` 底下的檔案會發布到網站。** 根目錄的 `asset/`、`doc/` 只存在於 repo。
2. **不要修改 `node_modules/hexo-theme-fluid/`。** 擴充一律用 `scripts/`(Hexo tag / filter)、`source/css/custom.css`、`source/js/na23.js`,否則主題升級時會被覆蓋。
3. **主題設定在 `_config.fluid.yml`,不是 `_config.yml`。** 後者是 Hexo 核心設定。
4. **文章檔名用英文小寫加連字號**,中文標題寫在 frontmatter。網址直接取用檔名。
5. **圖片放進 `source/` 前必須壓縮。** 規格見 DESIGN.md 第 6 節。原始大圖放根目錄 `asset/`。
6. **改完要實際驗證。** Hexo 有不少靜默失敗(build 成功但內容是空的),跑完 `npx hexo clean && npx hexo generate` 後要檢查 `public/` 裡的 HTML 真的含有預期內容。
7. **顏色一律同時給淺色與深色兩版。** 主題的顏色在 `_config.fluid.yml`;自訂元件與字元 shader 的顏色在 `custom.css` 最上面的 `--na-*` 變數(JS 是去讀這些變數,不要把顏色寫進 JS)。
8. **新增動態效果前先讀 DESIGN.md 的「動態效果」。** 每個會動的東西都要有明確的工作;文章內文區不放。使用者否決過「很酷但很花、意義不明」的方案。
9. **不要用自動化瀏覽器(headless Chrome)開 Google 翻譯的網址。** 會讓使用者的 IP 被 Google 要求機器人驗證。翻譯頁只能請使用者用自己的瀏覽器看。

## 視覺驗證

改到外觀時,build 成功不算驗證完,要截圖看。做法與踩過的坑(深淺色要用參數指定、手機寬度要用 iframe、打開選單要先關掉過場)都寫在 [doc/TECH.md](doc/TECH.md) 的「已知的坑」。使用者回報畫面問題時,**先看對方給的截圖或錄影(含網址列)再改**,不要用猜的。

## 完工後

- 動到規格 → 更新 `doc/DESIGN.md`
- 做完一輪 → 在 `doc/DEVLOG.md` 最上面加一段紀錄(做了什麼 / 為什麼 / 踩到的坑 / 待辦)

## 常用指令

```bash
npx hexo server                    # 本機預覽 localhost:4000
npx hexo clean && npx hexo generate  # 重建,異常時先做這個
gh run list --limit 3              # 查部署狀態
```

## 語言

使用者的溝通語言是**繁體中文**。程式碼註解與文件也用繁體中文。
