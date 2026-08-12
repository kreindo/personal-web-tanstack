const API = 'http://localhost:56348',
  POLL_INTERVAL = 2e3,
  BTN_ID = 'mr-remove-btn',
  RESHOW_ID = 'mr-reshow-btn',
  TOAST_ID = 'mr-toast',
  TTL_SELECT_ID = 'mr-ttl-select',
  TTL_OPTIONS = [
    { value: 'never', label: 'Never' },
    { value: '1d', label: '1 day' },
    { value: '3d', label: '3 days' },
    { value: '7d', label: '7 days' },
    { value: '15d', label: '15 days' },
    { value: '30d', label: '30 days' },
    { value: '6m', label: '6 months' },
    { value: '1y', label: '1 year' },
  ];
let MR_MSG = null;
const MR_SUPPORTED = ['en', 'ar', 'ur', 'bn', 'hi', 'tr', 'id'];
function mrSubstitute(e, n, o) {
  let r = e;
  return (
    n &&
      Object.keys(n).forEach((a) => {
        const i = n[a];
        let c = i && i.content;
        typeof c == 'string' &&
          (c = c.replace(/\$(\d+)/g, (m, f) =>
            o[+f - 1] != null ? String(o[+f - 1]) : ''
          )),
          (r = r.replace(new RegExp('\\$' + a + '\\$', 'gi'), c || ''));
      }),
    (r = r.replace(/\$(\d+)/g, (a, i) =>
      o[+i - 1] != null ? String(o[+i - 1]) : ''
    )),
    r
  );
}
function t(e, ...n) {
  const o = MR_MSG && MR_MSG[e];
  if (o && typeof o.message == 'string')
    return mrSubstitute(o.message, o.placeholders, n);
  try {
    const r = chrome.i18n.getMessage(e, n.length ? n.map(String) : void 0);
    if (r) return r;
  } catch {}
  return e;
}
async function mrLoadLang() {
  try {
    const e = await new Promise((a) => {
        try {
          chrome.storage.local.get(['mr_lang'], (i) => a(i && i.mr_lang));
        } catch {
          a(null);
        }
      }),
      n = (chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) || 'en';
    let o = (e || n || 'en').toLowerCase().split(/[-_]/)[0];
    if ((MR_SUPPORTED.includes(o) || (o = 'en'), o === 'en')) {
      MR_MSG = null;
      return;
    }
    const r = await fetch(chrome.runtime.getURL(`_locales/${o}/messages.json`));
    r.ok && (MR_MSG = await r.json());
  } catch {}
}
mrLoadLang();
let autoRemove = !0,
  pauseUntilClean = !0,
  muteAds = !0;
try {
  chrome.storage.local.get(
    ['mr_auto_remove', 'mr_pause_until_clean', 'mr_mute_ads'],
    (e) => {
      e &&
        typeof e.mr_auto_remove == 'boolean' &&
        (autoRemove = e.mr_auto_remove),
        e &&
          typeof e.mr_pause_until_clean == 'boolean' &&
          (pauseUntilClean = e.mr_pause_until_clean),
        e && typeof e.mr_mute_ads == 'boolean' && (muteAds = e.mr_mute_ads);
    }
  );
} catch {}
try {
  chrome.storage.onChanged.addListener((e, n) => {
    if (
      n === 'local' &&
      (e.mr_lang && mrLoadLang(),
      e.mr_auto_remove && (autoRemove = !!e.mr_auto_remove.newValue),
      e.mr_pause_until_clean &&
        (pauseUntilClean = !!e.mr_pause_until_clean.newValue),
      e.mr_mute_ads)
    ) {
      muteAds = !!e.mr_mute_ads.newValue;
      try {
        _syncAdMute();
      } catch {}
    }
  });
} catch {}
let appRunning = !1,
  currentVideoUrl = null,
  currentJobId = null,
  pollTimer = null,
  audioState = null,
  audioGen = 0,
  conflictToast = null,
  _autoEngagedUrl = null,
  _suppressToast = !1,
  buttonInjected = !1,
  observerDebounce = null,
  observer = null;
const HEAL_INTERVAL_MS = 1500;
let healTimer = null;
function isYouTubeWatchUrl(e) {
  return (
    typeof e == 'string' && /^https:\/\/(www\.)?youtube\.com\/watch\?/.test(e)
  );
}
async function init() {
  (currentVideoUrl = location.href),
    isYouTubeWatchUrl(location.href) && (await activate());
}
async function activate() {
  const e = await checkHealth();
  (appRunning = !!e),
    healTimer || startHealing(),
    injectButton(),
    observer || observePlayer(),
    appRunning && updateButtonHints(e);
}
function startHealing() {
  stopHealing(), (healTimer = setInterval(healButton, HEAL_INTERVAL_MS));
}
function stopHealing() {
  healTimer && (clearInterval(healTimer), (healTimer = null));
}
async function healButton() {
  if (
    (appRunning ||
      ((await checkHealth()) &&
        ((appRunning = !0), observer || observePlayer())),
    !!isYouTubeWatchUrl(location.href) &&
      !document.getElementById(BTN_ID) &&
      !document.querySelector('.ad-showing') &&
      document.querySelector('.ytp-right-controls') &&
      ((buttonInjected = !1),
      injectButton(),
      document.getElementById(BTN_ID) && !audioState))
  ) {
    const e = await checkHealth();
    e && updateButtonHints(e);
  }
}
async function checkHealth() {
  try {
    const e = await fetch(`${API}/health`, { method: 'GET' });
    return e.ok ? await e.json() : null;
  } catch {
    return null;
  }
}
async function lookupCache(e) {
  try {
    const n = await fetch(
      `${API}/api/lookup?url=${encodeURIComponent(e)}&media_type=audio`
    );
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
async function fetchManifest(e) {
  try {
    const n = await fetch(`${API}/api/manifest/${e}`);
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
async function fetchChunkArrayBuffer(e, n) {
  const o = await fetch(`${API}/audio/${e}/chunk/${n}`);
  if (!o.ok) throw new Error(`chunk ${n} HTTP ${o.status}`);
  return await o.arrayBuffer();
}
async function prioritizeAtPosition(e, n, o) {
  try {
    await fetch(`${API}/api/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: e, position_s: n, playing: o !== !1 }),
    });
  } catch {}
}
function _startPositionTimer(e) {
  e.positionTimer && clearInterval(e.positionTimer),
    (e.positionTimer = setInterval(() => {
      if (audioState !== e || !e.jobId) return;
      const n = e.video;
      !n ||
        !isFinite(n.currentTime) ||
        (prioritizeAtPosition(e.jobId, n.currentTime, !n.paused),
        (e.lastSentPosition = n.currentTime));
    }, PRIORITIZE_INTERVAL_MS));
}
function _stopPositionTimer(e) {
  if (e && e.positionTimer) {
    try {
      clearInterval(e.positionTimer);
    } catch {}
    e.positionTimer = null;
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  const e = audioState;
  if (!e || !e.jobId || !e.video) return;
  const n = e.video.currentTime;
  isFinite(n) &&
    (Math.abs(n - e.lastSentPosition) < 0.5 ||
      (prioritizeAtPosition(e.jobId, n), (e.lastSentPosition = n)));
});
const OVERLAY_ID = 'mr-chunks-overlay';
function _ensureOverlayStyles() {
  if (document.getElementById('mr-overlay-styles')) return;
  const e = document.createElement('style');
  (e.id = 'mr-overlay-styles'),
    (e.textContent = `
    #${OVERLAY_ID} {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 100%;
      height: 4px;
      display: flex;
      pointer-events: none;
      z-index: 25;
      gap: 0;
      /* Dark, solid track so the bar is always visible \u2014 including
         the pending state where individual segments are translucent.
         Without this, an all-pending bar reads as "no bar at all"
         against YouTube's already-dark player chrome. */
      background: rgba(0, 0, 0, .55);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, .12);
      border-radius: 2px;
      overflow: hidden;
    }
    #${OVERLAY_ID} .mr-chunk-seg {
      height: 100%;
      background: rgba(255, 255, 255, .12);   /* pending \u2014 faint over the dark track */
      transition: background .25s ease;
      min-width: 1px;
      flex-shrink: 0;
      border-right: 1px solid rgba(0, 0, 0, .35);
      box-sizing: border-box;
    }
    #${OVERLAY_ID} .mr-chunk-seg:last-child {
      border-right: none;
    }
    #${OVERLAY_ID} .mr-chunk-seg.mr-ready {
      background: #4ade80;                    /* green \u2014 chunk is cleaned */
    }
    #${OVERLAY_ID} .mr-chunk-seg.mr-processing {
      /* striped animated pattern so the in-flight chunk is obvious
         even when there's only one of them and the rest are pending */
      background: repeating-linear-gradient(
        45deg,
        rgba(74, 222, 128, .85) 0 6px,
        rgba(74, 222, 128, .35) 6px 12px
      );
      animation: mr-chunk-busy 1.2s linear infinite;
    }
    #${OVERLAY_ID} .mr-chunk-seg.mr-failed {
      background: #ff6b6b;
    }
    @keyframes mr-chunk-busy {
      from { background-position: 0 0; }
      to   { background-position: 17px 0; }
    }
  `),
    document.head.appendChild(e);
}
function _updateChunkOverlay(e) {
  if (!e || !e.chunks || !e.chunks.length) return;
  const n = e.total_duration_s || 0;
  if (n <= 0) return;
  audioState && (audioState.lastManifest = e);
  const o = document.querySelector('.ytp-progress-bar-container');
  if (!o) return;
  _ensureOverlayStyles();
  let r = document.getElementById(OVERLAY_ID);
  r ||
    ((r = document.createElement('div')),
    (r.id = OVERLAY_ID),
    getComputedStyle(o).position === 'static' &&
      (o.style.position = 'relative'),
    o.appendChild(r));
  const a = r.children;
  if (a.length !== e.chunks.length) {
    r.innerHTML = '';
    for (const i of e.chunks) {
      const c = document.createElement('div');
      c.className = 'mr-chunk-seg';
      const m = ((i.end_s - i.start_s) / n) * 100;
      (c.style.flexBasis = m + '%'),
        _setSegClass(c, i.status),
        (c.title = `Chunk ${i.idx + 1}/${e.chunks.length} (${_fmtTime(
          i.start_s
        )}\u2013${_fmtTime(i.end_s)}) \u2014 ${i.status}`),
        r.appendChild(c);
    }
  } else
    for (let i = 0; i < e.chunks.length; i++) {
      const c = e.chunks[i],
        m = a[i];
      _setSegClass(m, c.status),
        (m.title = `Chunk ${c.idx + 1}/${e.chunks.length} (${_fmtTime(
          c.start_s
        )}\u2013${_fmtTime(c.end_s)}) \u2014 ${c.status}`);
    }
  if (audioState && audioState.seekWaitIdx != null) {
    const i = audioState.seekWaitIdx,
      c = e.chunks.find((m) => m.idx === i);
    if (!c || c.status === 'ready' || c.status === 'failed')
      audioState.seekWaitIdx = null;
    else {
      const m = e.chunks.findIndex((h) => h.idx === i),
        f = m >= 0 ? r.children[m] : null;
      f && _setSegClass(f, 'processing');
    }
  }
}
function _markSeekProcessing(e) {
  if (!audioState) return;
  const n = audioState.lastManifest;
  if (!n || !n.chunks || !n.chunks.length) return;
  const o = n.chunks.find((a) => a.start_s <= e && e < a.end_s);
  if (!o || o.status === 'ready') {
    audioState.seekWaitIdx = null;
    return;
  }
  audioState.seekWaitIdx = o.idx;
  const r = document.getElementById(OVERLAY_ID);
  if (r) {
    const a = n.chunks.findIndex((c) => c.idx === o.idx),
      i = a >= 0 ? r.children[a] : null;
    i && _setSegClass(i, 'processing');
  }
}
function _coveredReady(e, n) {
  if (!e || !e.chunks) return !1;
  for (const o of e.chunks.values())
    if (o.startS <= n && n < o.endS && o.ready) return !0;
  return !1;
}
const HOLD_MAX_WAIT_MS = 3e4;
function _releaseHold(e, n) {
  if (
    ((e.holding = !1),
    (e.holdSince = 0),
    _hideHoldSpinner(),
    !n || !e.video || !e.video.paused)
  )
    return;
  const o = e.video.play();
  o &&
    o.catch &&
    o.catch(() => {
      audioState === e &&
        pauseUntilClean &&
        !e.holdWaived &&
        !_coveredReady(e, e.video.currentTime) &&
        ((e.holding = !0),
        e.holdSince || (e.holdSince = Date.now()),
        _showHoldSpinner());
    });
}
function _syncAdMute() {
  const e = audioState;
  if (!e || !e.video) return;
  const n = e.video;
  muteAds && isAdShowing()
    ? (e._adMuted || ((e._adMutedPrev = n.muted), (e._adMuted = !0)),
      n.muted || ((e.muteGuard = !0), (n.muted = !0)))
    : e._adMuted &&
      ((e._adMuted = !1),
      n.muted !== e._adMutedPrev &&
        ((e.muteGuard = !0), (n.muted = e._adMutedPrev)));
}
function _syncHold() {
  const e = audioState;
  if (!e || !e.jobId || !e.video) return;
  const n = e.video;
  if (!pauseUntilClean) {
    _releaseHold(e, !1);
    return;
  }
  if (isAdShowing()) {
    if (e.holding) _releaseHold(e, !0);
    else if ((_hideHoldSpinner(), n.paused && !e.userPaused))
      try {
        n.play();
      } catch {}
    return;
  }
  const o = n.currentTime;
  if (_coveredReady(e, o)) {
    (e.holdWaived = !1),
      (e.holdWaivedKey = null),
      e.holding ? _releaseHold(e, !0) : _hideHoldSpinner();
    return;
  }
  const r = e.lastManifest;
  let a = null;
  if (
    r &&
    Array.isArray(r.chunks) &&
    r.chunks.length &&
    ((a = r.chunks.find((c) => c.start_s <= o && o < c.end_s)),
    !a || a.status === 'failed')
  ) {
    _releaseHold(e, !1);
    return;
  }
  const i = a ? a.start_s : Math.floor(o);
  if (e.holdWaived && e.holdWaivedKey === i) {
    _hideHoldSpinner();
    return;
  }
  if (
    (e.holdWaived && ((e.holdWaived = !1), (e.holdWaivedKey = null)),
    e.holding && e.holdSince && Date.now() - e.holdSince > HOLD_MAX_WAIT_MS)
  ) {
    (e.holdWaived = !0), (e.holdWaivedKey = i), _releaseHold(e, !0);
    return;
  }
  if (
    (e.holding || ((e.holding = !0), (e.holdSince = Date.now())), !n.paused)
  ) {
    try {
      n.pause();
    } catch {}
    _markSeekProcessing(o);
  }
  _showHoldSpinner();
}
const HOLD_SPINNER_ID = 'mr-hold-spinner';
function _showHoldSpinner() {
  if (document.getElementById(HOLD_SPINNER_ID)) return;
  const e =
    document.querySelector('.html5-video-player') ||
    (audioState && audioState.video && audioState.video.parentElement);
  if (!e) return;
  _ensureHoldSpinnerStyles(),
    getComputedStyle(e).position === 'static' &&
      (e.style.position = 'relative');
  const n = chrome.runtime.getURL('icons/icon-128.png'),
    o = document.createElement('div');
  (o.id = HOLD_SPINNER_ID),
    (o.innerHTML =
      '<div class="mr-hold-box"><div class="mr-hold-spinner-wrap"><div class="mr-hold-ring"></div><img class="mr-hold-logo" src="' +
      n +
      '" alt="" /></div><div class="mr-hold-text">' +
      esc(t('toast_removing_music')) +
      '</div></div>'),
    e.appendChild(o);
}
function _hideHoldSpinner() {
  const e = document.getElementById(HOLD_SPINNER_ID);
  e && e.remove();
}
function _ensureHoldSpinnerStyles() {
  if (document.getElementById('mr-hold-styles')) return;
  const e = document.createElement('style');
  (e.id = 'mr-hold-styles'),
    (e.textContent = `
    #${HOLD_SPINNER_ID} {
      position: absolute; inset: 0; z-index: 60; display: flex;
      align-items: center; justify-content: center; pointer-events: none;
      background: rgba(0,0,0,0.35);
    }
    #${HOLD_SPINNER_ID} .mr-hold-box {
      display: flex; flex-direction: column; align-items: center; gap: 14px;
    }
    #${HOLD_SPINNER_ID} .mr-hold-spinner-wrap {
      position: relative; width: 56px; height: 56px;
      display: flex; align-items: center; justify-content: center;
    }
    #${HOLD_SPINNER_ID} .mr-hold-ring {
      position: absolute; inset: 0;
      width: 56px; height: 56px; border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.25);
      border-top-color: #1f7be8;
      animation: mrHoldSpin 0.9s linear infinite;
      box-sizing: border-box;
    }
    #${HOLD_SPINNER_ID} .mr-hold-logo {
      width: 26px; height: 26px; border-radius: 50%;
      object-fit: contain; pointer-events: none; z-index: 1;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));
    }
    @keyframes mrHoldSpin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) {
      #${HOLD_SPINNER_ID} .mr-hold-ring { animation-duration: 2.2s; }
    }
  `),
    (document.head || document.documentElement).appendChild(e);
}
function _setSegClass(e, n) {
  e.classList.remove('mr-ready', 'mr-processing', 'mr-failed'),
    n === 'ready'
      ? e.classList.add('mr-ready')
      : n === 'processing'
      ? e.classList.add('mr-processing')
      : n === 'failed' && e.classList.add('mr-failed');
}
function _fmtTime(e) {
  e = Math.max(0, Math.round(e));
  const n = Math.floor(e / 60),
    o = e % 60;
  return `${n}:${o.toString().padStart(2, '0')}`;
}
function _removeChunkOverlay() {
  const e = document.getElementById(OVERLAY_ID);
  e && e.remove();
}
async function updateButtonHints(e) {
  const n = document.getElementById(BTN_ID);
  if (!n) return;
  if (e && e.setup_done === !1) {
    setBtnState('loading'), (n.title = t('title_finishing_setup'));
    return;
  }
  if (
    e &&
    e.job &&
    e.job.status === 'processing' &&
    e.job.url === currentVideoUrl &&
    e.job.job_id
  ) {
    (currentJobId = e.job.job_id),
      setBtnState('loading'),
      (n.title = t('title_removal_progress')),
      showProcessingToast(e.job.progress || 0, e.job.stage || 'downloading'),
      enterStreamingMode(currentJobId, currentVideoUrl),
      startPolling(currentJobId, currentVideoUrl);
    return;
  }
  const o = await lookupCache(currentVideoUrl);
  o && o.cached
    ? (setTtlDropdown({ cached: !0, ttl: o.ttl }),
      audioState ||
        ((currentJobId = o.job_id),
        (n.title = t('title_audio_ready')),
        o.kind === 'chunks'
          ? enterStreamingMode(o.job_id, currentVideoUrl)
          : await downloadAndPlay(o.job_id, currentVideoUrl)))
    : (setTtlDropdown({ cached: !1 }),
      audioState ||
        (setBtnState('off'),
        (n.title = t('title_remove_music')),
        autoRemove &&
          appRunning &&
          isYouTubeWatchUrl(currentVideoUrl) &&
          _autoEngagedUrl !== currentVideoUrl &&
          ((_autoEngagedUrl = currentVideoUrl),
          (_suppressToast = !0),
          onButtonClick())));
}
function observePlayer() {
  const e = document.body;
  (observer = new MutationObserver(() => {
    clearTimeout(observerDebounce),
      (observerDebounce = setTimeout(() => {
        document.getElementById(BTN_ID) ||
          ((buttonInjected = !1),
          injectButton(),
          document.getElementById(BTN_ID) &&
            !audioState &&
            checkHealth().then((n) => {
              n && updateButtonHints(n);
            }));
      }, 300));
  })),
    observer.observe(e, { childList: !0, subtree: !0 });
}
function injectButton() {
  if (document.getElementById(BTN_ID)) {
    buttonInjected = !0;
    return;
  }
  if (buttonInjected) return;
  const e = document.querySelector('.ytp-right-controls');
  if (!e || document.querySelector('.ad-showing')) return;
  buttonInjected = !0;
  const n = document.createElement('button');
  (n.id = BTN_ID),
    (n.className = 'mr-btn'),
    n.setAttribute('role', 'switch'),
    n.setAttribute('aria-checked', 'false'),
    (n.title = t('title_remove_music')),
    (n.innerHTML = `
    <span class="mr-icon">${svgIcon()}</span>
    <span class="mr-track">
      <span class="mr-thumb"></span>
    </span>`),
    n.addEventListener('click', () => {
      (_suppressToast = !1), onButtonClick();
    });
  const o = document.createElement('span');
  o.id = 'mr-ttl-wrap';
  const r = document.createElement('select');
  (r.id = TTL_SELECT_ID),
    (r.className = 'mr-ttl'),
    (r.title = t('title_cache_duration'));
  let a = `<option value="" disabled>${esc(t('ttl_prompt'))}</option>`;
  for (const c of TTL_OPTIONS)
    a += `<option value="${c.value}">${esc(t('ttl_' + c.value))}</option>`;
  (a += `<option value="__delete__" disabled>${esc(t('ttl_delete'))}</option>`),
    (r.innerHTML = a),
    r.addEventListener('change', onTtlSelectChange),
    ['click', 'mousedown', 'keydown'].forEach((c) => {
      r.addEventListener(c, (m) => m.stopPropagation());
    }),
    o.appendChild(r);
  const i = document.createElement('button');
  (i.id = RESHOW_ID),
    (i.className = 'mr-reshow'),
    (i.title = t('title_show_progress')),
    (i.style.display = jobActive ? 'inline-flex' : 'none'),
    (i.innerHTML = reshowIcon()),
    i.addEventListener('click', onReshowClick),
    e.insertBefore(n, e.firstChild),
    e.insertBefore(i, n),
    e.insertBefore(o, n.nextSibling),
    injectStyles(),
    setBtnState('off'),
    setTtlDropdown({ cached: !1 });
}
function svgIcon() {
  return `<img class="mr-logo" src="${chrome.runtime.getURL(
    'icons/toggle.png'
  )}" alt="" width="24" height="24" draggable="false" />`;
}
function reshowIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3"  y="10" width="4" height="11" rx="1"/>
      <rect x="10" y="4"  width="4" height="17" rx="1"/>
      <rect x="17" y="13" width="4" height="8"  rx="1"/>
    </svg>`;
}
let jobActive = !1,
  lastJobProgress = { pct: 0, stage: 'downloading' },
  processingToastDismissed = !1;
const PROCESSING_TOAST_MS = 3e3;
function setJobActive(e) {
  e && !jobActive && (processingToastDismissed = !1), (jobActive = e);
  const n = document.getElementById(RESHOW_ID);
  n && (n.style.display = e ? 'inline-flex' : 'none');
}
function onReshowClick() {
  (processingToastDismissed = !1),
    showProcessingToast(lastJobProgress.pct, lastJobProgress.stage);
}
function setBtnState(e) {
  const n = document.getElementById(BTN_ID);
  n &&
    (n.classList.remove('mr-state-off', 'mr-state-on', 'mr-state-loading'),
    n.classList.add('mr-state-' + e),
    n.setAttribute('aria-checked', e === 'on' ? 'true' : 'false'),
    (n.disabled = e === 'loading'));
}
let preferredTtl = '3d';
function setTtlDropdown({ cached: e, ttl: n }) {
  const o = document.getElementById(TTL_SELECT_ID);
  if (!o) return;
  o.classList.toggle('mr-ttl-cached', !!e);
  const r = o.querySelector('option[value="__delete__"]');
  r && (r.disabled = !e);
  let a = e && n ? n : preferredTtl;
  TTL_OPTIONS.some((i) => i.value === a) || (a = '3d'),
    (o.value = a),
    (o.title = t(e ? 'title_cached_change' : 'title_will_cache', labelFor(a)));
}
function labelFor(e) {
  const n = TTL_OPTIONS.find((o) => o.value === e);
  return n ? t('ttl_' + n.value) : e;
}
async function onTtlSelectChange(e) {
  const o = e.currentTarget.value,
    r = location.href;
  if (!r.includes('youtube.com/watch')) return;
  if (o === '__delete__') {
    if (!confirm(t('confirm_delete_cached'))) {
      const i = await lookupCache(r);
      setTtlDropdown({ cached: !!(i && i.cached), ttl: i && i.ttl });
      return;
    }
    try {
      await apiFetch('POST', '/api/cache/delete', {
        url: r,
        media_type: 'audio',
      }),
        stopAudio(),
        setBtnState('off'),
        setTtlDropdown({ cached: !1 }),
        showSimpleToast(t('toast_cached_deleted'));
    } catch {
      showSimpleToast(t('toast_delete_failed'));
    }
    return;
  }
  preferredTtl = o;
  const a = await lookupCache(r);
  if (a && a.cached)
    try {
      await apiFetch('POST', '/api/cache/ttl', {
        url: r,
        media_type: 'audio',
        ttl: o,
      }),
        setTtlDropdown({ cached: !0, ttl: o }),
        showSimpleToast(t('toast_cache_set', labelFor(o)));
    } catch {
      showSimpleToast(t('toast_cache_update_failed'));
    }
  else
    setTtlDropdown({ cached: !1 }),
      showSimpleToast(t('toast_will_cache', labelFor(o)));
}
function injectStyles() {
  if (document.getElementById('mr-styles')) return;
  const e = document.createElement('style');
  (e.id = 'mr-styles'),
    (e.textContent = `
    #${BTN_ID} {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 6px;
      height: 100%;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      vertical-align: top;
    }
    #${BTN_ID}:disabled { cursor: wait; }
    #${RESHOW_ID} {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 6px;
      height: 100%;
      align-items: center;
      vertical-align: top;
      color: rgba(255,255,255,.85);
    }
    #${RESHOW_ID}:hover { color: #fff; }
    #${BTN_ID} .mr-icon {
      display: inline-flex;
      color: rgba(255,255,255,.85);
      transition: color .2s ease;
    }
    #${BTN_ID}:hover .mr-icon { color: #fff; }
    #${BTN_ID} .mr-track {
      position: relative;
      width: 30px;
      height: 16px;
      border-radius: 999px;
      background: rgba(255,255,255,.22);
      transition: background .2s ease;
      display: inline-flex;
      align-items: center;
    }
    #${BTN_ID} .mr-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.45);
      transition: left .2s ease, background .2s ease;
    }
    /* ON: blue track, thumb on the right, icon brightens to the accent color */
    #${BTN_ID}.mr-state-on .mr-track { background: #3ea6ff; }
    #${BTN_ID}.mr-state-on .mr-thumb { left: 16px; }
    #${BTN_ID}.mr-state-on .mr-icon  { color: #3ea6ff; }
    /* OFF \u2014 neutral state, hover lightens the track slightly */
    #${BTN_ID}.mr-state-off .mr-track { background: rgba(255,255,255,.22); }
    #${BTN_ID}.mr-state-off:hover .mr-track { background: rgba(255,255,255,.32); }
    /* LOADING \u2014 pulsing blue track to signal in-progress work */
    #${BTN_ID}.mr-state-loading .mr-track { background: #3ea6ff; opacity: .6; animation: mr-pulse 1.2s ease-in-out infinite; }
    #${BTN_ID}.mr-state-loading .mr-thumb { left: 9px; }
    @keyframes mr-pulse { 0%,100% { opacity: .45; } 50% { opacity: .85; } }

    /* Cache-duration dropdown */
    #mr-ttl-wrap {
      display: inline-flex;
      align-items: center;
      height: 100%;
      vertical-align: top;
      margin: 0 4px;
    }
    #${TTL_SELECT_ID} {
      appearance: none;
      -webkit-appearance: none;
      background: rgba(255,255,255,.08);
      color: #fff;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 4px;
      padding: 2px 18px 2px 8px;
      font-size: 11px;
      font-family: inherit;
      cursor: pointer;
      height: 22px;
      line-height: 1;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='white'><path d='M6 8L0 0h12z' opacity='.7'/></svg>");
      background-repeat: no-repeat;
      background-position: right 5px center;
      background-size: 8px 6px;
      transition: background-color .15s, border-color .15s, opacity .15s;
    }
    #${TTL_SELECT_ID}:hover  { background-color: rgba(255,255,255,.16); }
    #${TTL_SELECT_ID}:focus  { outline: none; border-color: #3ea6ff; }
    #${TTL_SELECT_ID}.mr-ttl-cached { border-color: rgba(62,166,255,.65); color: #cfe7ff; }
    #${TTL_SELECT_ID}:disabled { opacity: .55; cursor: not-allowed; }
    #${TTL_SELECT_ID} option { background: #1c1c1c; color: #eee; }
    #${TTL_SELECT_ID} option:disabled { color: #666; }

    .mr-toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a1a;
      color: #e8e8e8;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      z-index: 99999;
      box-shadow: 0 4px 20px rgba(0,0,0,.6);
      max-width: 340px;
      text-align: center;
    }
    .mr-toast-msg { margin-bottom: 10px; }
    .mr-toast-btns { display: flex; gap: 8px; justify-content: center; }
    .mr-toast-btn {
      background: #242424;
      border: 1px solid #444;
      color: #e8e8e8;
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      cursor: pointer;
      transition: background .15s;
    }
    .mr-toast-btn:hover { background: #333; }
    .mr-toast-btn.mr-primary { background: #3ea6ff; border-color: #3ea6ff; color: #fff; }
    .mr-toast-btn.mr-primary:hover { background: #5db8ff; }
    .mr-toast.mr-toast-permission { max-width: 380px; text-align: left; padding: 16px 18px; }
    .mr-toast-permission .mr-toast-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 10px; }
    .mr-toast-permission .mr-toast-body { font-size: 12px; line-height: 1.5; color: #cfcfcf; }
    .mr-toast-permission .mr-toast-help { margin: 0 0 10px; }
    .mr-toast-permission .mr-toast-secondary { margin: 0; color: #888; font-size: 11px; }
    .mr-toast-permission .mr-toast-secondary a { color: #3ea6ff; text-decoration: none; }
    .mr-toast-permission .mr-toast-secondary a:hover { text-decoration: underline; }
    .mr-toast-permission .mr-toast-btns { margin-top: 12px; justify-content: flex-end; }
    .mr-toast-progress { margin-top: 10px; font-size: 12px; color: #888; }
    .mr-toast-bar-wrap { height: 4px; background: #333; border-radius: 2px; margin-top: 6px; }
    .mr-toast-bar { height: 100%; background: #3ea6ff; border-radius: 2px; transition: width .4s ease; }

    /* Hide extension UI elements */
    #${BTN_ID}, #${RESHOW_ID}, #mr-ttl-wrap {
      display: none !important;
    }

  `),
    document.head.appendChild(e);
}
async function onButtonClick() {
  const e = document.getElementById(BTN_ID);
  if (audioState) {
    apiFetch('POST', '/cancel').catch(() => {});
    const o = !!audioState.holding,
      r = audioState.video;
    if (
      (stopAudio(),
      stopPolling(),
      setJobActive(!1),
      setBtnState('off'),
      e && (e.title = t('title_remove_music')),
      showSimpleToast(t('toast_original_restored')),
      o && r && r.paused)
    )
      try {
        r.play().catch(() => {});
      } catch {}
    return;
  }
  const n = location.href;
  if (n.includes('youtube.com/watch')) {
    setBtnState('loading');
    try {
      const o = await lookupCache(n);
      if (o && o.cached) {
        (currentJobId = o.job_id),
          o.kind === 'chunks'
            ? enterStreamingMode(o.job_id, n)
            : await downloadAndPlay(o.job_id, n);
        return;
      }
      const r = await apiFetch('POST', '/process', {
        url: n,
        media_type: 'audio',
        ttl: preferredTtl,
      });
      if (r.status === 'accepted') {
        if (((currentJobId = r.job_id), pauseUntilClean && !isAdShowing())) {
          const a = document.querySelector('video');
          if (a && !a.paused)
            try {
              a.pause();
            } catch {}
        }
        showProcessingToast(0, 'starting'),
          enterStreamingMode(currentJobId, n),
          startPolling(currentJobId, n);
      } else if (r.status === 'cached')
        (currentJobId = r.job_id), await downloadAndPlay(r.job_id, n);
      else if (r.status === 'busy')
        setBtnState('off'),
          r.url === n && r.job_id
            ? ((currentJobId = r.job_id),
              setBtnState('loading'),
              showProcessingToast(0, 'resuming'),
              enterStreamingMode(currentJobId, n),
              startPolling(currentJobId, n))
            : showConflictToast(n);
      else if (r.status === 'setup_pending') {
        setBtnState('off');
        const a = (r.setup && r.setup.progress) || 0;
        showSimpleToast(t('toast_first_run', a), 5e3);
      } else setBtnState('off'), showSimpleToast(t('toast_unexpected'));
    } catch (o) {
      if ((setBtnState('off'), o && o.status === 423)) {
        showUpdateRequiredToast();
        return;
      }
      showPermissionToast();
    }
  }
}
function startPolling(e, n) {
  stopPolling(), (pollTimer = setTimeout(() => doPoll(e, n), 2e3));
}
async function doPoll(e, n) {
  try {
    const o = await apiFetch('GET', `/status/${e}`);
    if (o.status === 'processing')
      updateProcessingToast(o.progress, o.stage),
        (pollTimer = setTimeout(() => doPoll(e, n), 2e3));
    else if (o.status === 'completed') {
      stopPolling(),
        setJobActive(!1),
        hideToast(),
        (!audioState || audioState.jobId !== e) &&
          (await downloadAndPlay(e, n));
      const r = await lookupCache(n);
      r && r.cached && setTtlDropdown({ cached: !0, ttl: r.ttl });
    } else
      o.status === 'failed'
        ? (stopPolling(),
          setJobActive(!1),
          setBtnState('off'),
          hideToast(),
          showRetryToast(t('toast_processing_failed')))
        : (stopPolling(), setJobActive(!1), setBtnState('off'), hideToast());
  } catch {
    pollTimer = setTimeout(() => doPoll(e, n), 2e3 * 1.5);
  }
}
function stopPolling() {
  pollTimer && (clearTimeout(pollTimer), (pollTimer = null));
}
function armCtxResume(e, n) {
  if (e.state !== 'suspended') return;
  const o = () => {
    if (e.state === 'suspended')
      try {
        e.resume().then(() => {
          n && n();
        });
      } catch {}
    document.removeEventListener('click', o, !0),
      document.removeEventListener('keydown', o, !0),
      document.removeEventListener('touchstart', o, !0);
  };
  document.addEventListener('click', o, !0),
    document.addEventListener('keydown', o, !0),
    document.addEventListener('touchstart', o, !0);
}
function isAdShowing() {
  const e = document.querySelector('.html5-video-player');
  return !!(
    document.querySelector(
      '.ad-showing, .ad-interrupting, .ytp-ad-player-overlay'
    ) ||
    (e &&
      (e.classList.contains('ad-showing') ||
        e.classList.contains('ad-interrupting')))
  );
}
function _setupAudioSession(e) {
  const n = new AudioContext(),
    o = n.createGain();
  (o.gain.value = c(e)), o.connect(n.destination);
  const r = {
    ctx: n,
    gain: o,
    video: e,
    chunks: new Map(),
    listeners: null,
    muteGuard: !1,
    jobId: null,
    manifestTimer: null,
    positionTimer: null,
    lastSentPosition: -1,
  };
  function a(s) {
    for (const l of r.chunks.values())
      if (l.startS <= s && s < l.endS && l.ready) return l;
    return null;
  }
  function i() {
    const s = document.querySelector('.ytp-volume-panel');
    if (!s) return !1;
    if (
      (s.getAttribute('aria-valuetext') || '').toLowerCase().includes('muted')
    )
      return !0;
    const d = s.querySelector('.ytp-volume-slider-handle'),
      u = s.querySelector('.ytp-volume-slider');
    return d && u && u.clientWidth > 0
      ? parseFloat(d.style.left || '0') <= 0
      : !1;
  }
  function c(s) {
    if (i()) return 0;
    const l = document.querySelector('.ytp-volume-panel');
    let d;
    if (l) {
      const u = Number(l.getAttribute('aria-valuenow'));
      d = Number.isFinite(u) ? u / 100 : s.volume;
    } else d = s.volume;
    return Math.max(0, Math.min(1, d));
  }
  function m() {
    !audioState || audioState !== r || (r.gain.gain.value = c(r.video));
  }
  function f() {
    if (!audioState || audioState !== r) return;
    const s = !!a(r.video.currentTime),
      l = i() ? !0 : s;
    r.video.muted !== l && ((r.muteGuard = !0), (r.video.muted = l));
  }
  function h() {
    if (!audioState || audioState !== r || r.ctx.state === 'suspended') return;
    if (isAdShowing() || r.video.paused) {
      y();
      return;
    }
    const s = r.video.currentTime,
      l = r.ctx.currentTime;
    for (const d of r.chunks.values()) _(d, s, l);
    f();
  }
  function _(s, l, d) {
    if (!s.el || !s.ready) return;
    const u = r.video.playbackRate || 1;
    if (
      ((s.el.preservesPitch = !0),
      s.el.playbackRate !== u && (s.el.playbackRate = u),
      s.endS <= l || s.startS > l)
    ) {
      if (!s.el.paused)
        try {
          s.el.pause();
        } catch {}
      return;
    }
    const p = isFinite(s.el.duration) ? s.el.duration : s.endS - s.startS,
      b = Math.max(0, Math.min(l - s.startS, p - 0.05));
    if (Math.abs(s.el.currentTime - b) > 0.25)
      try {
        s.el.currentTime = b;
      } catch {}
    s.el.paused && s.el.play().catch(() => {});
  }
  function y() {
    for (const s of r.chunks.values())
      if (s.el && !s.el.paused)
        try {
          s.el.pause();
        } catch {}
  }
  function g(s) {
    const l = URL.createObjectURL(new Blob([s])),
      d = new Audio();
    (d.preservesPitch = !0), (d.preload = 'auto'), (d.src = l);
    const u = r.ctx.createMediaElementSource(d);
    return u.connect(r.gain), { el: d, node: u, url: l };
  }
  function j(s) {
    if (s.el) {
      try {
        s.el.pause();
      } catch {}
      try {
        s.el.removeAttribute('src'), s.el.load();
      } catch {}
    }
    if (s.node)
      try {
        s.node.disconnect();
      } catch {}
    if (s.url)
      try {
        URL.revokeObjectURL(s.url);
      } catch {}
    (s.el = null), (s.node = null), (s.url = null), (s.ready = !1);
  }
  function w(s, l) {
    if (audioState !== r) return;
    const d = r.chunks.get(s);
    !d ||
      d.el !== l ||
      ((d.ready = !0),
      r.ctx.state !== 'suspended' &&
        !r.video.paused &&
        !isAdShowing() &&
        (_(d, r.video.currentTime, r.ctx.currentTime), f()),
      R(),
      _syncHold());
  }
  function x(s, l, d) {
    const { el: u, node: p, url: b } = g(d);
    (l.el = u),
      (l.node = p),
      (l.url = b),
      u.readyState >= 2
        ? w(s, u)
        : u.addEventListener('loadeddata', () => w(s, u), { once: !0 });
  }
  function A(s, l, d, u) {
    if (!audioState || audioState !== r || r.chunks.has(s)) return;
    const p = {
      el: null,
      node: null,
      url: null,
      startS: d,
      endS: u,
      inflight: null,
      persistent: !0,
      ready: !1,
    };
    r.chunks.set(s, p), x(s, p, l);
  }
  function B(s, l, d) {
    !audioState ||
      audioState !== r ||
      r.chunks.has(s) ||
      r.chunks.set(s, {
        el: null,
        node: null,
        url: null,
        startS: l,
        endS: d,
        inflight: null,
        persistent: !1,
        ready: !1,
      });
  }
  async function S(s) {
    if (!audioState || audioState !== r) return;
    const l = r.chunks.get(s);
    if (!l || l.el || l.inflight || !r.jobId) return;
    const d = (async () => {
      try {
        const u = await fetchChunkArrayBuffer(r.jobId, s);
        if (audioState !== r) return;
        const p = r.chunks.get(s);
        if (!p || p.el) return;
        x(s, p, u);
      } catch {
      } finally {
        const u = r.chunks.get(s);
        u && (u.inflight = null);
      }
    })();
    return (l.inflight = d), d;
  }
  function E(s) {
    const l = r.chunks.get(s);
    !l || l.persistent || !l.el || j(l);
  }
  function v() {
    if (!audioState || audioState !== r || r.chunks.size === 0) return;
    const s = r.video.currentTime,
      l = 5,
      d = 30;
    for (const [u, p] of r.chunks) {
      if (p.persistent) continue;
      const b = p.startS - s < l && p.endS > s,
        k = p.endS <= s && p.endS > s - d;
      b || k ? !p.el && !p.inflight && S(u) : p.el && E(u);
    }
  }
  function R() {
    if (r.firstChunkReady) return;
    (r.firstChunkReady = !0), setBtnState('on'), hideToast();
    const s = document.getElementById(BTN_ID);
    s && (s.title = t('title_click_restore')), _syncHold();
  }
  const T = () => {
      h(), _syncHold();
    },
    L = () => y(),
    $ = () => {
      r.jobId &&
        (prioritizeAtPosition(r.jobId, r.video.currentTime),
        _markSeekProcessing(r.video.currentTime)),
        v(),
        h(),
        _syncHold();
    },
    I = () => y(),
    C = () => {
      !audioState || audioState !== r || isAdShowing() || r.video.paused || h();
    },
    P = () => {
      if (!(!audioState || audioState !== r)) {
        if (r.muteGuard) {
          r.muteGuard = !1;
          return;
        }
        _syncAdMute(), m(), f();
      }
    },
    M = () => {
      if (!audioState || audioState !== r) return;
      if ((_syncAdMute(), isAdShowing() || r.video.paused)) {
        y();
        return;
      }
      const s = a(r.video.currentTime);
      s && s.el && s.el.paused && h(),
        v(),
        _syncHold(),
        m(),
        f(),
        r.lastManifest &&
          !document.getElementById(OVERLAY_ID) &&
          _updateChunkOverlay(r.lastManifest);
    };
  return (
    e.addEventListener('play', T),
    e.addEventListener('pause', L),
    e.addEventListener('seeked', $),
    e.addEventListener('ended', I),
    e.addEventListener('volumechange', P),
    e.addEventListener('timeupdate', M),
    e.addEventListener('ratechange', C),
    (r.listeners = {
      onPlay: T,
      onPause: L,
      onSeeked: $,
      onEnded: I,
      onVolume: P,
      onTimeUpdate: M,
      onRate: C,
    }),
    (r.addChunk = A),
    (r.addChunkSlot = B),
    (r.prepareChunk = S),
    (r.evictChunk = E),
    (r.checkLookahead = v),
    (r.rescheduleAllChunks = h),
    (r.unscheduleAllChunks = y),
    (r.firstChunkReady = !1),
    armCtxResume(n, () => {
      audioState === r && !r.video.paused && h();
    }),
    r
  );
}
async function downloadAndPlay(e, n) {
  const o = ++audioGen,
    r = () => o !== audioGen;
  let a = document.querySelector('video');
  if (!a) {
    setBtnState('off'), showSimpleToast(t('toast_no_video'));
    return;
  }
  let i = null;
  try {
    const c = await fetch(`${API}/audio/${e}`);
    if (r()) return;
    if (!c.ok) throw new Error(`HTTP ${c.status}`);
    const m = await c.arrayBuffer();
    if (r()) return;
    _stopAudioInternal(),
      (a = document.querySelector('video') || a),
      (i = _setupAudioSession(a)),
      (audioState = i);
    const f = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    i.addChunk(0, m, 0, f || Number.MAX_SAFE_INTEGER),
      _updateChunkOverlay({
        total_duration_s: f,
        chunks: [
          { idx: 0, start_s: 0, end_s: f, status: 'ready', url: `/audio/${e}` },
        ],
      }),
      setBtnState('on');
    const h = document.getElementById(BTN_ID);
    h && (h.title = t('title_click_restore'));
  } catch {
    if (i)
      try {
        i.ctx.close();
      } catch {}
    r() ||
      (stopAudio(),
      setBtnState('off'),
      showSimpleToast(t('toast_failed_load')));
  }
}
const MANIFEST_POLL_MS = 2e3,
  PRIORITIZE_INTERVAL_MS = 2e3;
async function enterStreamingMode(e, n) {
  const o = ++audioGen,
    r = () => o !== audioGen;
  let a = document.querySelector('video');
  if (!a) {
    setBtnState('off'), showSimpleToast(t('toast_no_video'));
    return;
  }
  _stopAudioInternal(), (a = document.querySelector('video') || a);
  const i = _setupAudioSession(a);
  (i.jobId = e),
    (audioState = i),
    _startPositionTimer(i),
    setBtnState('loading');
  const c = a && a.duration && isFinite(a.duration) ? a.duration : 1;
  _updateChunkOverlay({
    total_duration_s: c,
    chunks: [{ idx: 0, start_s: 0, end_s: c, status: 'processing', url: null }],
  }),
    prioritizeAtPosition(e, a.currentTime);
  async function m() {
    if (audioState !== i) return;
    let f = null,
      h = null;
    try {
      const [_, y] = await Promise.all([
        fetch(`${API}/status/${e}`)
          .then((g) => (g.ok ? g.json() : null))
          .catch(() => null),
        fetchManifest(e),
      ]);
      (f = _), (h = y);
    } catch {}
    if (audioState === i) {
      if (
        (f &&
          f.status === 'processing' &&
          updateProcessingToast(f.progress || 0, f.stage || 'downloading'),
        f && f.status === 'failed')
      ) {
        _stopAudioInternal();
        return;
      }
      if (h && h.chunks.length > 0) {
        _updateChunkOverlay(h);
        for (const g of h.chunks)
          g.status === 'ready' &&
            (i.chunks.has(g.idx) || i.addChunkSlot(g.idx, g.start_s, g.end_s));
        i.checkLookahead(), _syncAdMute(), _syncHold();
        const _ = h.chunks
            .filter((g) => g.status === 'ready')
            .every((g) => i.chunks.has(g.idx)),
          y = f && f.status === 'completed';
        if (_ && y) {
          i.manifestTimer = null;
          return;
        }
      } else _syncAdMute(), _syncHold();
      if (f && f.status === 'completed' && i.chunks.size === 0) {
        stopPolling(),
          hideToast(),
          _stopAudioInternal(),
          await downloadAndPlay(e, n);
        return;
      }
      i.manifestTimer = setTimeout(m, MANIFEST_POLL_MS);
    }
  }
  m();
}
function _stopAudioInternal() {
  if ((_removeChunkOverlay(), _hideHoldSpinner(), !audioState)) {
    const i = document.querySelector('video');
    i && (i.muted = !1);
    return;
  }
  const {
    ctx: e,
    chunks: n,
    video: o,
    listeners: r,
    manifestTimer: a,
  } = audioState;
  if (a)
    try {
      clearTimeout(a);
    } catch {}
  if (
    (_stopPositionTimer(audioState),
    o &&
      r &&
      (o.removeEventListener('play', r.onPlay),
      o.removeEventListener('pause', r.onPause),
      o.removeEventListener('seeked', r.onSeeked),
      o.removeEventListener('ended', r.onEnded),
      o.removeEventListener('volumechange', r.onVolume),
      o.removeEventListener('timeupdate', r.onTimeUpdate),
      o.removeEventListener('ratechange', r.onRate)),
    n)
  )
    for (const i of n.values()) {
      if (i.el) {
        try {
          i.el.pause();
        } catch {}
        try {
          i.el.removeAttribute('src'), i.el.load();
        } catch {}
      }
      if (i.node)
        try {
          i.node.disconnect();
        } catch {}
      if (i.url)
        try {
          URL.revokeObjectURL(i.url);
        } catch {}
    }
  if (e)
    try {
      e.close();
    } catch {}
  o && (o.muted = !1), (audioState = null);
}
function stopAudio() {
  audioGen++, _stopAudioInternal();
}
function showSimpleToast(e, n = 3e3) {
  hideToast();
  const o = document.createElement('div');
  (o.id = TOAST_ID),
    (o.className = 'mr-toast'),
    (o.innerHTML = `<div class="mr-toast-msg">${esc(e)}</div>
    <div class="mr-toast-btns"><button class="mr-toast-btn" id="mr-toast-dismiss">${esc(
      t('btn_ok')
    )}</button></div>`),
    document.body.appendChild(o),
    o.querySelector('#mr-toast-dismiss').addEventListener('click', hideToast),
    n && setTimeout(hideToast, n);
}
function showRetryToast(e) {
  hideToast();
  const n = document.createElement('div');
  (n.id = TOAST_ID),
    (n.className = 'mr-toast'),
    (n.innerHTML = `<div class="mr-toast-msg">${esc(e)}</div>
    <div class="mr-toast-btns">
      <button class="mr-toast-btn" id="mr-toast-dismiss">${esc(
        t('btn_dismiss')
      )}</button>
      <button class="mr-toast-btn mr-primary" id="mr-toast-retry">${esc(
        t('btn_try_again')
      )}</button>
    </div>`),
    document.body.appendChild(n),
    n.querySelector('#mr-toast-dismiss').addEventListener('click', hideToast),
    n.querySelector('#mr-toast-retry').addEventListener('click', () => {
      hideToast(), onButtonClick();
    });
}
function showProcessingToast(e, n) {
  if (((lastJobProgress = { pct: e, stage: n }), _suppressToast)) return;
  if ((setJobActive(!0), document.getElementById(TOAST_ID))) {
    updateProcessingToast(e, n);
    return;
  }
  if (processingToastDismissed) return;
  hideToast();
  const o = document.createElement('div');
  (o.id = TOAST_ID),
    (o.className = 'mr-toast'),
    (o.innerHTML = `
    <div class="mr-toast-msg">${esc(t('toast_removing_music'))}</div>
    <div class="mr-toast-progress" style="font-size:11px;color:#888;margin-bottom:4px">
      ${esc(t('toast_time_depends'))}
    </div>
    <div class="mr-toast-progress">
      <span id="mr-stage">${esc(
        stageText(n)
      )}</span> &bull; <span id="mr-pct">${e}%</span>
    </div>
    <div class="mr-toast-bar-wrap"><div class="mr-toast-bar" id="mr-bar" style="width:${e}%"></div></div>
    <div class="mr-toast-btns" style="margin-top:10px">
      <button class="mr-toast-btn" id="mr-toast-hide">${esc(
        t('btn_hide')
      )}</button>
      <button class="mr-toast-btn" id="mr-toast-cancel">${esc(
        t('btn_cancel')
      )}</button>
    </div>`),
    document.body.appendChild(o),
    setTimeout(() => {
      document.getElementById(TOAST_ID) === o &&
        ((processingToastDismissed = !0), hideToast());
    }, PROCESSING_TOAST_MS),
    o.querySelector('#mr-toast-hide').addEventListener('click', () => {
      (processingToastDismissed = !0), hideToast();
    }),
    o.querySelector('#mr-toast-cancel').addEventListener('click', async () => {
      stopPolling(), hideToast(), setJobActive(!1), setBtnState('off');
      try {
        await apiFetch('POST', '/cancel');
      } catch {}
    });
}
function updateProcessingToast(e, n) {
  lastJobProgress = { pct: e, stage: n };
  const o = document.getElementById('mr-stage'),
    r = document.getElementById('mr-pct'),
    a = document.getElementById('mr-bar');
  o && (o.textContent = stageText(n)),
    r && (r.textContent = e + '%'),
    a && (a.style.width = e + '%');
}
function showConflictToast(e) {
  hideToast();
  const n = document.createElement('div');
  (n.id = TOAST_ID),
    (n.className = 'mr-toast'),
    (n.innerHTML = `
    <div class="mr-toast-msg">${esc(t('toast_conflict'))}</div>
    <div class="mr-toast-btns">
      <button class="mr-toast-btn" id="mr-conflict-keep">${esc(
        t('btn_keep_running')
      )}</button>
      <button class="mr-toast-btn mr-primary" id="mr-conflict-stop">${esc(
        t('btn_stop_process')
      )}</button>
    </div>`),
    document.body.appendChild(n),
    n.querySelector('#mr-conflict-keep').addEventListener('click', hideToast),
    n.querySelector('#mr-conflict-stop').addEventListener('click', async () => {
      hideToast(), setBtnState('loading'), stopPolling();
      try {
        await apiFetch('POST', '/cancel', {
          start: { url: e, media_type: 'audio', ttl: preferredTtl },
        });
        const o = await apiFetch('GET', '/health');
        o.job &&
          o.job.job_id &&
          ((currentJobId = o.job.job_id),
          showProcessingToast(
            o.job.progress || 0,
            o.job.stage || 'downloading'
          ),
          enterStreamingMode(currentJobId, e),
          startPolling(currentJobId, e));
      } catch (o) {
        setBtnState('off'), showSimpleToast(t('toast_error', o.message));
      }
    });
}
function showPermissionToast() {
  hideToast();
  const e = document.createElement('div');
  (e.id = TOAST_ID),
    (e.className = 'mr-toast mr-toast-permission'),
    (e.innerHTML = `
    <div class="mr-toast-title">${esc(t('perm_title'))}</div>
    <div class="mr-toast-body">
      <p class="mr-toast-help">${t('perm_step1')}</p>
      <p class="mr-toast-help">
        ${t('perm_step2')}
        &nbsp;<a href="https://musicremover.org/how-to-use#common_issue" target="_blank" rel="noopener noreferrer" style="color:#fbbf24;font-weight:600">${esc(
          t('perm_see_fix')
        )}</a>
      </p>
      <p class="mr-toast-secondary">
        <a href="https://musicremover.org/how-to-use" target="_blank" rel="noopener noreferrer">${esc(
          t('perm_full_guide')
        )}</a>
      </p>
    </div>
    <div class="mr-toast-btns">
      <button class="mr-toast-btn mr-primary" id="mr-toast-dismiss">${esc(
        t('btn_got_it')
      )}</button>
    </div>`),
    document.body.appendChild(e),
    e.querySelector('#mr-toast-dismiss').addEventListener('click', hideToast);
}
function showUpdateRequiredToast() {
  hideToast();
  const e = document.createElement('div');
  (e.id = TOAST_ID),
    (e.className = 'mr-toast mr-toast-permission'),
    (e.innerHTML = `
    <div class="mr-toast-title">${esc(t('update_req_title'))}</div>
    <div class="mr-toast-body">
      <p class="mr-toast-help">${esc(t('update_req_body'))}</p>
      <p class="mr-toast-secondary">
        <a href="http://127.0.0.1:56348/update" target="_blank" rel="noopener noreferrer">${esc(
          t('update_req_link')
        )}</a>
      </p>
    </div>
    <div class="mr-toast-btns">
      <button class="mr-toast-btn mr-primary" id="mr-toast-dismiss">${esc(
        t('btn_got_it')
      )}</button>
    </div>`),
    document.body.appendChild(e),
    e.querySelector('#mr-toast-dismiss').addEventListener('click', hideToast);
}
function hideToast() {
  const e = document.getElementById(TOAST_ID);
  e && e.remove();
}
function stageText(e) {
  const n = {
    downloading: 'stage_downloading',
    extracting: 'stage_extracting',
    encoding: 'stage_encoding',
    done: 'stage_done',
    starting: 'stage_starting',
    resuming: 'stage_resuming',
  }[e];
  return n ? t(n) : e || t('stage_processing');
}
function esc(e) {
  return String(e || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
async function apiFetch(e, n, o) {
  const r = { method: e, headers: { 'Content-Type': 'application/json' } };
  o && (r.body = JSON.stringify(o));
  const a = await fetch(API + n, r);
  if (!a.ok) {
    const i = new Error(`HTTP ${a.status}`);
    i.status = a.status;
    try {
      i.body = await a.json();
    } catch {}
    throw i;
  }
  return a.json();
}
async function onNavigate() {
  const e = location.href;
  if (e === currentVideoUrl) return;
  const n = isYouTubeWatchUrl(currentVideoUrl),
    o = isYouTubeWatchUrl(e);
  if (
    ((currentVideoUrl = e),
    (_autoEngagedUrl = null),
    n && audioState && apiFetch('POST', '/cancel').catch(() => {}),
    stopPolling(),
    stopAudio(),
    hideToast(),
    setJobActive(!1),
    (buttonInjected = !1),
    !o)
  )
    return;
  setBtnState('off'), setTtlDropdown({ cached: !1 });
  const r = document.getElementById(BTN_ID);
  r && (r.title = t('title_remove_music')),
    n
      ? checkHealth().then((a) => {
          a && updateButtonHints(a);
        })
      : await activate();
}
window.addEventListener('yt-navigate-finish', onNavigate),
  document.addEventListener('yt-ad-module-ready', () => {
    document.querySelector('.ad-showing') ||
      ((buttonInjected = !1), injectButton());
  }),
  init();
