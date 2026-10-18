/**
 * 訪客計數(GoatCounter)
 *
 * _config.yml 的 goatcounter 填了代碼,就在每一頁最後面加上 GoatCounter 的計數程式。
 * 沒填就什麼都不加,頁尾的輝光管計數器也不會出現。
 *
 * 頁尾的計數器由 source/js/na23.js 畫:它找這裡加上的 <script data-goatcounter>,
 * 從網址取出代碼,再去讀 GoatCounter 的公開計數。
 *
 * GoatCounter 會自己略過 localhost,本機預覽不會灌水。
 */

const code = String(hexo.config.goatcounter || '').trim();

if (!code) {
  hexo.log.info('[goatcounter] _config.yml 沒有填 goatcounter,不加計數程式。');
} else if (!/^[a-z0-9-]+$/.test(code)) {
  hexo.log.warn(`[goatcounter] 代碼「${code}」格式不對,只能有英文小寫、數字、連字號。不加計數程式。`);
} else {
  hexo.extend.injector.register('body_end',
    `<script data-goatcounter="https://${code}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`);
}
