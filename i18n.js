/* Basit TR/EN çevirici: Türkçe metin kaynak; İngilizce karşılıklar window.I18N_EN'de. */
(function () {
  var EN = window.I18N_EN || {}, RE = window.I18N_EN_RE || [];
  var root = document.documentElement;
  var items = [], attrs = [], built = false;
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  function build() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || !norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) items.push({ n: n, tr: n.nodeValue });
    document.querySelectorAll('[alt],[aria-label],[title]').forEach(function (el) {
      ['alt', 'aria-label', 'title'].forEach(function (a) {
        if (el.hasAttribute(a) && el.id !== 'lang') attrs.push({ el: el, a: a, tr: el.getAttribute(a) });
      });
    });
    ['meta[name=description]', 'meta[property="og:description"]', 'meta[property="og:title"]'].forEach(function (sel) {
      var m = document.querySelector(sel);
      if (m) attrs.push({ el: m, a: 'content', tr: m.getAttribute('content') });
    });
    built = true;
  }
  function tx(s) {
    var k = norm(s);
    if (EN[k]) return s.replace(k, EN[k]);
    for (var i = 0; i < RE.length; i++) {
      if (RE[i][0].test(k)) return s.replace(k, k.replace(RE[i][0], RE[i][1]));
    }
    return s;
  }
  function apply(lang) {
    if (!built) build();
    var en = lang === 'en';
    items.forEach(function (it) { it.n.nodeValue = en ? tx(it.tr) : it.tr; });
    attrs.forEach(function (it) { it.el.setAttribute(it.a, en ? tx(it.tr) : it.tr); });
    document.title = en ? (EN.__title || window.__trTitle) : window.__trTitle;
    root.setAttribute('lang', en ? 'en' : 'tr');
    var b = document.getElementById('lang');
    if (b) {
      b.textContent = en ? 'TR' : 'EN';
      b.setAttribute('aria-label', en ? 'Türkçe' : 'English');
    }
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  window.__trTitle = document.title;
  var q = (location.search.match(/[?&]lang=(tr|en)/) || [])[1], saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var cur = q || saved || ((navigator.language || 'tr').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en');
  window.addEventListener('load', function () {
    var b = document.getElementById('lang');
    if (b) b.addEventListener('click', function () { cur = cur === 'en' ? 'tr' : 'en'; apply(cur); });
    if (cur === 'en') apply('en'); else if (b) b.textContent = 'EN';
  });
})();
