const KEY = 'hst_token';
const USER_KEY = 'hst_user';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t) => localStorage.setItem(KEY, t);
export const clearToken = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
};
export const isLoggedIn = () => Boolean(getToken());

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const setUser = (user) => {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
};
export const isOnboarded = () => Boolean(getUser()?.onboarding_completed);