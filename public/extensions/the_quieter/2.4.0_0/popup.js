const API = 'http://localhost:56348',
  POLL_MS = 1500;
let pollTimer = null;
const $ = (e) => document.getElementById(e),
  els = {
    extVersion: $('ext-version'),
    btnRefresh: $('btn-refresh'),
    btnOpen: $('btn-open'),
    btnSettings: $('btn-settings'),
    btnUpdate: $('btn-update'),
    cardDownload: $('card-download'),
    dlTitle: $('dl-title'),
    dlSub: $('dl-sub'),
    btnLaunchApp: $('btn-launch-app'),
    dlPlatforms: $('dl-platforms'),
    dlFallbackHint: $('dl-fallback-hint'),
    cardUpdate: $('card-update'),
    updateVersions: $('update-versions'),
    statusIcon: $('status-icon'),
    statusTitle: $('status-title'),
    statusSub: $('status-sub'),
    progressBlock: $('progress-block'),
    progressStep: $('progress-step'),
    progressPct: $('progress-pct'),
    progressFill: $('progress-fill'),
    cardVideo: $('card-video'),
    videoTitle: $('video-title'),
    videoSub: $('video-sub'),
    videoBadge: $('video-badge'),
    ttlRow: $('ttl-row'),
    ttlRemaining: $('ttl-remaining'),
  },
  cache = {
    updateInfo: null,
    updateChecked: 0,
    lastTabUrl: null,
    lookup: null,
    seenAppRunning: !1,
    launchTimeoutId: null,
  };
function setHidden(e, n) {
  e.classList.toggle('hidden', !!n);
}
function setStatusIcon(e) {
  els.statusIcon.className = 'status-icon' + (e ? ' ' + e : '');
}
let i18nMessages = null;
function _substitute(e, n, o) {
  let r = e;
  return (
    n &&
      Object.keys(n).forEach((s) => {
        const a = n[s];
        let l = a && a.content;
        typeof l == 'string' &&
          (l = l.replace(/\$(\d+)/g, (c, i) =>
            o[+i - 1] != null ? String(o[+i - 1]) : ''
          )),
          (r = r.replace(new RegExp('\\$' + s + '\\$', 'gi'), l || ''));
      }),
    (r = r.replace(/\$(\d+)/g, (s, a) =>
      o[+a - 1] != null ? String(o[+a - 1]) : ''
    )),
    r
  );
}
function t(e, ...n) {
  const o = i18nMessages && i18nMessages[e];
  if (o && typeof o.message == 'string')
    return _substitute(o.message, o.placeholders, n);
  try {
    const r = chrome.i18n.getMessage(e, n.length ? n.map(String) : void 0);
    if (r) return r;
  } catch {}
  return e;
}
const SUPPORTED_LANGS = ['en', 'ar', 'ur', 'bn', 'hi', 'tr', 'id'],
  RTL_LANGS = new Set(['ar', 'ur']);
function normaliseLang(e) {
  const n = (e || 'en').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGS.includes(n) ? n : 'en';
}
async function loadLocale(e) {
  try {
    const n = chrome.runtime.getURL(`_locales/${e}/messages.json`),
      o = await fetch(n);
    return o.ok ? await o.json() : null;
  } catch {
    return null;
  }
}
function getStoredLang() {
  return new Promise((e) => {
    try {
      chrome.storage.local.get(['mr_lang'], (n) => {
        e(n && n.mr_lang ? n.mr_lang : null);
      });
    } catch {
      e(null);
    }
  });
}
function setStoredLang(e) {
  try {
    chrome.storage.local.set({ mr_lang: e });
  } catch {}
}
function fmtRemaining(e) {
  if (!Number.isFinite(e) || e <= 0) return t('expired');
  const n = Math.floor(e / 86400);
  if (n >= 1) return t(n === 1 ? 'duration_day' : 'duration_days', n);
  const o = Math.floor(e / 3600);
  if (o >= 1) return t(o === 1 ? 'duration_hour' : 'duration_hours', o);
  const r = Math.max(1, Math.floor(e / 60));
  return t(r === 1 ? 'duration_min' : 'duration_mins', r);
}
function stageLabel(e) {
  const n = {
    downloading: 'stage_downloading',
    extracting: 'stage_extracting',
    encoding: 'stage_encoding',
    done: 'stage_done',
  }[e];
  return n ? t(n) : e || t('stage_working');
}
async function safeJson(e) {
  try {
    const n = await fetch(e, { method: 'GET' });
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
async function getActiveTabUrl() {
  return chrome.tabs
    ? new Promise((e) => {
        chrome.tabs.query({ active: !0, currentWindow: !0 }, (n) => {
          e((n && n[0] && n[0].url) || null);
        });
      })
    : null;
}
function isYouTubeWatchUrl(e) {
  return (
    typeof e == 'string' && /^https:\/\/(www\.)?youtube\.com\/watch\?/.test(e)
  );
}
function setProgress(e, n) {
  setHidden(els.progressBlock, !1),
    (els.progressStep.textContent = e || t('stage_working'));
  const o = Math.max(0, Math.min(100, Number(n) || 0));
  (els.progressPct.textContent = `${Math.round(o)}%`),
    (els.progressFill.style.width = `${o}%`);
}
function clearProgress() {
  setHidden(els.progressBlock, !0);
}
function renderOfflineState() {
  cache.launchTimeoutId ||
    (cache.seenAppRunning
      ? ((els.dlTitle.textContent = t('music_remover_isnt_running')),
        (els.dlSub.textContent = t('click_below_to_open')),
        setHidden(els.btnLaunchApp, !1),
        setHidden(els.dlPlatforms, !1),
        setHidden(els.dlFallbackHint, !0))
      : ((els.dlTitle.textContent = t('get_desktop_app')),
        (els.dlSub.textContent = t('desktop_app_intro')),
        setHidden(els.btnLaunchApp, !0),
        setHidden(els.dlPlatforms, !1),
        setHidden(els.dlFallbackHint, !0)));
}
async function maybeRefreshUpdate(e = !1) {
  const n = Date.now();
  if (!e && cache.updateInfo && n - cache.updateChecked < 60 * 60 * 1e3) return;
  const o = await safeJson(`${API}/api/update/check`);
  (cache.updateInfo = o), (cache.updateChecked = n);
}
function renderUpdateBanner() {
  const e = cache.updateInfo;
  e && e.available && e.latest_version
    ? ((els.updateVersions.textContent = `v${e.current_version} \u2192 v${e.latest_version}`),
      setHidden(els.cardUpdate, !1))
    : setHidden(els.cardUpdate, !0);
}
async function refresh() {
  const e = await safeJson(`${API}/health`);
  if (!e) {
    setStatusIcon('bad'),
      (els.statusTitle.textContent = t('desktop_app_not_running')),
      (els.statusSub.textContent = t('install_or_open')),
      (els.btnOpen.disabled = !0),
      (els.btnSettings.disabled = !0),
      clearProgress(),
      setHidden(els.cardVideo, !0),
      setHidden(els.cardUpdate, !0),
      setHidden(els.cardDownload, !1),
      renderOfflineState();
    return;
  }
  if (
    (setHidden(els.cardDownload, !0),
    (els.btnOpen.disabled = 1),
    (els.btnSettings.disabled = 1),
    cache.launchTimeoutId &&
      (clearTimeout(cache.launchTimeoutId),
      (cache.launchTimeoutId = null),
      (els.btnLaunchApp.textContent = t('open_music_remover')),
      (els.btnLaunchApp.disabled = !1)),
    !cache.seenAppRunning)
  ) {
    cache.seenAppRunning = !0;
    try {
      chrome.storage.local.set({ seen_app_running: !0 });
    } catch {}
  }
  if (
    (maybeRefreshUpdate()
      .then(renderUpdateBanner)
      .catch(() => {}),
    e.setup_done === !1)
  ) {
    setStatusIcon('warn'),
      (els.statusTitle.textContent = t('finishing_setup')),
      (els.statusSub.textContent = t('downloading_setup_files'));
    const r = await safeJson(`${API}/setup/status`);
    r &&
      setProgress(
        r.error ? `Error: ${r.error}` : r.step || t('stage_working'),
        r.progress
      ),
      setHidden(els.cardVideo, !0);
    return;
  }
  const n = e.job;
  n && n.status === 'processing'
    ? (setStatusIcon('busy'),
      (els.statusTitle.textContent = t('processing_video')),
      (els.statusSub.textContent = n.title || n.url || ''),
      setProgress(`${stageLabel(n.stage)}`, n.progress))
    : (setStatusIcon('good'),
      (els.statusTitle.textContent = t('music_remover_is_running')),
      (els.statusSub.textContent = t('open_youtube_to_use')),
      clearProgress());
  const o = await getActiveTabUrl();
  if (!isYouTubeWatchUrl(o)) {
    setHidden(els.cardVideo, !0);
    return;
  }
  if (n && n.status === 'processing' && n.url === o) {
    (els.videoTitle.textContent = t('processing_this_video')),
      (els.videoSub.textContent = `${stageLabel(n.stage)} \u2014 ${
        n.progress || 0
      }%`),
      setHidden(els.videoBadge, !0),
      setHidden(els.ttlRow, !0),
      setHidden(els.cardVideo, !1);
    return;
  }
  cache.lastTabUrl !== o &&
    ((cache.lastTabUrl = o),
    (cache.lookup = await safeJson(
      `${API}/api/lookup?url=${encodeURIComponent(o)}&media_type=audio`
    ))),
    cache.lookup && cache.lookup.cached
      ? ((els.videoTitle.textContent =
          cache.lookup.title || t('music_removed_ready')),
        (els.videoSub.textContent = t('use_toggle_to_play')),
        setHidden(els.videoBadge, !1),
        cache.lookup.remaining_seconds != null
          ? ((els.ttlRemaining.textContent = fmtRemaining(
              cache.lookup.remaining_seconds
            )),
            setHidden(els.ttlRow, !1))
          : setHidden(els.ttlRow, !0))
      : ((els.videoTitle.textContent = t('not_processed_yet')),
        (els.videoSub.textContent = t('use_toggle_to_start')),
        setHidden(els.videoBadge, !0),
        setHidden(els.ttlRow, !0)),
    setHidden(els.cardVideo, !1);
}
function startPolling() {
  stopPolling(), (pollTimer = setInterval(refresh, 1500));
}
function stopPolling() {
  pollTimer && (clearInterval(pollTimer), (pollTimer = null));
}
function applyI18n(e) {
  (document.documentElement.lang = e),
    (document.documentElement.dir = RTL_LANGS.has(e) ? 'rtl' : 'ltr'),
    document.querySelectorAll('[data-i18n]').forEach((o) => {
      const r = o.getAttribute('data-i18n'),
        s = t(r);
      s && s !== r && (o.textContent = s);
    });
  const n = document.getElementById('lang-select');
  n && (n.value = e);
}
let activeLang = 'en';
async function setLanguage(e) {
  e = normaliseLang(e);
  const n = await loadLocale(e);
  if (n) {
    (i18nMessages = n), (activeLang = e), setStoredLang(e), applyI18n(e);
    try {
      refresh();
    } catch {}
  }
}
(function () {
  (async () => {
    const l =
      (await getStoredLang()) || normaliseLang(chrome.i18n.getUILanguage());
    await setLanguage(l);
  })();
  const n = document.getElementById('lang-select');
  n && n.addEventListener('change', () => setLanguage(n.value));
  const o = document.getElementById('auto-remove-toggle');
  if (o) {
    try {
      chrome.storage.local.get(['mr_auto_remove'], (a) => {
        o.checked = !(a && a.mr_auto_remove === !1);
      });
    } catch {}
    o.addEventListener('change', () => {
      if (!o.checked) {
        o.checked = true; // Force the visual toggle back on
      }
      try {
        chrome.storage.local.set({ mr_auto_remove: true });
      } catch {}
    });
  }
  const r = document.getElementById('pause-until-toggle');
  if (r) {
    try {
      chrome.storage.local.get(['mr_pause_until_clean'], (a) => {
        r.checked = !(a && a.mr_pause_until_clean === !1);
      });
    } catch {}
    r.addEventListener('change', () => {
      try {
        chrome.storage.local.set({ mr_pause_until_clean: r.checked });
      } catch {}
    });
  }
  const s = document.getElementById('mute-ads-toggle');
  if (s) {
    try {
      chrome.storage.local.get(['mr_mute_ads'], (a) => {
        s.checked = !(a && a.mr_mute_ads === !1);
      });
    } catch {}
    s.addEventListener('change', () => {
      try {
        chrome.storage.local.set({ mr_mute_ads: s.checked });
      } catch {}
    });
  }
  try {
    const a = chrome.runtime.getManifest();
    a && a.version && (els.extVersion.textContent = `v${a.version}`);
  } catch {}
  els.btnOpen.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API}/app` }), window.close();
  }),
    els.btnSettings.addEventListener('click', () => {
      chrome.tabs.create({ url: `${API}/app/settings` }), window.close();
    }),
    els.btnUpdate.addEventListener('click', () => {
      chrome.tabs.create({ url: `${API}/app/settings` }), window.close();
    }),
    els.btnLaunchApp.addEventListener('click', () => {
      try {
        chrome.tabs.create({ url: 'musicremover://open', active: !1 });
      } catch {
        const l = document.createElement('a');
        (l.href = 'musicremover://open'),
          (l.style.display = 'none'),
          document.body.appendChild(l),
          l.click(),
          l.remove();
      }
      (els.btnLaunchApp.textContent = t('opening')),
        (els.btnLaunchApp.disabled = !0),
        cache.launchTimeoutId && clearTimeout(cache.launchTimeoutId),
        (cache.launchTimeoutId = setTimeout(() => {
          (cache.launchTimeoutId = null),
            (els.btnLaunchApp.textContent = t('open_music_remover')),
            (els.btnLaunchApp.disabled = !1),
            (els.dlTitle.textContent = t('couldnt_reach_short')),
            (els.dlSub.textContent = t('install_or_reinstall')),
            setHidden(els.dlFallbackHint, !1),
            setHidden(els.dlPlatforms, !1);
        }, 5e3));
    }),
    els.btnRefresh.addEventListener('click', () => {
      els.btnRefresh.classList.add('spin'),
        (cache.updateChecked = 0),
        (cache.lastTabUrl = null),
        refresh().finally(() =>
          setTimeout(() => els.btnRefresh.classList.remove('spin'), 400)
        );
    }),
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopPolling() : startPolling();
    });
  try {
    chrome.storage.local.get(['seen_app_running'], (a) => {
      (cache.seenAppRunning = !!(a && a.seen_app_running)),
        els.cardDownload.classList.contains('hidden') || renderOfflineState();
    });
  } catch {}
  try {
    chrome.runtime.sendMessage({ type: 'refresh-badge' });
  } catch {}
  refresh(), startPolling();
})();
