/* =========================================================
   Daniyaal Baquer: Portfolio interactions
   1. Intro (hand signs → release)
   2. Scroll reveal + stat counters
   3. Shuriken cursor
   4. Nav: active section + mobile menu
   5. Résumé summoning scroll
   6. Copy email
   7. Easter egg: type "rasengan"
   8. Scroll-driven scroll box (My Ninja Way)
   9. EDITH terminal demo
   ========================================================= */

document.documentElement.classList.remove('no-js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// Toast used by several features
const toast = $('#toast');
let toastTimer;
function showToast(text, ms = 2400) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
}

/* ---------------------------------------------------------
   2. Scroll reveal + stat counters
   (defined before the intro, which starts them when it ends)
   --------------------------------------------------------- */
let revealsStarted = false;

function countUp(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const duration = 1100;
  (function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  })(start);
}

function startReveals() {
  if (revealsStarted) return;
  revealsStarted = true;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      const counter = entry.target.querySelector('[data-count]');
      if (counter && !reduceMotion) countUp(counter);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 5) * 70}ms`;
    io.observe(el);
  });

  // Stamp the 合格 seal on the registration card shortly after the hero appears
  setTimeout(() => $('#hanko').classList.add('stamped'), 900);
}

/* ---------------------------------------------------------
   1. Intro: hand signs → release (once per visit)
   --------------------------------------------------------- */
(function intro() {
  const intro = $('#intro');
  const sign = $('#introSign');
  const signs = [['子', 'RAT'], ['丑', 'OX'], ['寅', 'TIGER'], ['卯', 'HARE'], ['辰', 'DRAGON'], ['解', 'RELEASE']];
  const timers = [];

  let seen = false;
  try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) { /* storage blocked */ }

  // Skip entirely for returning visits, reduced-motion users, or deep links like /#scrolls
  if (seen || reduceMotion || location.hash) {
    intro.classList.add('gone');
    startReveals();
    return;
  }
  try { sessionStorage.setItem('introSeen', '1'); } catch (e) { /* storage blocked */ }

  document.body.style.overflow = 'hidden';

  function finish() {
    timers.forEach(clearTimeout);
    intro.classList.add('slashing');
    setTimeout(() => intro.classList.add('done'), 220);
    setTimeout(() => {
      intro.classList.add('gone');
      document.body.style.overflow = '';
      startReveals();
    }, 950);
  }

  signs.forEach(([kanji, name], i) => {
    timers.push(setTimeout(() => {
      // textContent (not innerHTML) so nothing here can ever be parsed as HTML
      sign.querySelector('b').textContent = kanji;
      sign.querySelector('small').textContent = name;
      sign.classList.toggle('release', kanji === '解');
    }, 180 + i * 170));
  });
  timers.push(setTimeout(finish, 180 + signs.length * 170 + 260));

  $('#introSkip').addEventListener('click', finish);
  addEventListener('keydown', function skipOnKey() {
    removeEventListener('keydown', skipOnKey);
    finish();
  }, { once: true });
})();

/* ---------------------------------------------------------
   3. Shuriken cursor: follows the mouse and spins only while moving,
      then slows to a stop (no constant idle spinning)
   --------------------------------------------------------- */
(function cursor() {
  if (!finePointer) return;
  const shuriken = $('#shuriken');
  let x = -100, y = -100, tx = -100, ty = -100, angle = 0, spin = 0, started = false;

  addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!started) {
      started = true; x = tx; y = ty;
      document.body.classList.add('has-cursor');
    }
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  document.addEventListener('mouseenter', () => { if (started) document.body.classList.add('has-cursor'); });

  (function loop() {
    const dx = tx - x, dy = ty - y;
    x += dx * 0.3; y += dy * 0.3;
    // Spin speed builds with movement and decays when the mouse stops
    const speed = Math.hypot(dx, dy);
    spin = Math.min(9, spin * 0.9 + speed * 0.06);
    if (spin < 0.05) spin = 0;
    if (!reduceMotion) angle += spin;
    shuriken.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    requestAnimationFrame(loop);
  })();

  const grow = 'a, button, .scroll-card, .mini-scroll, .nature';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(grow)) shuriken.classList.add('big'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(grow)) shuriken.classList.remove('big'); });
})();

/* ---------------------------------------------------------
   4. Nav: highlight the current section + mobile menu
   --------------------------------------------------------- */
(function nav() {
  const links = $$('.nav-links a');
  const sections = links.map((a) => $(a.getAttribute('href')));

  function update() {
    let current = -1;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top < innerHeight * 0.4) current = i;
    });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
  }
  addEventListener('scroll', update, { passive: true });
  update();

  const btn = $('#menuBtn');
  const menu = $('#mobileMenu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  }
  btn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
})();

/* ---------------------------------------------------------
   5. Résumé summoning scroll: unroll → stamp → download
   --------------------------------------------------------- */
(function resume() {
  const scroll = $('#summonScroll');
  const btn = $('#unsealBtn');
  const link = $('#resumeLink');
  const status = $('#resumeStatus');
  const seal = $('#paperSeal');
  let pdfAvailable = true;

  // Check the PDF exists so visitors never hit a broken download
  fetch(link.href, { method: 'HEAD' })
    .then((res) => { pdfAvailable = res.ok; })
    .catch(() => { pdfAvailable = false; })
    .finally(() => {
      if (!pdfAvailable) {
        link.removeAttribute('download');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          status.textContent = 'RÉSUMÉ PDF COMING SOON';
        });
      }
    });

  function download() {
    if (!pdfAvailable) { status.textContent = 'RÉSUMÉ PDF COMING SOON'; return; }
    status.textContent = 'SUMMONED. DOWNLOADING…';
    link.click();
  }

  btn.addEventListener('click', () => {
    if (scroll.classList.contains('open')) { download(); return; }
    scroll.classList.add('open');
    btn.disabled = true;
    const unrollTime = reduceMotion ? 0 : 1100;
    setTimeout(() => {
      seal.classList.add('stamped');
      setTimeout(() => {
        download();
        btn.disabled = false;
        btn.textContent = 'DOWNLOAD AGAIN ↓';
      }, reduceMotion ? 0 : 450);
    }, unrollTime);
  });
})();

/* ---------------------------------------------------------
   6. Copy email
   --------------------------------------------------------- */
(function copyEmail() {
  const btn = $('#copyEmail');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      btn.textContent = 'COPIED ✓';
      showToast('Email copied');
    } catch (e) {
      btn.textContent = 'SELECT IT';
    }
    setTimeout(() => (btn.textContent = 'COPY'), 1800);
  });
})();

/* ---------------------------------------------------------
   7. Easter egg: type "rasengan" anywhere
   --------------------------------------------------------- */
(function rasengan() {
  let typed = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    typed = (typed + e.key.toLowerCase()).slice(-8);
    if (typed !== 'rasengan') return;
    typed = '';

    showToast('螺旋丸 · Rasengan!', 2600);
    if (reduceMotion) return;

    const orb = document.createElement('div');
    orb.className = 'rasengan';
    document.body.appendChild(orb);
    orb.animate(
      [
        { left: '-10vw', top: '70vh', transform: 'scale(.4)' },
        { left: '50vw', top: '45vh', transform: 'scale(1.2)', offset: .6 },
        { left: '110vw', top: '30vh', transform: 'scale(.8)' }
      ],
      { duration: 1400, easing: 'cubic-bezier(.4,0,.2,1)' }
    ).onfinish = () => orb.remove();
  });
})();

/* ---------------------------------------------------------
   8. Scroll-driven scroll box
   Scroll progress through the tall #path section (0 → 1) is split
   into steps; each step writes a 0 → 1 CSS variable that the
   stylesheet turns into movement.
   --------------------------------------------------------- */
(function scrollBox() {
  const scene = $('.scene');
  if (!scene) return;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, start, end) => clamp((p - start) / (end - start)); // 0 → 1 within [start, end]
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function target() {
    if (reduceMotion) return 1;
    const r = scene.getBoundingClientRect();
    return clamp(-r.top / (scene.offsetHeight - innerHeight));
  }

  function apply(p) {
    const set = (k, v) => scene.style.setProperty(k, v.toFixed(4));
    set('--p', p);
    set('--hint-fade', seg(p, 0, .05));
    set('--glint',     seg(p, 0, .08));               // gold glint sweeps the lid
    set('--untie',     ease(seg(p, .06, .14)));       // cord comes off
    set('--lid-lift',  easeOut(seg(p, .13, .2)));     // lid lifts straight up
    set('--lid-out',   ease(seg(p, .19, .32)));       // ...then flies away
    set('--lid-fade',  seg(p, .26, .33));
    set('--rise',      ease(seg(p, .28, .46)));       // rolled scroll rises out
    set('--box-sink',  ease(seg(p, .38, .54)));       // box sinks away
    set('--box-fade',  seg(p, .44, .54));
    set('--swap',      seg(p, .45, .5));              // top rod appears behind the roll
    set('--unroll',    ease(seg(p, .5, .8)));         // paper unrolls
    set('--ink',       ease(seg(p, .6, .72)));        // brush kanji inked in
    set('--ink2',      ease(seg(p, .68, .78)));
    set('--o1',        ease(seg(p, .72, .78)));       // creed lines appear
    set('--o2',        ease(seg(p, .76, .82)));
    set('--o3',        ease(seg(p, .8, .86)));
    set('--o-sig',     ease(seg(p, .85, .9)));
    scene.classList.toggle('sealed', p > .9);          // 誓 seal stamps
  }

  // Smoothing: the drawn progress glides toward the real scroll position,
  // so the motion feels weighted instead of jumping with each wheel tick.
  let shown = target();
  apply(shown);
  (function loop() {
    const t = target();
    if (Math.abs(t - shown) > .0005) {
      shown += (t - shown) * (reduceMotion ? 1 : .1);
      apply(shown);
    }
    requestAnimationFrame(loop);
  })();
})();

/* ---------------------------------------------------------
   9. EDITH terminal demo: types example sessions using the same
      console messages EDITH prints. Starts when scrolled into view;
      the static HTML (first session) shows if JS or motion is off.
   --------------------------------------------------------- */
(function edithTerminal() {
  const term = $('#edithTerm');
  if (!term || reduceMotion) return;

  // [class, text, typed?] — "you" lines are typed like speech being transcribed
  const sessions = [
    [['t-sys', '🔔 Heard you.'],
     ['t-you', "🗣️ You: what's on my calendar today?", true],
     ['t-sys', '🤔 Thinking...'],
     ['t-edith', '🤖 EDITH: Two things, Boss. ISE 305 at 11, MSA board at 6.', true]],
    [['t-sys', '🔔 Heard you.'],
     ['t-you', '🗣️ You: anything in my inbox I need to deal with?', true],
     ['t-sys', '🤔 Thinking...'],
     ['t-edith', '🤖 EDITH: Three. A deadline moved to Friday, a housing form, and a recruiter replied. Start with the recruiter.', true]],
    [['t-sys', '🔔 Heard you.'],
     ['t-you', '🗣️ You: look at my screen, why is this broken?', true],
     ['t-sys', '👁️ Capturing your screen...'],
     ['t-sys', '🤔 Thinking...'],
     ['t-edith', '🤖 EDITH: Your grid column is stretching. Use minmax(0, 1fr).', true]],
  ];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const caret = document.createElement('span');
  caret.className = 'term-caret';

  async function typeLine(cls, text, typed) {
    const p = document.createElement('p');
    p.className = cls;
    term.appendChild(p);
    if (!typed) { p.textContent = text; await sleep(500); return; }
    const chars = [...text]; // spread keeps emoji intact
    for (let i = 0; i < chars.length; i++) {
      p.textContent = chars.slice(0, i + 1).join('');
      p.appendChild(caret);
      await sleep(cls === 't-you' ? 38 : 18);
    }
    caret.remove();
    await sleep(350);
  }

  async function run() {
    for (let s = 0; ; s = (s + 1) % sessions.length) {
      term.innerHTML = '';
      for (const [cls, text, typed] of sessions[s]) await typeLine(cls, text, typed);
      await sleep(3800);
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.4 });
  io.observe(term);
})();
