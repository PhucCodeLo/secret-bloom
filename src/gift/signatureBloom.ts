import type { ThemeId, VirtueId } from './types';
import { VIRTUES } from './types';

/**
 * Signature Bloom — a unique flower identity generated deterministically
 * from the recipient's journey: theme, deepened virtue, final wish,
 * relics and discoveries. Same journey → same flower, always.
 */

export interface SignatureBloom {
  name: string;
  epithet: string;
  meaning: string;
  petalCount: number;
  layers: number;
  petalColor: string;
  petalColor2: string;
  centerColor: string;
  seed: number;
}

const THEME_NOUN: Record<ThemeId, string> = {
  midnight: 'Dạ Nguyệt',
  dawn: 'Húc Dương',
  moonlit: 'Ngân Hà',
  meadow: 'Dã Quỳ',
};

const VIRTUE_COLOR: Record<VirtueId, string> = {
  love: '#F4A0BC',
  gratitude: '#F3D79B',
  joy: '#8FD8C9',
};

const THEME_PETAL: Record<ThemeId, string> = {
  midnight: '#B9A8E8',
  dawn: '#FF9E7A',
  moonlit: '#9FB8E8',
  meadow: '#8FD8A9',
};

const WISH_EPITHET: Record<string, string> = {
  radiance: 'đóa hoa rực rỡ của riêng bạn',
  serenity: 'đóa hoa của những ngày an nhiên',
  freedom: 'đóa hoa của tự do',
};

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface BloomInput {
  displayName: string;
  theme: ThemeId;
  virtue: VirtueId;
  wish: string;
  relicCount: number;
  objectCount: number;
}

export function generateSignatureBloom(input: BloomInput): SignatureBloom {
  const seed = hashString(
    [input.displayName, input.theme, input.virtue, input.wish, input.relicCount, input.objectCount].join('|'),
  );
  const petalCount = 8 + Math.min(Math.max(input.relicCount, 0), 8);
  const layers = petalCount >= 14 ? 3 : 2;
  const name = `Hoa ${VIRTUES[input.virtue].name} ${THEME_NOUN[input.theme]}`;
  const epithet = WISH_EPITHET[input.wish] ?? 'đóa hoa duy nhất của bạn';
  const meaning =
    `Được dệt từ ${input.relicCount} kỷ vật và ${input.objectCount} khám phá của ${input.displayName} — ` +
    `mỗi cánh hoa là một lựa chọn bạn đã đi qua. Không có đóa thứ hai giống hệt trên đời.`;
  return {
    name,
    epithet,
    meaning,
    petalCount,
    layers,
    petalColor: VIRTUE_COLOR[input.virtue],
    petalColor2: THEME_PETAL[input.theme],
    centerColor: '#F3D79B',
    seed,
  };
}

/** Deterministic PRNG for petal variation. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
