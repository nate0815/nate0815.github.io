/**
 * 自訂 CSS / JS 的快取版本號
 *
 * 在每一頁的 HTML 裡,把 /css/custom.css 與 /js/na23.js
 * 改成 /css/custom.css?v=<檔案內容的雜湊>。
 * 檔案內容一變,網址就跟著變,瀏覽器與中間的快取都會當成新檔案重抓。
 *
 * 為什麼需要?
 *   GitHub Pages 讓瀏覽器把檔案快取 10 分鐘;Google 翻譯的網頁代理還會另外再快取一份。
 *   沒有版本號的話,推上線之後訪客(以及翻譯頁)可能繼續拿到舊的樣式與程式,
 *   看起來就像「修了卻沒修好」。
 *
 * 要加別的檔案:在下面的 FILES 多寫一行。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILES = ['/css/custom.css', '/js/na23.js'];

function version(url) {
  const file = path.join(hexo.source_dir, url);
  try {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  } catch (e) {
    hexo.log.warn(`[cache-bust] 讀不到 ${file},這個檔案不會加上版本號。`);
    return null;
  }
}

hexo.extend.filter.register('after_render:html', function (html) {
  // 每次都重新算:hexo server 開著時改檔案,版本號才會跟著變
  FILES.forEach(url => {
    const v = version(url);
    if (v) html = html.split(`"${url}"`).join(`"${url}?v=${v}"`);
  });
  return html;
});
