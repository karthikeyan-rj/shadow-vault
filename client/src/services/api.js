const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('ft_token') || '';
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

export function setToken(token) {
  if (token) localStorage.setItem('ft_token', token);
  else localStorage.removeItem('ft_token');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('ft_user'));
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem('ft_user', JSON.stringify(user));
  else localStorage.removeItem('ft_user');
}
