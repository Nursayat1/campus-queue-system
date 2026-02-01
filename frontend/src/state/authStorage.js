const KEY = "campus_auth";

export function saveAuth({ token, user }) {
  localStorage.setItem(KEY, JSON.stringify({ token, user }));
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return loadAuth()?.token || null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
