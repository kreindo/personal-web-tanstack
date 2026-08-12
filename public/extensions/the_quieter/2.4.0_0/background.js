const API = 'http://localhost:56348',
  POLL_ALARM = 'music-remover-poll',
  POLL_INTERVAL_MIN = 1,
  UNINSTALL_URL = 'https://forms.gle/rZHJoKAZHhEfjxpS8',
  SHOW_UPDATE_PAGE = !0,
  PROMO_URL = 'https://pordaai.com/en/muslim-browser';
function styleBadges() {
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }),
    chrome.action.setBadgeTextColor?.({ color: '#ffffff' });
}
async function fetchJson(t, a = 2500) {
  const e = new AbortController(),
    r = setTimeout(() => e.abort(), a);
  try {
    const o = await fetch(t, { method: 'GET', signal: e.signal });
    return o.ok ? await o.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(r);
  }
}
async function refreshBadge() {
  if ((styleBadges(), !(await fetchJson(`${API}/health`)))) {
    await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }),
      await chrome.action.setBadgeText({ text: '\u2022' }),
      await chrome.action.setTitle({
        title:
          chrome.i18n.getMessage('bg_app_not_running') ||
          'Music Remover desktop app not running',
      });
    return;
  }
  const a = (await chrome.storage.session.get('update_last')).update_last || 0;
  let e = (await chrome.storage.session.get('update_info')).update_info || null;
  if (
    ((!e || Date.now() - a > 6 * 60 * 60 * 1e3) &&
      ((e = await fetchJson(`${API}/api/update/check`)),
      e &&
        (await chrome.storage.session.set({
          update_info: e,
          update_last: Date.now(),
        }))),
    e && e.available)
  ) {
    await chrome.action.setBadgeBackgroundColor({ color: '#3ea6ff' }),
      await chrome.action.setBadgeText({ text: '1' }),
      await chrome.action.setTitle({
        title:
          chrome.i18n.getMessage(
            'bg_update_available',
            String(e.latest_version)
          ) || `Music Remover \u2014 update v${e.latest_version} available`,
      });
    return;
  }
  await chrome.action.setBadgeText({ text: '' }),
    await chrome.action.setTitle({
      title: chrome.i18n.getMessage('bg_title') || 'Music Remover',
    });
}
chrome.runtime.onInstalled.addListener(async (t) => {
  chrome.alarms.create(POLL_ALARM, {
    delayInMinutes: 0.05,
    periodInMinutes: 1,
  });
  try {
    chrome.runtime.setUninstallURL(UNINSTALL_URL);
  } catch {}
}),
  chrome.runtime.onStartup.addListener(() => {
    chrome.alarms.create(POLL_ALARM, {
      delayInMinutes: 0.05,
      periodInMinutes: 1,
    });
  }),
  chrome.alarms.onAlarm.addListener((t) => {
    t.name === POLL_ALARM && refreshBadge();
  }),
  chrome.runtime.onMessage.addListener((t, a, e) => {
    if (t && t.type === 'refresh-badge')
      return refreshBadge().then(() => e({ ok: !0 })), !0;
  }),
  refreshBadge();
