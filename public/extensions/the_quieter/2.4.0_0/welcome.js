(function () {
  const h =
      new URLSearchParams(location.search).get('event') === 'update'
        ? 'update'
        : 'install',
    g = chrome.runtime.getManifest().version || '',
    a = (t) => document.getElementById(t);
  let l = null;
  const _ = ['en', 'ar', 'ur', 'bn', 'hi', 'tr', 'id'],
    m = new Set(['ar', 'ur']);
  function p(t, e, n) {
    let o = t;
    return (
      e &&
        Object.keys(e).forEach((s) => {
          const i = e[s];
          let c = i && i.content;
          typeof c == 'string' &&
            (c = c.replace(/\$(\d+)/g, (T, f) =>
              n[+f - 1] != null ? String(n[+f - 1]) : ''
            )),
            (o = o.replace(new RegExp('\\$' + s + '\\$', 'gi'), c || ''));
        }),
      (o = o.replace(/\$(\d+)/g, (s, i) =>
        n[+i - 1] != null ? String(n[+i - 1]) : ''
      )),
      o
    );
  }
  function r(t, ...e) {
    const n = l && l[t];
    if (n && typeof n.message == 'string')
      return p(n.message, n.placeholders, e);
    try {
      const o = chrome.i18n.getMessage(t, e.length ? e.map(String) : void 0);
      if (o) return o;
    } catch {}
    return t;
  }
  function w() {
    return new Promise((t) => {
      try {
        chrome.storage.local.get(['mr_lang'], (e) =>
          t(e && e.mr_lang ? e.mr_lang : null)
        );
      } catch {
        t(null);
      }
    });
  }
  function u(t) {
    const e = (t || 'en').toLowerCase().split(/[-_]/)[0];
    return _.includes(e) ? e : 'en';
  }
  async function L(t) {
    if (t === 'en') return null;
    try {
      const e = await fetch(
        chrome.runtime.getURL(`_locales/${t}/messages.json`)
      );
      if (e.ok) return await e.json();
    } catch {}
    return null;
  }
  function S() {
    document.querySelectorAll('[data-i18n]').forEach((t) => {
      const e = t.getAttribute('data-i18n'),
        n = r(e);
      n && n !== e && (t.textContent = n);
    });
  }
  function y() {
    const t = a('hero-pill'),
      e = a('hero-title'),
      n = a('hero-sub'),
      o = a('hero-cta'),
      s = a('setup-card'),
      i = a('update-card');
    if (h === 'update') {
      (document.title = r('w_hero_title_update')),
        t && (t.textContent = r('w_pill_updated')),
        e && (e.textContent = r('w_hero_title_update')),
        n && (n.textContent = r('w_hero_sub_update', g)),
        o && o.classList.add('hidden'),
        s && s.classList.add('hidden');
      const c = document.querySelector('.hero');
      i &&
        (i.classList.remove('hidden'),
        c && c.parentNode && c.parentNode.insertBefore(i, c.nextSibling));
    } else
      (document.title = r('w_hero_title_install')),
        t && (t.textContent = r('w_pill_installed')),
        e && (e.textContent = r('w_hero_title_install')),
        n && (n.textContent = r('w_hero_sub_install'));
  }
  function v(t, e) {
    if (!t) return;
    const n = t.textContent;
    (t.textContent = e),
      setTimeout(() => {
        t.textContent = n;
      }, 1600);
  }
  function x() {
    const t = a('share-btn');
    t &&
      t.addEventListener('click', (e) => {
        const n = t.href,
          o = t.querySelector('.support-label');
        navigator.clipboard &&
          navigator.clipboard.writeText &&
          (e.preventDefault(),
          navigator.clipboard
            .writeText(n)
            .then(() => v(o, r('w_link_copied')))
            .catch(() => window.open(n, '_blank', 'noopener,noreferrer')));
      });
  }
  async function d(t, e) {
    (t = u(t)),
      (l = await L(t)),
      (document.documentElement.lang = t),
      (document.documentElement.dir = m.has(t) ? 'rtl' : 'ltr'),
      S(),
      y();
    const n = a('lang-select');
    if ((n && n.value !== t && (n.value = t), e))
      try {
        chrome.storage.local.set({ mr_lang: t });
      } catch {}
  }
  function C() {
    const t = a('lang-select');
    t && t.addEventListener('change', () => d(t.value, !0));
  }
  (async function () {
    const e = await w(),
      n = (chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || 'en',
      o = u(e || n);
    C(), await d(o, !1), x();
  })();
})();
