(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Footer year ---------- */
  $$('.js-year').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Mobile menu ---------- */
  const burger = $('.nav-burger');
  const panel  = $('.mobile-panel');
  const setMenu = open => {
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? '✕' : '☰';
  };
  burger.addEventListener('click', () => setMenu(!panel.classList.contains('open')));
  $$('a', panel).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll progress, nav shadow, back-to-top ---------- */
  const bar   = $('.progress');
  const nav   = $('.site-nav');
  const toTop = $('.to-top');
  const onScroll = () => {
    const h   = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    nav.classList.toggle('scrolled', h.scrollTop > 10);
    toTop.classList.toggle('show', h.scrollTop > 700);
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Highlight current section in the nav ---------- */
  const navLinks = $$('.nav-links a');
  const linkFor  = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.remove('active'));
      const link = linkFor.get(entry.target.id);
      if (link) link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  // [selector, direction class, stagger columns (0 = stagger by index)]
  const targets = [
    ['.hero-copy > *',                 '',           0],
    ['.hero-portrait',                 'zoom',       0],
    ['.tools-label',                   '',           0],
    ['.tool',                          'zoom',       6],
    ['.section-label',                 '',           0],
    ['.section h2',                    '',           0],
    ['.lede, .sub-h',                  '',           0],
    ['.about-grid > div',              '',           2],
    ['.facts > div',                   '',           4],
    ['.project img',                   'from-left',  0],
    ['.project-copy',                  'from-right', 0],
    ['.project.reverse img',           'from-right', 0],
    ['.project.reverse .project-copy', 'from-left',  0],
    ['.mini-card',                     '',           3],
    ['.t-item',                        '',           1],
    ['.edu-item',                      '',           1],
    ['.cert',                          '',           1],
    ['.contact-list li',               'from-left',  1],
    ['.contact-form',                  'from-right', 0]
  ];

  const items = [];
  targets.forEach(([selector, dir, cols]) => {
    $$(selector).forEach((el, i) => {
      // later rules (e.g. .project.reverse) may override an earlier direction
      el.classList.remove('from-left', 'from-right', 'zoom');
      if (dir) el.classList.add(dir);
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        items.push(el);
      }
      const step = cols ? i % cols : i;
      el.style.setProperty('--d', Math.min(step * 90, 600) + 'ms');
    });
  });

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      reveal.unobserve(el);
      // once finished, hand control back so hover effects work normally
      const delay = parseInt(el.style.getPropertyValue('--d'), 10) || 0;
      setTimeout(() => {
        el.classList.remove('reveal', 'in', 'from-left', 'from-right', 'zoom');
        el.style.removeProperty('--d');
      }, delay + 1000);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => reveal.observe(el));

  // safety net: if anything is still hidden when the user reaches the page bottom, show it
  addEventListener('scroll', () => {
    const h = document.documentElement;
    if (h.scrollHeight - h.scrollTop - h.clientHeight < 4) {
      $$('.reveal:not(.in)').forEach(el => el.classList.add('in'));
    }
  }, { passive: true });

  /* ---------- Contact form: opens the visitor's email app ---------- */
  const form = $('#contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d       = new FormData(form);
    const name    = d.get('name');
    const subject = encodeURIComponent(d.get('subject') || 'Portfolio message from ' + name);
    const body    = encodeURIComponent(d.get('message') + '\n\n— ' + name + ' (' + d.get('email') + ')');
    location.href = 'mailto:' + form.dataset.email + '?subject=' + subject + '&body=' + body;
  });
})();