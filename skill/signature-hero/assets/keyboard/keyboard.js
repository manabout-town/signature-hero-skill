/* 직접 눌러보는 키보드 — 인트로 · 히어로 · 타건음 */
window.KF = (() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = (chars, pre) => chars.split('').map(c => [c, pre + c]);
  const ROWS = [
    [['Esc', 'Escape', 1, 'acc'], ...'1234567890'.split('').map(c => [c, 'Digit' + c]), ['-', 'Minus'], ['=', 'Equal'], ['⌫', 'Backspace', 2]],
    [['Tab', 'Tab', 1.5], ...L('QWERTYUIOP', 'Key'), ['[', 'BracketLeft'], [']', 'BracketRight'], ['\\', 'Backslash', 1.5]],
    [['Caps', 'CapsLock', 1.75], ...L('ASDFGHJKL', 'Key'), [';', 'Semicolon'], ["'", 'Quote'], ['Enter', 'Enter', 2.25, 'acc']],
    [['Shift', 'ShiftLeft', 2.25], ...L('ZXCVBNM', 'Key'), [',', 'Comma'], ['.', 'Period'], ['/', 'Slash'], ['Shift', 'ShiftRight', 1.75], ['↑', 'ArrowUp']],
    [['Ctrl', 'ControlLeft', 1.25], ['Opt', 'AltLeft', 1.25], ['Cmd', 'MetaLeft', 1.25], ['', 'Space', 6.25], ['Cmd', 'MetaRight'], ['Fn', 'Fn'], ['←', 'ArrowLeft'], ['↓', 'ArrowDown'], ['→', 'ArrowRight']],
  ];
  const esc = t => t.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function boardHTML() {
    return '<div class="kf-board">' + ROWS.map((row, y) => {
      let x = 0;
      return '<div class="kf-row">' + row.map(([label, code, w = 1, cls = '']) => {
        const cx = x + w / 2; x += w;
        return `<b class="kc ${cls}" style="--kw:${w}" data-code="${code}" data-x="${cx}" data-y="${y}"><i>${esc(label)}</i></b>`;
      }).join('') + '</div>';
    }).join('') + '</div>';
  }

  /* 타건음: 짧은 노이즈 딸깍 + 낮게 떨어지는 사인파 '톡'. 첫 클릭/키 입력 뒤에만 재생됨(브라우저 정책) */
  let actx = null, noise = null, lastT = 0, muted = false;
  try { muted = localStorage.getItem('kf-mute') === '1'; } catch {}
  function unlock() {
    if (actx) { actx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    actx = new AC();
    const n = Math.floor(actx.sampleRate * .06);
    noise = actx.createBuffer(1, n, actx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  }
  function thock(s = 1) {
    if (!actx || muted) return;
    const now = actx.currentTime; if (now - lastT < .028) return; lastT = now;
    const src = actx.createBufferSource(); src.buffer = noise; src.playbackRate.value = .8 + Math.random() * .4;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300 + Math.random() * 700; bp.Q.value = .9;
    const g = actx.createGain(); g.gain.value = .45 * s;
    src.connect(bp).connect(g).connect(actx.destination); src.start(now);
    const o = actx.createOscillator(), og = actx.createGain();
    o.frequency.setValueAtTime(175, now); o.frequency.exponentialRampToValueAtTime(70, now + .07);
    og.gain.setValueAtTime(.32 * s, now); og.gain.exponentialRampToValueAtTime(.001, now + .09);
    o.connect(og).connect(actx.destination); o.start(now); o.stop(now + .1);
  }
  addEventListener('pointerdown', unlock, { passive: true });
  addEventListener('keydown', unlock);

  /* 히어로 */
  let keys = [], byCode = {}, heroVisible = false, typed = '', field = null;
  function press(k, s, hold) {
    k.classList.add('down', 'lit');
    clearTimeout(k._t);
    if (!hold) k._t = setTimeout(() => k.classList.remove('down', 'lit'), 170);
    thock(s); ripple(k);
  }
  function release(k) { clearTimeout(k._t); k._t = setTimeout(() => k.classList.remove('down', 'lit'), 60); }
  function ripple(k) {
    if (RM) return;
    const x = +k.dataset.x, y = +k.dataset.y;
    for (const o of keys) {
      if (o === k) continue;
      const d = Math.hypot(o.dataset.x - x, (o.dataset.y - y) * 1.15);
      if (d > 2.8) continue;
      setTimeout(() => { o.classList.add('wave'); setTimeout(() => o.classList.remove('wave'), 190); }, d * 55);
    }
  }
  function soundLabel() {
    const b = document.querySelector('.kf-sound'); if (!b) return;
    b.textContent = muted ? '♪ 타건음 꺼짐' : '♪ 타건음 켜짐';
    b.setAttribute('aria-pressed', String(!muted));
  }
  let io;
  function mountHero() {
    field = document.querySelector('.kf-field');
    if (!field) { heroVisible = false; return; }
    field.innerHTML = boardHTML();
    keys = [...field.querySelectorAll('.kc')];
    byCode = Object.fromEntries(keys.map(k => [k.dataset.code, k]));
    typed = '';
    const board = field.firstElementChild;
    if (document.documentElement.classList.contains('kf-open')) requestAnimationFrame(() => board.classList.add('show'));
    field.addEventListener('pointerover', e => { const k = e.target.closest('.kc'); if (k) press(k, .3); });
    field.addEventListener('pointerdown', e => { const k = e.target.closest('.kc'); if (k) press(k, 1); });
    const hero = field.parentElement;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      field.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      field.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
    const sb = hero.querySelector('.kf-sound');
    sb.onclick = () => { muted = !muted; try { localStorage.setItem('kf-mute', muted ? '1' : '0'); } catch {} soundLabel(); if (!muted) { unlock(); thock(1); } };
    soundLabel();
    io?.disconnect();
    io = new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; });
    io.observe(hero);
  }
  // 실제 키보드 → 같은 키가 눌림 (히어로가 보일 때, 입력칸 밖에서만)
  addEventListener('keydown', e => {
    if (!field || !heroVisible || !document.documentElement.classList.contains('kf-open')) return;
    if (e.metaKey || e.ctrlKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const k = byCode[e.code]; if (!k) return;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); // 누르는 동안 페이지가 스크롤되지 않게
    if (!e.repeat) press(k, .9, true);
    const t = document.querySelector('.kf-typed');
    if (t) {
      if (e.key === 'Backspace') typed = typed.slice(0, -1);
      else if (e.key.length === 1) typed = (typed + e.key).slice(-14);
      t.textContent = typed ? '› ' + typed : '';
    }
  });
  addEventListener('keyup', e => { const k = byCode[e.code]; if (k) release(k); });

  /* 인트로: 누를 때마다 KEYFORGE 한 글자씩 켜짐, 가만히 있으면 자동 타이핑 */
  function intro(onOpen) {
    const el = document.getElementById('kf-intro');
    const open = () => {
      document.documentElement.classList.add('kf-open');
      document.querySelector('.kf-board')?.classList.add('show');
      onOpen?.();
    };
    if (!el || RM) { el?.remove(); open(); return; }
    if (matchMedia('(hover: none)').matches) el.querySelector('.kf-intro-hint').innerHTML = '<b>화면을 탭해보세요</b> · Tap to type';
    const caps = [...el.querySelectorAll('.kc')];
    let i = 0, last = 0, done = false;
    const t0 = performance.now();
    const step = () => {
      if (done || i >= caps.length) return;
      const k = caps[i++];
      k.classList.add('down', 'lit'); setTimeout(() => k.classList.remove('down'), 120);
      thock(1);
      el.style.setProperty('--p', i / caps.length);
      if (i === caps.length) setTimeout(finish, 420);
    };
    const onKey = e => { if (e.metaKey || e.ctrlKey || e.repeat) return; e.preventDefault(); last = performance.now(); step(); };
    const onTap = e => { if (e.target.closest('.kf-skip')) return; last = performance.now(); step(); };
    function finish() {
      if (done) return; done = true;
      clearInterval(auto);
      removeEventListener('keydown', onKey); el.removeEventListener('pointerdown', onTap); removeEventListener('wheel', finish);
      caps.forEach(k => k.classList.add('lit'));
      el.querySelector('.kf-word').classList.add('launch');
      setTimeout(() => {
        el.classList.add('done'); el.setAttribute('aria-hidden', 'true');
        open();
        // 열리는 순간 히어로 키보드에 물결 한 번
        const mid = byCode.KeyG; if (mid) setTimeout(() => press(mid, .6), 350);
      }, 560);
    }
    const auto = setInterval(() => { const n = performance.now(); if (n - t0 > 800 && n - last > 500) step(); }, 260);
    addEventListener('keydown', onKey);
    el.addEventListener('pointerdown', onTap);
    addEventListener('wheel', finish, { passive: true });
    el.querySelector('.kf-skip').onclick = finish;
  }
  return { mountHero, intro };
})();
KF.intro();
