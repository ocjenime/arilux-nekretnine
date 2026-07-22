/* ═══════════════════════════════════════════════════════════════
   ARILUX NEKRETNINE — main.js
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Podaci: 4 zgrade, 102 stana ────────────────────────────── */

  var BUILDINGS = {
    one:      { name: 'Arilux One',      loc: 'Centar',   base: 3700, letter: 'ONE' },
    park:     { name: 'Arilux Park',     loc: 'Uz park',  base: 3500, letter: 'PRK' },
    centar:   { name: 'Arilux Centar',   loc: 'Trg',      base: 4000, letter: 'CNT' },
    panorama: { name: 'Arilux Panorama', loc: 'Grabik',   base: 4500, letter: 'PAN' }
  };

  var ROOM_AREA = { 1: [45, 54], 2: [60, 74], 3: [85, 104], 4: [118, 148] };
  var ROOM_LABEL = { 1: 'Jednosoban', 2: 'Dvosoban', 3: 'Trosoban', 4: 'Četverosoban' };

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
    // "uskoro" zgrade — uglavnom slobodno
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

  // filteri — chips
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

  // "Rezerviši" na kartici stana → predefiniši formu
  grid.addEventListener('click', function (e) {
    var link = e.target.closest('[data-apt]');
    if (!link) return;
    var sel = document.getElementById('fBuilding');
    var bName = BUILDINGS[link.dataset.building].name;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === bName) { sel.selectedIndex = i; break; }
    }
    var msg = document.getElementById('fMsg');
    msg.value = 'Zanima me stan ' + link.dataset.apt + ' (' + bName + '). Molim vas za više informacija i termin razgovora.';
  });

  syncRange();

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

  function closeMenu() {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
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
      note.textContent = 'Molimo upišite ime i broj telefona — bez toga ne možemo stupiti u kontakt.';
      return;
    }

    var subject = 'Upit za stan — ' + building.value + ' (' + name.value.trim() + ')';
    var body =
      'Ime i prezime: ' + name.value.trim() + '\n' +
      'Telefon: ' + phone.value.trim() + '\n' +
      'E-mail: ' + (email.value.trim() || '—') + '\n' +
      'Zgrada: ' + building.value + '\n\n' +
      'Poruka:\n' + (msg.value.trim() || '—') + '\n\n' +
      '— Poslano sa stranice Arilux Nekretnine';

    window.location.href = 'mailto:info@arilux.ba?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    note.className = 'formnote formnote--ok';
    note.textContent = 'Hvala, ' + name.value.trim().split(' ')[0] + '! Vaš e-mail klijent se upravo otvara sa pripremljenim upitom. Ako se ne otvori, nazovite nas na +387 37 772 000.';
    form.reset();
  });

  /* ── Ostalo ─────────────────────────────────────────────────── */

  document.getElementById('year').textContent = new Date().getFullYear();

})();
