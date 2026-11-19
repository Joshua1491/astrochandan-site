/* Chandan Shrivastava · Jyotish calculations, run entirely in the visitor's browser.
   Sun and Moon follow Meeus (Astronomical Algorithms, ch. 25 and 47, main terms); planets use
   JPL's Keplerian elements for approximate positions (valid 1800–2050). Sidereal longitudes use
   the Lahiri (Chitrapaksha) ayanamsa. Accuracy is well inside a degree for the planets and a few
   arc-minutes for the Sun and Moon: fine for signs, Nakshatras and Dashas. */
(function () {
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function n360(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sin(d) { return Math.sin(d * D2R); }
  function cos(d) { return Math.cos(d * D2R); }

  // ---------- Names and tables ----------
  var SIGNS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  var SIGNS_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  var SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  var NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var DASHA = [['Ketu', 7], ['Venus', 20], ['Sun', 6], ['Moon', 10], ['Mars', 7], ['Rahu', 18], ['Jupiter', 16], ['Saturn', 19], ['Mercury', 17]];
  var NAK_DEITY = ['Ashwini Kumaras', 'Yama', 'Agni', 'Brahma', 'Soma', 'Rudra', 'Aditi', 'Brihaspati', 'Nagas', 'Pitris', 'Bhaga', 'Aryaman', 'Savitar', 'Vishwakarma', 'Vayu', 'Indra and Agni', 'Mitra', 'Indra', 'Nirriti', 'Apah', 'Vishvedevas', 'Vishnu', 'Vasus', 'Varuna', 'Aja Ekapada', 'Ahir Budhnya', 'Pushan'];
  var NAK_SYL = [['Chu', 'Che', 'Cho', 'La'], ['Li', 'Lu', 'Le', 'Lo'], ['A', 'I', 'U', 'E'], ['O', 'Va', 'Vi', 'Vu'], ['Ve', 'Vo', 'Ka', 'Ki'], ['Ku', 'Gha', 'Na', 'Chha'], ['Ke', 'Ko', 'Ha', 'Hi'], ['Hu', 'He', 'Ho', 'Da'], ['Di', 'Du', 'De', 'Do'], ['Ma', 'Mi', 'Mu', 'Me'], ['Mo', 'Ta', 'Ti', 'Tu'], ['Te', 'To', 'Pa', 'Pi'], ['Pu', 'Sha', 'Na', 'Tha'], ['Pe', 'Po', 'Ra', 'Ri'], ['Ru', 'Re', 'Ro', 'Ta'], ['Ti', 'Tu', 'Te', 'To'], ['Na', 'Ni', 'Nu', 'Ne'], ['No', 'Ya', 'Yi', 'Yu'], ['Ye', 'Yo', 'Bha', 'Bhi'], ['Bhu', 'Dha', 'Pha', 'Dha'], ['Bhe', 'Bho', 'Ja', 'Ji'], ['Ju', 'Je', 'Jo', 'Gha'], ['Ga', 'Gi', 'Gu', 'Ge'], ['Go', 'Sa', 'Si', 'Su'], ['Se', 'So', 'Da', 'Di'], ['Du', 'Tha', 'Jha', 'Da'], ['De', 'Do', 'Cha', 'Chi']];
  var GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'; // Deva, Manushya, Rakshasa by Nakshatra
  var YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
  var YONI = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
  var YONI_PTS = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4]];
  var NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];
  var NADI_N = ['Adi', 'Madhya', 'Antya'];
  var VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]; // rank by Moon sign: 3 Brahmin (water), 2 Kshatriya (fire), 1 Vaishya (earth), 0 Shudra (air)
  var VARNA_N = ['Shudra', 'Vaishya', 'Kshatriya', 'Brahmin'];
  var FRIEND = { // natural friendship: 2 friend, 1 neutral, 0 enemy
    Sun: { Moon: 2, Mars: 2, Jupiter: 2, Mercury: 1, Venus: 0, Saturn: 0 },
    Moon: { Sun: 2, Mercury: 2, Mars: 1, Jupiter: 1, Venus: 1, Saturn: 1 },
    Mars: { Sun: 2, Moon: 2, Jupiter: 2, Venus: 1, Saturn: 1, Mercury: 0 },
    Mercury: { Sun: 2, Venus: 2, Mars: 1, Jupiter: 1, Saturn: 1, Moon: 0 },
    Jupiter: { Sun: 2, Moon: 2, Mars: 2, Saturn: 1, Mercury: 0, Venus: 0 },
    Venus: { Mercury: 2, Saturn: 2, Mars: 1, Jupiter: 1, Sun: 0, Moon: 0 },
    Saturn: { Mercury: 2, Venus: 2, Jupiter: 1, Sun: 0, Moon: 0, Mars: 0 }
  };
  var TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  var YOGA = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var KARANA_M = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
  var VARA = ['Ravivar (Sunday)', 'Somvar (Monday)', 'Mangalvar (Tuesday)', 'Budhvar (Wednesday)', 'Guruvar (Thursday)', 'Shukravar (Friday)', 'Shanivar (Saturday)'];
  var CHOG = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
  var CHOG_Q = { Udveg: 'Avoid', Char: 'Good for travel', Labh: 'Good', Amrit: 'Best', Kaal: 'Avoid', Shubh: 'Good', Rog: 'Avoid' };
  var CHOG_DAY0 = [0, 3, 6, 2, 5, 1, 4], CHOG_NIGHT0 = [5, 1, 4, 0, 3, 6, 2];
  var RAHU_PART = [8, 2, 7, 5, 6, 4, 3], GULIKA_PART = [7, 6, 5, 4, 3, 2, 1], YAMA_PART = [5, 4, 3, 2, 1, 7, 6];

  var CITIES = [
    ['Gurugram, Haryana', 28.4595, 77.0266, 5.5], ['New Delhi, Delhi', 28.6139, 77.2090, 5.5], ['Noida, Uttar Pradesh', 28.5355, 77.3910, 5.5], ['Faridabad, Haryana', 28.4089, 77.3178, 5.5],
    ['Ghaziabad, Uttar Pradesh', 28.6692, 77.4538, 5.5], ['Varanasi, Uttar Pradesh', 25.3176, 82.9739, 5.5], ['Lucknow, Uttar Pradesh', 26.8467, 80.9462, 5.5], ['Kanpur, Uttar Pradesh', 26.4499, 80.3319, 5.5],
    ['Prayagraj, Uttar Pradesh', 25.4358, 81.8463, 5.5], ['Agra, Uttar Pradesh', 27.1767, 78.0081, 5.5], ['Patna, Bihar', 25.5941, 85.1376, 5.5], ['Ranchi, Jharkhand', 23.3441, 85.3096, 5.5],
    ['Jaipur, Rajasthan', 26.9124, 75.7873, 5.5], ['Jodhpur, Rajasthan', 26.2389, 73.0243, 5.5], ['Chandigarh', 30.7333, 76.7794, 5.5], ['Ludhiana, Punjab', 30.9010, 75.8573, 5.5],
    ['Amritsar, Punjab', 31.6340, 74.8723, 5.5], ['Dehradun, Uttarakhand', 30.3165, 78.0322, 5.5], ['Shimla, Himachal Pradesh', 31.1048, 77.1734, 5.5], ['Jammu, Jammu and Kashmir', 32.7266, 74.8570, 5.5],
    ['Bhopal, Madhya Pradesh', 23.2599, 77.4126, 5.5], ['Indore, Madhya Pradesh', 22.7196, 75.8577, 5.5], ['Raipur, Chhattisgarh', 21.2514, 81.6296, 5.5], ['Ahmedabad, Gujarat', 23.0225, 72.5714, 5.5],
    ['Surat, Gujarat', 21.1702, 72.8311, 5.5], ['Mumbai, Maharashtra', 19.0760, 72.8777, 5.5], ['Pune, Maharashtra', 18.5204, 73.8567, 5.5], ['Nagpur, Maharashtra', 21.1458, 79.0882, 5.5],
    ['Kolkata, West Bengal', 22.5726, 88.3639, 5.5], ['Bhubaneswar, Odisha', 20.2961, 85.8245, 5.5], ['Guwahati, Assam', 26.1445, 91.7362, 5.5], ['Hyderabad, Telangana', 17.3850, 78.4867, 5.5],
    ['Bengaluru, Karnataka', 12.9716, 77.5946, 5.5], ['Chennai, Tamil Nadu', 13.0827, 80.2707, 5.5], ['Kochi, Kerala', 9.9312, 76.2673, 5.5], ['Thiruvananthapuram, Kerala', 8.5241, 76.9366, 5.5],
    ['Goa (Panaji)', 15.4909, 73.8278, 5.5], ['Kathmandu, Nepal', 27.7172, 85.3240, 5.75], ['Dubai, UAE', 25.2048, 55.2708, 4], ['Singapore', 1.3521, 103.8198, 8],
    ['London, UK', 51.5074, -0.1278, 0], ['New York, USA', 40.7128, -74.0060, -5], ['San Francisco, USA', 37.7749, -122.4194, -8], ['Toronto, Canada', 43.6532, -79.3832, -5],
    ['Sydney, Australia', -33.8688, 151.2093, 10], ['Melbourne, Australia', -37.8136, 144.9631, 10]
  ];

  // ---------- Time ----------
  // Julian Day (UT) from a local civil date/time and a UTC offset in hours
  function jdFromLocal(y, mo, d, h, mi, tz) {
    var ut = Date.UTC(y, mo - 1, d, h, mi) - tz * 3600000;
    return ut / 86400000 + 2440587.5;
  }
  function jdToDate(jd) { return new Date((jd - 2440587.5) * 86400000); }
  function deltaT(jd) { var y = 2000 + (jd - 2451545) / 365.25; return (62.92 + 0.32217 * (y - 2000) + 0.005589 * (y - 2000) * (y - 2000)) / 86400; }
  function T(jd) { return (jd + deltaT(jd) - 2451545) / 36525; }

  // Lahiri ayanamsa (23°51′11″ at J2000, advancing with general precession)
  function ayanamsa(jd) { var t = T(jd); return 23.85306 + 1.396971 * t + 0.000308 * t * t; }

  // ---------- Sun and Moon (tropical, of date) ----------
  function sunLon(jd) {
    var t = T(jd), L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t, M = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    var C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(M) + (0.019993 - 0.000101 * t) * sin(2 * M) + 0.000289 * sin(3 * M);
    var om = 125.04 - 1934.136 * t;
    return n360(L0 + C - 0.00569 - 0.00478 * sin(om));
  }
  var MOON_T = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236], [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892], [2, 1, 1, 0, -810], [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713], [2, 2, -1, 0, -700], [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537]];
  function moonLon(jd) {
    var t = T(jd);
    var Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    var D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
    var M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
    var Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
    var F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;
    var A1 = 119.75 + 131.849 * t, A2 = 53.09 + 479264.290 * t, E = 1 - 0.002516 * t - 0.0000074 * t * t;
    var s = 0;
    for (var i = 0; i < MOON_T.length; i++) {
      var r = MOON_T[i], c = r[4], m = Math.abs(r[1]);
      if (m === 1) c *= E; else if (m === 2) c *= E * E;
      s += c * sin(r[0] * D + r[1] * M + r[2] * Mp + r[3] * F);
    }
    s += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    var om = 125.04452 - 1934.136261 * t;
    return n360(Lp + s / 1e6 - 0.004778 * sin(om));
  }

  // ---------- Planets (JPL approximate elements, J2000 ecliptic) ----------
  var EL = {
    Mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    Venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    Earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    Mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    Jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    Saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.54179478, -0.28867794]
  };
  function helio(name, t) {
    var e0 = EL[name], a = e0[0] + e0[6] * t, e = e0[1] + e0[7] * t, I = e0[2] + e0[8] * t, L = e0[3] + e0[9] * t, w = e0[4] + e0[10] * t, O = e0[5] + e0[11] * t;
    var om = w - O, M = n360(L - w); if (M > 180) M -= 360;
    var Er = M * D2R + e * Math.sin(M * D2R);
    for (var k = 0; k < 8; k++) Er -= (Er - e * Math.sin(Er) - M * D2R) / (1 - e * Math.cos(Er));
    var xp = a * (Math.cos(Er) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(Er);
    var co = cos(om), so = sin(om), cO = cos(O), sO = sin(O), cI = cos(I), sI = sin(I);
    return [(co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp,
            (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp,
            (so * sI) * xp + (co * sI) * yp];
  }
  function planetLon(name, jd) { // tropical of date
    var t = T(jd), p = helio(name, t), e = helio('Earth', t);
    var lon = Math.atan2(p[1] - e[1], p[0] - e[0]) * R2D;
    return n360(lon + 1.396971 * t); // J2000 → equinox of date
  }
  function rahuLon(jd) { var t = T(jd); return n360(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t); } // mean node

  // ---------- Ascendant ----------
  function lagna(jd, lat, lon) {
    var t = (jd - 2451545) / 36525;
    var gmst = n360(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t);
    var lst = n360(gmst + lon), eps = 23.4392911 - 0.0130042 * t;
    var asc = Math.atan2(cos(lst), -(sin(lst) * cos(eps) + Math.tan(lat * D2R) * sin(eps))) * R2D;
    return n360(asc);
  }

  // ---------- Derived ----------
  function sid(tropical, jd) { return n360(tropical - ayanamsa(jd)); }
  function nakOf(l) { var i = Math.floor(l / (360 / 27)); return { i: i, name: NAK[i], pada: Math.floor((l % (360 / 27)) / (360 / 108)) + 1, lord: DASHA[i % 9][0] }; }
  function signOf(l) { return Math.floor(l / 30); }
  function dms(l) { var x = l % 30, d = Math.floor(x), m = Math.floor((x - d) * 60); return d + '°' + (m < 10 ? '0' : '') + m + '′'; }

  var BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  var ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke', Lagna: 'As' };
  function tropOf(b, jd) {
    if (b === 'Sun') return sunLon(jd);
    if (b === 'Moon') return moonLon(jd);
    if (b === 'Rahu') return rahuLon(jd);
    if (b === 'Ketu') return n360(rahuLon(jd) + 180);
    return planetLon(b, jd);
  }
  function sidOf(b, jd) { return sid(tropOf(b, jd), jd); }

  function chart(jd, lat, lon) {
    var asc = sid(lagna(jd, lat, lon), jd), ascSign = signOf(asc), planets = {};
    BODIES.forEach(function (b) {
      var l = sidOf(b, jd), retro = false;
      if (b !== 'Sun' && b !== 'Moon' && b !== 'Rahu' && b !== 'Ketu') { var d = n360(sidOf(b, jd + 0.5) - sidOf(b, jd - 0.5) + 180) - 180; retro = d < 0; }
      if (b === 'Rahu' || b === 'Ketu') retro = true;
      var s = signOf(l);
      planets[b] = { lon: l, sign: s, deg: dms(l), nak: nakOf(l), house: ((s - ascSign + 12) % 12) + 1, retro: retro, nav: Math.floor(l * 9 / 30) % 12 };
    });
    return { jd: jd, asc: asc, ascSign: ascSign, ascNak: nakOf(asc), ascNav: Math.floor(asc * 9 / 30) % 12, p: planets, ayan: ayanamsa(jd) };
  }

  // Vimshottari Dasha from the Moon's longitude
  function dashas(moon, jdBirth) {
    var span = 360 / 27, i = Math.floor(moon / span), frac = (moon % span) / span, start = DASHA[i % 9], out = [];
    var jd = jdBirth - frac * start[1] * 365.25;
    for (var k = 0; k < 9; k++) {
      var md = DASHA[(i + k) % 9], end = jd + md[1] * 365.25, subs = [], sj = jd;
      for (var j = 0; j < 9; j++) { var ad = DASHA[(i + k + j) % 9], len = md[1] * ad[1] / 120 * 365.25; subs.push({ lord: ad[0], start: sj, end: sj + len }); sj += len; }
      out.push({ lord: md[0], start: jd, end: end, subs: subs });
      jd = end;
    }
    return out;
  }

  // Manglik: Mars in houses 1, 2, 4, 7, 8 or 12 counted from Lagna, Moon and Venus
  function manglik(c) {
    var BAD = [1, 2, 4, 7, 8, 12], m = c.p.Mars.sign;
    function from(s) { return ((m - s + 12) % 12) + 1; }
    var r = { lagna: from(c.ascSign), moon: from(c.p.Moon.sign), venus: from(c.p.Venus.sign) };
    r.fromLagna = BAD.indexOf(r.lagna) >= 0; r.fromMoon = BAD.indexOf(r.moon) >= 0; r.fromVenus = BAD.indexOf(r.venus) >= 0;
    r.ownOrExalted = [0, 7, 9].indexOf(m) >= 0; // Mars in Aries, Scorpio (own) or Capricorn (exalted): a classical softening
    return r;
  }

  // Ashtakoot (Guna Milan). g = bride, b = groom: { sign, nak, lon }
  function vashyaGroup(sign, lon) {
    var deg = lon % 30;
    if (sign === 0 || sign === 1 || (sign === 8 && deg >= 15) || (sign === 9 && deg < 15)) return 0; // quadruped
    if (sign === 2 || sign === 5 || sign === 6 || (sign === 8 && deg < 15) || sign === 10) return 1;   // human
    if (sign === 3 || sign === 11 || (sign === 9 && deg >= 15)) return 2;                              // water
    if (sign === 4) return 3;                                                                          // wild
    return 4;                                                                                          // insect (Scorpio)
  }
  var VASHYA_N = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'];
  var VASHYA_PTS = [[2, 1, 1, 0.5, 1], [1, 2, 0.5, 0, 1], [1, 0.5, 2, 1, 1], [0.5, 0, 1, 2, 0], [1, 1, 1, 0, 2]];
  function milan(g, b) {
    var rows = [];
    var vg = VARNA[g.sign], vb = VARNA[b.sign];
    rows.push(['Varna', 1, vb >= vg ? 1 : 0, VARNA_N[vg] + ' · ' + VARNA_N[vb]]);
    var wg = vashyaGroup(g.sign, g.lon), wb = vashyaGroup(b.sign, b.lon);
    rows.push(['Vashya', 2, VASHYA_PTS[wb][wg], VASHYA_N[wg] + ' · ' + VASHYA_N[wb]]);
    function tara(a, z) { var r = ((z - a + 27) % 27 + 1) % 9; return [3, 5, 7].indexOf(r) >= 0 ? 0 : 1.5; }
    rows.push(['Tara', 3, tara(g.nak, b.nak) + tara(b.nak, g.nak), NAK[g.nak] + ' · ' + NAK[b.nak]]);
    rows.push(['Yoni', 4, YONI_PTS[YONI_OF[g.nak]][YONI_OF[b.nak]], YONI[YONI_OF[g.nak]] + ' · ' + YONI[YONI_OF[b.nak]]]);
    var lg = SIGN_LORD[g.sign], lb = SIGN_LORD[b.sign], gm;
    if (lg === lb) gm = 5; else {
      var x = FRIEND[lg][lb], y = FRIEND[lb][lg], s = x + y;
      gm = s === 4 ? 5 : s === 3 ? 4 : (s === 2 && x === 1) ? 3 : s === 2 ? 1 : s === 1 ? 0.5 : 0;
    }
    rows.push(['Graha Maitri', 5, gm, lg + ' · ' + lb]);
    var GI = { D: 0, M: 1, R: 2 }, GN = ['Deva', 'Manushya', 'Rakshasa'], ga = GI[GANA[g.nak]], gb = GI[GANA[b.nak]];
    var GP = [[6, 6, 1], [5, 6, 0], [1, 0, 6]]; // rows groom, cols bride
    rows.push(['Gana', 6, GP[gb][ga], GN[ga] + ' · ' + GN[gb]]);
    var dist = ((b.sign - g.sign + 12) % 12) + 1, bad = [2, 12, 5, 9, 6, 8].indexOf(dist) >= 0;
    rows.push(['Bhakoot', 7, bad ? 0 : 7, SIGNS[g.sign] + ' · ' + SIGNS[b.sign]]);
    rows.push(['Nadi', 8, NADI[g.nak] === NADI[b.nak] ? 0 : 8, NADI_N[NADI[g.nak]] + ' · ' + NADI_N[NADI[b.nak]]]);
    var total = rows.reduce(function (a, r) { return a + r[2]; }, 0);
    return { rows: rows, total: total, nadiDosha: NADI[g.nak] === NADI[b.nak], bhakootDosha: bad, sameSignDiffNak: g.sign === b.sign && g.nak !== b.nak, sameNakDiffSign: g.nak === b.nak && g.sign !== b.sign };
  }

  // ---------- Panchang ----------
  function panchangAt(jd) {
    var s = sidOf('Sun', jd), m = sidOf('Moon', jd), diff = n360(m - s);
    var ti = Math.floor(diff / 12), k = Math.floor(diff / 6);
    var karana = k === 0 ? 'Kimstughna' : k >= 57 ? ['Shakuni', 'Chatushpada', 'Naga'][k - 57] : KARANA_M[(k - 1) % 7];
    return {
      tithiIndex: ti, paksha: ti < 15 ? 'Shukla' : 'Krishna',
      tithi: ti === 14 ? 'Purnima' : ti === 29 ? 'Amavasya' : TITHI[ti % 15],
      nak: nakOf(m), yoga: YOGA[Math.floor(n360(s + m) / (360 / 27))], karana: karana,
      illum: (1 - cos(diff)) / 2, elong: diff, moonSign: signOf(m), sunSign: signOf(s)
    };
  }
  function phaseName(e) {
    if (e < 6 || e > 354) return 'New Moon';
    if (e < 84) return 'Waxing crescent'; if (e < 96) return 'First quarter'; if (e < 174) return 'Waxing gibbous';
    if (e < 186) return 'Full Moon'; if (e < 264) return 'Waning gibbous'; if (e < 276) return 'Last quarter'; return 'Waning crescent';
  }
  // Find the JD (UT) at which a function of JD crosses the next multiple of `step` (used for tithi/nakshatra end times)
  function nextBoundary(fn, jd, step) {
    var v0 = fn(jd), target = (Math.floor(v0 / step) + 1) * step, a = jd, b = jd + 1.6;
    function g(x) { var v = fn(x); if (v < v0 - 180) v += 360; return v - target; }
    for (var i = 0; i < 40; i++) { var mid = (a + b) / 2; if (g(mid) < 0) a = mid; else b = mid; }
    return b;
  }
  function tithiEnd(jd) { return nextBoundary(function (x) { return n360(sidOf('Moon', x) - sidOf('Sun', x)); }, jd, 12); }
  function nakEnd(jd) { return nextBoundary(function (x) { return sidOf('Moon', x); }, jd, 360 / 27); }

  // Amanta lunar month at a moment: named from the Sun's sidereal sign at the preceding new moon
  var MASA = ['Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashvin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna', 'Chaitra'];
  function lunarMonth(jd) {
    var e = n360(sidOf('Moon', jd) - sidOf('Sun', jd)), nm = jd - e / 12.19;
    for (var i = 0; i < 4; i++) { var d = n360(sidOf('Moon', nm) - sidOf('Sun', nm) + 180) - 180; nm -= d / 12.19; }
    return MASA[signOf(sidOf('Sun', nm))];
  }
  // Chaturmas: Ashadha Shukla Ekadashi to Kartika Shukla Ekadashi (Devshayani to Devuthani)
  function inChaturmas(jd) {
    var m = lunarMonth(jd), t = panchangAt(jd).tithiIndex;
    if (m === 'Shravana' || m === 'Bhadrapada' || m === 'Ashvin') return true;
    if (m === 'Ashadha') return t >= 10;
    if (m === 'Kartika') return t < 10;
    return false;
  }

  // Sunrise/sunset (UT JD) for a civil date at a place; returns null at polar latitudes
  function sunEvent(y, mo, d, lat, lon, rise) {
    var jd0 = Date.UTC(y, mo - 1, d) / 86400000 + 2440587.5, jd = jd0 + 0.5 - lon / 360 + (rise ? -0.25 : 0.25);
    for (var i = 0; i < 4; i++) {
      var t = (jd - 2451545) / 36525, L = sunLon(jd), eps = 23.4392911 - 0.0130042 * t;
      var ra = n360(Math.atan2(cos(eps) * sin(L), cos(L)) * R2D), dec = Math.asin(sin(eps) * sin(L)) * R2D;
      var gmst = n360(280.46061837 + 360.98564736629 * (jd - 2451545));
      var ch = (sin(-0.833) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
      if (ch < -1 || ch > 1) return null;
      var H0 = Math.acos(ch) * R2D, ha = n360(gmst + lon - ra); if (ha > 180) ha -= 360;
      var want = rise ? -H0 : H0;
      jd += (want - ha) / 360.98564736629;
    }
    return jd;
  }

  function dayInfo(y, mo, d, place) {
    var sr = sunEvent(y, mo, d, place.lat, place.lon, true), ss = sunEvent(y, mo, d, place.lat, place.lon, false);
    var nx = new Date(Date.UTC(y, mo - 1, d + 1)), sr2 = sunEvent(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), place.lat, place.lon, true);
    var wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    var info = { weekday: wd, vara: VARA[wd], sunrise: sr, sunset: ss };
    if (sr && ss && sr2) {
      var dl = (ss - sr) / 8, nl = (sr2 - ss) / 8;
      info.rahu = [sr + (RAHU_PART[wd] - 1) * dl, sr + RAHU_PART[wd] * dl];
      info.gulika = [sr + (GULIKA_PART[wd] - 1) * dl, sr + GULIKA_PART[wd] * dl];
      info.yama = [sr + (YAMA_PART[wd] - 1) * dl, sr + YAMA_PART[wd] * dl];
      var noon = (sr + ss) / 2, mu = (ss - sr) / 15;
      info.abhijit = [noon - mu / 2, noon + mu / 2];
      info.chogDay = []; info.chogNight = [];
      for (var i = 0; i < 8; i++) {
        var nd = CHOG[(CHOG_DAY0[wd] + i) % 7], nn = CHOG[((CHOG_NIGHT0[wd] - 2 * i) % 7 + 7) % 7];
        info.chogDay.push({ name: nd, q: CHOG_Q[nd], start: sr + i * dl, end: sr + (i + 1) * dl });
        info.chogNight.push({ name: nn, q: CHOG_Q[nn], start: ss + i * nl, end: ss + (i + 1) * nl });
      }
      info.atSunrise = panchangAt(sr);
      info.tithiEnds = tithiEnd(sr); info.nakEnds = nakEnd(sr);
    }
    return info;
  }

  // Sade Sati: Saturn transiting the 12th, 1st and 2nd sign from the natal Moon sign
  function sadeSati(moonSign, fromYear, toYear) {
    var out = [], cur = null, step = 2;
    var jd = Date.UTC(fromYear, 0, 1) / 86400000 + 2440587.5, end = Date.UTC(toYear, 0, 1) / 86400000 + 2440587.5;
    for (; jd < end; jd += step) {
      var rel = ((signOf(sidOf('Saturn', jd)) - moonSign + 12) % 12), inSS = rel === 11 || rel === 0 || rel === 1;
      if (inSS && !cur) cur = { start: jd, phases: {} };
      if (cur) { var ph = rel === 11 ? 1 : rel === 0 ? 2 : rel === 1 ? 3 : 0; if (ph && !cur.phases[ph]) cur.phases[ph] = jd; }
      if (!inSS && cur) {
        // allow for retrograde dips back out of the window for under 400 days
        var back = false;
        for (var k = step; k < 400; k += 10) { var r2 = ((signOf(sidOf('Saturn', jd + k)) - moonSign + 12) % 12); if (r2 === 11 || r2 === 0 || r2 === 1) { back = true; break; } }
        if (!back) { cur.end = jd; out.push(cur); cur = null; }
      }
    }
    if (cur) { cur.end = null; out.push(cur); }
    return out;
  }

  // ---------- Formatting helpers ----------
  function fmtDate(jd, tz, opts) {
    var dt = new Date((jd - 2440587.5) * 86400000 + (tz || 0) * 3600000);
    return dt.toLocaleDateString('en-GB', Object.assign({ day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }, opts || {}));
  }
  function fmtTime(jd, tz) {
    var dt = new Date((jd - 2440587.5) * 86400000 + (tz || 0) * 3600000);
    var h = dt.getUTCHours(), m = dt.getUTCMinutes(); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // North Indian chart as SVG. houses: array[12] of arrays of labels; signs: sign index in house 1
  function northSVG(ascSign, contents, title) {
    var C = [[200, 112], [100, 50], [48, 104], [112, 200], [48, 296], [100, 352], [200, 288], [300, 352], [352, 296], [288, 200], [352, 104], [300, 50]];
    var SN = [[200, 178], [100, 86], [82, 104], [176, 200], [82, 296], [100, 314], [200, 222], [300, 314], [318, 296], [224, 200], [318, 104], [300, 86]];
    var s = '<svg viewBox="0 0 400 400" class="nchart" role="img" aria-label="' + (title || 'North Indian birth chart') + '"><rect class="ln" x="2" y="2" width="396" height="396"/><path class="ln" d="M2 2L398 398M398 2L2 398M200 2L398 200L200 398L2 200Z"/>';
    for (var h = 0; h < 12; h++) {
      var sg = (ascSign + h) % 12;
      s += '<text class="hn" x="' + SN[h][0] + '" y="' + (SN[h][1] + 4) + '" text-anchor="middle">' + (sg + 1) + '</text>';
      var items = contents[h] || [], lines = [];
      for (var i = 0; i < items.length; i += 3) lines.push(items.slice(i, i + 3).join(' '));
      lines.forEach(function (ln, k) { s += '<text class="pl" x="' + C[h][0] + '" y="' + (C[h][1] + (k - (lines.length - 1) / 2) * 15 + 4) + '" text-anchor="middle">' + ln + '</text>'; });
    }
    return s + '</svg>';
  }
  function chartSVG(c, which) {
    var houses = [[], [], [], [], [], [], [], [], [], [], [], []], asc = which === 'D9' ? c.ascNav : c.ascSign;
    houses[0].push('As');
    BODIES.forEach(function (b) { var p = c.p[b], s = which === 'D9' ? p.nav : p.sign; houses[(s - asc + 12) % 12].push(ABBR[b] + (p.retro && b !== 'Rahu' && b !== 'Ketu' ? '℞' : '')); });
    return northSVG(asc, houses, which === 'D9' ? 'Navamsa chart (D9)' : 'Lagna chart (D1)');
  }

  // ---------- Place fields ----------
  function ensureCities() {
    if (document.getElementById('cj-cities')) return;
    var dl = document.createElement('datalist'); dl.id = 'cj-cities';
    dl.innerHTML = CITIES.map(function (c) { return '<option value="' + c[0] + '">'; }).join('');
    document.body.appendChild(dl);
  }
  function findCity(q) {
    q = String(q || '').trim().toLowerCase(); if (!q) return null;
    for (var i = 0; i < CITIES.length; i++) if (CITIES[i][0].toLowerCase() === q) return CITIES[i];
    for (i = 0; i < CITIES.length; i++) if (CITIES[i][0].toLowerCase().indexOf(q) === 0 || CITIES[i][0].toLowerCase().split(',')[0] === q.split(',')[0]) return CITIES[i];
    return null;
  }
  // Reads date/time/place from a form using a name prefix. Returns {jd, place, ...} or {error}
  function readBirth(form, pre, opts) {
    opts = opts || {};
    function v(n) { var el = form.querySelector('[name="' + pre + n + '"]'); return el ? String(el.value).trim() : ''; }
    var date = v('dob'), time = v('tob') || (opts.timeOptional ? '12:00' : ''), placeTxt = v('pob');
    if (!date) return { error: 'Please enter the date of birth.' };
    if (!time) return { error: 'Please enter the time of birth (as close as you know it).' };
    var lat = parseFloat(v('lat')), lon = parseFloat(v('lon')), tz = parseFloat(v('tz')), name = placeTxt;
    if (isNaN(lat) || isNaN(lon)) {
      var c = findCity(placeTxt);
      if (!c) return { error: 'We could not find "' + (placeTxt || 'that place') + '" in our list. Pick a city from the list, or open "Place not listed?" and enter its latitude, longitude and time zone.' };
      lat = c[1]; lon = c[2]; if (isNaN(tz)) tz = c[3]; name = c[0];
    }
    if (isNaN(tz)) tz = 5.5;
    var dp = date.split('-').map(Number), tp = time.split(':').map(Number);
    if (dp[0] < 1800 || dp[0] > 2100) return { error: 'Please enter a year between 1800 and 2100.' };
    return { jd: jdFromLocal(dp[0], dp[1], dp[2], tp[0], tp[1], tz), lat: lat, lon: lon, tz: tz, place: name, date: date, time: v('tob'), y: dp[0], mo: dp[1], d: dp[2] };
  }

  window.CJA = {
    SIGNS: SIGNS, SIGNS_EN: SIGNS_EN, SIGN_LORD: SIGN_LORD, NAK: NAK, NAK_DEITY: NAK_DEITY, NAK_SYL: NAK_SYL, DASHA: DASHA, GANA: GANA, YONI: YONI, YONI_OF: YONI_OF, NADI: NADI, NADI_N: NADI_N,
    BODIES: BODIES, ABBR: ABBR, CITIES: CITIES, CHOG_Q: CHOG_Q,
    jdFromLocal: jdFromLocal, ayanamsa: ayanamsa, sidOf: sidOf, tropOf: tropOf, lagna: lagna, sid: sid, nakOf: nakOf, signOf: signOf, dms: dms,
    chart: chart, dashas: dashas, manglik: manglik, milan: milan, panchangAt: panchangAt, phaseName: phaseName, tithiEnd: tithiEnd, nakEnd: nakEnd,
    sunEvent: sunEvent, dayInfo: dayInfo, lunarMonth: lunarMonth, inChaturmas: inChaturmas, sadeSati: sadeSati, fmtDate: fmtDate, fmtTime: fmtTime, chartSVG: chartSVG, northSVG: northSVG,
    ensureCities: ensureCities, findCity: findCity, readBirth: readBirth, n360: n360
  };

  // ---------- "Today" line, wherever the page has #todayDate / #todayMoon ----------
  function today() {
    var dEl = document.getElementById('todayDate'), mEl = document.getElementById('todayMoon');
    if (!dEl && !mEl) return;
    var now = new Date(), jd = now.getTime() / 86400000 + 2440587.5, p = panchangAt(jd);
    var ist = new Date(now.getTime() + 5.5 * 3600000);
    if (dEl) dEl.textContent = ist.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    if (mEl) mEl.textContent = phaseName(p.elong) + ' (' + Math.round(p.illum * 100) + '% lit) · ' + p.paksha + ' ' + p.tithi + ' · Moon in ' + p.nak.name;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', today); else today();
})();
