/* Страница «Сколько клиентов теряет автосервис»: счётчик дня, карточки ниш, калькулятор.
   Перенос логики прототипа deford-poteri/src/avtoservis.html; расчёты – POTERI (calc.js), город – CITY (city.js). */
(function () {
  var P = window.POTERI, C = window.CITY, fmt = P.fmt, N = P.D.niches;
  var checks = {}, off = {}, $ = function (id) { return document.getElementById(id); };
  var wideMq = window.matchMedia('(min-width: 761px)');
  var nicheSel = $('niche'), opts = N.map(function (n) { return '<option value="' + n.id + '">' + n.name + '</option>'; }).join('');
  nicheSel.innerHTML = opts; $('f-niche').innerHTML = opts;

  function drawTop() {
    var r = C.current(), hot = P.cityTotal(r, 'none').hot, dp = P.dayPart();
    document.querySelectorAll('.js-city-in').forEach(function (e) { e.textContent = P.CITY_IN[r]; });
    document.querySelectorAll('.js-src').forEach(function (e) { e.textContent = 'Источник: ' + P.src(r); });
    document.querySelectorAll('.js-cur').forEach(function (e) { e.textContent = P.sign(r); });
    document.querySelector('.js-month').textContent = fmt(hot);
    // Счётчик: горячие поиски за прошедшую часть дня, которые ушли на сайты в топе.
    document.querySelectorAll('.js-today').forEach(function (e) { e.textContent = fmt(hot * P.MODEL.servis.sites / 30 * dp.part); });
    document.querySelectorAll('.js-today-l').forEach(function (e) { e.textContent = dp.label; });
  }
  function drawNiches() {
    var r = C.current(), wide = wideMq.matches;
    var cards = N.map(function (n) { var rows = P.nicheRows(n, r, 'none'); return { n: n, rows: rows.slice(0, 10), t: P.sum(rows) }; })
      .sort(function (a, b) { return b.t.money - a.t.money; });
    $('niches').innerHTML = cards.map(function (c, i) {
      // на телефоне ниши свёрнуты до названия и суммы (открыта первая), на широком экране раскрыты
      return '<details class="p-niche"' + (wide || i === 0 ? ' open' : '') + '><summary><h3>' + c.n.name + '</h3>' +
        '<div class="p-lose"><b>' + P.money(c.t.money, r) + '</b><span>в месяц проходит мимо без сайта в поиске</span></div></summary>' +
        '<p>' + fmt(c.t.hot) + ' горячих поисков в месяц · клиентов: ≈ ' + P.num(c.t.clients) + '</p>' +
        (c.n.note ? '<p class="p-niche-note">' + c.n.note + '</p>' : '') +
        '<table class="p-mini"><thead><tr><th>Услуга</th><th class="n">Ищут</th><th class="n">Мимо вас</th></tr></thead><tbody>' +
        c.rows.map(function (x) { return '<tr><td>' + x.name + '</td><td class="n">' + fmt(x.hot) + '</td><td class="n">' + P.money(x.money, r) + '</td></tr>'; }).join('') +
        '</tbody></table><div class="w-actions">' +
        (c.rows.length > 3 ? '<button class="w-btn ghost js-all" type="button" data-n="' + c.rows.length + '">Смотреть все ' + c.rows.length + '</button>' : '') +
        '<a class="w-btn" href="#kalkulyator" data-pick="' + c.n.id + '">Посчитать мою</a></div></details>';
    }).join('');
  }
  var MARK = { '': '', est: '<b class="js-mark" title="оценка: цен в прайсах города не нашли">*</b>', weak: '<b class="js-mark" title="цена «от», только работа или один прайс – нижняя граница">°</b>' };
  function niche() { return N.filter(function (n) { return n.id === nicheSel.value; })[0]; }
  function drawChips() {
    var r = C.current(), rub = P.sign(r) === '₽', notes = niche().services.map(function (s) { return P.checkNote(s, r); });
    // чеки: средние по прайсам города, если они собраны; иначе честно «оценка по рынку»
    $('chk-src').textContent = P.hasPrices(r) ? 'цена – медиана прайсов сервисов города, впишите свой средний чек' : 'чек – оценка по рынку, впишите свой';
    $('est').hidden = notes.indexOf('est') < 0; $('weak').hidden = notes.indexOf('weak') < 0;
    $('chips').innerHTML = niche().services.map(function (s) {
      var v = checks[s[0]] != null ? checks[s[0]] : P.baseCheck(s, r);
      return '<label><input type="checkbox"' + (off[s[0]] ? '' : ' checked') + ' data-q="' + s[0] + '"><span>' + s[1] + '</span><input class="p-chk" type="number" min="0" step="' + (rub ? 500 : 10) + '" value="' + v + '" data-c="' + s[0] + '" aria-label="Средний чек: ' + s[1] + '"><em>' + P.sign(r) + MARK[checks[s[0]] != null ? '' : P.checkNote(s, r)] + '</em></label>';
    }).join('');
  }
  function drawCalc() {
    var rows = P.nicheRows(niche(), C.current(), $('state').value, checks).filter(function (x) { return !off[x.q]; }), t = P.sum(rows);
    $('r-cl').textContent = '≈ ' + P.num(t.clients);
    $('r-m').textContent = fmt(t.money);
    $('r-d').textContent = fmt(t.money / 30);
    $('r-y').textContent = fmt(t.money * 12);
  }
  $('niches').addEventListener('click', function (e) {
    var all = e.target.closest('.js-all'), pick = e.target.closest('[data-pick]');
    // на широком экране карточка всегда раскрыта: нажатие на заголовок её не сворачивает
    if (wideMq.matches && e.target.closest('summary')) { e.preventDefault(); return; }
    if (all) { var card = all.closest('.p-niche'); card.classList.toggle('open'); all.textContent = card.classList.contains('open') ? 'Свернуть' : 'Смотреть все ' + all.dataset.n; }
    if (pick) { nicheSel.value = pick.dataset.pick; $('f-niche').value = pick.dataset.pick; drawChips(); drawCalc(); }
  });
  $('chips').addEventListener('change', function (e) { if (e.target.dataset.q) { off[e.target.dataset.q] = !e.target.checked; drawCalc(); } });
  $('chips').addEventListener('input', function (e) {
    var q = e.target.dataset.c; if (!q) return;
    var v = parseInt(e.target.value, 10), mark = e.target.parentNode.querySelector('.js-mark'); checks[q] = v > 0 ? v : 0;
    if (mark) mark.remove(); // чек вписан руками – это уже не оценка
    drawCalc();
  });
  nicheSel.addEventListener('change', function () { $('f-niche').value = nicheSel.value; drawChips(); drawCalc(); });
  $('state').addEventListener('change', drawCalc);
  function drawAll() { drawTop(); drawNiches(); drawCalc(); }
  var lastSign = P.sign(C.current());
  C.onChange(function (r) {
    // чеки, вписанные в рублях, для города с другой валютой не годятся – возвращаем оценки
    if (P.sign(r) !== lastSign) { checks = {}; lastSign = P.sign(r); }
    drawChips(); drawAll();
  });
  // «Как считаем» – из тех же коэффициентов, по которым идёт расчёт (calc.js), чтобы текст не расходился с цифрами
  var M = P.MODEL.servis, S = P.STATES, pc = function (x) { return Math.round(x * 100) + '%'; };
  $('formula').textContent = 'Горячие поиски × ' + pc(M.sites) + ' переходят на сайты (остальные – карты и агрегаторы; для «автосервис», «шиномонтаж», «автоэлектрик» – ' + pc(M.sites / 2) +
    ') × ' + pc(M.top) + ' достаются сайту в топ-3 × ' + pc(M.conv) + ' звонят или пишут × ' + pc(M.close) + ' доезжают × средний чек. Лендинг забирает около ' + pc(S.landing.take) +
    ' этого, сайт без продвижения около ' + pc(S.weak.take) + ', без сайта – 0.';
  drawChips(); drawAll(); setInterval(drawTop, 20000);
})();
