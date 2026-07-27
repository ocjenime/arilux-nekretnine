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

  /* ── i18n: detect language and provide translations ─────────── */
  var LANG = (function() { var l = document.documentElement.lang; return (l === 'de' || l === 'en') ? l : 'bs'; })();

  var I18N = {
    de: {
      roomLabel: { 1: '1-Zimmer', 2: '2-Zimmer', 3: '3-Zimmer', 4: '4-Zimmer' },
      floorLabel: { 1: 'Erdgeschoss', 2: '1. OG', 3: '2. OG', 4: '3. OG', 5: '4. OG', 6: '5. OG', 7: '6. OG', 8: '7. OG', 9: '8. OG' },
      statusLabel: { available: 'Verfügbar', reserved: 'Reserviert', sold: 'Verkauft' },
      floor: 'Stockwerk',
      floors: 'Etagen',
      totalFloors: 'Etagen gesamt',
      penthouse: 'Penthouse',
      penthouseUnit: 'Penthouse-Wohnung',
      found: 'Wohnungen gefunden',
      available: 'verfügbar',
      reserve: 'Reservieren',
      reserveApt: 'Wohnung reservieren',
      call: 'Anrufen',
      sendInquiry: 'Wartelisten-Anfrage senden',
      callSimilar: 'Anrufen für ähnliche Wohnungen',
      showPlan: 'Grundriss anzeigen',
      hidePlan: 'Grundriss ausblenden',
      floorSpec: 'Etage',
      areaSpec: 'Wohnfläche',
      roomsSpec: 'Zimmer',
      bathroomsSpec: 'Badezimmer',
      balconySpec: 'Balkon',
      balconyYes: 'Ja',
      balconyNo: 'Nein',
      orientationSpec: 'Ausrichtung',
      orientation: ['Süd', 'Nord', 'Ost', 'West'],
      features: {
        one: ['Fußbodenheizung', 'Wärmepumpe', 'Energiestandard A+', 'Balkon', 'Tiefgarage', 'Gewerbeflächen im EG'],
        park: ['Fußbodenheizung', 'Wärmepumpe', 'Energiestandard A+', 'Privater Parkplatz', 'Spielplatz', 'Terrassen mit Parkblick'],
        centar: ['Fußbodenheizung', 'Wärmepumpe', 'Energiestandard A+', 'Aufzug', 'Gewerbeflächen', 'Garage im Untergeschoss'],
        panorama: ['Fußbodenheizung', 'Wärmepumpe', 'Energiestandard A+', 'Terrassen', 'Dachterrassen (PH)', 'Panoramablick']
      },
      tourNames: ['Wohnzimmer', 'Schlafzimmer', 'Küche', 'Badezimmer', 'Balkon'],
      prefilledMsg: 'Ich interessiere mich für Wohnung {id} ({name}), {m2} m². Bitte um weitere Informationen und einen Termin.',
      btnReserve: 'Wohnung reservieren \u2192',
      btnCall: 'Anrufen: +387 37 772 000'
    },
    en: {
      roomLabel: { 1: '1-Room', 2: '2-Room', 3: '3-Room', 4: '4-Room' },
      floorLabel: { 1: 'Ground Floor', 2: '1st Floor', 3: '2nd Floor', 4: '3rd Floor', 5: '4th Floor', 6: '5th Floor', 7: '6th Floor', 8: '7th Floor', 9: '8th Floor' },
      statusLabel: { available: 'Available', reserved: 'Reserved', sold: 'Sold' },
      floor: 'Floor',
      floors: 'Floors',
      totalFloors: 'Total Floors',
      penthouse: 'Penthouse',
      penthouseUnit: 'Penthouse Unit',
      found: 'apartments found',
      available: 'available',
      reserve: 'Reserve',
      reserveApt: 'Reserve Apartment',
      call: 'Call',
      sendInquiry: 'Send Waitlist Inquiry',
      callSimilar: 'Call for Similar Apartments',
      showPlan: 'Show Floor Plan',
      hidePlan: 'Hide Floor Plan',
      floorSpec: 'Floor',
      areaSpec: 'Living Area',
      roomsSpec: 'Rooms',
      bathroomsSpec: 'Bathrooms',
      balconySpec: 'Balcony',
      balconyYes: 'Yes',
      balconyNo: 'No',
      orientationSpec: 'Orientation',
      orientation: ['South', 'North', 'East', 'West'],
      features: {
        one: ['Underfloor Heating', 'Heat Pump', 'A+ Energy Standard', 'Balcony', 'Underground Parking', 'Ground Floor Commercial'],
        park: ['Underfloor Heating', 'Heat Pump', 'A+ Energy Standard', 'Private Parking', 'Playground', 'Park-View Terraces'],
        centar: ['Underfloor Heating', 'Heat Pump', 'A+ Energy Standard', 'Elevator', 'Commercial Units', 'Basement Garage'],
        panorama: ['Underfloor Heating', 'Heat Pump', 'A+ Energy Standard', 'Terraces', 'Rooftop Terraces (PH)', 'Panoramic View']
      },
      tourNames: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony'],
      prefilledMsg: 'I\'m interested in apartment {id} ({name}), {m2} m². Please send more information and schedule a visit.',
      btnReserve: 'Reserve Apartment \u2192',
      btnCall: 'Call: +387 37 772 000'
    }
  };

  function t(key) {
    if (I18N[LANG] && I18N[LANG][key] !== undefined) return I18N[LANG][key];
    return null;
  }
  function tArr(key) {
    if (I18N[LANG] && I18N[LANG][key]) return I18N[LANG][key];
    return null;
  }

  /* Apply i18n overrides to label objects */
  (function () {
    var rl = tArr('roomLabel'); if (rl) Object.keys(rl).forEach(function (k) { ROOM_LABEL[k] = rl[k]; });
    var fl = tArr('floorLabel'); if (fl) Object.keys(fl).forEach(function (k) { FLOOR_LABEL[k] = fl[k]; });
  })();

  /* ── Try loading from site.json ──────────────────────────────── */
  var JSON_LOADED = false;

  function mergeJSON(data) {
    if (!data || !data.buildings) return;
    JSON_LOADED = true;
    Object.keys(data.buildings).forEach(function (k) {
      var b = data.buildings[k];
      if (BUILDINGS[k]) {
        BUILDINGS[k].name = b.name || BUILDINGS[k].name;
        BUILDINGS[k].loc = b.loc || BUILDINGS[k].loc;
        BUILDINGS[k].base = b.base || BUILDINGS[k].base;
        BUILDINGS[k].letter = b.letter || BUILDINGS[k].letter;
      }
      if (b.plans) PLANS[k] = b.plans;
    });
    if (data.roomArea) {
      Object.keys(data.roomArea).forEach(function (k) { ROOM_AREA[k] = data.roomArea[k]; });
    }
    if (data.roomLabels) {
      Object.keys(data.roomLabels).forEach(function (k) { ROOM_LABEL[k] = data.roomLabels[k]; });
    }
    if (data.floorLabels) {
      Object.keys(data.floorLabels).forEach(function (k) { FLOOR_LABEL[k] = data.floorLabels[k]; });
    }
    window.__ARILUX_JSON = data;
    if (data.logo && data.logo.url) {
      applyLogo(data.logo.url);
    } else {
      try { localStorage.removeItem('arilux_logo_cache'); } catch(e) {}
    }
  }

  /* ── Leaflet satellite map ─────────────────────────────── */
  var MAP_COLORS = { one: '#0041B1', park: '#2FB57E', centar: '#F26721', panorama: '#7B61FF' };
  var MAP_LABELS = { one: 'Amor', park: 'Park', centar: 'Centar', panorama: 'Panorama' };
  var MAP_COORDS = {
    one:      [45.183776, 15.807419],
    park:     [45.184194, 15.801271],
    centar:   [45.184554, 15.807756],
    panorama: [45.183531, 15.792195]
  };
  var MAP_FLOORS = { one: 6, park: 5, centar: 8, panorama: 4 };
  var lmap = null;
  var lmarkers = {};

  function buildingIcon(bid) {
    var color = MAP_COLORS[bid];
    var label = MAP_LABELS[bid];
    var floors = MAP_FLOORS[bid] || 4;
    var S = 54, TOTAL = 110;
    var bH = 16 + floors * 7;
    var bW = 26;
    var bX = (S - bW) / 2;
    var bY = 6;

    /* darker / lighter variants */
    function darken(hex, pct) {
      var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      r = Math.round(r * (1 - pct)); g = Math.round(g * (1 - pct)); b = Math.round(b * (1 - pct));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    function lighten(hex, pct) {
      var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
      r = Math.min(255, Math.round(r + (255 - r) * pct));
      g = Math.min(255, Math.round(g + (255 - g) * pct));
      b = Math.min(255, Math.round(b + (255 - b) * pct));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    var dark = darken(color, 0.35);
    var mid = darken(color, 0.15);
    var lite = lighten(color, 0.25);
    var glass = lighten(color, 0.55);

    var uid = 'b' + bid;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + TOTAL + '" viewBox="0 0 ' + S + ' ' + TOTAL + '">';
    /* ── defs: gradients, filters ── */
    svg += '<defs>';
    /* building body gradient */
    svg += '<linearGradient id="' + uid + 'bg" x1="0" y1="0" x2="1" y2="1">';
    svg += '<stop offset="0%" stop-color="' + lite + '"/>';
    svg += '<stop offset="45%" stop-color="' + color + '"/>';
    svg += '<stop offset="100%" stop-color="' + dark + '"/>';
    svg += '</linearGradient>';
    /* glass reflection gradient */
    svg += '<linearGradient id="' + uid + 'gl" x1="0" y1="0" x2="0" y2="1">';
    svg += '<stop offset="0%" stop-color="#fff" stop-opacity=".45"/>';
    svg += '<stop offset="40%" stop-color="#fff" stop-opacity=".08"/>';
    svg += '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>';
    svg += '</linearGradient>';
    /* window glow */
    svg += '<linearGradient id="' + uid + 'wg" x1="0" y1="0" x2="0" y2="1">';
    svg += '<stop offset="0%" stop-color="' + glass + '" stop-opacity=".9"/>';
    svg += '<stop offset="100%" stop-color="#fff" stop-opacity=".35"/>';
    svg += '</linearGradient>';
    /* roof sheen */
    svg += '<linearGradient id="' + uid + 'rf" x1="0" y1="0" x2="0" y2="1">';
    svg += '<stop offset="0%" stop-color="#fff" stop-opacity=".5"/>';
    svg += '<stop offset="100%" stop-color="' + color + '" stop-opacity=".9"/>';
    svg += '</linearGradient>';
    /* drop shadow */
    svg += '<filter id="' + uid + 'ds" x="-50%" y="-20%" width="200%" height="200%">';
    svg += '<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="' + dark + '" flood-opacity=".35"/>';
    svg += '</filter>';
    /* glow */
    svg += '<filter id="' + uid + 'gw" x="-80%" y="-80%" width="260%" height="260%">';
    svg += '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>';
    svg += '<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .35 0" result="glow"/>';
    svg += '<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>';
    svg += '</filter>';
    /* ground shadow */
    svg += '<radialGradient id="' + uid + 'gs" cx="50%" cy="50%" r="50%">';
    svg += '<stop offset="0%" stop-color="#000" stop-opacity=".22"/>';
    svg += '<stop offset="100%" stop-color="#000" stop-opacity="0"/>';
    svg += '</radialGradient>';
    svg += '</defs>';

    /* ── ground shadow ellipse ── */
    svg += '<ellipse cx="' + (S / 2) + '" cy="' + (bY + bH + 10) + '" rx="14" ry="4" fill="url(#' + uid + 'gs)"/>';

    /* ── building group with glow + shadow ── */
    svg += '<g filter="url(#' + uid + 'gw)">';

    /* main body */
    svg += '<rect x="' + bX + '" y="' + bY + '" width="' + bW + '" height="' + bH + '" rx="4" fill="url(#' + uid + 'bg)" filter="url(#' + uid + 'ds)"/>';

    /* glass curtain wall overlay */
    svg += '<rect x="' + bX + '" y="' + bY + '" width="' + bW + '" height="' + bH + '" rx="4" fill="url(#' + uid + 'gl)"/>';

    /* left edge highlight (beveled glass feel) */
    svg += '<rect x="' + bX + '" y="' + bY + '" width="2.5" height="' + bH + '" rx="1.2" fill="#fff" opacity=".2"/>';

    /* right edge shadow (depth) */
    svg += '<rect x="' + (bX + bW - 2) + '" y="' + bY + '" width="2" height="' + bH + '" rx="1" fill="#000" opacity=".12"/>';

    /* ── windows grid ── */
    var cols = 4;
    var rows = Math.min(floors, 8);
    var padX = 3, padY = 5;
    var ww = (bW - padX * 2 - (cols - 1) * 1.8) / cols;
    var wh = ((bH - padY * 2 - (rows - 1) * 1.5) / rows) * 0.65;
    var gapX = (bW - padX * 2 - cols * ww) / Math.max(1, cols - 1);
    var gapY = (bH - padY * 2 - rows * wh) / Math.max(1, rows);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var wx = bX + padX + c * (ww + gapX);
        var wy = bY + padY + r * (wh + gapY);
        /* window glass */
        svg += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="1.2" fill="url(#' + uid + 'wg)"/>';
        /* top highlight on each window */
        svg += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="1" rx=".5" fill="#fff" opacity=".5"/>';
      }
    }

    /* ── entrance ── */
    var doorW = 7, doorH = 9;
    var doorX = bX + (bW - doorW) / 2;
    var doorY = bY + bH - doorH - 1;
    svg += '<rect x="' + doorX + '" y="' + doorY + '" width="' + doorW + '" height="' + doorH + '" rx="2" fill="' + dark + '" opacity=".7"/>';
    svg += '<rect x="' + (doorX + 1) + '" y="' + (doorY + 1) + '" width="' + (doorW - 2) + '" height="' + (doorH - 1) + '" rx="1.5" fill="#fff" opacity=".15"/>';
    /* door glass line */
    svg += '<line x1="' + (doorX + doorW / 2) + '" y1="' + (doorY + 2) + '" x2="' + (doorX + doorW / 2) + '" y2="' + (doorY + doorH - 1) + '" stroke="#fff" stroke-width=".5" opacity=".3"/>';

    /* ── roof accent ── */
    svg += '<rect x="' + (bX - 1) + '" y="' + (bY - 1) + '" width="' + (bW + 2) + '" height="5" rx="2.5" fill="url(#' + uid + 'rf)"/>';
    /* roof highlight line */
    svg += '<line x1="' + (bX + 2) + '" y1="' + (bY + 1) + '" x2="' + (bX + bW - 2) + '" y2="' + (bY + 1) + '" stroke="#fff" stroke-width=".8" opacity=".6"/>';

    svg += '</g>'; /* end glow group */

    /* ── pin connector (elegant teardrop stem) ── */
    var cx = S / 2;
    var stemTop = bY + bH + 2;
    var stemBot = TOTAL - 26;
    svg += '<path d="M' + (cx - 1.2) + ' ' + stemTop + ' Q' + cx + ' ' + ((stemTop + stemBot) / 2 + 4) + ' ' + cx + ' ' + stemBot + ' Q' + cx + ' ' + ((stemTop + stemBot) / 2 + 4) + ' ' + (cx + 1.2) + ' ' + stemTop + 'Z" fill="' + dark + '" opacity=".6"/>';

    /* ── premium label pill ── */
    var pillY = TOTAL - 22;
    var pillW = 48, pillH = 16;
    var pillX = (S - pillW) / 2;
    svg += '<rect x="' + pillX + '" y="' + pillY + '" width="' + pillW + '" height="' + pillH + '" rx="8" fill="#fff" opacity=".92"/>';
    svg += '<rect x="' + pillX + '" y="' + pillY + '" width="' + pillW + '" height="' + pillH + '" rx="8" fill="none" stroke="' + color + '" stroke-width="1.2" opacity=".6"/>';
    /* colored dot inside pill */
    svg += '<circle cx="' + (pillX + 7) + '" cy="' + (pillY + pillH / 2) + '" r="3" fill="' + color + '"/>';
    /* label text */
    svg += '<text x="' + (pillX + 13) + '" y="' + (pillY + pillH / 2 + 3.2) + '" font-size="7.5" font-weight="700" font-family="Inter,sans-serif" fill="#1a1a2e" letter-spacing=".3">' + label + '</text>';

    svg += '</svg>';

    return L.divIcon({
      className: '',
      html: svg,
      iconSize: [S, TOTAL],
      iconAnchor: [S / 2, TOTAL - 10],
      popupAnchor: [0, -TOTAL + 28]
    });
  }

  function initLeafletMap() {
    if (lmap || !document.getElementById('leafletMap') || typeof L === 'undefined') return;
    var isMobile = window.innerWidth <= 900;
    lmap = L.map('leafletMap', {
      center: [45.1840, 15.8020],
      zoom: isMobile ? 14 : 15,
      zoomControl: !isMobile,
      scrollWheelZoom: false,
      touchZoom: true,
      dragging: true,
      tap: true
    });

    if (isMobile) {
      L.control.zoom({ position: 'bottomright' }).addTo(lmap);
    }

    /* satellite layer (ESRI WorldImagery - free, no key) */
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    }).addTo(lmap);

    /* labels layer on top */
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      pane: 'overlayPane'
    }).addTo(lmap);

    /* add building markers */
    var names = { one: 'Arilux Amor', park: 'Arilux Park', centar: 'Arilux Centar', panorama: 'Arilux Panorama' };
    Object.keys(MAP_COORDS).forEach(function (bid) {
      var marker = L.marker(MAP_COORDS[bid], { icon: buildingIcon(bid) }).addTo(lmap);
      marker.bindPopup('<b style="color:' + MAP_COLORS[bid] + '">' + names[bid] + '</b><br><small>' + MAP_LABELS[bid] + ' · ' + MAP_FLOORS[bid] + ' ' + (t('floors') || 'spratova') + '</small>');
      marker.on('click', function () { setLocMapBuilding(bid); });
      lmarkers[bid] = marker;
    });

    /* fit all markers */
    var group = L.featureGroup(Object.values(lmarkers));
    lmap.fitBounds(group.getBounds().pad(0.15));

    /* fix for mobile: invalidate size after tiles load */
    lmap.whenReady(function () {
      setTimeout(function () { lmap.invalidateSize(); }, 300);
    });
  }

  function panToBuilding(bid) {
    if (!lmap || !MAP_COORDS[bid]) return;
    lmap.setView(MAP_COORDS[bid], 17, { animate: true });
    if (lmarkers[bid]) lmarkers[bid].openPopup();
  }

  /* init after DOM ready + Leaflet loaded */
  function tryInitMap() {
    if (typeof L !== 'undefined') { initLeafletMap(); return; }
    /* retry until Leaflet loads (deferred) */
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (typeof L !== 'undefined' || tries > 50) { clearInterval(iv); initLeafletMap(); }
    }, 100);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(tryInitMap, 100); });
  } else {
    setTimeout(tryInitMap, 100);
  }

  /* apply custom logo from JSON or cache */
  function applyLogo(src) {
    if (!src) return;

    /* cache for instant apply on next visit */
    try { localStorage.setItem('arilux_logo_cache', JSON.stringify({ url: src, ts: Date.now() })); } catch(e) {}

    /* header logo - original: 74px wide */
    var logomark = document.querySelector('.header__logomark');
    if (logomark) {
      logomark.innerHTML = '';
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Arilux';
      img.style.cssText = 'width:102px;height:auto;object-fit:contain';
      logomark.appendChild(img);
    }

    /* dark section logo - original: min(420px, 80%) */
    var darkVisual = document.querySelector('.dark__visual');
    if (darkVisual) {
      var existing = darkVisual.querySelector('img.dark__logo-img');
      if (!existing) {
        var dImg = document.createElement('img');
        dImg.src = src;
        dImg.alt = 'Arilux';
        dImg.className = 'dark__logo-img';
        dImg.style.cssText = 'width:min(420px,80%);height:auto;object-fit:contain;filter:drop-shadow(0 30px 80px rgba(242,103,33,.25))';
        var darkEst = darkVisual.querySelector('.dark__est');
        if (darkEst) darkVisual.insertBefore(dImg, darkEst);
        else darkVisual.appendChild(dImg);
      }
    }

    /* footer logo - original: 97px wide */
    var footerBrand = document.querySelector('.footer__brand');
    if (footerBrand) {
      var existingF = footerBrand.querySelector('img.footer__logo-img');
      if (!existingF) {
        var fImg = document.createElement('img');
        fImg.src = src;
        fImg.alt = 'Arilux';
        fImg.className = 'footer__logo-img';
        fImg.style.cssText = 'width:97px;height:auto;object-fit:contain;margin-bottom:14px';
        footerBrand.insertBefore(fImg, footerBrand.firstChild);
      }
    }
  }

  /* instant apply from cache */
  try {
    var c = JSON.parse(localStorage.getItem('arilux_logo_cache') || 'null');
    if (c && c.url && Date.now() - c.ts < 86400000) applyLogo(c.url);
  } catch(e) {}

  fetch('data/site.json?' + Math.floor(Date.now() / 300000))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { if (data) mergeJSON(data); })
    .catch(function () {});

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

  var STATUS_LABEL = t('statusLabel') || { available: 'Slobodan', reserved: 'Rezervisan', sold: 'Prodan' };

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
      cta = '<a href="#kontakt" class="apt__cta" data-apt="' + a.id + '" data-building="' + a.building + '">' + (t('reserve') || 'Rezerviši') + ' <span aria-hidden="true">\u2192</span></a>';
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
        '<span><b>' + a.floor + '.</b> ' + (t('floor') || 'sprat') + '</span>' +
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
    countEl.innerHTML = (LANG === 'de' ? 'Gefunden: <b>' + all.length + '</b> Wohnungen · <b>' + avail + '</b> verfügbar' : LANG === 'en' ? 'Found: <b>' + all.length + '</b> apartments · <b>' + avail + '</b> available' : 'Pronađeno <b>' + all.length + '</b> stanova · <b>' + avail + '</b> slobodnih');

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

  var BUILDING_INC = tArr('features') || {
    one: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Balkon', 'Podzemna garaža', 'Poslovni prostori u prizemlju'],
    park: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Privatni parking', 'Dječije igralište', 'Terase sa pogledom na park'],
    centar: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Lift', 'Poslovni prostori', 'Garaža u podnožju'],
    panorama: ['Podno grijanje', 'Toplotna pumpa', 'A+ energetski razred', 'Terase', 'Krovne terase (PH)', 'Panoramski pogled']
  };

  function getFeatures(bid) {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.buildings[bid] && window.__ARILUX_JSON.buildings[bid].features) {
      return window.__ARILUX_JSON.buildings[bid].features;
    }
    return BUILDING_INC[bid] || [];
  }

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

  function getProx(bid) {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.buildings[bid] && window.__ARILUX_JSON.buildings[bid].proximity) {
      return window.__ARILUX_JSON.buildings[bid].proximity;
    }
    return BUILDING_PROX[bid] || [];
  }

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

  function getGAL(bid) {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.buildings[bid] && window.__ARILUX_JSON.buildings[bid].gallery) {
      return window.__ARILUX_JSON.buildings[bid].gallery;
    }
    return GAL_IMAGES[bid] || GAL_IMAGES.one;
  }

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
      '<text x="' + (w / 2) + '" y="' + (h - 4) + '" ' + dim + ' font-size="8" letter-spacing=".12em">TLOCRT, NIJE MJERITVEN</text>' +
      '</svg>';
  }

  function renderGallery(bid) {
    var imgs = getGAL(bid);
    var view = document.getElementById('galView');
    var dots = document.getElementById('galDots');
    galTotal = imgs.length;
    galIdx = 0;

    view.innerHTML = imgs.map(function (url, i) {
      return '<div class="gal__slide' + (i === 0 ? ' is-active' : '') + '">' +
        '<img src="' + url + '" alt="Stan, fotografija ' + (i + 1) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '">' +
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
    var floorLabel = apt.floor === 1 ? (tArr('floorLabel') || {})['1'] || 'Prizemlje' : ((tArr('floorLabel') || FLOOR_LABEL)[apt.floor] || apt.floor + '.') + ' ' + (t('floor') || 'sprat');
    var baths = apt.rooms <= 2 ? 1 : 2;
    var balcony = apt.rooms >= 2 ? (t('balconyYes') || 'Da') : (t('balconyNo') || 'Ne');
    var orientArr = tArr('orientation') || ['Jug', 'Sjever', 'Istok', 'Zapad'];
    var orient = orientArr[(apt.floor + apt.rooms) % 4];

    document.getElementById('modalId').textContent = apt.id + (apt.penthouse ? ' · ' + (t('penthouse') || 'Penthouse') : '');
    var badge = document.getElementById('modalBadge');
    badge.textContent = STATUS_LABEL[apt.status];
    badge.className = 'modal__badge modal__badge--' + apt.status;
    document.getElementById('modalBldg').textContent = apt.buildingName;

    var titleLine = ROOM_LABEL[apt.rooms];
    document.getElementById('modalTitle').innerHTML = titleLine + '<br><em>' + apt.area + ' m²</em>';
    document.getElementById('modalSub').textContent = floorLabel + ' · ' + totalFloors + ' ' + (t('totalFloors') || 'spratova ukupno') + (apt.penthouse ? ' · ' + (t('penthouseUnit') || 'Penthouse stan') : '');

    document.getElementById('modalFloorplan').innerHTML = generateFloorplan(apt.rooms);
    document.getElementById('modalFloorplan').classList.add('fp--hidden');
    document.getElementById('fpToggle').classList.remove('is-open');
    document.getElementById('fpToggle').querySelector('span').textContent = t('showPlan') || 'Prikaži tlocrt stana';

    renderGallery(apt.building);

    document.getElementById('modalSpecs').innerHTML =
      '<div class="modal__spec"><dt>' + (t('floorSpec') || 'Sprat') + '</dt><dd>' + apt.floor + '. <small>/ ' + totalFloors + '</small></dd></div>' +
      '<div class="modal__spec"><dt>' + (t('areaSpec') || 'Kvadratura') + '</dt><dd>' + apt.area + ' <small>m\u00B2</small></dd></div>' +
      '<div class="modal__spec"><dt>' + (t('roomsSpec') || 'Sobe') + '</dt><dd>' + apt.rooms + ' <small>' + (apt.rooms === 1 ? (LANG === 'de' ? 'Zimmer' : LANG === 'en' ? 'Room' : 'soba') : (LANG === 'de' ? 'Zimmer' : LANG === 'en' ? 'Rooms' : 'sobe')) + '</small></dd></div>' +
      '<div class="modal__spec"><dt>' + (t('bathroomsSpec') || 'Kupatila') + '</dt><dd>' + baths + ' <small>' + (baths === 1 ? (LANG === 'de' ? 'Badezimmer' : LANG === 'en' ? 'Bathroom' : 'kupatilo') : (LANG === 'de' ? 'Badezimmer' : LANG === 'en' ? 'Bathrooms' : 'kupatila')) + '</small></dd></div>' +
      '<div class="modal__spec"><dt>' + (t('balconySpec') || 'Balkon') + '</dt><dd>' + balcony + '</dd></div>' +
      '<div class="modal__spec"><dt>' + (t('orientationSpec') || 'Orijentacija') + '</dt><dd style="font-size:clamp(18px,2vw,24px)">' + orient + '</dd></div>';

    document.getElementById('modalPrice').innerHTML =
      '<span class="modal__priceval">' + fmt(apt.price) + ' KM</span>' +
      '<span class="modal__priceper">' + fmt(apt.m2) + ' KM/m²</span>';

    var inc = getFeatures(apt.building);
    document.getElementById('modalInc').innerHTML = inc.map(function (item) {
      return '<div class="modal__incitem">' + item + '</div>';
    }).join('');

    var prox = getProx(apt.building);
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
        '<a href="#kontakt" class="btn btn--orange" id="modalReserve">' + (t('btnReserve') || 'Rezerviši stan \u2192') + '</a>' +
        '<a href="tel:+38737772000" class="btn btn--blue">' + (t('btnCall') || 'Pozovi: +387 37 772 000') + '</a>';
      document.getElementById('modalReserve').addEventListener('click', function () {
        closeModal();
        var sel = document.getElementById('fBuilding');
        var bName = BUILDINGS[apt.building].name;
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === bName) { sel.selectedIndex = i; break; }
        }
        var msg = t('prefilledMsg');
        if (msg) {
          msg = msg.replace('{id}', apt.id).replace('{name}', bName).replace('{m2}', apt.area);
        } else {
          msg = 'Zanima me stan ' + apt.id + ' (' + bName + '), ' + apt.area + ' m². Molim vas za više informacija i termin razgovora.';
        }
        document.getElementById('fMsg').value = msg;
        document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
      });
    } else if (apt.status === 'reserved') {
      footer.innerHTML =
        '<a href="tel:+38737772000" class="btn btn--blue">' + (t('btnCall') || 'Pozovi: +387 37 772 000') + '</a>' +
        '<a href="mailto:info@arilux.ba" class="btn btn--ghost-blue">' + (t('sendInquiry') || 'Pošalji upit za listu čekanja') + '</a>';
    } else {
      footer.innerHTML =
        '<a href="tel:+38737772000" class="btn btn--ghost-blue">' + (t('callSimilar') || 'Pozovi za slične stanove') + '</a>';
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
    this.querySelector('span').textContent = open ? (t('showPlan') || 'Prikaži tlocrt stana') : (t('hidePlan') || 'Sakrij tlocrt');
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
    /* Batch observe to avoid long task on large DOM */
    var ioBatch = 12;
    var ioIdx = 0;
    function observeNext() {
      var end = Math.min(ioIdx + ioBatch, revealEls.length);
      for (var i = ioIdx; i < end; i++) { io.observe(revealEls[i]); }
      ioIdx = end;
      if (ioIdx < revealEls.length) {
        if (window.requestIdleCallback) window.requestIdleCallback(observeNext);
        else setTimeout(observeNext, 0);
      }
    }
    observeNext();
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
  var whatsappFab = document.getElementById('whatsappFab');
  var viberFab = document.getElementById('viberFab');

  function onScroll() {
    var sy = window.scrollY;
    header.classList.toggle('is-scrolled', sy > 10);
    /* FABs visibility */
    var show = sy > 200;
    if (show !== waShow) {
      waShow = show;
      if (whatsappFab) whatsappFab.classList.toggle('is-visible', show);
      if (viberFab) viberFab.classList.toggle('is-visible', show);
    }
  }
  var waShow = false;
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
  var lastSubmit = 0;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    /* Rate limit: max 1 submit per 5 seconds */
    var now = Date.now();
    if (now - lastSubmit < 5000) {
      note.hidden = false;
      note.className = 'formnote formnote--err';
      note.textContent = 'Molimo sačekajte prije slanja sljedećeg upita.';
      return;
    }
    lastSubmit = now;

    var name = document.getElementById('fName');
    var phone = document.getElementById('fPhone');
    var email = document.getElementById('fEmail');
    var building = document.getElementById('fBuilding');
    var msg = document.getElementById('fMsg');

    var ok = true;
    [name, phone].forEach(function (f) {
      var valid = f.value.trim().length >= (f === phone ? 6 : 3);
      f.classList.toggle('is-error', !valid);
      f.setAttribute('aria-invalid', String(!valid));
      var errEl = document.getElementById(f.id + 'Error');
      if (errEl) errEl.style.display = valid ? 'none' : 'block';
      if (!valid) ok = false;
    });

    note.hidden = false;
    if (!ok) {
      note.className = 'formnote formnote--err';
      note.textContent = 'Molimo upišite ime i broj telefona, bez toga ne možemo stupiti u kontakt.';
      return;
    }

    /* Sanitize inputs - strip HTML tags */
    function sanitize(str) { return str.replace(/[<>]/g, ''); }
    var sName = sanitize(name.value.trim());
    var sPhone = sanitize(phone.value.trim());
    var sEmail = sanitize(email.value.trim());
    var sMsg = sanitize(msg.value.trim());

      var subject = 'Upit za stan: ' + building.value + ' (' + sName + ')';
    var body =
      'Ime i prezime: ' + sName + '\n' +
      'Telefon: ' + sPhone + '\n' +
      'E-mail: ' + (sEmail || '-') + '\n' +
      'Zgrada: ' + building.value + '\n\n' +
      'Poruka:\n' + (sMsg || '-') + '\n\n' +
      '- Poslano sa stranice Arilux Nekretnine';

    window.location.href = 'mailto:info@arilux.ba?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    if (typeof gtag === 'function') {
      gtag('event', 'form_submit', { event_category: 'conversion', event_label: building.value });
    }

    note.className = 'formnote formnote--ok';
    note.textContent = 'Hvala, ' + sName.split(' ')[0] + '! Vaš e-mail klijent se upravo otvara sa pripremljenim upitom. Ako se ne otvori, nazovite nas na +387 37 772 000.';
    form.reset();
  });

  /* ── Premium features ──────────────────────────────────────── */

  /* ─────── Per-building Timeline ─────── */
  var TL_COLORS = { one:'#0041B1', park:'#2FB57E', centar:'#F26721', panorama:'#7B61FF' };
  var TL_DATA = {
    one: [
      { phase:'Faza 01', title:'Projektovanje i dozvole', desc:'Izrada projekata, ishođenje građevinske i upotrebne dozvole, tehnička dokumentacija.', pct:100, state:'done' },
      { phase:'Faza 02', title:'Temelji i konstrukcija', desc:'Iskop, armiranje, betoniranje temelja i izgradnja betonske konstrukcije objekta.', pct:100, state:'done' },
      { phase:'Faza 03', title:'Vanjski radovi', desc:'Krovna konstrukcija, fasadni sistem, vanjska stolarija, hidroizolacija i balkoni.', pct:65, state:'active' },
      { phase:'Faza 04', title:'Unutrašnji radovi', desc:'Instalacije, zidanje pregradnih zidova, gletanje, keramika, parket, sanitarije.', pct:0, state:'' },
      { phase:'Faza 05', title:'Završna obrada', desc:'Fasada, uređenje okoliša, parking, pristupne saobraćajnice, pejzažno uređenje.', pct:0, state:'' },
      { phase:'Faza 06', title:'Useljenje', desc:'Tehnički pregled, primopredaja ključeva, upis vlasništva i početak života u novom domu.', pct:0, state:'' }
    ],
    park: [
      { phase:'Faza 01', title:'Projektovanje i dozvole', desc:'Izrada projekata, ishođenje građevinske i upotrebne dozvole, tehnička dokumentacija.', pct:100, state:'done' },
      { phase:'Faza 02', title:'Temelji i konstrukcija', desc:'Iskop, armiranje, betoniranje temelja i izgradnja betonske konstrukcije objekta.', pct:70, state:'active' },
      { phase:'Faza 03', title:'Vanjski radovi', desc:'Krovna konstrukcija, fasadni sistem, vanjska stolarija, hidroizolacija i balkoni.', pct:0, state:'' },
      { phase:'Faza 04', title:'Unutrašnji radovi', desc:'Instalacije, zidanje pregradnih zidova, gletanje, keramika, parket, sanitarije.', pct:0, state:'' },
      { phase:'Faza 05', title:'Završna obrada', desc:'Fasada, uređenje okoliša, parking, pristupne saobraćajnice, pejzažno uređenje.', pct:0, state:'' },
      { phase:'Faza 06', title:'Useljenje', desc:'Tehnički pregled, primopredaja ključeva, upis vlasništva i početak života u novom domu.', pct:0, state:'' }
    ],
    centar: [
      { phase:'Faza 01', title:'Projektovanje i dozvole', desc:'Izrada projekata, ishođenje građevinske i upotrebne dozvole, tehnička dokumentacija.', pct:100, state:'done' },
      { phase:'Faza 02', title:'Temelji i konstrukcija', desc:'Iskop, armiranje, betoniranje temelja i izgradnja betonske konstrukcije objekta.', pct:50, state:'active' },
      { phase:'Faza 03', title:'Vanjski radovi', desc:'Krovna konstrukcija, fasadni sistem, vanjska stolarija, hidroizolacija i balkoni.', pct:0, state:'' },
      { phase:'Faza 04', title:'Unutrašnji radovi', desc:'Instalacije, zidanje pregradnih zidova, gletanje, keramika, parket, sanitarije.', pct:0, state:'' },
      { phase:'Faza 05', title:'Završna obrada', desc:'Fasada, uređenje okoliša, parking, pristupne saobraćajnice, pejzažno uređenje.', pct:0, state:'' },
      { phase:'Faza 06', title:'Useljenje', desc:'Tehnički pregled, primopredaja ključeva, upis vlasništva i početak života u novom domu.', pct:0, state:'' }
    ],
    panorama: [
      { phase:'Faza 01', title:'Projektovanje i dozvole', desc:'Izrada projekata, ishođenje građevinske i upotrebne dozvole, tehnička dokumentacija.', pct:100, state:'done' },
      { phase:'Faza 02', title:'Temelji i konstrukcija', desc:'Iskop, armiranje, betoniranje temelja i izgradnja betonske konstrukcije objekta.', pct:25, state:'active' },
      { phase:'Faza 03', title:'Vanjski radovi', desc:'Krovna konstrukcija, fasadni sistem, vanjska stolarija, hidroizolacija i balkoni.', pct:0, state:'' },
      { phase:'Faza 04', title:'Unutrašnji radovi', desc:'Instalacije, zidanje pregradnih zidova, gletanje, keramika, parket, sanitarije.', pct:0, state:'' },
      { phase:'Faza 05', title:'Završna obrada', desc:'Fasada, uređenje okoliša, parking, pristupne saobraćajnice, pejzažno uređenje.', pct:0, state:'' },
      { phase:'Faza 06', title:'Useljenje', desc:'Tehnički pregled, primopredaja ključeva, upis vlasništva i početak života u novom domu.', pct:0, state:'' }
    ]
  };

  function getTL(bid) {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.buildings[bid] && window.__ARILUX_JSON.buildings[bid].phases) {
      return window.__ARILUX_JSON.buildings[bid].phases;
    }
    return TL_DATA[bid] || [];
  }

  function animateTimelineFills() {
    var fills = document.querySelectorAll('#timeline .timeline__fill');
    fills.forEach(function (fill) {
      var target = fill.getAttribute('data-w');
      fill.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = target;
        });
      });
    });
  }

  function renderTimeline(bldg) {
    var phases = getTL(bldg);
    var color = TL_COLORS[bldg];
    var el = document.getElementById('timeline');
    if (!el || !phases) return;
    var totalPct = 0;
    var html = '<div class="timeline__line" aria-hidden="true"><div class="timeline__progress" id="tlProgress"></div></div>';
    phases.forEach(function (p, i) {
      var cls = 'timeline__item';
      if (p.state === 'done') cls += ' timeline__item--done';
      else if (p.state === 'active') cls += ' timeline__item--active';
      totalPct += p.pct;
      html += '<div class="' + cls + '" data-phase="' + (i+1) + '">';
      html += '<div class="timeline__marker"></div>';
      html += '<div class="timeline__card">';
      html += '<span class="timeline__phase">' + p.phase + '</span>';
      html += '<h3 class="timeline__title">' + p.title + '</h3>';
      html += '<p class="timeline__desc">' + p.desc + '</p>';
      html += '<div class="timeline__bar"><div class="timeline__fill" data-w="' + p.pct + '%" style="width:' + p.pct + '%;' + (p.pct > 0 ? 'background:' + color : '') + '"></div></div>';
      html += '<span class="timeline__pct">' + p.pct + '%</span>';
      html += '</div></div>';
    });
    el.innerHTML = html;
    /* animate progress line */
    var avgPct = Math.round(totalPct / phases.length);
    var prog = document.getElementById('tlProgress');
    if (prog) {
      prog.style.setProperty('--progress', avgPct + '%');
      prog.classList.add('is-animating');
    }
    animateTimelineFills();
  }

  document.querySelectorAll('.tl__tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tl__tab').forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      renderTimeline(tab.dataset.bldg);
    });
  });

  /* Initial render for Amor (defer non-critical work) */
  if (window.requestIdleCallback) {
    window.requestIdleCallback(function () { renderTimeline('one'); });
  } else {
    setTimeout(function () { renderTimeline('one'); }, 0);
  }

  /* Location map interaction */
  /* Walking distances: calculated from GPS coords to real POIs in Velika Kladuša
     Prva osnovna škola: Ibrahima Mržljaka 27 ~45.1849,15.8068
     Dom zdravlja: Sulejmana Topića 1 ~45.1828,15.8058
     Trg mladih (centar): ~45.1842,15.8052
     Trgovine (centar): ~45.1842,15.8048
     Gradski park: ~45.1852,15.8028 */
  var WALK_SUB = LANG === 'de' ? 'Min. zu Fuß' : LANG === 'en' ? 'min walk' : 'min pješke';

  var LOC_DATA = {
    one:      { school: '200 m', schoolSub: '3 ' + WALK_SUB, health: '350 m', healthSub: '5 ' + WALK_SUB, center: '50 m', centerSub: '1 ' + WALK_SUB, shop: '100 m', shopSub: '2 ' + WALK_SUB, park: '400 m', parkSub: '5 ' + WALK_SUB },
    park:     { school: '500 m', schoolSub: '6 ' + WALK_SUB, health: '600 m', healthSub: '8 ' + WALK_SUB, center: '450 m', centerSub: '6 ' + WALK_SUB, shop: '400 m', shopSub: '5 ' + WALK_SUB, park: '150 m', parkSub: '2 ' + WALK_SUB },
    centar:   { school: '150 m', schoolSub: '2 ' + WALK_SUB, health: '400 m', healthSub: '5 ' + WALK_SUB, center: '100 m', centerSub: '2 ' + WALK_SUB, shop: '150 m', shopSub: '2 ' + WALK_SUB, park: '500 m', parkSub: '6 ' + WALK_SUB },
    panorama: { school: '1.2 km', schoolSub: '15 ' + WALK_SUB, health: '1.1 km', healthSub: '14 ' + WALK_SUB, center: '1.0 km', centerSub: '13 ' + WALK_SUB, shop: '900 m', shopSub: '11 ' + WALK_SUB, park: '800 m', parkSub: '10 ' + WALK_SUB }
  };

  var LOC_META = LANG === 'de' ? {
    one:      { name: 'Arilux Amor', addr: 'Zentrum \u00B7 Trg mladih', color: '#0041B1' },
    park:     { name: 'Arilux Park', addr: 'Am Stadtpark', color: '#2FB57E' },
    centar:   { name: 'Arilux Centar', addr: 'Gesch\u00E4fts- und Wohnplatz', color: '#F26721' },
    panorama: { name: 'Arilux Panorama', addr: 'Grabik-H\u00FCgel', color: '#7B61FF' }
  } : LANG === 'en' ? {
    one:      { name: 'Arilux Amor', addr: 'City Center \u00B7 Trg mladih', color: '#0041B1' },
    park:     { name: 'Arilux Park', addr: 'Next to City Park', color: '#2FB57E' },
    centar:   { name: 'Arilux Centar', addr: 'Business & Living District', color: '#F26721' },
    panorama: { name: 'Arilux Panorama', addr: 'Grabik Hill', color: '#7B61FF' }
  } : {
    one:      { name: 'Arilux Amor', addr: 'Centar \u00B7 Trg mladih', color: '#0041B1' },
    park:     { name: 'Arilux Park', addr: 'Uz gradski park', color: '#2FB57E' },
    centar:   { name: 'Arilux Centar', addr: 'Poslovno-stambeni trg', color: '#F26721' },
    panorama: { name: 'Arilux Panorama', addr: 'Brdo Grabik', color: '#7B61FF' }
  };

  function getLocData(bid) {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.buildings[bid] && window.__ARILUX_JSON.buildings[bid].distances) {
      var d = window.__ARILUX_JSON.buildings[bid].distances;
      var parsed = {};
      Object.keys(d).forEach(function (k) {
        var parts = (d[k] || '').split(' · ');
        parsed[k] = parts[0] || d[k];
        parsed[k + 'Sub'] = parts[1] || '';
      });
      return parsed;
    }
    return LOC_DATA[bid] || LOC_DATA.one;
  }

  function setLocMapBuilding(bid) {
    var data = getLocData(bid);
    var meta = LOC_META[bid] || LOC_META.one;
    document.getElementById('locSchool').textContent = data.school;
    document.getElementById('locHealth').textContent = data.health;
    document.getElementById('locCenter').textContent = data.center;
    document.getElementById('locShop').textContent = data.shop;
    document.getElementById('locPark').textContent = data.park;

    var subs = { locSchoolSub: data.schoolSub, locHealthSub: data.healthSub, locCenterSub: data.centerSub, locShopSub: data.shopSub, locParkSub: data.parkSub };
    Object.keys(subs).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = subs[id];
    });

    var nameEl = document.getElementById('locActiveName');
    var addrEl = document.getElementById('locActiveAddr');
    var dotEl = document.getElementById('locActiveDot');
    if (nameEl) nameEl.textContent = meta.name;
    if (addrEl) addrEl.textContent = meta.addr;
    if (dotEl) dotEl.style.background = meta.color;

    document.querySelectorAll('.locmap__pill').forEach(function (c) {
      c.classList.toggle('is-active', c.dataset.building === bid);
    });

    panToBuilding(bid);
  }

  document.querySelectorAll('.locmap__pill').forEach(function (card) {
    card.addEventListener('click', function () { setLocMapBuilding(card.dataset.building); });
  });

  /* 3D Tour nav buttons */
  var DEFAULT_TOUR_NAMES = tArr('tourNames') || ['Dnevni boravak', 'Spavaća soba', 'Kuhinja', 'Kupatilo', 'Balkon'];

  function getTourNames() {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.tour3d && window.__ARILUX_JSON.tour3d.rooms) {
      return window.__ARILUX_JSON.tour3d.rooms.map(function (r) { return r.name; });
    }
    return DEFAULT_TOUR_NAMES;
  }

  function getTourImages() {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.tour3d && window.__ARILUX_JSON.tour3d.images) {
      return window.__ARILUX_JSON.tour3d.images;
    }
    return {};
  }

  function getTourGallery() {
    if (window.__ARILUX_JSON && window.__ARILUX_JSON.tour3d && window.__ARILUX_JSON.tour3d.gallery) {
      return window.__ARILUX_JSON.tour3d.gallery;
    }
    return {};
  }

  var tourNames = getTourNames();
  var tourImages = getTourImages();
  var tourGallery = getTourGallery();
  var defaultTourSrc = '';
  var tourImg = document.querySelector('.tour3d__img');
  var currentGalleryIdx = 0;
  var currentBuilding = 'one';

  if (tourImg) {
    defaultTourSrc = tourImg.src;
    var buildingKeys = ['one', 'park', 'centar', 'panorama'];

    function showBuildingGallery(bk) {
      currentBuilding = bk;
      currentGalleryIdx = 0;
      var imgs = tourGallery[bk] || tourImages[bk] ? [tourImages[bk]] : [];
      if (tourGallery[bk] && tourGallery[bk].length > 0) imgs = tourGallery[bk];
      if (imgs.length === 0) return;
      tourImg.style.opacity = '0';
      setTimeout(function () {
        tourImg.src = imgs[0];
        tourImg.style.opacity = '1';
      }, 200);
    }

    document.querySelectorAll('.tour3d__bldbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tour3d__bldbtn').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        showBuildingGallery(btn.dataset.building);
      });
    });

    /* viewer click cycles through gallery images */
    var tourViewer = document.querySelector('.tour3d__viewer');
    if (tourViewer) {
      tourViewer.addEventListener('click', function (e) {
        if (e.target.closest('.tour3d__play')) return;
        var imgs = tourGallery[currentBuilding] || [];
        if (imgs.length <= 1) return;
        currentGalleryIdx = (currentGalleryIdx + 1) % imgs.length;
        tourImg.style.opacity = '0';
        setTimeout(function () {
          tourImg.src = imgs[currentGalleryIdx];
          tourImg.style.opacity = '1';
        }, 200);
      });
    }

    /* set initial active building */
    if (buildingKeys.length > 0) {
      var firstBtn = document.querySelector('.tour3d__bldbtn');
      if (firstBtn) { firstBtn.classList.add('is-active'); currentBuilding = buildingKeys[0]; }
    }
  }

  function setTourRoom(idx) {
    document.querySelectorAll('.tour3d__navbtn').forEach(function (b, i) {
      b.classList.toggle('is-active', i === idx);
    });
    document.querySelectorAll('.tour3d__dropbtn').forEach(function (b, i) {
      b.classList.toggle('is-active', i === idx);
    });
    var mobText = document.getElementById('tourMobiText');
    if (mobText) mobText.textContent = tourNames[idx];
  }

  document.querySelectorAll('.tour3d__navbtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTourRoom(Number(btn.dataset.tour) - 1);
    });
  });

  document.querySelectorAll('.tour3d__dropbtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTourRoom(Number(btn.dataset.tour) - 1);
      document.getElementById('tourDropdown').classList.remove('is-open');
    });
  });

  var tourMobileBar = document.getElementById('tourMobileBar');
  var tourDropdown = document.getElementById('tourDropdown');
  if (tourMobileBar && tourDropdown) {
    tourMobileBar.addEventListener('click', function (e) {
      e.stopPropagation();
      tourDropdown.classList.toggle('is-open');
    });
    document.addEventListener('click', function (e) {
      if (!tourDropdown.contains(e.target) && e.target !== tourMobileBar) {
        tourDropdown.classList.remove('is-open');
      }
    });
  }

  /* 3D Tour feature cards → lightbox */
  var SVG_ICONS = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" width="56" height="56"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" width="56" height="56"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" width="56" height="56"><path d="M21 3H3v7h18V3zM21 14H3v7h18v-7z"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'
  ];

  function getTourFeatureContent() {
    var defaultContent = [
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#041742;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:40px;">' + SVG_ICONS[0] + '<p style="font-size:20px;font-weight:700;margin-top:24px;">360° Pogled</p><p style="color:rgba(255,255,255,.6);margin-top:8px;max-width:360px;">Okrenite se oko osi i pogledajte svaki kutak stana</p></div>',
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#041742;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:40px;">' + SVG_ICONS[1] + '<p style="font-size:20px;font-weight:700;margin-top:24px;">3D Model</p><p style="color:rgba(255,255,255,.6);margin-top:8px;max-width:360px;">Izgradite trodimenzionalni model prostora</p></div>',
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#041742;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:40px;">' + SVG_ICONS[2] + '<p style="font-size:20px;font-weight:700;margin-top:24px;">Mjerne dimenzije</p><p style="color:rgba(255,255,255,.6);margin-top:8px;max-width:360px;">Svaka prostorija sa tačnim dimenzijama u metrima</p></div>'
    ];

    if (window.__ARILUX_JSON && window.__ARILUX_JSON.tour3d && window.__ARILUX_JSON.tour3d.features) {
      var feats = window.__ARILUX_JSON.tour3d.features;
      var iconMap = { '360': 0, '3dmodel': 1, 'dimensions': 2 };
      return feats.map(function (f, i) {
        var iconIdx = iconMap[f.id] !== undefined ? iconMap[f.id] : i;
        var icon = SVG_ICONS[iconIdx % SVG_ICONS.length];
        return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:#041742;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:40px;">' + icon + '<p style="font-size:20px;font-weight:700;margin-top:24px;">' + f.title + '</p><p style="color:rgba(255,255,255,.6);margin-top:8px;max-width:360px;">' + f.desc + '</p></div>';
      });
    }
    return defaultContent;
  }

  var tourFeatures = document.querySelectorAll('.tour3d__feature');
  var tourFeatureContent = getTourFeatureContent();

  tourFeatures.forEach(function (card, i) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', function () { openLightbox(tourFeatureContent[i]); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(tourFeatureContent[i]); } });
  });

  /* Parallax on scroll for hero and archvision */
  var parallaxEls = document.querySelectorAll('.hero__title, .archvision__title');
  if (parallaxEls.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          parallaxEls.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              var offset = (rect.top / window.innerHeight) * 30;
              el.style.transform = 'translateY(' + offset + 'px)';
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Lightbox (3D tour + Video) ─────────────────────────────── */

  var lightbox = document.getElementById('lightbox');
  var lightboxBackdrop = document.getElementById('lightboxBackdrop');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxContent = document.getElementById('lightboxContent');

  function openLightbox(html) {
    lightboxContent.innerHTML = html;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () { lightboxContent.innerHTML = ''; }, 400);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  /* 3D Tour play button */
  var tourPlay = document.querySelector('.tour3d__play');
  if (tourPlay) {
    tourPlay.addEventListener('click', function () {
      openLightbox(
        '<img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=680&fit=crop&crop=center" alt="3D vizualizacija stana Arilux">'
      );
    });
  }

  /* Architecture video play button */
  var archPlay = document.querySelector('.archvision__playbtn');
  if (archPlay) {
    archPlay.addEventListener('click', function () {
      openLightbox(
        '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;flex-direction:column;background:#041742;">' +
          '<svg viewBox="0 0 24 24" fill="rgba(255,255,255,.3)" width="64" height="64"><polygon points="5,3 19,12 5,21"/></svg>' +
          '<p style="color:rgba(255,255,255,.6);font-family:Inter,sans-serif;font-size:16px;margin-top:24px;text-align:center;padding:0 20px;">Video o arhitekturi biti će dostupan uskoro.</p>' +
        '</div>'
      );
    });
  }

  /* ── Ostalo ─────────────────────────────────────────────────── */

  var yearEl = document.getElementById('year');
  if (yearEl) {
    var setYear = function () { yearEl.textContent = new Date().getFullYear(); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(setYear);
    } else {
      setTimeout(setYear, 0);
    }
  }

  /* ── Catalog Request Modal ────────────────────────────────── */
  var catalogRequestBtn = document.getElementById('catalogRequestBtn');
  var catalogModal = document.getElementById('catalogModal');
  var catalogModalBackdrop = document.getElementById('catalogModalBackdrop');
  var catalogModalClose = document.getElementById('catalogModalClose');
  var catalogForm = document.getElementById('catalogForm');
  var catalogSubmitBtn = document.getElementById('catalogSubmitBtn');
  var catalogSuccess = document.getElementById('catalogSuccess');
  var catalogSuccessClose = document.getElementById('catalogSuccessClose');

  function openCatalogModal() {
    if (!catalogModal) return;
    catalogModal.classList.add('is-open');
    catalogModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCatalogModal() {
    if (!catalogModal) return;
    catalogModal.classList.remove('is-open');
    catalogModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (catalogForm) catalogForm.reset();
      catalogForm.style.display = '';
      if (catalogSuccess) { catalogSuccess.style.display = 'none'; catalogSuccess.setAttribute('aria-hidden', 'true'); }
      var errs = catalogForm.querySelectorAll('.is-error');
      errs.forEach(function (e) { e.classList.remove('is-error'); });
    }, 350);
  }
  if (catalogRequestBtn) catalogRequestBtn.addEventListener('click', openCatalogModal);
  if (catalogModalBackdrop) catalogModalBackdrop.addEventListener('click', closeCatalogModal);
  if (catalogModalClose) catalogModalClose.addEventListener('click', closeCatalogModal);
  if (catalogSuccessClose) catalogSuccessClose.addEventListener('click', closeCatalogModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && catalogModal && catalogModal.classList.contains('is-open')) closeCatalogModal();
  });

  if (catalogForm) {
    catalogForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cfName');
      var email = document.getElementById('cfEmail');
      var country = document.getElementById('cfCountry');
      var buildings = catalogForm.querySelectorAll('input[name="zgrade"]:checked');
      var valid = true;

      [name, email, country].forEach(function (f) { f.classList.remove('is-error'); });
      if (!name.value.trim()) { name.classList.add('is-error'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('is-error'); valid = false; }
      if (!country.value.trim()) { country.classList.add('is-error'); valid = false; }
      if (buildings.length === 0) { valid = false; }

      if (!valid) {
        var firstErr = catalogForm.querySelector('.is-error');
        if (firstErr) firstErr.focus();
        return;
      }

      var zgradeText = Array.from(buildings).map(function (b) { return b.value; }).join(', ');
      var budgetVal = document.getElementById('cfBudget').value.trim();
      var phoneVal = document.getElementById('cfPhone').value.trim();
      var addrVal = document.getElementById('cfAddress').value.trim();

      var msg = 'ZAHTJEV ZA KATALOG\n\n';
      msg += 'Ime i prezime: ' + name.value.trim() + '\n';
      msg += 'Email: ' + email.value.trim() + '\n';
      if (phoneVal) msg += 'Telefon: ' + phoneVal + '\n';
      if (addrVal) msg += 'Adresa: ' + addrVal + '\n';
      msg += 'Država: ' + country.value.trim() + '\n';
      if (budgetVal) msg += 'Budžet: ' + budgetVal + ' KM\n';
      msg += 'Zgrade: ' + zgradeText + '\n';

      var hiddenField = catalogForm.querySelector('input[name="poruka"]');
      if (!hiddenField) {
        hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'poruka';
        catalogForm.appendChild(hiddenField);
      }
      hiddenField.value = msg;

      catalogSubmitBtn.classList.add('is-loading');
      catalogSubmitBtn.disabled = true;

      var xhr = new XMLHttpRequest();
      xhr.open('POST', catalogForm.action, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          catalogSubmitBtn.classList.remove('is-loading');
          catalogSubmitBtn.disabled = false;
          if (xhr.status === 200 || xhr.status === 301 || xhr.status === 302) {
            catalogForm.style.display = 'none';
            catalogSuccess.style.display = 'block';
            catalogSuccess.setAttribute('aria-hidden', 'false');
          } else {
            alert('Došlo je do greške. Molimo pokušajte ponovo ili nas kontaktirajte telefonom.');
          }
        }
      };
      xhr.send(new FormData(catalogForm));
    });
  }

  /* ── GA4 conversion tracking (delegated, href-pattern based) ────────
     Mjeri: quiz_start, whatsapp/viber/phone/email klikovi.
     Aktivno tek kad se u HTML unese pravi Measurement ID. */
  document.addEventListener('click', function (e) {
    if (typeof gtag !== 'function') return;
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('kviz.html') !== -1) {
      gtag('event', 'quiz_start', { event_category: 'conversion', event_label: a.className || 'link' });
    } else if (href.indexOf('wa.me') !== -1) {
      gtag('event', 'whatsapp_click', { event_category: 'contact', event_label: a.className || 'link' });
    } else if (href.indexOf('viber://') !== -1) {
      gtag('event', 'viber_click', { event_category: 'contact' });
    } else if (href.indexOf('tel:') === 0) {
      gtag('event', 'phone_click', { event_category: 'contact', event_label: href.replace('tel:', '') });
    } else if (href.indexOf('mailto:') === 0) {
      gtag('event', 'email_click', { event_category: 'contact' });
    }
  });

  /* ── Quiz concierge card ──────────────────────────────────────
     Appears only after genuine engagement: 45% scroll depth AND
     at least 8 seconds on page. Dismissal remembered per session.
     ──────────────────────────────────────────────────────────── */
  var quizFab = document.getElementById('quizFab');
  if (quizFab && !sessionStorage.getItem('quizFabDismissed')) {
    var quizShown = false;
    var pageStart = Date.now();

    function maybeShowQuiz() {
      if (quizShown) return;
      var doc = document.documentElement;
      var depth = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      var elapsed = (Date.now() - pageStart) / 1000;
      if (depth >= 0.45 && elapsed >= 8) {
        quizShown = true;
        quizFab.classList.add('is-visible');
        quizFab.setAttribute('aria-hidden', 'false');
        window.removeEventListener('scroll', maybeShowQuiz);
      }
    }
    window.addEventListener('scroll', maybeShowQuiz, { passive: true });

    function dismissQuiz() {
      quizFab.classList.remove('is-visible');
      quizFab.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('quizFabDismissed', '1');
      window.removeEventListener('scroll', maybeShowQuiz);
    }
    document.getElementById('quizFabClose').addEventListener('click', dismissQuiz);
    quizFab.querySelector('.quizfab__cta').addEventListener('click', function () {
      sessionStorage.setItem('quizFabDismissed', '1');
    });
  }

})();
