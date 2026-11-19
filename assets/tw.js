/* Applies the saved palette before first paint. Styles are precompiled in tw.css. */
(function () {
  var p = null;
  try { p = localStorage.getItem('cj-pal'); } catch (e) {}
  var q = new URLSearchParams(location.search).get('palette');
  if (q) p = q;
  if (p === 'sandstone' || p === 'lotus' || p === 'lavender' || p === 'sage') document.documentElement.setAttribute('data-palette', p);
})();
