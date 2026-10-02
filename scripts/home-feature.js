/**
 * 首頁「精選作品」區塊
 *
 * 把 source/_data/portfolio.yml 裡 featured: true 的作品,
 * 插到首頁文章列表的最上面(只有第一頁)。
 * 換圖動畫由 source/js/na23.js 負責;沒有 JavaScript 時會顯示第一個作品。
 *
 * 為什麼用 after_render:html 而不是 theme_inject?
 *   Fluid 的 theme_inject 沒有「首頁內容區」這個插入點,
 *   所以改成在整頁 HTML 產生後,找到主題輸出的隱藏 <h1> 把區塊放在它前面。
 *   這依賴主題的輸出格式:主題升級後若找不到插入點,build 時會印出警告。
 */

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const MARKER = '<h1 style="display: none">';

hexo.extend.filter.register('after_render:html', function (html, data) {
  const page = data && data.page;
  // __index 是 hexo-generator-index 給首頁加的記號;current 是分頁頁碼
  if (!page || !page.__index || page.current !== 1) return html;

  const all = (hexo.locals.get('data') || {}).portfolio;
  if (!Array.isArray(all)) return html;

  const items = all
    .filter(item => item && item.featured && item.title)
    .map(item => {
      const link = (Array.isArray(item.links) ? item.links : []).find(l => l && l.url) || {};
      return {
        title: String(item.title),
        desc: String(item.desc || ''),
        cover: item.cover || '',
        url: link.url || '/portfolio/',
        text: link.text || '前往'
      };
    });
  if (items.length === 0) return html;

  if (!html.includes(MARKER)) {
    hexo.log.warn('[home-feature] 找不到首頁的插入點,精選作品沒有顯示。主題的 index.ejs 可能改版了。');
    return html;
  }

  const first = items[0];
  const ext = /^https?:\/\//i.test(first.url) ? ' target="_blank" rel="noopener"' : '';
  const art = first.cover ? ` style="background-image:url('${esc(first.cover)}')"` : '';
  const dots = items.length > 1
    ? `<div class="na-feat-dots" role="group" aria-label="切換精選作品">${items
        .map((it, i) => `<button type="button" aria-pressed="${i === 0}" aria-label="${esc(it.title)}">${i + 1}</button>`)
        .join('')}</div>`
    : '';

  const block = `<section class="na-feat" id="na-feat" data-items="${esc(JSON.stringify(items))}">
  <div class="na-feat-copy">
    <p class="na-feat-label">精選作品</p>
    <h2 class="na-feat-title"><a href="${esc(first.url)}"${ext}>${esc(first.title)}</a></h2>
    <p class="na-feat-desc">${esc(first.desc)}</p>
    <div class="na-feat-actions">
      <a class="pf-link na-feat-play" href="${esc(first.url)}"${ext}>${esc(first.text)}</a>
      <a class="pf-link" href="/portfolio/">全部作品</a>
    </div>
    ${dots}
  </div>
  <a class="na-feat-art" href="${esc(first.url)}"${ext} aria-label="${esc(first.title)}"${art}></a>
</section>
`;

  return html.replace(MARKER, block + MARKER);
});
