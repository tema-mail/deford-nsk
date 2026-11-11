/* Страница «Все услуги и поиск»: поиск по услугам, итог, правка чека в строке.
   Логика прототипа deford-poteri/src/avtoservis__uslugi.html без изменений; расчёты – POTERI (calc.js), город – CITY (city.js). */
(function () {
  var P = window.POTERI, C = window.CITY, fmt = P.fmt, $ = function (id) { return document.getElementById(id); };
  var checks = {}, showAll = false, LIMIT = 15, last = { keys: {}, searching: false };
  var norm = function (s) { return String(s).toLowerCase().replace(/ё/g, 'е').trim(); };
  var toWords = function (s) { return norm(s).split(/[^a-zа-я0-9]+/).filter(Boolean); };
  // Основы слова из поиска: без окончания («плёнка» → «пленк», «фара» → «фар», «руль» → «рул»)
  // и вариант с беглой гласной («потолок» → «потолк», «ремень» → «ремн»).
  function stems(w) {
    var s = w.length >= 4 ? w.replace(/(ами|ями|ой|ей|ия|ие|ий|ый|ая|ов|ев|ам|ям|ах|ях|а|я|ы|и|у|ю|е|о|ь|й)$/, '') : w;
    var m = s.match(/^(.+[^аеиоуыэюя])[ое]([^аеиоуыэюя])$/);
    return m ? [s, m[1] + m[2]] : [s];
  }
  // Слово найдено, если с его основы начинается слово названия или примера запроса; длинная основа (от 5 букв)
  // ищется в названии и как часть слова («плёнка» → «бронеплёнка»). Слова короче трёх букв – только целиком.
  function hasWord(w, main, extra) {
    if (w.length < 3) return main.concat(extra).indexOf(w) >= 0;
    return stems(w).some(function (st) {
      return main.some(function (h) { return h.indexOf(st) === 0 || (st.length >= 5 && h.indexOf(st) > 0); }) || extra.some(function (h) { return h.indexOf(st) === 0; });
    });
  }
  var NOTE = { '': '', est: '<small class="js-mark" title="цен в прайсах города не нашли">оценка</small>', weak: '<small class="js-mark" title="в прайсах цена «от», только работа или один прайс – нижняя граница">от</small>' };
  function rows() { return P.allRows(C.current(), $('state').value, checks).sort(function (a, b) { return b.money - a.money; }); }
  // Поиск ступенями: по названию услуги и её запросу; пусто – по примерам «как ищут»; пусто – по названию ниши.
  function search(all, words) {
    var by = function (pick) { return all.filter(function (x) { var hay = pick(x); return words.every(function (w) { return hasWord(w, hay[0], hay[1]); }); }); };
    var found = by(function (x) { return [toWords(x.name + ' ' + x.q), []]; });
    if (!found.length) found = by(function (x) { return [[], toWords(x.top.join(' '))]; });
    if (!found.length) found = by(function (x) { return [toWords(x.nicheName), []]; });
    return found;
  }
  // Итог: при поиске – всё найденное; без поиска – город целиком без услуг, которые входят в другие запросы (марки).
  function paintSum(found) {
    var t = P.sum(last.searching ? found : found.filter(function (x) { return !x.sub; }));
    $('sum').textContent = found.length ? (last.searching ? 'Найдено услуг: ' : 'Услуг в списке: ') + found.length + ' · в ' + P.CITY_IN[C.current()] +
      ' мимо вас ' + P.money(t.money, C.current()) + ' в месяц · клиентов: ≈ ' + P.num(t.clients) : 'Ничего не нашли по запросу «' + $('q').value + '»';
  }
  function draw() {
    var words = toWords($('q').value), all = rows(), r = C.current(), rub = P.sign(r) === '₽';
    var found = words.length ? search(all, words) : all;
    var shown = words.length || showAll ? found : found.slice(0, LIMIT);
    last = { keys: {}, searching: !!words.length }; found.forEach(function (x) { last.keys[x.q] = 1; });
    var nicheSvc = {}; P.D.niches.forEach(function (n) { n.services.forEach(function (sv) { nicheSvc[sv[0]] = sv; }); });
    document.querySelector('#tbl tbody').innerHTML = shown.map(function (x) {
      return '<tr data-q="' + x.q + '"><td>' + x.name + '<small>' + x.nicheName + '</small></td><td class="n">' + fmt(x.hot) + '</td><td class="n w-hide-m js-cl">' +
        P.num(x.clients) + '</td><td class="n js-m"><b>' + P.money(x.money, r) + '</b></td><td class="n"><input class="p-chk" type="number" min="0" step="' + (rub ? 500 : 10) + '" value="' +
        x.check + '" aria-label="Средний чек: ' + x.name + '">' + (checks[x.q] == null ? NOTE[P.checkNote(nicheSvc[x.q], r)] : '') + '</td></tr>';
    }).join('');
    $('tbl').hidden = !found.length; $('empty').hidden = !!found.length;
    $('more').hidden = !!words.length || found.length <= LIMIT;
    $('more').textContent = showAll ? 'Свернуть' : 'Показать все услуги (' + found.length + ')';
    paintSum(found);
    document.querySelector('.js-src').textContent = 'Источник: ' + P.src(r) + '. «Ищут» – горячие формулировки, без «своими руками» и прочего.';
    document.querySelectorAll('.js-cur').forEach(function (e) { e.textContent = P.sign(r); });
  }
  // Правка чека: поле ввода не перерисовываем – меняем сумму строки и общий итог.
  $('tbl').addEventListener('input', function (e) {
    if (!e.target.classList.contains('p-chk')) return;
    var tr = e.target.closest('tr'), v = parseInt(e.target.value, 10); checks[tr.dataset.q] = v > 0 ? v : 0;
    var all = rows(), x = all.filter(function (r) { return r.q === tr.dataset.q; })[0], mark = tr.querySelector('.js-mark');
    if (mark) mark.remove(); // чек вписан руками – это уже не оценка
    if (x) tr.querySelector('.js-m').innerHTML = '<b>' + P.money(x.money, C.current()) + '</b>';
    paintSum(all.filter(function (r) { return last.keys[r.q]; }));
  });
  $('q').addEventListener('input', draw);
  $('find').addEventListener('click', function () { draw(); $('sum').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  $('q').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('find').click(); });
  $('state').addEventListener('change', draw);
  $('more').addEventListener('click', function () { showAll = !showAll; draw(); });
  var lastSign = P.sign(C.current());
  // чеки, вписанные в рублях, для города с другой валютой не годятся – возвращаем оценки
  C.onChange(function (r) { if (P.sign(r) !== lastSign) { checks = {}; lastSign = P.sign(r); } draw(); });
  draw();
})();
