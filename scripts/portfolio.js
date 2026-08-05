/**
 * 作品集卡片網格
 *
 * 這個檔案註冊了一個 Hexo 標籤 {% portfolio %},
 * 它會讀取 source/_data/portfolio.yml 並產生卡片網格的 HTML。
 *
 * 為什麼放在 scripts/ 而不是改主題?
 *   因為 scripts/ 是 Hexo 官方的擴充機制,完全獨立於主題之外。
 *   之後 Fluid 主題升級、甚至整個換掉主題,這個檔案都不受影響。
 *   千萬不要為了改版面去動 node_modules/hexo-theme-fluid/ 裡的檔案。
 *
 * 用法:在任何 .md 頁面裡寫 {% portfolio %} 就會展開成作品集。
 */

/** 把使用者輸入的文字轉義,避免 YAML 裡的引號或角括號把 HTML 弄壞 */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

hexo.extend.tag.register('portfolio', function () {
  // 資料檔要透過 hexo.locals 取得,tag 外掛裡的 this 拿不到 site.data
  const data = hexo.locals.get('data') || {};
  const items = data.portfolio;

  if (!Array.isArray(items) || items.length === 0) {
    return '<p class="pf-empty">還沒有作品。編輯 <code>source/_data/portfolio.yml</code> 來新增。</p>';
  }

  // featured 的排前面,其餘維持 YAML 裡的順序
  const sorted = items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => (b.item.featured ? 1 : 0) - (a.item.featured ? 1 : 0) || a.i - b.i)
    .map(x => x.item);

  const cards = sorted.map(item => {
    const cover = item.cover
      ? `<div class="pf-cover" style="background-image:url('${esc(item.cover)}')"></div>`
      : `<div class="pf-cover pf-cover--empty"><span>${esc(item.title)}</span></div>`;

    const year = item.year ? `<span class="pf-year">${esc(item.year)}</span>` : '';
    const role = item.role ? `<p class="pf-role">${esc(item.role)}</p>` : '';

    const tags = Array.isArray(item.tags) && item.tags.length
      ? `<ul class="pf-tags">${item.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
      : '';

    const links = Array.isArray(item.links) && item.links.length
      ? `<div class="pf-links">${item.links
          .filter(l => l && l.url)
          .map(l => {
            // 外部連結才加 target="_blank"
            const external = /^https?:\/\//i.test(l.url);
            const attrs = external ? ' target="_blank" rel="noopener"' : '';
            return `<a class="pf-link" href="${esc(l.url)}"${attrs}>${esc(l.text || '前往')}</a>`;
          })
          .join('')}</div>`
      : '';

    return `<article class="pf-card${item.featured ? ' pf-card--featured' : ''}">
  ${cover}
  <div class="pf-body">
    <h3 class="pf-title">${esc(item.title)}${year}</h3>
    ${role}
    <p class="pf-desc">${esc(item.desc)}</p>
    ${tags}
    ${links}
  </div>
</article>`;
  }).join('\n');

  return `<div class="pf-grid">\n${cards}\n</div>`;
});
