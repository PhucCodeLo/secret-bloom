import type { ThemeId } from './types';

/**
 * Visual definitions per theme. Phase 2 uses these for builder previews;
 * Phase 3 (Living World) applies them across the whole journey.
 */
export interface ThemeVisual {
  bg: string;
  accent: string;
  accent2: string;
  glow: string;
  cardBg: string;
}

export const THEME_VISUALS: Record<ThemeId, ThemeVisual> = {
  midnight: {
    bg: 'radial-gradient(ellipse at 50% 20%, #16223f 0%, #0a1024 55%, #05080f 100%)',
    accent: '#F3D79B',
    accent2: '#F4A0BC',
    glow: 'rgba(243,215,155,0.35)',
    cardBg: 'linear-gradient(160deg, #1a2340, #0b1022)',
  },
  dawn: {
    bg: 'radial-gradient(ellipse at 50% 20%, #4a2b3a 0%, #2b1a2e 55%, #120d18 100%)',
    accent: '#FFD9A0',
    accent2: '#FF9E7A',
    glow: 'rgba(255,180,120,0.35)',
    cardBg: 'linear-gradient(160deg, #4a2b3a, #241423)',
  },
  moonlit: {
    bg: 'radial-gradient(ellipse at 50% 20%, #1c2a4a 0%, #0d1526 55%, #060a14 100%)',
    accent: '#CFE0FF',
    accent2: '#9FB8E8',
    glow: 'rgba(180,200,255,0.30)',
    cardBg: 'linear-gradient(160deg, #1c2a4a, #0c1322)',
  },
  meadow: {
    bg: 'radial-gradient(ellipse at 50% 20%, #14352b 0%, #0b211b 55%, #050f0c 100%)',
    accent: '#B8E8C9',
    accent2: '#8FD8A9',
    glow: 'rgba(140,220,170,0.30)',
    cardBg: 'linear-gradient(160deg, #14352b, #0a1f18)',
  },
};
