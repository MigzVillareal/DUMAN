const AUTH_USER_KEY = "duman_user";
const AUTH_TOKEN_KEY = "duman_token";

export function readStoredToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function persistAuthSession(user, token) {
  if (user) {
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(AUTH_USER_KEY);
  }

  if (token) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getAuthHeaders(json = false) {
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const token = readStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
