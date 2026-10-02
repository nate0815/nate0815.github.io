/**
 * 替選單裡的 Google 翻譯連結做記號
 *
 * 在每一頁的 HTML 裡,把指向 translate.google.com 的連結加上兩個屬性:
 *   data-na-tl="en"   這個連結要翻成哪個語言(取自連結裡的 tl=)
 *   translate="no"    請 Google 不要翻譯這個連結的文字
 *
 * 為什麼需要?
 *   訪客已經在翻譯頁裡的時候,Google 會把頁面上所有連結的網址改寫掉,
 *   source/js/na23.js 就沒辦法再從網址看出「這顆是英文還是日文」
 *   (實測:改寫後兩顆都被認成目前的語言,點日文也只是重新載入英文版)。
 *   data-* 屬性不會被改寫,所以把語言記在這裡。
 *
 *   translate="no" 則是讓「日本語」不要在英文頁裡被翻成 "Japanese":
 *   語言名稱要用該語言自己的寫法,懂那個語言的人才認得出來。
 */

const LINK = /<a ((?:[^>]*\s)?href="https:\/\/translate\.google\.com\/translate\?[^"]*?[?&;]tl=([A-Za-z-]+)[^"]*"[^>]*)>/g;

hexo.extend.filter.register('after_render:html', function (html) {
  return html.replace(LINK, '<a data-na-tl="$2" translate="no" $1>');
});
