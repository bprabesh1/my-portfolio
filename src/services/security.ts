// Client-side hardening helpers (WebCrypto). Note: a static site has no server,
// so this raises the bar but cannot replace server-side auth for real secrets.
const enc = new TextEncoder();
const ITER = 210_000;
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(secret: string, salt: Uint8Array, iter: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
  return new Uint8Array(bits);
}

export const isHashed = (v: string) => v.startsWith('pbkdf2$');

export async function hashSecret(secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(await derive(secret, salt, ITER))}`;
}

function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}

/** Verifies against a PBKDF2 hash; legacy plaintext values still match once so they can be upgraded. */
export async function verifySecret(input: string, stored: string): Promise<boolean> {
  if (!isHashed(stored)) return safeEqual(enc.encode(input), enc.encode(stored));
  const [, iter, salt, hash] = stored.split('$');
  return safeEqual(await derive(input, unb64(salt), Number(iter)), unb64(hash));
}

// ---- Brute-force lockout (exponential backoff) ----
const LOCK_KEY = 'pb_auth_guard';
export function lockState(): { locked: boolean; seconds: number } {
  try {
    const { until = 0 } = JSON.parse(localStorage.getItem(LOCK_KEY) || '{}');
    const s = Math.ceil((until - Date.now()) / 1000);
    return { locked: s > 0, seconds: Math.max(0, s) };
  } catch { return { locked: false, seconds: 0 }; }
}
export function recordFailure(): void {
  let g = { fails: 0, until: 0 };
  try { g = { ...g, ...JSON.parse(localStorage.getItem(LOCK_KEY) || '{}') }; } catch {}
  g.fails += 1;
  if (g.fails >= 3) g.until = Date.now() + Math.min(2 ** (g.fails - 3) * 15_000, 3_600_000);
  localStorage.setItem(LOCK_KEY, JSON.stringify(g));
}
export const recordSuccess = () => localStorage.removeItem(LOCK_KEY);

// ---- Input hygiene ----
export const cleanText = (v: string, max = 2000) =>
  v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '').trim().slice(0, max);

/** Allows only http(s)/mailto URLs (blocks javascript:, data:, etc.). */
export function safeUrl(u?: string): string {
  if (!u) return '#';
  if (u.startsWith('#') || u.startsWith('/')) return u;
  try {
    const p = new URL(u);
    return ['http:', 'https:', 'mailto:'].includes(p.protocol) ? p.href : '#';
  } catch { return '#'; }
}

// ---- Contact-form abuse guard: min fill time + cooldown ----
const MSG_KEY = 'pb_last_msg';
export function canSendMessage(openedAt: number, honeypot: string): string | null {
  if (honeypot) return 'Blocked.';
  if (Date.now() - openedAt < 3000) return 'Please take a moment before sending.';
  const last = Number(localStorage.getItem(MSG_KEY) || 0);
  if (Date.now() - last < 30_000) return 'Please wait before sending another message.';
  return null;
}
export const markMessageSent = () => localStorage.setItem(MSG_KEY, String(Date.now()));
