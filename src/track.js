const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

const stored = (storage, key) => {
  try {
    let value = storage.getItem(key);
    const fresh = !value;
    if (fresh) storage.setItem(key, (value = id()));
    return [value, fresh];
  } catch {
    return [id(), true];
  }
};

export const trackPage = path => {
  if (path.startsWith('/admin')) return;
  const [vid] = stored(localStorage, 'p18_vid');
  const [, landing] = stored(sessionStorage, 'p18_session');
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, vid, landing, referrer: landing ? document.referrer : '' }),
    keepalive: true
  }).catch(() => {});
};
