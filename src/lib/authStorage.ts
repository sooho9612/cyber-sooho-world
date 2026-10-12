/** localStorage keys for login UX preferences */
export const AUTH_SAVED_USERNAME_KEY = 'auth_saved_username';
export const AUTH_AUTO_LOGIN_KEY = 'auth_auto_login'; // '1' | '0'
export const AUTH_SAVE_USERNAME_KEY = 'auth_save_username'; // '1' | '0'

export function readAutoLogin(): boolean {
  const v = localStorage.getItem(AUTH_AUTO_LOGIN_KEY);
  return v !== '0'; // default ON
}

export function writeAutoLogin(on: boolean): void {
  localStorage.setItem(AUTH_AUTO_LOGIN_KEY, on ? '1' : '0');
}

export function readSaveUsername(): boolean {
  return localStorage.getItem(AUTH_SAVE_USERNAME_KEY) === '1';
}

export function writeSaveUsername(on: boolean): void {
  localStorage.setItem(AUTH_SAVE_USERNAME_KEY, on ? '1' : '0');
}

export function readSavedUsername(): string {
  return localStorage.getItem(AUTH_SAVED_USERNAME_KEY) ?? '';
}

export function writeSavedUsername(username: string): void {
  if (username) localStorage.setItem(AUTH_SAVED_USERNAME_KEY, username);
  else localStorage.removeItem(AUTH_SAVED_USERNAME_KEY);
}

/** Auth session storage: persist across browser restarts only when auto-login is on */
export function getAuthStorage(): Storage {
  try {
    return readAutoLogin() ? localStorage : sessionStorage;
  } catch {
    return localStorage;
  }
}
