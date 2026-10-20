/**
 * Local gift store — Phase 1 prototype.
 *
 * Gifts are stored in this browser's localStorage under a random ID.
 * A share link looks like https://site/?gift=<id>.
 *
 * IMPORTANT (shown in the UI): this is a LOCAL prototype. A gift created
 * here can only be opened on THIS device / browser. Cross-device sharing
 * needs a backend, which this build does not have yet.
 */

import { GIFT_VERSION, isGiftConfig, type GiftConfig } from './types';

const STORE_KEY = 'secret-bloom-gifts-v1';

function readAll(): Record<string, GiftConfig> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, GiftConfig> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (isGiftConfig(v) && v.id === k) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, GiftConfig>): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    // storage full / private mode — the builder will surface this
    throw new Error('Không lưu được món quà (bộ nhớ trình duyệt đầy hoặc bị chặn).');
  }
}

/** Random 10-char URL-safe gift ID. */
export function generateGiftId(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(10);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => chars[n % chars.length]).join('');
}

export function saveGift(config: GiftConfig): GiftConfig {
  const all = readAll();
  const saved: GiftConfig = {
    ...config,
    version: GIFT_VERSION,
    id: config.id || generateGiftId(),
    createdAt: config.createdAt || Date.now(),
  };
  all[saved.id] = saved;
  writeAll(all);
  return saved;
}

export function loadGift(id: string): GiftConfig | null {
  const all = readAll();
  return all[id] ?? null;
}

export function listGifts(): GiftConfig[] {
  return Object.values(readAll()).sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteGift(id: string): void {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

/** Build a shareable link for a gift ID (same-device only in this prototype). */
export function giftShareUrl(id: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('gift', id);
  url.searchParams.delete('builder');
  return url.toString();
}

/** Read ?gift=<id> from the current URL. */
export function giftIdFromUrl(): string | null {
  try {
    const id = new URLSearchParams(window.location.search).get('gift');
    return id && /^[a-z0-9]{6,16}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Read ?builder=1 from the current URL. */
export function builderRequested(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('builder') === '1';
  } catch {
    return false;
  }
}

/**
 * Is the gift's reveal date still in the future? Compares calendar dates
 * in the viewer's local timezone (day precision).
 */
export function isGiftLocked(config: GiftConfig, now = new Date()): boolean {
  if (!config.revealDate) return false;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return config.revealDate > today;
}
