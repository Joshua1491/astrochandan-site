/* Free tools: each page sets <body data-tool="..."> and has a form[data-tool-form] plus a #result block.
   All maths comes from assets/astro.js; nothing is sent anywhere. */
(function () {
  var A = window.CJA, tool = document.body.dataset.tool;
  if (!A || !tool) return;
  A.ensureCities();
  var SAMPLE = { dob: '1990-08-15', tob: '06:30', pob: 'New Delhi, Delhi' };
  var SAMPLE_B = { dob: '1988-01-26', tob: '09:15', pob: 'Varanasi, Uttar Pradesh' };

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stat(label, value, sub) { return '<div class="card rounded-[12px] p-4 min-w-0"><p class="label muted text-[0.56rem]">' + label + '</p><p class="font-display text-2xl mt-1 leading-tight">' + value + '</p>' + (sub ? '<p class="text-xs muted mt-1">' + sub + '</p>' : '') + '</div>'; }
  function table(head, rows, cls) { return '<div class="tbl-wrap"><table class="tbl ' + (cls || '') + '"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>'; }
  function signName(i) { return A.SIGNS[i] + ' <span class="muted text-sm">(' + A.SIGNS_EN[i] + ')</span>'; }
  function nowJD() { return Date.now() / 86400000 + 2440587.5; }
  var quiet = false; // true while the on-load sample runs, so the page doesn't jump
  function show(html, sample) {
    var r = $('#result'); r.innerHTML = (sample ? '<p class="mb-5"><span class="sample-tag">Sample report</span> <span class="text-sm muted ml-2">' + sample + '</span></p>' : '') + html;
    r.hidden = false;
    if (!sample && !quiet) r.scrollIntoView({ behavior: A && window.CJ && window.CJ.reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function err(form, msg) { var s = form.querySelector('[role="status"]'); if (s) { s.style.color = 'var(--ink)'; s.textContent = msg; } }
  function ok(form) { var s = form.querySelector('[role="status"]'); if (s) s.textContent = ''; }
  function fill(form, pre, v) { ['dob', 'tob', 'pob'].forEach(function (k) { var el = form.querySelector('[name="' + pre + k + '"]'); if (el && v[k]) el.value = v[k]; }); }
  function sampleBirth(v) { var c = A.findCity(v.pob), p = v.dob.split('-').map(Number), t = v.tob.split(':').map(Number); return { jd: A.jdFromLocal(p[0], p[1], p[2], t[0], t[1], c[3]), lat: c[1], lon: c[2], tz: c[3], place: c[0], y: p[0], mo: p[1], d: p[2] }; }
  function bind(handler) {
    document.querySelectorAll('form[data-tool-form]').forEach(function (f) {
      f.setAttribute('novalidate', '');
      f.addEventListener('submit', function (e) { e.preventDefault(); handler(f); });
      var sb = f.querySelector('[data-sample]');
      if (sb) sb.addEventListener('click', function () { fill(f, '', SAMPLE); fill(f, 'b-', SAMPLE_B); fill(f, 'g-', SAMPLE); });
    });
  }

  // ---------- Kundli ----------
  function kundliHTML(b) {
    var c = A.chart(b.jd, b.lat, b.lon), ds = A.dashas(c.p.Moon.lon, b.jd), now = nowJD(), md = null, ad = null;
    ds.forEach(function (d) { if (now >= d.start && now < d.end) { md = d; d.subs.forEach(function (s) { if (now >= s.start && now < s.end) ad = s; }); } });
    var mg = A.manglik(c);
    var h = '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4">' +
      stat('Lagna (Ascendant)', A.SIGNS[c.ascSign], A.SIGNS_EN[c.ascSign] + ' · ' + A.dms(c.asc)) +
      stat('Moon sign (Rashi)', A.SIGNS[c.p.Moon.sign], A.SIGNS_EN[c.p.Moon.sign] + ' · lord ' + A.SIGN_LORD[c.p.Moon.sign]) +
      stat('Birth Nakshatra', c.p.Moon.nak.name, 'Pada ' + c.p.Moon.nak.pada + ' · lord ' + c.p.Moon.nak.lord) +
      stat('Running Dasha', md ? md.lord + ' / ' + (ad ? ad.lord : '') : '—', md ? 'Mahadasha to ' + A.fmtDate(md.end, b.tz) : 'Outside the 120-year cycle') + '</div>';
    h += '<div class="mt-8 grid gap-6 md:grid-cols-2">' +
      '<figure class="card rounded-[14px] p-5 md:p-6 text-center">' + A.chartSVG(c, 'D1') + '<figcaption class="label gilt mt-4">Lagna chart · D1</figcaption></figure>' +
      '<figure class="card rounded-[14px] p-5 md:p-6 text-center">' + A.chartSVG(c, 'D9') + '<figcaption class="label gilt mt-4">Navamsa · D9</figcaption></figure></div>' +
      '<p class="text-xs muted mt-3">North Indian style: houses are fixed, with house 1 in the top centre diamond. Numbers are signs (1 = Mesha … 12 = Meena). ℞ = retrograde.</p>';
    var rows = ['<tr><td><b>Lagna</b></td><td>' + A.SIGNS[c.ascSign] + '</td><td>' + A.dms(c.asc) + '</td><td>' + c.ascNak.name + ' (' + c.ascNak.pada + ')</td><td class="m">' + c.ascNak.lord + '</td><td>1</td></tr>'];
    A.BODIES.forEach(function (n) { var p = c.p[n]; rows.push('<tr><td><b>' + n + '</b>' + (p.retro && n !== 'Rahu' && n !== 'Ketu' ? ' <span class="gilt" title="Retrograde">℞</span>' : '') + '</td><td>' + A.SIGNS[p.sign] + '</td><td>' + p.deg + '</td><td>' + p.nak.name + ' (' + p.nak.pada + ')</td><td class="m">' + p.nak.lord + '</td><td>' + p.house + '</td></tr>'); });
    h += '<h2 class="font-display text-3xl mt-12">Planet positions</h2><div class="card rounded-[14px] p-2 md:p-4 mt-4">' + table(['Graha', 'Sign', 'Degree', 'Nakshatra (pada)', 'Star lord', 'House'], rows) + '</div>';
    var drows = ds.map(function (d) { var cur = d === md; return '<tr' + (cur ? ' style="background:color-mix(in srgb,var(--accent2) 30%,transparent)"' : '') + '><td><b>' + d.lord + '</b>' + (cur ? ' <span class="label gilt text-[0.55rem] ml-1">Now</span>' : '') + '</td><td>' + A.fmtDate(Math.max(d.start, b.jd), b.tz) + '</td><td>' + A.fmtDate(d.end, b.tz) + '</td></tr>'; });
    h += '<div class="mt-12 grid gap-6 lg:grid-cols-2"><div><h2 class="font-display text-3xl">Vimshottari Mahadasha</h2><div class="card rounded-[14px] p-2 md:p-4 mt-4">' + table(['Mahadasha', 'From', 'To'], drows) + '</div></div>';
    if (md) h += '<div><h2 class="font-display text-3xl">Antardashas in ' + md.lord + '</h2><div class="card rounded-[14px] p-2 md:p-4 mt-4">' + table(['Antardasha', 'From', 'To'], md.subs.map(function (s) { var cur = s === ad; return '<tr' + (cur ? ' style="background:color-mix(in srgb,var(--accent2) 30%,transparent)"' : '') + '><td><b>' + md.lord + ' / ' + s.lord + '</b></td><td>' + A.fmtDate(s.start, b.tz) + '</td><td>' + A.fmtDate(s.end, b.tz) + '</td></tr>'; })) + '</div></div>';
    h += '</div>';
    h += '<div class="mt-10 grid gap-4 md:grid-cols-2"><div class="card rounded-[14px] p-5"><p class="label gilt">Mangal dosha check</p><p class="mt-2">' + (mg.fromLagna || mg.fromMoon ? 'Mars falls in house ' + mg.lagna + ' from the Lagna and ' + mg.moon + ' from the Moon, so a Mangal dosha is indicated' + (mg.ownOrExalted ? ', though Mars is in its own or exalted sign, which classical texts treat as a softening.' : '.') : 'No Mangal dosha from the Lagna or the Moon (Mars in house ' + mg.lagna + ' and ' + mg.moon + ').') + '</p></div>' +
      '<div class="card rounded-[14px] p-5"><p class="label gilt">How this was calculated</p><p class="mt-2 text-sm muted">Sidereal zodiac, Lahiri ayanamsa ' + c.ayan.toFixed(2) + '°. Mean lunar node for Rahu and Ketu. Place: ' + esc(b.place) + ' (UTC' + (b.tz >= 0 ? '+' : '') + b.tz + ').</p></div></div>';
    return h;
  }

  // ---------- Milan ----------
  function milanHTML(g, bo) {
    var cg = A.chart(g.jd, g.lat, g.lon), cb = A.chart(bo.jd, bo.lat, bo.lon);
    var m = A.milan({ sign: cg.p.Moon.sign, nak: cg.p.Moon.nak.i, lon: cg.p.Moon.lon }, { sign: cb.p.Moon.sign, nak: cb.p.Moon.nak.i, lon: cb.p.Moon.lon });
    var verdict = m.total >= 25 ? 'Good to excellent' : m.total >= 18 ? 'Acceptable' : 'Usually not advised without a closer look';
    var pct = Math.round(m.total / 36 * 100);
    var h = '<div class="grid gap-6 md:grid-cols-[0.8fr_1.2fr] items-center"><div class="card rounded-[14px] p-6 text-center"><p class="label gilt">Guna score</p><p class="font-display text-7xl mt-2">' + (m.total % 1 ? m.total.toFixed(1) : m.total) + '<span class="text-3xl muted"> / 36</span></p>' +
      '<div class="mt-4 h-2 rounded-full overflow-hidden" style="background:var(--bg2)"><div style="width:' + pct + '%;height:100%;background:var(--ink)"></div></div><p class="mt-4 font-medium">' + verdict + '</p></div>' +
      '<div class="grid grid-cols-2 gap-3">' + stat('Bride · Moon', A.SIGNS[cg.p.Moon.sign], cg.p.Moon.nak.name + ', pada ' + cg.p.Moon.nak.pada) + stat('Groom · Moon', A.SIGNS[cb.p.Moon.sign], cb.p.Moon.nak.name + ', pada ' + cb.p.Moon.nak.pada) +
      stat('Bride · Mangal', manglikWord(A.manglik(cg)), 'From Lagna and Moon') + stat('Groom · Mangal', manglikWord(A.manglik(cb)), 'From Lagna and Moon') + '</div></div>';
    h += '<div class="card rounded-[14px] p-2 md:p-4 mt-8">' + table(['Koota', 'Bride · Groom', 'Points'], m.rows.map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td class="m">' + r[3] + '</td><td><b>' + r[2] + '</b> <span class="muted">/ ' + r[1] + '</span></td></tr>'; })) + '</div>';
    var notes = [];
    if (m.nadiDosha) notes.push('<b>Nadi dosha</b> is present (same Nadi). ' + (m.sameSignDiffNak || m.sameNakDiffSign ? 'Classical texts cancel it here, because the two share a ' + (m.sameSignDiffNak ? 'Moon sign but not a Nakshatra' : 'Nakshatra but not a Moon sign') + '.' : 'It is taken seriously and needs a careful look at both charts.'));
    if (m.bhakootDosha) notes.push('<b>Bhakoot dosha</b> is present. It is often cancelled when the two Moon-sign lords are the same planet or natural friends: here they are ' + A.SIGN_LORD[cg.p.Moon.sign] + ' and ' + A.SIGN_LORD[cb.p.Moon.sign] + '.');
    var mg1 = A.manglik(cg), mg2 = A.manglik(cb), a1 = mg1.fromLagna || mg1.fromMoon, a2 = mg2.fromLagna || mg2.fromMoon;
    if (a1 && a2) notes.push('<b>Both are Manglik.</b> Traditionally this balances the dosha.');
    else if (a1 || a2) notes.push('<b>One partner is Manglik.</b> Its strength and any cancellations should be checked in both full charts.');
    if (!notes.length) notes.push('No Nadi, Bhakoot or Mangal dosha is indicated by this check.');
    h += '<div class="mt-6 grid gap-3">' + notes.map(function (n) { return '<p class="card rounded-[12px] p-4 text-sm leading-relaxed">' + n + '</p>'; }).join('') + '</div>';
    h += '<p class="text-xs muted mt-4">Almanacs differ slightly on the Vashya and Gana tables, so a score may vary by a point between sources. The score is a first look; a full match also weighs both seventh houses, the Navamsa and the Dashas after marriage.</p>';
    return h;
  }
  function manglikWord(r) { return (r.fromLagna || r.fromMoon) ? 'Manglik' : 'Not Manglik'; }

  // ---------- Shared small reports ----------
  var LAGNA_TXT = ['Direct, energetic and quick to start things; learns by doing.', 'Steady, patient and sensual; values comfort, beauty and security.', 'Curious, talkative and adaptable; thinks in connections and ideas.', 'Caring, intuitive and protective; home and family run deep.', 'Warm, proud and generous; a natural sense of presence and leadership.', 'Precise, practical and service-minded; notices what others miss.', 'Diplomatic, fair and graceful; at its best in partnership.', 'Intense, private and resilient; goes to the bottom of things.', 'Optimistic, principled and searching; drawn to learning and travel.', 'Disciplined, ambitious and patient; builds slowly and lastingly.', 'Independent, thoughtful and humane; thinks about the wider group.', 'Gentle, imaginative and compassionate; strongly tuned to feeling.'];

  var handlers = {
    kundli: function (f) { var b = A.readBirth(f, ''); if (b.error) return err(f, b.error); ok(f); show(kundliHTML(b)); },
    milan: function (f) {
      var g = A.readBirth(f, 'g-'), bo = A.readBirth(f, 'b-');
      if (g.error) return err(f, 'Bride: ' + g.error); if (bo.error) return err(f, 'Groom: ' + bo.error); ok(f); show(milanHTML(g, bo));
    },
    'moon-sign': function (f) {
      var unknown = f.querySelector('[name="unknown"]') && f.querySelector('[name="unknown"]').checked;
      var b = A.readBirth(f, '', { timeOptional: unknown }); if (b.error) return err(f, b.error); ok(f);
      var j0 = A.jdFromLocal(b.y, b.mo, b.d, 0, 0, b.tz), j1 = A.jdFromLocal(b.y, b.mo, b.d, 23, 59, b.tz);
      var m = A.sidOf('Moon', b.jd), s = A.signOf(m), nk = A.nakOf(m), h;
      if (unknown) {
        var s0 = A.signOf(A.sidOf('Moon', j0)), s1 = A.signOf(A.sidOf('Moon', j1));
        h = s0 === s1 ? '<p class="font-display text-4xl">Your Moon sign is ' + A.SIGNS[s0] + ' (' + A.SIGNS_EN[s0] + ').</p><p class="mt-3 muted">The Moon stayed in this sign all day, so the birth time does not change it.</p>'
          : '<p class="font-display text-4xl">' + A.SIGNS[s0] + ' or ' + A.SIGNS[s1] + '</p><p class="mt-3 muted">The Moon changed sign on this day. Without a birth time it could be either; a consultation can narrow it down from life events.</p>';
      } else h = '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4">' + stat('Moon sign', A.SIGNS[s], A.SIGNS_EN[s]) + stat('Sign lord', A.SIGN_LORD[s]) + stat('Nakshatra', nk.name, 'Pada ' + nk.pada) + stat('Moon at', A.dms(m), 'in ' + A.SIGNS[s]) + '</div>';
      h += '<p class="mt-6"><a class="link-arrow" href="../horoscope/?sign=' + A.SIGNS_EN[s].toLowerCase() + '">Read the ' + A.SIGNS[s] + ' horoscope</a></p>';
      show(h);
    },
    lagna: function (f) {
      var b = A.readBirth(f, ''); if (b.error) return err(f, b.error); ok(f);
      var c = A.chart(b.jd, b.lat, b.lon), s = c.ascSign, deg = c.asc % 30;
      var h = '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4">' + stat('Lagna', A.SIGNS[s], A.SIGNS_EN[s]) + stat('Rising degree', A.dms(c.asc)) + stat('Lagna lord', A.SIGN_LORD[s], 'in ' + A.SIGNS[c.p[A.SIGN_LORD[s]].sign] + ', house ' + c.p[A.SIGN_LORD[s]].house) + stat('Nakshatra', c.ascNak.name, 'Pada ' + c.ascNak.pada) + '</div>' +
        '<p class="mt-6 text-lg leading-relaxed">' + LAGNA_TXT[s] + '</p>';
      if (deg < 2 || deg > 28) h += '<p class="mt-4 card rounded-[12px] p-4 text-sm">Your Lagna is within 2° of a sign boundary. A birth time a few minutes off could change it, so it is worth checking against a birth certificate.</p>';
      show(h);
    },
    nakshatra: function (f) {
      var b = A.readBirth(f, ''); if (b.error) return err(f, b.error); ok(f);
      var m = A.sidOf('Moon', b.jd), nk = A.nakOf(m), g = { D: 'Deva', M: 'Manushya', R: 'Rakshasa' }[A.GANA[nk.i]];
      var h = '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4">' + stat('Nakshatra', nk.name, 'Pada ' + nk.pada + ' of 4') + stat('Ruling planet', nk.lord) + stat('Deity', A.NAK_DEITY[nk.i]) + stat('Moon sign', A.SIGNS[A.signOf(m)]) +
        stat('Gana', g) + stat('Yoni', A.YONI[A.YONI_OF[nk.i]]) + stat('Nadi', A.NADI_N[A.NADI[nk.i]]) + stat('Name syllable', A.NAK_SYL[nk.i][nk.pada - 1], 'for pada ' + nk.pada) + '</div>' +
        '<p class="mt-6"><a class="link-arrow" href="../baby-names/?nak=' + nk.i + '&pada=' + nk.pada + '">See names for this Nakshatra</a></p>';
      var row = document.querySelector('#nakTable tr[data-i="' + nk.i + '"]'); document.querySelectorAll('#nakTable tr').forEach(function (r) { r.style.background = ''; }); if (row) row.style.background = 'color-mix(in srgb,var(--accent2) 35%,transparent)';
      show(h);
    },
    manglik: function (f) {
      var b = A.readBirth(f, ''); if (b.error) return err(f, b.error); ok(f);
      var c = A.chart(b.jd, b.lat, b.lon), r = A.manglik(c), on = r.fromLagna || r.fromMoon;
      var h = '<p class="font-display text-4xl">' + (on ? 'Mangal dosha is indicated.' : 'No Mangal dosha.') + '</p>' +
        '<div class="grid gap-3 grid-cols-1 sm:grid-cols-3 mt-6">' + stat('From Lagna', 'House ' + r.lagna, r.fromLagna ? 'Dosha position' : 'Clear') + stat('From Moon', 'House ' + r.moon, r.fromMoon ? 'Dosha position' : 'Clear') + stat('From Venus', 'House ' + r.venus, r.fromVenus ? 'Dosha position' : 'Clear') + '</div>' +
        '<p class="mt-6 muted leading-relaxed">Mars is in ' + A.SIGNS[c.p.Mars.sign] + ' at ' + c.p.Mars.deg + '. ' + (on ? (r.ownOrExalted ? 'Mars is in its own or exalted sign, which classical texts count as a softening. ' : '') + 'A dosha found this way is common (about half of all charts, counted from the Lagna) and is often reduced by other factors, or balanced when both partners have it. It is not a reason for alarm.' : 'Mars is not in the 1st, 2nd, 4th, 7th, 8th or 12th house from either the Lagna or the Moon.') + ' The position from Venus is shown for reference; the verdict follows the Lagna and the Moon, as most traditions do.</p>';
      show(h);
    },
    'sade-sati': function (f) {
      var b = A.readBirth(f, '', { timeOptional: true }); if (b.error) return err(f, b.error); ok(f);
      var ms = A.signOf(A.sidOf('Moon', b.jd)), now = nowJD();
      var eps = A.sadeSati(ms, Math.max(1900, b.y), Math.min(2099, b.y + 100)), cur = null;
      var rows = eps.map(function (e) {
        var isNow = now >= e.start && (!e.end || now < e.end); if (isNow) cur = e;
        return '<tr' + (isNow ? ' style="background:color-mix(in srgb,var(--accent2) 35%,transparent)"' : '') + '><td>' + A.fmtDate(e.start, 5.5) + '</td><td>' + (e.end ? A.fmtDate(e.end, 5.5) : 'beyond 2099') + '</td><td class="m">' + (e.phases[2] ? 'Peak from ' + A.fmtDate(e.phases[2], 5.5) : '') + (e.phases[3] ? ' · last phase from ' + A.fmtDate(e.phases[3], 5.5) : '') + '</td><td>' + (isNow ? '<b>Running now</b>' : e.start > now ? 'Upcoming' : 'Past') + '</td></tr>';
      });
      var satNow = A.signOf(A.sidOf('Saturn', now)), rel = (satNow - ms + 12) % 12;
      var h = '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4">' + stat('Your Moon sign', A.SIGNS[ms], A.SIGNS_EN[ms]) + stat('Saturn today', A.SIGNS[satNow], A.SIGNS_EN[satNow]) +
        stat('Sade Sati now?', cur ? 'Yes' : 'No', cur ? ['First phase (12th from Moon)', 'Peak (over the Moon)', 'Last phase (2nd from Moon)'][rel === 11 ? 0 : rel === 0 ? 1 : 2] : '') +
        stat(rel === 3 || rel === 7 ? 'Dhaiya now' : 'Dhaiya', rel === 3 || rel === 7 ? 'Yes' : 'No', 'Saturn 4th or 8th from Moon') + '</div>' +
        '<h2 class="font-display text-3xl mt-10">Your Sade Sati periods</h2><div class="card rounded-[14px] p-2 md:p-4 mt-4">' + table(['Begins', 'Ends', 'Phases', 'Status'], rows) + '</div>' +
        '<p class="text-xs muted mt-3">Dates are when sidereal Saturn first enters and finally leaves the three signs, allowing for retrograde returns. Accurate to within a few days.</p>';
      show(h);
    },
    panchang: function (f) { dayReport(f, 'panchang'); },
    choghadiya: function (f) { dayReport(f, 'choghadiya'); },
    muhurat: muhurat,
    'baby-names': babyNames
  };

  function placeFrom(f) {
    var q = (f.querySelector('[name="pob"]') || {}).value, lat = parseFloat((f.querySelector('[name="lat"]') || {}).value), lon = parseFloat((f.querySelector('[name="lon"]') || {}).value), tz = parseFloat((f.querySelector('[name="tz"]') || {}).value);
    if (!isNaN(lat) && !isNaN(lon)) return { lat: lat, lon: lon, tz: isNaN(tz) ? 5.5 : tz, name: q || 'Custom place' };
    var pin = f.querySelector('[name="pob"]'), d = (f.querySelector('[name="date"]') || {}).value || new Date().toISOString().slice(0, 10), dp = d.split('-').map(Number);
    var hit = pin && pin.dataset.lat ? { lat: +pin.dataset.lat, lon: +pin.dataset.lon, tz: pin.dataset.tz, label: pin.dataset.label } : (q && window.CJ && CJ.places.ready() ? CJ.places.search(q, 1)[0] : null);
    if (hit) return { lat: hit.lat, lon: hit.lon, tz: isNaN(tz) ? A.tzOffset(hit.tz, dp[0], dp[1], dp[2], 12, 0) : tz, name: hit.label };
    var c = A.findCity(q || 'Gurugram'); if (!c) return null;
    return { lat: c[1], lon: c[2], tz: isNaN(tz) ? c[3] : tz, name: c[0] };
  }
  function dayReport(f, kind) {
    var d = (f.querySelector('[name="date"]') || {}).value, pl = placeFrom(f);
    if (!d) return err(f, 'Please choose a date.'); if (!pl) return err(f, 'Pick a city from the list, or enter latitude and longitude.'); ok(f);
    var p = d.split('-').map(Number), info = A.dayInfo(p[0], p[1], p[2], pl), T = function (j) { return A.fmtTime(j, pl.tz); };
    if (!info.sunrise) return show('<p>The Sun does not rise or set on this date at this latitude.</p>');
    var head = '<p class="label gilt">' + esc(pl.name) + ' · ' + new Date(Date.UTC(p[0], p[1] - 1, p[2])).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) + '</p>';
    var h = head;
    if (kind === 'panchang') {
      var a = info.atSunrise, tEnd = A.fmtDate(info.tithiEnds, pl.tz, { day: 'numeric', month: 'short' }) + ' ' + T(info.tithiEnds), nEnd = A.fmtDate(info.nakEnds, pl.tz, { day: 'numeric', month: 'short' }) + ' ' + T(info.nakEnds);
      h += '<div class="grid gap-3 grid-cols-2 lg:grid-cols-4 mt-4">' + stat('Tithi', a.paksha + ' ' + a.tithi, 'until ' + tEnd) + stat('Nakshatra', a.nak.name, 'until ' + nEnd) + stat('Yoga', a.yoga, 'at sunrise') + stat('Karana', a.karana, 'at sunrise') +
        stat('Vara', info.vara.split(' ')[0], info.vara.split(' ')[1].replace(/[()]/g, '')) + stat('Moon sign', A.SIGNS[a.moonSign], A.SIGNS_EN[a.moonSign]) + stat('Sunrise', T(info.sunrise)) + stat('Sunset', T(info.sunset)) + '</div>' +
        '<div class="card rounded-[14px] p-2 md:p-4 mt-6">' + table(['Period', 'From', 'To', ''], [
          '<tr><td><b>Abhijit Muhurat</b></td><td>' + T(info.abhijit[0]) + '</td><td>' + T(info.abhijit[1]) + '</td><td class="m">Auspicious</td></tr>',
          '<tr><td><b>Rahu Kaal</b></td><td>' + T(info.rahu[0]) + '</td><td>' + T(info.rahu[1]) + '</td><td class="m">Avoid new starts</td></tr>',
          '<tr><td><b>Yamaganda</b></td><td>' + T(info.yama[0]) + '</td><td>' + T(info.yama[1]) + '</td><td class="m">Avoid new starts</td></tr>',
          '<tr><td><b>Gulika Kaal</b></td><td>' + T(info.gulika[0]) + '</td><td>' + T(info.gulika[1]) + '</td><td class="m">Avoid new starts</td></tr>']) + '</div>' +
        '<p class="text-xs muted mt-3">Moon ' + Math.round(a.illum * 100) + '% lit (' + A.phaseName(a.elong) + ' at sunrise). Times are local (UTC' + (pl.tz >= 0 ? '+' : '') + pl.tz + ') and accurate to about a minute; Abhijit is the 8th of 15 daytime muhurtas.</p>';
    } else {
      function rows(list) { return list.map(function (c) { var good = c.q === 'Best' || c.q === 'Good', bad = c.q === 'Avoid'; return '<tr><td><b>' + c.name + '</b></td><td>' + T(c.start) + '–' + T(c.end) + '</td><td><span class="chog ' + (good ? 'g' : bad ? 'b' : 'n') + '">' + c.q + '</span></td></tr>'; }); }
      h += '<div class="grid gap-6 lg:grid-cols-2 mt-4"><div><h2 class="font-display text-3xl">Day <span class="text-base muted">' + T(info.sunrise) + ' to ' + T(info.sunset) + '</span></h2><div class="card rounded-[14px] p-2 md:p-4 mt-3">' + table(['Choghadiya', 'Time', 'Quality'], rows(info.chogDay)) + '</div></div>' +
        '<div><h2 class="font-display text-3xl">Night <span class="text-base muted">to next sunrise</span></h2><div class="card rounded-[14px] p-2 md:p-4 mt-3">' + table(['Choghadiya', 'Time', 'Quality'], rows(info.chogNight)) + '</div></div></div>' +
        '<p class="text-xs muted mt-3">Rahu Kaal today: ' + T(info.rahu[0]) + '–' + T(info.rahu[1]) + '. Times are local (UTC' + (pl.tz >= 0 ? '+' : '') + pl.tz + ').</p>';
    }
    show(h);
  }

  // Muhurat shortlist: classical first-pass filters on tithi, nakshatra, weekday and karana at sunrise
  var OCC = {
    marriage: { cm: true, n: 'Marriage', nak: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26], days: [1, 3, 4, 5], note: 'Days in Chaturmas are already left out. Marriage muhurats are also avoided while Jupiter or Venus is combust; Chandan checks this before confirming.' },
    'griha-pravesh': { cm: true, n: 'Griha Pravesh', nak: [3, 4, 11, 13, 16, 20, 22, 23, 25, 26], days: [1, 3, 4, 5], note: 'Days in Chaturmas are already left out. Many families also avoid the month of Pausha for a Griha Pravesh.' },
    vehicle: { n: 'Buying a vehicle', nak: [0, 3, 4, 6, 7, 12, 13, 14, 16, 21, 22, 26], days: [1, 3, 4, 5], note: 'For a vehicle, the time of taking delivery matters most.' },
    business: { n: 'Starting a business', nak: [0, 3, 4, 7, 11, 12, 13, 16, 20, 25, 26], days: [3, 4, 5], note: 'Your own chart and running Dasha matter as much as the day; bring both to a consultation for a final choice.' },
    namkaran: { n: 'Naming ceremony', nak: [0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26], days: [1, 3, 4, 5], note: 'Traditionally held on the 11th, 12th or 13th day after birth, or on a good day after that.' },
    property: { n: 'Buying property', nak: [3, 4, 6, 11, 16, 20, 22, 25, 26], days: [3, 4, 5], note: 'For property, the registration time is the one to fix.' }
  };
  function win(info, tz) {
    var end = Math.min(info.nakEnds, info.tithiEnds, info.sunrise + 1), next = A.fmtDate(end, tz) !== A.fmtDate(info.sunrise, tz);
    return A.fmtTime(info.sunrise, tz) + '–' + A.fmtTime(end, tz) + (next ? ' (next day)' : '');
  }
  var GOOD_TITHI = [1, 2, 4, 6, 9, 10, 12, 15, 16, 17, 19]; // tithi index (0-based): Shukla 2,3,5,7,10,11,13 and Krishna 1,2,3,5
  function muhurat(f) {
    var occ = OCC[(f.querySelector('[name="occasion"]') || {}).value], mon = (f.querySelector('[name="month"]') || {}).value, pl = placeFrom(f);
    if (!occ || !mon) return err(f, 'Choose an occasion and a month.'); if (!pl) return err(f, 'Pick a city from the list.'); ok(f);
    var ym = mon.split('-').map(Number), days = new Date(Date.UTC(ym[0], ym[1], 0)).getUTCDate(), out = [], skippedCM = 0;
    var todayStr = new Date(Date.now() + pl.tz * 3600000).toISOString().slice(0, 10);
    for (var d = 1; d <= days; d++) {
      var ds = ym[0] + '-' + String(ym[1]).padStart(2, '0') + '-' + String(d).padStart(2, '0'); if (ds < todayStr) continue;
      var info = A.dayInfo(ym[0], ym[1], d, pl); if (!info.sunrise) continue;
      if (occ.cm && A.inChaturmas(info.sunrise)) { skippedCM++; continue; }
      var a = info.atSunrise;
      if (GOOD_TITHI.indexOf(a.tithiIndex) < 0 || occ.nak.indexOf(a.nak.i) < 0 || occ.days.indexOf(info.weekday) < 0 || a.karana === 'Vishti') continue;
      out.push('<tr><td><b>' + new Date(Date.UTC(ym[0], ym[1] - 1, d)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) + '</b></td><td>' + a.paksha + ' ' + a.tithi + '</td><td>' + a.nak.name + '</td><td class="m">' + win(info, pl.tz) + '</td><td class="m">' + A.fmtTime(info.rahu[0], pl.tz) + '–' + A.fmtTime(info.rahu[1], pl.tz) + '</td></tr>');
    }
    var h = '<p class="label gilt">' + occ.n + ' · ' + esc(pl.name) + ' · ' + new Date(Date.UTC(ym[0], ym[1] - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }) + '</p>';
    h += out.length ? '<div class="card rounded-[14px] p-2 md:p-4 mt-4">' + table(['Date', 'Tithi', 'Nakshatra', 'Good window', 'Avoid (Rahu Kaal)'], out) + '</div><p class="text-xs muted mt-3">Dates already past are not shown. The window runs from sunrise until the tithi or Nakshatra changes, capped at the next sunrise. Times are local.</p>'
      : '<p class="font-display text-3xl mt-4">No remaining day this month passes every classical filter.</p><p class="muted mt-2">Try the next month, or ask Chandan, who can weigh the exceptions for your chart.</p>';
    if (skippedCM) h += '<p class="mt-4 text-sm muted">' + skippedCM + ' day' + (skippedCM > 1 ? 's' : '') + ' this month fall in Chaturmas (Devshayani to Devuthani Ekadashi) and were left out.</p>';
    h += '<p class="mt-5 card rounded-[12px] p-4 text-sm">' + occ.note + ' This is a first shortlist; the final muhurat should be matched to the people involved.</p>';
    show(h);
  }

  // Baby names by Nakshatra syllable
  var NAMES = [
    ['Chudamani', 'b', 'Crest jewel'], ['Chetan', 'b', 'Consciousness'], ['Chetna', 'g', 'Awareness'], ['Lakshya', 'b', 'Aim, goal'], ['Lavanya', 'g', 'Grace, beauty'], ['Lalit', 'b', 'Graceful'], ['Lata', 'g', 'Creeper, vine'],
    ['Likhit', 'b', 'Written'], ['Lipika', 'g', 'Script, letters'], ['Lubdhak', 'b', 'The star Sirius'], ['Lekha', 'g', 'Writing, line'], ['Lokesh', 'b', 'Lord of the world'], ['Lochan', 'b', 'Eye'], ['Lopa', 'g', 'Short for Lopamudra, a learned sage'],
    ['Aarav', 'b', 'Peaceful'], ['Ananya', 'g', 'Unique'], ['Aditi', 'g', 'Boundless; mother of the gods'], ['Arjun', 'b', 'Bright, shining'], ['Ishaan', 'b', 'Lord of the north-east; Shiva'], ['Isha', 'g', 'Goddess'], ['Ira', 'g', 'Earth; Saraswati'], ['Uday', 'b', 'Rising, dawn'], ['Urvi', 'g', 'Earth'], ['Ujjwal', 'b', 'Bright'], ['Eshan', 'b', 'Desiring; Shiva'], ['Ekta', 'g', 'Unity'],
    ['Om', 'b', 'The sacred syllable'], ['Ojas', 'b', 'Vitality'], ['Oviya', 'g', 'Artist (Tamil)'], ['Vansh', 'b', 'Lineage'], ['Varun', 'b', 'Lord of the waters'], ['Vani', 'g', 'Speech; Saraswati'], ['Vivaan', 'b', 'Full of life'], ['Vidya', 'g', 'Knowledge'], ['Vihaan', 'b', 'Dawn'], ['Vritika', 'g', 'Thought'],
    ['Vedant', 'b', 'Culmination of the Vedas'], ['Vedika', 'g', 'Altar'], ['Vyom', 'b', 'Sky'], ['Kabir', 'b', 'Great'], ['Kavya', 'g', 'Poetry'], ['Kartik', 'b', 'A Hindu month; Kartikeya'], ['Kiara', 'g', 'Bright'], ['Kirti', 'g', 'Fame'], ['Kiran', 'b', 'Ray of light'],
    ['Kunal', 'b', 'Lotus'], ['Kumud', 'g', 'Water lily'], ['Ghanshyam', 'b', 'Dark as a cloud; Krishna'], ['Navya', 'g', 'New'], ['Naman', 'b', 'Salutation'], ['Chhavi', 'g', 'Reflection, image'], ['Chhayank', 'b', 'The Moon'],
    ['Keshav', 'b', 'Krishna'], ['Ketaki', 'g', 'A fragrant flower'], ['Kovid', 'b', 'Learned'], ['Komal', 'g', 'Tender'], ['Harsh', 'b', 'Joy'], ['Harini', 'g', 'Deer'], ['Himanshu', 'b', 'The Moon'], ['Hiral', 'g', 'Lustrous'], ['Hridaan', 'b', 'Big-hearted'],
    ['Hemant', 'b', 'Early winter'], ['Hema', 'g', 'Golden'], ['Hrithik', 'b', 'From the heart'], ['Daksh', 'b', 'Able, skilful'], ['Damini', 'g', 'Lightning'], ['Divya', 'g', 'Divine'], ['Dhruv', 'b', 'Pole star, steadfast'], ['Diya', 'g', 'Lamp'], ['Dushyant', 'b', 'Destroyer of evil'],
    ['Devansh', 'b', 'Part of the divine'], ['Devika', 'g', 'Little goddess'], ['Manav', 'b', 'Human'], ['Mahi', 'g', 'Earth'], ['Mihir', 'b', 'The Sun'], ['Mira', 'g', 'Devotee of Krishna'], ['Mukul', 'b', 'Bud'], ['Mugdha', 'g', 'Charmed'],
    ['Medha', 'g', 'Intellect'], ['Meghansh', 'b', 'Part of a cloud'], ['Mohit', 'b', 'Enchanted'], ['Mohini', 'g', 'Enchanting'], ['Tanvi', 'g', 'Delicate'], ['Tarun', 'b', 'Young'], ['Tisha', 'g', 'Joy'], ['Tilak', 'b', 'Auspicious mark'], ['Tushar', 'b', 'Snow'], ['Tulsi', 'g', 'Holy basil'],
    ['Tejas', 'b', 'Radiance'], ['Tejal', 'g', 'Bright'], ['Toshan', 'b', 'Contentment'], ['Toral', 'g', 'A folk heroine'], ['Pavan', 'b', 'Wind'], ['Pari', 'g', 'Angel'], ['Pihu', 'g', 'Call of a bird'], ['Pinak', 'b', 'Shiva\'s bow'],
    ['Pushkar', 'b', 'Lotus; a holy lake'], ['Purvi', 'g', 'Eastern'], ['Shaurya', 'b', 'Bravery'], ['Sharvani', 'g', 'Parvati'], ['Nakul', 'b', 'Mongoose; a Pandava'], ['Naina', 'g', 'Eyes'], ['Tharun', 'b', 'Young (southern spelling)'],
    ['Pehal', 'g', 'Beginning'], ['Prem', 'b', 'Love'], ['Pooja', 'g', 'Worship'], ['Pranav', 'b', 'The syllable Om'], ['Raghav', 'b', 'Rama'], ['Radhika', 'g', 'Radha'], ['Rishi', 'b', 'Sage'], ['Riya', 'g', 'Singer'], ['Rudra', 'b', 'Shiva'], ['Rupal', 'g', 'Silvery'],
    ['Reyansh', 'b', 'Ray of light'], ['Reva', 'g', 'The Narmada river'], ['Rohan', 'b', 'Ascending'], ['Rohini', 'g', 'A Nakshatra; Moon\'s consort'], ['Nidhi', 'g', 'Treasure'], ['Nikhil', 'b', 'Complete'], ['Nupur', 'g', 'Anklet'], ['Neel', 'b', 'Blue'], ['Neha', 'g', 'Affection'],
    ['Noopur', 'g', 'Anklet'], ['Yash', 'b', 'Fame'], ['Yamini', 'g', 'Night'], ['Yuvraj', 'b', 'Crown prince'], ['Yukta', 'g', 'Attentive'], ['Yogesh', 'b', 'Lord of yoga'], ['Yogita', 'g', 'Enchanted'], ['Yesha', 'g', 'Glory'],
    ['Bharat', 'b', 'India; a king'], ['Bhavya', 'g', 'Grand'], ['Bhishma', 'b', 'Of a terrible vow'], ['Bhumi', 'g', 'Earth'], ['Bhushan', 'b', 'Ornament'], ['Dhairya', 'b', 'Patience'], ['Dhara', 'g', 'Earth'], ['Phalguni', 'g', 'Born in Phalguna'],
    ['Bhoomika', 'g', 'Earth'], ['Bhola', 'b', 'Simple; Shiva'], ['Jay', 'b', 'Victory'], ['Janvi', 'g', 'The Ganga'], ['Jiya', 'g', 'Heart'], ['Jitesh', 'b', 'Lord of victory'], ['Jugal', 'b', 'Pair'], ['Juhi', 'g', 'Jasmine'],
    ['Jeevan', 'b', 'Life'], ['Jeet', 'b', 'Victory'], ['Joshita', 'g', 'Pleased'], ['Jyoti', 'g', 'Light'], ['Ghanashyam', 'b', 'Krishna'], ['Gaurav', 'b', 'Pride'], ['Gauri', 'g', 'Parvati'], ['Girish', 'b', 'Lord of mountains'], ['Gitanjali', 'g', 'An offering of songs'],
    ['Gunjan', 'g', 'Humming'], ['Gurnoor', 'b', 'Light of the guru'], ['Geet', 'g', 'Song'], ['Gopal', 'b', 'Cowherd; Krishna'], ['Gomati', 'g', 'A river'], ['Saanvi', 'g', 'Lakshmi'], ['Sahil', 'b', 'Shore'], ['Siddharth', 'b', 'One who has attained'], ['Siya', 'g', 'Sita'],
    ['Suraj', 'b', 'The Sun'], ['Suhani', 'g', 'Pleasant'], ['Sejal', 'g', 'River water'], ['Sevak', 'b', 'Servant, devotee'], ['Soham', 'b', 'I am that'], ['Sonal', 'g', 'Golden'], ['Darshan', 'b', 'Sight of the divine'], ['Dipti', 'g', 'Brightness'],
    ['Durga', 'g', 'The invincible goddess'], ['Thakur', 'b', 'Lord'], ['Jhanvi', 'g', 'The Ganga'], ['Dev', 'b', 'Divine'], ['Deepa', 'g', 'Lamp'], ['Darsh', 'b', 'Sight'], ['Charu', 'g', 'Beautiful'], ['Chandan', 'b', 'Sandalwood'], ['Chirag', 'b', 'Lamp'], ['Chitra', 'g', 'Picture; a Nakshatra']
  ];
  function babyNames(f) {
    var nakSel = f.querySelector('[name="nak"]'), padaSel = f.querySelector('[name="pada"]'), gender = (f.querySelector('[name="gender"]') || {}).value || 'any';
    var i = parseInt(nakSel.value, 10), pada = parseInt(padaSel.value, 10);
    var syl = isNaN(pada) ? A.NAK_SYL[i] : [A.NAK_SYL[i][pada - 1]];
    var list = NAMES.filter(function (n) { return (gender === 'any' || n[1] === gender) && syl.some(function (s) { var nm = n[0].toLowerCase().replace(/^([bcdghjklmnpstv]h?)[ry](?=[aeiou])/, '$1'); return nm.indexOf(s.toLowerCase()) === 0 || n[0].toLowerCase().indexOf(s.toLowerCase()) === 0; }); });
    var h = '<p class="label gilt">' + A.NAK[i] + (isNaN(pada) ? ' · all four padas' : ' · pada ' + pada) + '</p><p class="font-display text-4xl mt-2">Starting sounds: ' + syl.join(', ') + '</p>';
    h += list.length ? '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-6">' + list.map(function (n) { return '<div class="card rounded-[12px] p-4"><p class="font-display text-2xl">' + n[0] + '</p><p class="text-sm muted mt-1">' + n[2] + ' · ' + (n[1] === 'b' ? 'Boy' : 'Girl') + '</p></div>'; }).join('') + '</div>'
      : '<p class="mt-4 muted">Our short list has no ' + (gender === 'b' ? 'boys\' ' : gender === 'g' ? 'girls\' ' : '') + 'names for these sounds yet. Many families choose a name beginning with the syllable and its close variants; Chandan can suggest some in a consultation.</p>';
    show(h);
  }

  if (tool === 'baby-names') {
    var f0 = document.querySelector('form[data-tool-form]'), q = new URLSearchParams(location.search);
    if (q.get('nak')) { f0.querySelector('[name="nak"]').value = q.get('nak'); if (q.get('pada')) f0.querySelector('[name="pada"]').value = q.get('pada'); babyNames(f0); }
    var bf = document.querySelector('form[data-tool-form="birth"]');
    if (bf) { bf.setAttribute('novalidate', ''); bf.addEventListener('submit', function (e) { e.preventDefault(); var b = A.readBirth(bf, ''); if (b.error) return err(bf, b.error); ok(bf); var nk = A.nakOf(A.sidOf('Moon', b.jd)); f0.querySelector('[name="nak"]').value = nk.i; f0.querySelector('[name="pada"]').value = nk.pada; babyNames(f0); }); }
    f0.setAttribute('novalidate', ''); f0.addEventListener('submit', function (e) { e.preventDefault(); babyNames(f0); });
    return;
  }

  bind(handlers[tool]);

  // Defaults and sample reports
  var f = document.querySelector('form[data-tool-form]');
  var today = new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);
  quiet = true;
  if (f && f.querySelector('[name="date"]')) { f.querySelector('[name="date"]').value = today; handlers[tool](f); }
  if (f && f.querySelector('[name="month"]')) { f.querySelector('[name="month"]').value = today.slice(0, 7); handlers[tool](f); }
  quiet = false;
  var smp = 'A sample chart: born 15 August 1990, 06:30, New Delhi. Not a real client.';
  if (tool === 'kundli') show(kundliHTML(sampleBirth(SAMPLE)), smp);
  if (['moon-sign', 'lagna', 'nakshatra', 'manglik', 'sade-sati'].indexOf(tool) >= 0 && f) {
    fill(f, '', SAMPLE); quiet = true; handlers[tool](f); quiet = false;
    var r0 = $('#result'); r0.insertAdjacentHTML('afterbegin', '<p class="mb-5"><span class="sample-tag">Sample result</span> <span class="text-sm muted ml-2">' + smp + ' Enter your own details above.</span></p>');
    ['dob', 'tob', 'pob'].forEach(function (k) { var el = f.querySelector('[name="' + k + '"]'); if (el) el.value = ''; });
  }
  if (tool === 'milan') show(milanHTML(sampleBirth(SAMPLE), sampleBirth(SAMPLE_B)), 'A sample match: bride born 15 Aug 1990, 06:30, New Delhi; groom born 26 Jan 1988, 09:15, Varanasi. Not real clients.');
})();
