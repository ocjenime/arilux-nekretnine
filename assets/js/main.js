/* ═══════════════════════════════════════════════════════════════
   ARILUX NEKRETNINE - main.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Podaci: 4 zgrade, 102 stana ────────────────────────────── */

  var BUILDINGS = {
    one:      { name: 'Arilux Amor',      loc: 'Centar',   base: 4500, letter: 'ONE' },
    park:     { name: 'Arilux Park',     loc: 'Uz park',  base: 3500, letter: 'PRK' },
    centar:   { name: 'Arilux Centar',   loc: 'Trg',      base: 4000, letter: 'CNT' },
    panorama: { name: 'Arilux Panorama', loc: 'Grabik',   base: 4500, letter: 'PAN' }
  };

  var ROOM_AREA = { 1: [45, 54], 2: [60, 74], 3: [85, 104], 4: [118, 148] };
  var ROOM_LABEL = { 1: 'Jednosoban', 2: 'Dvosoban', 3: 'Trosoban', 4: 'Četverosoban' };
  var FLOOR_LABEL = { 1: 'Prizemlje', 2: 'Prvi', 3: 'Drugi', 4: 'Treći', 5: 'Četvrti', 6: 'Peti', 7: 'Šesti', 8: 'Sedmi', 9: 'Osmi' };

  // plan spratova: niz soba po stanu za svaki sprat
  var PLANS = {
    one: [
      [1, 2, 2, 3, 2], [1, 2, 2, 3, 2], [1, 2, 2, 3, 2],
      [1, 2, 2, 3, 2], [1, 2, 2, 3, 2], [2, 3, 4]
    ],
    park: [
      [1, 2, 2, 3, 2], [1, 2, 2, 3, 2], [1, 2, 2, 3, 2],
      [1, 2, 2, 3], [2, 3, 4]
    ],
    centar: [
      [1, 1, 2, 2, 3], [1, 1, 2, 2, 3], [1, 1, 2, 2, 3], [1, 1, 2, 2, 3],
      [1, 2, 2, 3], [1, 2, 2, 3], [1, 2, 2, 3], [2, 2, 3, 4]
    ],
    panorama: [
      [1, 2, 2, 3], [1, 2, 2, 3], [1, 2, 2, 3], [3, 3, 4, 4]
    ]
  };

  // deterministički PRNG da svi vide isto stanje
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function statusFor(rng, buildingId, floor, totalFloors) {
    var r = rng();
    if (buildingId === 'one' || buildingId === 'park') {
      if (floor <= 2) return r < 0.55 ? 'sold' : (r < 0.75 ? 'reserved' : 'available');
      if (floor <= totalFloors - 2) return r < 0.18 ? 'sold' : (r < 0.38 ? 'reserved' : 'available');
      return r < 0.15 ? 'reserved' : 'available';
    }
    // "uskoro" zgrade - uglavnom slobodno
    return r < 0.12 ? 'reserved' : 'available';
  }

  function generateApartments() {
    var list = [];
    Object.keys(PLANS).forEach(function (bid, bi) {
      var rng = mulberry32(1234 + bi * 777);
      var b = BUILDINGS[bid];
      var plan = PLANS[bid];
      plan.forEach(function (units, fi) {
        var floor = fi + 1;
        units.forEach(function (rooms, ui) {
          var range = ROOM_AREA[rooms];
          var area = Math.round(range[0] + rng() * (range[1] - range[0]));
          var isTop = floor === plan.length;
          var isPenthouse = isTop && rooms >= 4;
          var m2 = Math.round(b.base * (1 + (floor - 1) * 0.015) * (isPenthouse ? 1.12 : 1) / 10) * 10;
          var price = Math.round((area * m2) / 100) * 100;
          list.push({
            id: b.letter + '-' + floor + '0' + (ui + 1),
            building: bid,
            buildingName: b.name,
            floor: floor,
            rooms: rooms,
            area: area,
            m2: m2,
            price: price,
            penthouse: !!isPenthouse,
            status: statusFor(rng, bid, floor, plan.length)
          });
        });
      });
    });
    return list;
  }

  var APARTMENTS = generateApartments();

  var STATUS_LABEL = { available: 'Slobodan', reserved: 'Rezervisan', sold: 'Prodan' };

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /* ── Finder ─────────────────────────────────────────────────── */

  var PAGE = 9;
  var state = { building: 'all', rooms: 'all', maxPrice: 500000, onlyAvailable: false, sort: 'price-asc', shown: PAGE };

  var grid = document.getElementById('finderGrid');
  var countEl = document.getElementById('finderCount');
  var emptyEl = document.getElementById('finderEmpty');
  var moreWrap = document.getElementById('finderMoreWrap');
  var moreBtn = document.getElementById('finderMore');

  function filtered() {
    var out = APARTMENTS.filter(function (a) {
      if (state.building !== 'all' && a.building !== state.building) return false;
      if (state.rooms !== 'all') {
        if (state.rooms === '4') { if (a.rooms < 4) return false; }
        else if (a.rooms !== Number(state.rooms)) return false;
      }
      if (a.price > state.maxPrice) return false;
      if (state.onlyAvailable && a.status !== 'available') return false;
      return true;
    });
    out.sort(function (a, b) {
      switch (state.sort) {
        case 'price-desc': return b.price - a.price;
        case 'area-asc': return a.area - b.area;
        case 'area-desc': return b.area - a.area;
        default: return a.price - b.price;
      }
    });
    return out;
  }

  function aptCard(a, i) {
    var el = document.createElement('article');
    el.className = 'apt';
    el.style.animationDelay = Math.min(i * 40, 400) + 'ms';

    var cta;
    if (a.status === 'available') {
      cta = '<a href="#kontakt" class="apt__cta" data-apt="' + a.id + '" data-building="' + a.building + '">Rezerviši <span aria-hidden="true">→</span></a>';
    } else {
      cta = '<span class="apt__cta is-disabled">' + STATUS_LABEL[a.status] + '</span>';
    }

    el.innerHTML =
      '<div class="apt__top"><span class="apt__id">' + a.id + (a.penthouse ? ' · PH' : '') + '</span>' +
      '<span class="apt__status apt__status--' + a.status + '">' + STATUS_LABEL[a.status] + '</span></div>' +
      '<p class="apt__building">' + a.buildingName + '</p>' +
      '<div class="apt__specs">' +
        '<span><b>' + ROOM_LABEL[a.rooms] + '</b></span>' +
        '<span><b>' + a.area + '</b> m²</span>' +
        '<span><b>' + a.floor + '.</b> sprat</span>' +
      '</div>' +
      '<div class="apt__foot">' +
        '<div class="apt__price"><small>' + fmt(a.m2) + ' KM/m²</small><b>' + fmt(a.price) + ' KM</b></div>' +
        cta +
      '</div>';
    return el;
  }

  function render() {
    var all = filtered();
    var visible = all.slice(0, state.shown);
    grid.innerHTML = '';
    visible.forEach(function (a, i) { grid.appendChild(aptCard(a, i)); });

    var avail = all.filter(function (a) { return a.status === 'available'; }).length;
    countEl.innerHTML = 'Pronađeno <b>' + all.length + '</b> stanova · <b>' + avail + '</b> slobodnih';

    emptyEl.hidden = all.length !== 0;
    grid.style.display = all.length === 0 ? 'none' : '';
    moreWrap.hidden = all.length <= state.shown;
  }

  // filteri - chips
  function bindChips(containerId, key) {
    var box = document.getElementById(containerId);
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      box.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      btn.classList.add('is-active');
      state[key] = btn.dataset.value;
      state.shown = PAGE;
      render();
    });
  }
  bindChips('filterBuilding', 'building');
  bindChips('filterRooms', 'rooms');

  // budžet slider
  var priceInput = document.getElementById('filterPrice');
  var priceOut = document.getElementById('priceOut');
  function syncRange() {
    var min = Number(priceInput.min), max = Number(priceInput.max), v = Number(priceInput.value);
    priceInput.style.setProperty('--fill', ((v - min) / (max - min) * 100) + '%');
    priceOut.textContent = fmt(v) + ' KM';
    state.maxPrice = v;
    state.shown = PAGE;
    render();
  }
  priceInput.addEventListener('input', syncRange);

  // samo slobodni
  document.getElementById('filterAvailable').addEventListener('change', function (e) {
    state.onlyAvailable = e.target.checked;
    state.shown = PAGE;
    render();
  });

  // sortiranje
  document.getElementById('sortSelect').addEventListener('change', function (e) {
    state.sort = e.target.value;
    render();
  });

  moreBtn.addEventListener('click', function () {
    state.shown += PAGE;
    render();
  });

  // prebacivanje sa kartice zgrade na finder
  document.querySelectorAll('[data-goto-finder]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var bid = btn.dataset.gotoFinder;
      var box = document.getElementById('filterBuilding');
      box.querySelectorAll('.chip').forEach(function (c) {
        c.classList.toggle('is-active', c.dataset.value === bid);
      });
      state.building = bid;
      state.onlyAvailable = false;
      document.getElementById('filterAvailable').checked = false;
      state.shown = PAGE;
      render();
      document.getElementById('stanovi').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // klik na karticu stana → otvori modal
  grid.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-apt]');
    if (cta) {
      e.preventDefault();
      e.stopPropagation();
    }
    var card = e.target.closest('.apt');
    if (!card) return;
    var id = card.querySelector('.apt__id');
    if (!id) return;
    var rawId = id.textContent.replace(/\s*·\s*PH$/, '').trim();
    var apt = APARTMENTS.find(function (a) { return a.id === rawId; });
    if (apt) openModal(apt);
  });

  syncRange();

  /* ── Modal - detalji stana ─────────────────────────────────── */

  var modalOverlay = document.getElementById('modalOverlay');
  var modalClose = document.getElementById('modalClose');

  var BUILDING_INC = {
    one: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Balkon', 'Podzemna garaža', 'Poslovni prostori u prizemlju'],
    park: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Privatni parking', 'Dječije igralište', 'Terase sa pogledom na park'],
    centar: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Lift', 'Poslovni prostori', 'Garaža u podnožju'],
    panorama: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Terase', 'Krovne terase (PH)', 'Panoramski pogled']
  };

  var PROX_SVG = {
    school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    park: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12L10.03 16"/><path d="M15 14a7.5 7.5 0 1 0-6 0"/><path d="M8 14v8h8v-8"/></svg>',
    bus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="7.5" cy="20" r="1.5"/><circle cx="16.5" cy="20" r="1.5"/></svg>',
    child: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M8 22l4-10 4 10"/><path d="M9.5 15h5"/></svg>'
  };

  var BUILDING_PROX = {
    one: [
      { icon: 'school', dist: '350 m', name: 'Osnovna škola', sub: 'Velika Kladuša Centar' },
      { icon: 'health', dist: '500 m', name: 'Dom zdravlja', sub: 'Velika Kladuša' },
      { icon: 'shop', dist: '200 m', name: 'Marketi', sub: 'Konzum, Bingo, pijaca' },
      { icon: 'park', dist: '400 m', name: 'Gradski park', sub: 'Odmor i rekreacija' },
      { icon: 'bus', dist: '150 m', name: 'Autobuska stanica', sub: 'Gradski prijevoz' },
      { icon: 'child', dist: '300 m', name: 'Vrtić', sub: 'Javni i privatni' }
    ],
    park: [
      { icon: 'school', dist: '450 m', name: 'Osnovna škola', sub: 'Velika Kladuša' },
      { icon: 'health', dist: '700 m', name: 'Dom zdravlja', sub: 'Velika Kladuša' },
      { icon: 'shop', dist: '350 m', name: 'Marketi', sub: 'Konzum, Bingo' },
      { icon: 'park', dist: '50 m', name: 'Gradski park', sub: 'Odmah pored zgrade' },
      { icon: 'bus', dist: '400 m', name: 'Autobuska stanica', sub: 'Gradski prijevoz' },
      { icon: 'child', dist: '250 m', name: 'Vrtić', sub: 'Javni i privatni' }
    ],
    centar: [
      { icon: 'school', dist: '400 m', name: 'Osnovna škola', sub: 'Velika Kladuša Centar' },
      { icon: 'health', dist: '450 m', name: 'Dom zdravlja', sub: 'Velika Kladuša' },
      { icon: 'shop', dist: '100 m', name: 'Marketi', sub: 'Trg, Konzum, pijaca' },
      { icon: 'park', dist: '350 m', name: 'Gradski park', sub: 'Odmor i rekreacija' },
      { icon: 'bus', dist: '100 m', name: 'Autobuska stanica', sub: 'Gradski prijevoz' },
      { icon: 'child', dist: '350 m', name: 'Vrtić', sub: 'Javni i privatni' }
    ],
    panorama: [
      { icon: 'school', dist: '600 m', name: 'Osnovna škola', sub: 'Velika Kladuša' },
      { icon: 'health', dist: '800 m', name: 'Dom zdravlja', sub: 'Velika Kladuša' },
      { icon: 'shop', dist: '500 m', name: 'Marketi', sub: 'Konzum, Bingo' },
      { icon: 'park', dist: '200 m', name: 'Gradski park', sub: 'Grabik šetalište' },
      { icon: 'bus', dist: '550 m', name: 'Autobuska stanica', sub: 'Gradski prijevoz' },
      { icon: 'child', dist: '450 m', name: 'Vrtić', sub: 'Javni i privatni' }
    ]
  };

  function getBuildingTotalFloors(bid) { return PLANS[bid].length; }

  var GAL_IMAGES = {
    one: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=450&fit=crop'
    ],
    park: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=450&fit=crop'
    ],
    centar: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=450&fit=crop'
    ],
    panorama: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=450&fit=crop'
    ]
  };

  var galIdx = 0;
  var galTotal = 0;

  function generateFloorplan(rooms) {
    var w = 420, h = 300, p = 16;
    var wall = 'stroke="#0B1220" stroke-width="2.5" fill="none"';
    var thin = 'stroke="#0B1220" stroke-width="1.2" fill="none"';
    var door = 'stroke="#F26721" stroke-width="1.8" fill="none" stroke-dasharray="4,3"';
    var label = 'font-family="Inter,sans-serif" font-size="11" fill="#7A869E" text-anchor="middle"';
    var roomLabel = 'font-family="Archivo,sans-serif" font-weight="700" font-size="12" fill="#3E4A61" text-anchor="middle"';
    var dim = 'font-family="Inter,sans-serif" font-size="9" fill="#B0B8C8" text-anchor="middle"';

    var rooms1 =
      '<rect x="' + p + '" y="' + p + '" width="' + (w - p * 2) + '" height="' + (h - p * 2) + '" ' + wall + '/>' +
      '<line x1="' + (w * 0.55) + '" y1="' + p + '" x2="' + (w * 0.55) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + p + '" y1="' + (h * 0.52) + '" x2="' + (w * 0.55) + '" y2="' + (h * 0.52) + '" ' + thin + '/>' +
      '<text x="' + (w * 0.28) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Dnevni boravak</text>' +
      '<text x="' + (w * 0.28) + '" y="' + (h * 0.34) + '" ' + dim + '>' + Math.round(rooms === 1 ? 28 : 32) + ' m²</text>' +
      '<text x="' + (w * 0.78) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Spavaća</text>' +
      '<text x="' + (w * 0.78) + '" y="' + (h * 0.34) + '" ' + dim + '>' + Math.round(rooms === 1 ? 14 : 18) + ' m²</text>' +
      '<text x="' + (w * 0.28) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Kuhinja</text>' +
      '<text x="' + (w * 0.78) + '" y="' + (h * 0.68) + '" ' + roomLabel + '>Kupatilo</text>' +
      '<text x="' + (w * 0.78) + '" y="' + (h * 0.74) + '" ' + dim + '>4 m²</text>' +
      '<circle cx="' + (w * 0.55) + '" cy="' + (h * 0.42) + '" r="5" fill="#F26721" opacity=".7"/>' +
      '<line x1="' + (w * 0.53) + '" y1="' + (h * 0.38) + '" x2="' + (w * 0.60) + '" y2="' + (h * 0.46) + '"' + door + '/>';

    var rooms2 =
      '<rect x="' + p + '" y="' + p + '" width="' + (w - p * 2) + '" height="' + (h - p * 2) + '" ' + wall + '/>' +
      '<line x1="' + (w * 0.42) + '" y1="' + p + '" x2="' + (w * 0.42) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + p + '" y1="' + (h * 0.52) + '" x2="' + (w * 0.42) + '" y2="' + (h * 0.52) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.42) + '" y1="' + (h * 0.55) + '" x2="' + (w - p) + '" y2="' + (h * 0.55) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.72) + '" y1="' + (h * 0.55) + '" x2="' + (w * 0.72) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<text x="' + (w * 0.21) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Dnevni</text>' +
      '<text x="' + (w * 0.21) + '" y="' + (h * 0.34) + '" ' + dim + '>24 m²</text>' +
      '<text x="' + (w * 0.21) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Kuhinja</text>' +
      '<text x="' + (w * 0.57) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Spavaća 1</text>' +
      '<text x="' + (w * 0.57) + '" y="' + (h * 0.34) + '" ' + dim + '>14 m²</text>' +
      '<text x="' + (w * 0.57) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Spavaća 2</text>' +
      '<text x="' + (w * 0.57) + '" y="' + (h * 0.80) + '" ' + dim + '>12 m²</text>' +
      '<text x="' + (w * 0.87) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Kupatilo</text>' +
      '<circle cx="' + (w * 0.42) + '" cy="' + (h * 0.52) + '" r="5" fill="#F26721" opacity=".7"/>' +
      '<line x1="' + (w * 0.40) + '" y1="' + (h * 0.48) + '" x2="' + (w * 0.47) + '" y2="' + (h * 0.56) + '"' + door + '/>';

    var rooms3 =
      '<rect x="' + p + '" y="' + p + '" width="' + (w - p * 2) + '" height="' + (h - p * 2) + '" ' + wall + '/>' +
      '<line x1="' + (w * 0.36) + '" y1="' + p + '" x2="' + (w * 0.36) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.68) + '" y1="' + p + '" x2="' + (w * 0.68) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + p + '" y1="' + (h * 0.5) + '" x2="' + (w * 0.36) + '" y2="' + (h * 0.5) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.36) + '" y1="' + (h * 0.52) + '" x2="' + (w - p) + '" y2="' + (h * 0.52) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.52) + '" y1="' + (h * 0.52) + '" x2="' + (w * 0.52) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<text x="' + (w * 0.18) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Dnevni</text>' +
      '<text x="' + (w * 0.18) + '" y="' + (h * 0.34) + '" ' + dim + '>26 m²</text>' +
      '<text x="' + (w * 0.18) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Kuhinja</text>' +
      '<text x="' + (w * 0.52) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Spavaća 1</text>' +
      '<text x="' + (w * 0.52) + '" y="' + (h * 0.34) + '" ' + dim + '>14 m²</text>' +
      '<text x="' + (w * 0.52) + '" y="' + (h * 0.78) + '" ' + roomLabel + '>Kupatilo</text>' +
      '<text x="' + (w * 0.84) + '" y="' + (h * 0.28) + '" ' + roomLabel + '>Spavaća 2</text>' +
      '<text x="' + (w * 0.84) + '" y="' + (h * 0.34) + '" ' + dim + '>12 m²</text>' +
      '<text x="' + (w * 0.84) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Spavaća 3</text>' +
      '<text x="' + (w * 0.84) + '" y="' + (h * 0.80) + '" ' + dim + '>11 m²</text>' +
      '<text x="' + (w * 0.66) + '" y="' + (h * 0.78) + '" ' + roomLabel + '>Kupatilo 2</text>' +
      '<circle cx="' + (w * 0.36) + '" cy="' + (h * 0.50) + '" r="5" fill="#F26721" opacity=".7"/>' +
      '<line x1="' + (w * 0.34) + '" y1="' + (h * 0.46) + '" x2="' + (w * 0.41) + '" y2="' + (h * 0.54) + '"' + door + '/>';

    var rooms4 =
      '<rect x="' + p + '" y="' + p + '" width="' + (w - p * 2) + '" height="' + (h - p * 2) + '" ' + wall + '/>' +
      '<line x1="' + (w * 0.33) + '" y1="' + p + '" x2="' + (w * 0.33) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.62) + '" y1="' + p + '" x2="' + (w * 0.62) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + p + '" y1="' + (h * 0.48) + '" x2="' + (w * 0.33) + '" y2="' + (h * 0.48) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.33) + '" y1="' + (h * 0.5) + '" x2="' + (w - p) + '" y2="' + (h * 0.5) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.48) + '" y1="' + (h * 0.5) + '" x2="' + (w * 0.48) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<line x1="' + (w * 0.62) + '" y1="' + (h * 0.5) + '" x2="' + (w * 0.62) + '" y2="' + (h - p) + '" ' + thin + '/>' +
      '<text x="' + (w * 0.17) + '" y="' + (h * 0.26) + '" ' + roomLabel + '>Dnevni</text>' +
      '<text x="' + (w * 0.17) + '" y="' + (h * 0.32) + '" ' + dim + '>30 m²</text>' +
      '<text x="' + (w * 0.17) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Kuhinja</text>' +
      '<text x="' + (w * 0.41) + '" y="' + (h * 0.26) + '" ' + roomLabel + '>Spavaća 1</text>' +
      '<text x="' + (w * 0.41) + '" y="' + (h * 0.32) + '" ' + dim + '>16 m²</text>' +
      '<text x="' + (w * 0.41) + '" y="' + (h * 0.78) + '" ' + roomLabel + '>Kupatilo</text>' +
      '<text x="' + (w * 0.75) + '" y="' + (h * 0.26) + '" ' + roomLabel + '>Spavaća 2</text>' +
      '<text x="' + (w * 0.75) + '" y="' + (h * 0.32) + '" ' + dim + '>13 m²</text>' +
      '<text x="' + (w * 0.55) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Spavaća 3</text>' +
      '<text x="' + (w * 0.55) + '" y="' + (h * 0.80) + '" ' + dim + '>11 m²</text>' +
      '<text x="' + (w * 0.81) + '" y="' + (h * 0.74) + '" ' + roomLabel + '>Spavaća 4</text>' +
      '<text x="' + (w * 0.81) + '" y="' + (h * 0.80) + '" ' + dim + '>10 m²</text>' +
      '<text x="' + (w * 0.73) + '" y="' + (h * 0.78) + '" ' + roomLabel + '>Kupatilo 2</text>' +
      '<circle cx="' + (w * 0.33) + '" cy="' + (h * 0.48) + '" r="5" fill="#F26721" opacity=".7"/>' +
      '<line x1="' + (w * 0.31) + '" y1="' + (h * 0.44) + '" x2="' + (w * 0.38) + '" y2="' + (h * 0.52) + '"' + door + '/>';

    var svg = rooms === 1 ? rooms1 : rooms === 2 ? rooms2 : rooms === 3 ? rooms3 : rooms4;

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="fp__svg">' +
      '<rect width="' + w + '" height="' + h + '" fill="#F8F9FB" rx="6"/>' +
      svg +
      '<text x="' + (w / 2) + '" y="' + (h - 4) + '" ' + dim + ' font-size="8" letter-spacing=".12em">TLOCRT - NIJE MJERITVEN</text>' +
      '</svg>';
  }

  function renderGallery(bid) {
    var imgs = GAL_IMAGES[bid] || GAL_IMAGES.one;
    var view = document.getElementById('galView');
    var dots = document.getElementById('galDots');
    galTotal = imgs.length;
    galIdx = 0;

    view.innerHTML = imgs.map(function (url, i) {
      return '<div class="gal__slide' + (i === 0 ? ' is-active' : '') + '">' +
        '<img src="' + url + '" alt="Stan - fotografija ' + (i + 1) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '">' +
        '</div>';
    }).join('');

    dots.innerHTML = imgs.map(function (_, i) {
      return '<button class="gal__dot' + (i === 0 ? ' is-active' : '') + '" data-gi="' + i + '" aria-label="Fotografija ' + (i + 1) + '"></button>';
    }).join('');
  }

  function galGo(idx) {
    galIdx = (idx + galTotal) % galTotal;
    var slides = document.querySelectorAll('#galView .gal__slide');
    var dots = document.querySelectorAll('#galDots .gal__dot');
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === galIdx); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === galIdx); });
  }

  document.getElementById('galPrev').addEventListener('click', function () { galGo(galIdx - 1); });
  document.getElementById('galNext').addEventListener('click', function () { galGo(galIdx + 1); });
  document.getElementById('galDots').addEventListener('click', function (e) {
    var dot = e.target.closest('[data-gi]');
    if (dot) galGo(Number(dot.dataset.gi));
  });

  function openModal(apt) {
    var totalFloors = getBuildingTotalFloors(apt.building);
    var floorLabel = apt.floor === 1 ? 'Prizemlje' : (FLOOR_LABEL[apt.floor] || apt.floor + '.') + ' sprat';
    var baths = apt.rooms <= 2 ? 1 : 2;
    var balcony = apt.rooms >= 2 ? 'Da' : 'Ne';
    var orient = ['Jug', 'Sjever', 'Istok', 'Zapad'][(apt.floor + apt.rooms) % 4];

    document.getElementById('modalId').textContent = apt.id + (apt.penthouse ? ' · Penthouse' : '');
    var badge = document.getElementById('modalBadge');
    badge.textContent = STATUS_LABEL[apt.status];
    badge.className = 'modal__badge modal__badge--' + apt.status;
    document.getElementById('modalBldg').textContent = apt.buildingName;

    var titleLine = ROOM_LABEL[apt.rooms];
    document.getElementById('modalTitle').innerHTML = titleLine + '<br><em>' + apt.area + ' m²</em>';
    document.getElementById('modalSub').textContent = floorLabel + ' · ' + totalFloors + ' spratova ukupno' + (apt.penthouse ? ' · Penthouse stan' : '');

    document.getElementById('modalFloorplan').innerHTML = generateFloorplan(apt.rooms);
    document.getElementById('modalFloorplan').classList.add('fp--hidden');
    document.getElementById('fpToggle').classList.remove('is-open');
    document.getElementById('fpToggle').querySelector('span').textContent = 'Prikaži tlocrt stana';

    renderGallery(apt.building);

    document.getElementById('modalSpecs').innerHTML =
      '<div class="modal__spec"><dt>Sprat</dt><dd>' + apt.floor + '. <small>/ ' + totalFloors + '</small></dd></div>' +
      '<div class="modal__spec"><dt>Kvadratura</dt><dd>' + apt.area + ' <small>m²</small></dd></div>' +
      '<div class="modal__spec"><dt>Sobe</dt><dd>' + apt.rooms + ' <small>' + (apt.rooms === 1 ? 'soba' : 'sobe') + '</small></dd></div>' +
      '<div class="modal__spec"><dt>Kupatila</dt><dd>' + baths + ' <small>' + (baths === 1 ? 'kupatilo' : 'kupatila') + '</small></dd></div>' +
      '<div class="modal__spec"><dt>Balkon</dt><dd>' + balcony + '</dd></div>' +
      '<div class="modal__spec"><dt>Orijentacija</dt><dd style="font-size:clamp(18px,2vw,24px)">' + orient + '</dd></div>';

    document.getElementById('modalPrice').innerHTML =
      '<span class="modal__priceval">' + fmt(apt.price) + ' KM</span>' +
      '<span class="modal__priceper">' + fmt(apt.m2) + ' KM/m²</span>';

    var inc = BUILDING_INC[apt.building] || [];
    document.getElementById('modalInc').innerHTML = inc.map(function (item) {
      return '<div class="modal__incitem">' + item + '</div>';
    }).join('');

    var prox = BUILDING_PROX[apt.building] || [];
    document.getElementById('modalProx').innerHTML = prox.map(function (p) {
      return '<div class="modal__proxitem">' +
        '<span class="modal__proxicon">' + (PROX_SVG[p.icon] || '') + '</span>' +
        '<div class="modal__proxinfo">' +
          '<span class="modal__proxname">' + p.name + '</span>' +
          '<span class="modal__proxsub">' + p.sub + '</span>' +
        '</div>' +
        '<span class="modal__proxdist">' + p.dist + '</span>' +
      '</div>';
    }).join('');

    var footer = document.getElementById('modalFooter');
    if (apt.status === 'available') {
      footer.innerHTML =
        '<a href="#kontakt" class="btn btn--orange" id="modalReserve">Rezerviši stan <span aria-hidden="true">→</span></a>' +
        '<a href="tel:+38737772000" class="btn btn--blue">Pozovi: +387 37 772 000</a>';
      document.getElementById('modalReserve').addEventListener('click', function () {
        closeModal();
        var sel = document.getElementById('fBuilding');
        var bName = BUILDINGS[apt.building].name;
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === bName) { sel.selectedIndex = i; break; }
        }
        document.getElementById('fMsg').value = 'Zanima me stan ' + apt.id + ' (' + bName + '), ' + apt.area + ' m². Molim vas za više informacija i termin razgovora.';
        document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
      });
    } else if (apt.status === 'reserved') {
      footer.innerHTML =
        '<a href="tel:+38737772000" class="btn btn--blue">Pozovi: +387 37 772 000</a>' +
        '<a href="mailto:info@arilux.ba" class="btn btn--ghost-blue">Pošalji upit za listu čekanja</a>';
    } else {
      footer.innerHTML =
        '<a href="tel:+38737772000" class="btn btn--ghost-blue">Pozovi za slične stanove</a>';
    }

    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('fpToggle').addEventListener('click', function () {
    var fp = document.getElementById('modalFloorplan');
    var open = fp.classList.toggle('fp--hidden');
    this.classList.toggle('is-open', !open);
    this.querySelector('span').textContent = open ? 'Prikaži tlocrt stana' : 'Sakrij tlocrt';
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) closeModal();
  });

  /* ── Reveal animacije ───────────────────────────────────────── */

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Brojači ────────────────────────────────────────────────── */

  function animateCount(el) {
    var target = Number(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var dur = 1600;
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = fmt(Number(el.dataset.count)) + (el.dataset.suffix || ''); });
  }

  /* ── Header + mobilni meni ──────────────────────────────────── */

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuLinks = mobileMenu.querySelectorAll('.mobilemenu__link');

  function closeMenu() {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    menuLinks.forEach(function (l) { l.style.opacity = ''; l.style.transform = ''; l.style.transition = ''; });
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var open = !mobileMenu.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      menuLinks.forEach(function (l, i) {
        l.style.opacity = '0';
        l.style.transform = 'translateX(-20px)';
        l.style.transition = 'none';
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          menuLinks.forEach(function (l, i) {
            l.style.transition = 'opacity .4s ease ' + (i * 0.06) + 's, transform .45s cubic-bezier(.22,.8,.28,1) ' + (i * 0.06) + 's, color .3s, padding-left .35s cubic-bezier(.22,.8,.28,1)';
            l.style.opacity = '1';
            l.style.transform = 'none';
          });
        });
      });
    }
  });

  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Kontakt forma ──────────────────────────────────────────── */

  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('fName');
    var phone = document.getElementById('fPhone');
    var email = document.getElementById('fEmail');
    var building = document.getElementById('fBuilding');
    var msg = document.getElementById('fMsg');

    var ok = true;
    [name, phone].forEach(function (f) {
      var valid = f.value.trim().length >= (f === phone ? 6 : 3);
      f.classList.toggle('is-error', !valid);
      if (!valid) ok = false;
    });

    note.hidden = false;
    if (!ok) {
      note.className = 'formnote formnote--err';
      note.textContent = 'Molimo upišite ime i broj telefona - bez toga ne možemo stupiti u kontakt.';
      return;
    }

    var subject = 'Upit za stan - ' + building.value + ' (' + name.value.trim() + ')';
    var body =
      'Ime i prezime: ' + name.value.trim() + '\n' +
      'Telefon: ' + phone.value.trim() + '\n' +
      'E-mail: ' + (email.value.trim() || '-') + '\n' +
      'Zgrada: ' + building.value + '\n\n' +
      'Poruka:\n' + (msg.value.trim() || '-') + '\n\n' +
      '- Poslano sa stranice Arilux Nekretnine';

    window.location.href = 'mailto:info@arilux.ba?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    note.className = 'formnote formnote--ok';
    note.textContent = 'Hvala, ' + name.value.trim().split(' ')[0] + '! Vaš e-mail klijent se upravo otvara sa pripremljenim upitom. Ako se ne otvori, nazovite nas na +387 37 772 000.';
    form.reset();
  });

  /* ── Ostalo ─────────────────────────────────────────────────── */

  document.getElementById('year').textContent = new Date().getFullYear();

})();
