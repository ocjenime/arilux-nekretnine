document.addEventListener('DOMContentLoaded', function () {
  var TOTAL = 9;
  var current = 1;
  var answers = {};

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return Array.from((p || document).querySelectorAll(s)); };

  var preloader = $('#preloader');
  var stepCurrent = $('#step-current');
  var progressFill = $('#progress-fill');
  var btnBack = $('#btn-back');
  var btnNext = $('#btn-next');
  var btnSubmit = $('#btn-submit');
  var nav = $('#qz-nav');
  var answersField = $('#quiz-answers-field');

  // Hide preloader
  setTimeout(function () { preloader.classList.add('hidden'); }, 800);

  function getStep() { return $('.qz-step[data-step="' + current + '"]'); }

  function updateUI() {
    stepCurrent.textContent = current;
    progressFill.style.width = (current / TOTAL * 100) + '%';
    btnBack.style.visibility = current === 1 ? 'hidden' : 'visible';

    if (current === TOTAL) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'flex';
    } else {
      btnNext.style.display = 'flex';
      btnSubmit.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collectAnswers() {
    var a = {};

    var q1 = $('input[name="q1_building"]:checked');
    a.building = q1 ? q1.value : '';

    var q2 = $$('input[name="q2_priority"]:checked');
    a.priorities = q2.map(function (c) { return c.value; });

    var q3 = $('input[name="q3_budget"]:checked');
    a.budget = q3 ? q3.value : '';

    var q4 = $('input[name="q4_rooms"]:checked');
    a.rooms = q4 ? q4.value : '';

    var q5 = $('input[name="q5_experience"]:checked');
    a.experience = q5 ? q5.value : '';

    var q6 = $('input[name="q6_timeline"]:checked');
    a.timeline = q6 ? q6.value : '';

    var q7 = $('input[name="q7_purpose"]:checked');
    a.purpose = q7 ? q7.value : '';

    var q8c = $('input[name="q8_contact"]:checked');
    a.contact = q8c ? q8c.value : '';
    var q8t = $('input[name="q8_time"]:checked');
    a.time = q8t ? q8t.value : '';

    return a;
  }

  function hasAnswer(step) {
    if (step === 2) {
      return $$('input[name="q2_priority"]:checked').length > 0;
    }
    if (step === 8) {
      // Must pick contact method; if phone/whatsapp, also pick time
      var contact = $('input[name="q8_contact"]:checked');
      if (!contact) return false;
      if (contact.value !== 'email') {
        return !!$('input[name="q8_time"]:checked');
      }
      return true;
    }
    var names = {
      1: 'q1_building',
      3: 'q3_budget',
      4: 'q4_rooms',
      5: 'q5_experience',
      6: 'q6_timeline',
      7: 'q7_purpose'
    };
    return !!$('input[name="' + names[step] + '"]:checked');
  }

  function goTo(step) {
    $$('.qz-step').forEach(function (s) { s.classList.remove('active'); });
    var target = step === 'results' ? 'results' : step;
    var el = $('.qz-step[data-step="' + target + '"]');
    if (el) {
      el.classList.add('active');
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    }
    if (typeof step === 'number') current = step;
    updateUI();
  }

  function buildResults(a) {
    var buildingNames = {
      amor: 'Arilux Amor · Centar, P+6, 4.500 KM/m²',
      park: 'Arilux Park · Uz park, P+5, 3.500 KM/m²',
      centar: 'Arilux Centar · Poslovno-stambeni, P+8, 4.000 KM/m²',
      panorama: 'Arilux Panorama · Grabik, P+4, 4.500 KM/m²',
      ne_znam: 'Sve zgrade, pregledat ćemo sve opcije zajedno'
    };

    var priorityLabels = {
      blizina_centra: 'Blizina centra',
      park: 'Blizina parka',
      skola: 'Blizina škole',
      pogled: 'Lijep pogled',
      investicija: 'Dobra investicija',
      tišina: 'Mir i tišina'
    };

    var contactLabels = { email: 'Email', telefon: 'Telefon', whatsapp: 'WhatsApp' };
    var timeLabels = { jutro: 'Jutro (8–12)', podne: 'Podne (12–17)', vecer: 'Večer (17–20)', bilo_kad: 'Bilo kad' };

    var items = [];
    items.push('<h3>Vaša preporuka</h3><ul>');

    if (a.building) {
      items.push('<li><strong>Zgrada:</strong> ' + (buildingNames[a.building] || a.building) + '</li>');
    }
    if (a.priorities.length) {
      var pLabels = a.priorities.map(function (p) { return priorityLabels[p] || p; });
      items.push('<li><strong>Prioriteti:</strong> ' + pLabels.join(', ') + '</li>');
    }
    if (a.budget) {
      items.push('<li><strong>Budžet:</strong> ' + a.budget.replace(/_/g, ' ') + '</li>');
    }
    if (a.rooms) {
      items.push('<li><strong>Sobe:</strong> ' + a.rooms + '</li>');
    }
    if (a.purpose) {
      var purposeLabels = { stanovanje: 'Stanovanje', investicija: 'Investicija', oboje: 'Oboje' };
      items.push('<li><strong>Svrha:</strong> ' + (purposeLabels[a.purpose] || a.purpose) + '</li>');
    }
    if (a.timeline) {
      var tLabels = { odmah: 'Odmah', godinu: 'U toku godine', '2_3_godine': '2–3 godine', samo_istrazujem: 'Samo istražujem' };
      items.push('<li><strong>Vremenski okvir:</strong> ' + (tLabels[a.timeline] || a.timeline) + '</li>');
    }
    if (a.contact) {
      items.push('<li><strong>Kontakt:</strong> ' + (contactLabels[a.contact] || a.contact) + '</li>');
    }
    if (a.time) {
      items.push('<li><strong>Vrijeme:</strong> ' + (timeLabels[a.time] || a.time) + '</li>');
    }
    items.push('</ul>');

    $('#results-match').innerHTML = items.join('');

    /* WhatsApp direktan kanal: sažetak kviza stiže na prodajni broj */
    var form = $('#quiz-form');
    var name = form.querySelector('input[name="ime"]').value.trim();
    var email = form.querySelector('input[name="email"]').value.trim();
    var phoneCode = form.querySelector('select[name="phone_code"]');
    var phone = form.querySelector('input[name="telefon"]').value.trim();
    var fullPhone = phone ? ((phoneCode ? phoneCode.value : '') + ' ' + phone) : '';

    var lines = ['Zdravo! Riješio/la sam Arilux kviz.', ''];
    if (a.building) lines.push('Zgrada: ' + (buildingNames[a.building] || a.building));
    if (a.priorities.length) lines.push('Prioriteti: ' + a.priorities.map(function (p) { return priorityLabels[p] || p; }).join(', '));
    if (a.budget) lines.push('Budžet: ' + a.budget.replace(/_/g, ' '));
    if (a.rooms) lines.push('Sobe: ' + a.rooms);
    if (a.purpose) {
      var pl = { stanovanje: 'Stanovanje', investicija: 'Investicija', oboje: 'Oboje' };
      lines.push('Svrha: ' + (pl[a.purpose] || a.purpose));
    }
    if (a.timeline) {
      var tl = { odmah: 'Odmah', godinu: 'U toku godine', '2_3_godine': '2-3 godine', samo_istrazujem: 'Samo istražujem' };
      lines.push('Vremenski okvir: ' + (tl[a.timeline] || a.timeline));
    }
    if (a.contact) lines.push('Željeni kontakt: ' + (contactLabels[a.contact] || a.contact));
    if (a.time) lines.push('Vrijeme za kontakt: ' + (timeLabels[a.time] || a.time));
    lines.push('');
    if (name) lines.push('Ime: ' + name);
    if (email) lines.push('Email: ' + email);
    if (fullPhone) lines.push('Telefon: ' + fullPhone);

    var waBtn = $('#resultsWhatsApp');
    if (waBtn) {
      waBtn.href = 'https://wa.me/38761088002?text=' + encodeURIComponent(lines.join('\n'));
    }
  }

  // Contact preference - show/hide time options
  $$('input[name="q8_contact"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var timeWrap = $('#time-pref');
      if (radio.value === 'email') {
        timeWrap.style.display = 'none';
        // Uncheck time if switching to email
        $$('input[name="q8_time"]').forEach(function (r) { r.checked = false; });
      } else {
        timeWrap.style.display = 'block';
      }
    });
  });

  // Navigation
  btnNext.addEventListener('click', function () {
    if (!hasAnswer(current)) return;
    goTo(current + 1);
  });

  btnBack.addEventListener('click', function () {
    if (current > 1) goTo(current - 1);
  });

  // Submit
  btnSubmit.addEventListener('click', function () {
    var form = $('#quiz-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    answers = collectAnswers();
    answersField.value = JSON.stringify(answers);

    var data = new FormData(form);
    data.append('quiz_odgovori', JSON.stringify(answers));

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Šalje se...';

    fetch(form.action || 'https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function () {
      buildResults(answers);
      goTo('results');
      nav.style.display = 'none';
    }).catch(function () {
      buildResults(answers);
      goTo('results');
      nav.style.display = 'none';
    });
  });

  // No auto-advance - user must click "Dalje" on every step

  // Init
  updateUI();
});
