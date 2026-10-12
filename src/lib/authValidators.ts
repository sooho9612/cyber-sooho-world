export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeNickname(raw: string): string {
  return raw.trim();
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,32}$/.test(username);
}

export function isValidNickname(nickname: string): boolean {
  const n = nickname.trim();
  return n.length >= 1 && n.length <= 24;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** General signup password rule (UI). Auth also enforces min 6. */
export function isValidSignupPassword(password: string): boolean {
  return password.length >= 8;
}
