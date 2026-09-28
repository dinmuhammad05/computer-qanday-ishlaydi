/* Bob testi: <section class="quiz" data-chapter="N"></section> ichiga render qilinadi */
(function () {
  const bank = window.KQI_QUIZ || {};
  const store = (window.KQI && KQI.store) || { get: (k, d) => d, set() {} };
  const results = store.get('kqi-quiz', {});

  document.querySelectorAll('.quiz[data-chapter]').forEach(sec => {
    const ch = +sec.dataset.chapter;
    const qs = bank[ch];
    if (!qs) return;
    const answers = new Array(qs.length).fill(null);
    let checked = false;

    const prev = results[ch];
    sec.innerHTML = `
      <div class="quiz-head">
        <div><div class="eyebrow">Bob testi</div><h2 class="quiz-title">O'zingizni tekshiring: ${qs.length} ta savol</h2></div>
        <div class="quiz-prev">${prev ? `Oxirgi natija: <b>${prev.score}</b> / ${prev.total}` : 'Hali topshirilmagan'}</div>
      </div>
      <ol class="quiz-list"></ol>
      <div class="quiz-foot">
        <button type="button" class="primary quiz-check">Tekshirish</button>
        <button type="button" class="quiz-retry" hidden>Qayta topshirish</button>
        <span class="quiz-score"></span>
      </div>`;
    const list = sec.querySelector('.quiz-list');
    qs.forEach((q, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<p class="quiz-q">${q.q}</p><div class="quiz-opts"></div><div class="quiz-exp" hidden></div>`;
      const opts = li.querySelector('.quiz-opts');
      q.a.forEach((txt, j) => {
        const id = `q${ch}-${i}-${j}`;
        const lab = document.createElement('label');
        lab.className = 'quiz-opt';
        lab.innerHTML = `<input type="radio" name="q${ch}-${i}" id="${id}" value="${j}"><span>${txt}</span>`;
        lab.querySelector('input').addEventListener('change', () => { if (!checked) answers[i] = j; });
        opts.appendChild(lab);
      });
      list.appendChild(li);
    });

    const scoreEl = sec.querySelector('.quiz-score');
    const btnCheck = sec.querySelector('.quiz-check');
    const btnRetry = sec.querySelector('.quiz-retry');

    btnCheck.onclick = () => {
      const missing = answers.findIndex(a => a === null);
      if (missing >= 0) {
        scoreEl.textContent = `${missing + 1}-savolga javob bering.`;
        list.children[missing].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      checked = true;
      let score = 0;
      qs.forEach((q, i) => {
        const li = list.children[i];
        const ok = answers[i] === q.c;
        if (ok) score++;
        li.classList.add(ok ? 'ok' : 'bad');
        li.querySelectorAll('.quiz-opt').forEach((lab, j) => {
          lab.querySelector('input').disabled = true;
          if (j === q.c) lab.classList.add('right');
          if (j === answers[i] && !ok) lab.classList.add('wrong');
        });
        const exp = li.querySelector('.quiz-exp');
        exp.hidden = false;
        exp.innerHTML = `<b>${ok ? 'To\'g\'ri.' : 'Noto\'g\'ri.'}</b> ${q.e}`;
      });
      const total = qs.length;
      const msg = score === total ? 'Zo\'r! Bob to\'liq o\'zlashtirilgan.' : score >= total - 1 ? 'Yaxshi. Xato savolning izohini o\'qing.' : score >= Math.ceil(total / 2) ? 'Bobni yana bir ko\'rib chiqing.' : 'Bobni qayta o\'qib, keyin qayta topshiring.';
      scoreEl.innerHTML = `<b>${score}</b> / ${total} · ${msg}`;
      results[ch] = { score, total, at: Date.now() };
      store.set('kqi-quiz', results);
      btnCheck.hidden = true;
      btnRetry.hidden = false;
      sec.querySelector('.quiz-prev').innerHTML = `Oxirgi natija: <b>${score}</b> / ${total}`;
    };

    btnRetry.onclick = () => {
      checked = false;
      answers.fill(null);
      list.querySelectorAll('li').forEach(li => {
        li.classList.remove('ok', 'bad');
        li.querySelector('.quiz-exp').hidden = true;
        li.querySelectorAll('.quiz-opt').forEach(lab => { lab.classList.remove('right', 'wrong'); const inp = lab.querySelector('input'); inp.disabled = false; inp.checked = false; });
      });
      scoreEl.textContent = '';
      btnCheck.hidden = false;
      btnRetry.hidden = true;
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });

  /* Mundarijada natijalarni ko'rsatish */
  document.querySelectorAll('.toc-list a[data-chapter]').forEach(a => {
    const r = results[+a.dataset.chapter];
    if (!r) return;
    const ok = a.querySelector('.ok');
    if (ok) ok.textContent = (ok.textContent ? ok.textContent + ' · ' : '') + `test ${r.score}/${r.total}`;
  });
})();
