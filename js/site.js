/* Kompyuter qanday ishlaydi — umumiy skript */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  window.KQI = { $, $$, reduce, store };

  /* Theme toggle */
  const saved = store.get('kqi-theme', null);
  if (saved) document.documentElement.dataset.theme = saved;
  const tb = $('#themeBtn');
  if (tb) {
    const paint = () => {
      const dark = document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      tb.textContent = dark ? '☀' : '☾';
      tb.setAttribute('aria-label', dark ? 'Yorug\' mavzu' : 'Qorong\'i mavzu');
    };
    tb.onclick = () => {
      const dark = document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'light' : 'dark';
      store.set('kqi-theme', document.documentElement.dataset.theme);
      paint();
    };
    paint();
  }

  /* Figures: play animations when visible, add replay button */
  const figs = $$('.fig');
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('play'); } });
  }, { threshold: 0.25 }) : null;
  figs.forEach(f => {
    if (io) io.observe(f); else f.classList.add('play');
    const cap = $('figcaption', f);
    if (cap && f.querySelector('[class*="seq"],[class*="stagger"],.flow,.pulse,.travel,.rise,[data-replay]')) {
      const b = document.createElement('button');
      b.className = 'replay'; b.type = 'button'; b.textContent = '↻ qayta';
      b.onclick = () => { f.classList.remove('play'); void f.offsetWidth; f.classList.add('play'); f.dispatchEvent(new CustomEvent('replay')); };
      cap.appendChild(b);
    }
  });

  /* Step chains: <button data-chain="id"> lights up #id > div one by one */
  $$('[data-chain]').forEach(btn => {
    btn.onclick = () => {
      const ch = document.getElementById(btn.dataset.chain);
      const items = [...ch.children];
      items.forEach(d => d.classList.remove('lit', 'now'));
      items.forEach((d, i) => setTimeout(() => {
        items.forEach(x => x.classList.remove('now'));
        d.classList.add('lit', 'now');
        if (i === items.length - 1) setTimeout(() => d.classList.remove('now'), 600);
      }, reduce ? 0 : i * 550));
    };
  });

  /* Reading progress */
  const read = new Set(store.get('kqi-read', []));
  const doneBtn = $('#doneBtn');
  if (doneBtn) {
    const ch = +doneBtn.dataset.chapter;
    const paint = () => { const ok = read.has(ch); doneBtn.textContent = ok ? '✓ O\'qildi' : 'Bobni o\'qidim'; doneBtn.classList.toggle('on', ok); };
    doneBtn.onclick = () => { if (read.has(ch)) read.delete(ch); else read.add(ch); store.set('kqi-read', [...read]); paint(); };
    paint();
  }
  $$('.toc-list a[data-chapter]').forEach(a => { if (read.has(+a.dataset.chapter)) { a.classList.add('read'); const ok = $('.ok', a); if (ok) ok.textContent = '✓ o\'qildi'; } });
  const pt = $('#readCount');
  if (pt) pt.textContent = read.size;
})();
