// API client with automatic access-token refresh on 401.
// Access tokens live in memory only; the refresh token is an httpOnly cookie.

let accessToken = null;
let onSessionExpired = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

async function rawFetch(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
}

export async function refreshSession() {
  const res = await rawFetch('/api/auth/refresh', { method: 'POST' });
  if (!res.ok) return null;
  const data = await res.json();
  accessToken = data.accessToken;
  return data.user;
}

export async function api(path, options = {}, retried = false) {
  const res = await rawFetch(path, options);
  if (res.status === 401 && !retried && !path.startsWith('/api/auth/')) {
    const user = await refreshSession();
    if (user) return api(path, options, true);
    if (onSessionExpired) onSessionExpired();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
