/* Shared chrome for every page: header, footer, palette switcher, reveals and front-end forms.
   Pages only need <div id="site-header"></div> and <div id="site-footer"></div>. */
(function () {
  var root = document.documentElement;
  var BASE = new URL('..', document.currentScript.src).href;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ONE SWITCH for all contact links. Set to the WhatsApp number in international digits, e.g. '919876543210'.
  // While it is empty, every Call / WhatsApp / quote button points to the on-page booking form, the floating
  // WhatsApp button is hidden, and forms show a "booking opens shortly" note without sending anything.
  var CONTACT_WHATSAPP = '';
  var DIGITS = String(CONTACT_WHATSAPP).replace(/\D/g, ''), HAS = DIGITS.length >= 10;
  var PHONE = !HAS ? '' : DIGITS.indexOf('91') === 0 && DIGITS.length === 12 ? '+91 ' + DIGITS.slice(2, 7) + ' ' + DIGITS.slice(7) : '+' + DIGITS;
  var WA = HAS ? 'https://wa.me/' + DIGITS : '';
  function waLink(text) { return HAS ? WA + (text ? '?text=' + encodeURIComponent(text) : '') : ''; }
  root.classList.toggle('contact-on', HAS);

  // Palette, applied before paint so there is no flash
  var NAMES = { sandstone: 'Sandstone & Slate', sage: 'Sage & Saffron', lavender: 'Moonlit Lavender', lotus: 'Lotus Dawn' };
  var start = 'sandstone';
  try { var sp = localStorage.getItem('cj-pal'); if (NAMES[sp]) start = sp; } catch (e) {}
  var qp = new URLSearchParams(location.search).get('palette'); if (NAMES[qp]) start = qp;
  root.setAttribute('data-palette', start);

  // Favicon on every page (one SVG, no extra request)
  if (!document.querySelector('link[rel="icon"]')) {
    var fav = document.createElement('link'); fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = BASE + 'assets/favicon.svg';
    document.head.appendChild(fav);
  }

  var TOOLS = [
    ['kundali/', 'Janam Kundli', 'Your birth chart'],
    ['kundali-matching/', 'Kundli Milan', '36-guna compatibility'],
    ['muhurat/', 'Shubh Muhurat', 'Auspicious timings'],
    ['panchang/', 'Panchang', 'Tithi, Nakshatra, Yoga'],
    ['choghadiya/', 'Choghadiya', 'Good hours of the day'],
    ['moon-sign/', 'Moon Sign', 'Find your Rashi'],
    ['lagna/', 'Lagna', 'Your rising sign'],
    ['nakshatra/', 'Nakshatra', 'Your birth star'],
    ['sade-sati/', 'Sade Sati', 'Saturn\'s 7½ years'],
    ['manglik-dosh/', 'Manglik Check', 'Mangal dosha'],
    ['baby-names/', 'Baby Names', 'By Nakshatra syllable']
  ];
  var path = location.pathname.replace(/index\.html$/, '');
  var basePath = new URL(BASE).pathname;
  var here = path.indexOf(basePath) === 0 ? path.slice(basePath.length) : '';
  var isHome = here === '';
  var consult = isHome ? '#consult' : BASE + '#consult';
  function cur(p) { return here === p ? ' aria-current="page"' : ''; }

  var swatches = '<div class="flex items-center gap-1.5" role="group" aria-label="Colour palette">' +
    '<button type="button" class="swatch" data-p="sandstone" aria-label="Sandstone and Slate palette" style="background:linear-gradient(135deg,#1f2a3a 0 50%,#d9c7a3 50%)"></button>' +
    '<button type="button" class="swatch" data-p="sage" aria-label="Sage and Saffron palette" style="background:linear-gradient(135deg,#d5e9cd,#f4d888)"></button>' +
    '<button type="button" class="swatch" data-p="lavender" aria-label="Moonlit Lavender palette" style="background:linear-gradient(135deg,#ddd5fb,#a9d5f1)"></button>' +
    '<button type="button" class="swatch" data-p="lotus" aria-label="Lotus Dawn palette" style="background:linear-gradient(135deg,#f9d3df,#f5c6a5)"></button></div>';

  var toolLinks = TOOLS.map(function (t) {
    return '<a href="' + BASE + t[0] + '"><span class="block text-sm font-medium">' + t[1] + '</span><span class="block text-xs muted">' + t[2] + '</span></a>';
  }).join('');

  var header = document.getElementById('site-header');
  if (header) {
    header.outerHTML =
      '<header class="nav"><nav class="gutter mx-auto max-w-6xl h-16 flex items-center justify-between gap-4" aria-label="Main">' +
        '<a href="' + BASE + '" class="flex items-baseline gap-2 min-w-0"><span class="font-display text-xl sm:text-2xl leading-none whitespace-nowrap">Chandan Shrivastava</span><span class="label gilt hidden lg:inline">Jyotish</span></a>' +
        '<div class="hidden md:flex items-center gap-6">' +
          '<div class="drop"><button type="button" class="nav-link" aria-haspopup="true">Free tools ▾</button><div class="drop-panel grid grid-cols-2 gap-1">' + toolLinks + '<a href="' + BASE + 'free-tools/" class="col-span-2 text-center label gilt">All free tools</a></div></div>' +
          '<a class="nav-link" href="' + BASE + 'horoscope/"' + cur('horoscope/') + '>Horoscope</a>' +
          '<a class="nav-link" href="' + BASE + 'puja-booking/"' + cur('puja-booking/') + '>Puja</a>' +
          '<a class="nav-link" href="' + BASE + 'about/"' + cur('about/') + '>About</a>' +
          '<a class="nav-link" href="' + BASE + 'blogs/"' + cur('blogs/') + '>Journal</a>' +
        '</div>' +
        '<div class="flex items-center gap-3"><div class="hidden sm:block">' + swatches + '</div>' +
          '<a href="' + consult + '" class="btn-ink hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-medium">Book</a>' +
          '<button type="button" id="menuBtn" class="md:hidden btn-soft circle h-10 w-10" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">☰</button>' +
        '</div></nav>' +
        '<div id="mobileMenu" class="mobile-menu md:hidden border-t hair gutter pb-6 max-h-[75vh] overflow-y-auto">' +
          '<div class="grid grid-cols-2 gap-1 pt-3">' + toolLinks.replace(/<a /g, '<a class="block rounded-xl px-2 py-2" ') + '</div>' +
          '<div class="grid gap-1 mt-3 border-t hair pt-3 text-lg font-display">' +
            ['horoscope/|Horoscope', 'puja-booking/|Puja booking', 'about/|About Chandan', 'faq/|FAQ', 'blogs/|Journal'].map(function (x) { x = x.split('|'); return '<a class="py-2" href="' + BASE + x[0] + '">' + x[1] + '</a>'; }).join('') +
          '</div><div class="mt-4 flex items-center justify-between border-t hair pt-4"><span class="text-sm muted">Colour palette</span>' + swatches + '</div><a href="' + consult + '" class="btn-ink px-6 py-3 mt-4 w-full font-medium" data-close>Book a consultation</a></div>' +
      '</header>';
    var mb = document.getElementById('menuBtn'), mm = document.getElementById('mobileMenu');
    mb.addEventListener('click', function () { var o = mm.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? '✕' : '☰'; });
    mm.addEventListener('click', function (e) { if (e.target.closest('a')) { mm.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.textContent = '☰'; } });
  }

  var footer = document.getElementById('site-footer');
  if (footer) {
    function col(title, items) { return '<div><p class="label gilt">' + title + '</p><ul class="mt-4 space-y-2.5 text-sm">' + items.map(function (x) { return '<li><a class="muted hover:opacity-70" href="' + (x[0].charAt(0) === '#' ? consult : BASE + x[0]) + '">' + x[1] + '</a></li>'; }).join('') + '</ul></div>'; }
    footer.outerHTML =
      '<footer class="relative overflow-hidden border-t hair bg2">' +
        '<div class="relative gutter mx-auto max-w-6xl pt-16 pb-28">' +
          '<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">' +
            '<div><div class="font-deva text-3xl gilt" aria-hidden="true">ॐ</div><p class="font-display text-2xl mt-3">Chandan Shrivastava</p><p class="label muted text-[0.6rem] mt-2">Vedic Astrologer · Gurugram</p>' +
              '<p class="mt-5 text-sm muted leading-relaxed max-w-xs">Classical Jyotish from a Varanasi lineage, read in the sidereal zodiac with Lahiri ayanamsa. No gemstones are sold here.</p>' +
              (HAS ? '<p class="mt-5 text-sm"><a href="tel:+' + DIGITS + '" class="font-medium">' + PHONE + '</a> · <a class="underline" href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a></p>'
                   : '<p class="mt-5 text-sm"><a href="' + consult + '" class="font-medium underline">Book through the online form</a></p>') +
              '<dl class="mt-5 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1"><dt class="muted">Hours</dt><dd>Mon–Sat, 10:00–19:00 IST</dd><dt class="muted">Location</dt><dd>Gurugram, Haryana, India</dd></dl></div>' +
            col('Free tools', TOOLS.slice(0, 6).map(function (t) { return [t[0], t[1]]; })) +
            col('Services', [['#consult', 'One-to-one consultation'], ['horoscope/', 'Daily horoscope'], ['puja-booking/', 'Puja booking'], ['muhurat/', 'Muhurat selection'], ['kundali-matching/', 'Marriage matching']]) +
            col('About', [['about/', 'About Chandan'], ['faq/', 'FAQ'], ['blogs/', 'Journal'], ['privacy-policy/', 'Privacy policy'], ['terms-and-conditions/', 'Terms & conditions'], ['refund-and-cancellation-policy/', 'Refunds & cancellations'], ['disclaimer/', 'Disclaimer']]) +
          '</div>' +
          '<p class="mt-14 border-t hair pt-6 text-xs muted flex flex-wrap gap-x-4 gap-y-2 justify-between"><span>© ' + new Date().getFullYear() + ' Chandan Shrivastava. Readings are guidance for reflection and planning, not a substitute for medical, legal or financial advice.</span></p>' +
        '</div></footer>' +
      (HAS ? '<a class="wa btn-ink circle h-14 w-14" href="' + WA + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
        '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg></a>' : '');
  }

  // Palette buttons (header) and footer label
  function setPalette(p) {
    root.setAttribute('data-palette', p);
    document.querySelectorAll('.swatch').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.p === p)); });
    try { localStorage.setItem('cj-pal', p); } catch (e) {}
  }
  document.querySelectorAll('.swatch').forEach(function (b) { b.addEventListener('click', function () { setPalette(b.dataset.p); }); });
  setPalette(start);

  // Gilt dust in any .dust container
  document.querySelectorAll('.dust').forEach(function (dust) {
    for (var i = 0; i < 36; i++) {
      var d = document.createElement('i'), s = (Math.random() * 2 + 1.5).toFixed(1) + 'px';
      d.style.cssText = 'left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;width:' + s + ';height:' + s + ';animation-delay:' + (Math.random() * 5).toFixed(2) + 's';
      dust.appendChild(d);
    }
  });

  // Reveal blocks below the fold
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (x, k) { if (x.getBoundingClientRect().top > window.innerHeight) { x.classList.add('pre'); x.style.transitionDelay = (k % 3) * 70 + 'ms'; io.observe(x); } });
  }

  // Booking forms: check required fields. With a WhatsApp number set, hand the details to WhatsApp;
  // without one, show a clear note and send nothing.
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('[role="status"]'), missing = [];
      f.querySelectorAll('[required]').forEach(function (x) { if (!String(x.value).trim()) missing.push(x.getAttribute('aria-label') || x.name); });
      if (missing.length) { msg.style.color = 'var(--ink)'; msg.textContent = 'Please fill in: ' + missing.join(', ') + '.'; return; }
      msg.style.color = 'var(--gilt)';
      if (!HAS) { msg.textContent = 'Thank you. Online booking opens shortly. Chandan\'s team will publish a WhatsApp number here very soon.'; return; }
      var kind = f.dataset.form, h1 = document.querySelector('h1');
      var head = kind === 'question' ? 'I have a question for Chandan ji.' : kind === 'consultation' ? 'I would like to book a consultation.' : 'I would like to book ' + (h1 ? h1.textContent.trim() : 'a puja') + '.';
      var lines = ['Namaste. ' + head];
      f.querySelectorAll('input, select, textarea').forEach(function (x) {
        var v = String(x.value).trim(); if (!v || x.type === 'button') return;
        var lab = x.id && f.querySelector('label[for="' + x.id + '"]'), name = lab ? lab.childNodes[0].textContent.trim() : (x.getAttribute('aria-label') || x.name);
        lines.push(name + ': ' + v);
      });
      var url = waLink(lines.join('\n'));
      msg.innerHTML = 'Opening WhatsApp with your details. If it does not open, <a class="underline" target="_blank" rel="noopener" href="' + url + '">tap here</a> or call ' + PHONE + '.';
      window.open(url, '_blank', 'noopener');
    });
  });

  // Static contact links switch on with the number:
  //   <a data-wa="prefilled text" data-on="Label when on" href="#form">Label when off</a>
  //   <a data-tel href="#form">Label when off</a>  (becomes the phone number)
  //   [data-contact-only] / [data-no-contact] blocks are shown or hidden by CSS via html.contact-on
  if (HAS) {
    document.querySelectorAll('a[data-wa]').forEach(function (a) { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; if (a.dataset.on) a.textContent = a.dataset.on; });
    document.querySelectorAll('a[data-tel]').forEach(function (a) { a.href = 'tel:+' + DIGITS; a.textContent = PHONE; });
    document.querySelectorAll('[data-phone-text]').forEach(function (el) { el.textContent = PHONE; });
  }

  window.CJ = { BASE: BASE, reduce: reduce, consult: consult, hasContact: HAS, phone: PHONE, waLink: waLink };
})();
