import { useMemo } from 'react';
import RoseSilhouette from './RoseSilhouette';
import ParallaxLayer from './ParallaxLayer';
import type { ThemeId } from '../../gift/types';

interface AtmosphereProps {
  variant?: 'night' | 'intimate';
  theme?: ThemeId;
  reducedMotion?: boolean;
  parallax?: boolean;
}

/** Per-theme sky, moon glow and fog tints — the Living World palette. */
const THEME_SKY: Record<
  ThemeId,
  { base: string; moon: string; fogA: string; fogB: string }
> = {
  midnight: {
    base: 'radial-gradient(ellipse 110% 70% at 50% -12%, #16233f 0%, #0a1024 48%, #04070e 100%)',
    moon: 'radial-gradient(circle, rgba(243,215,155,0.13) 0%, rgba(243,215,155,0.04) 45%, transparent 70%)',
    fogA:
      'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(185,168,232,0.10), transparent 70%), radial-gradient(ellipse 45% 55% at 75% 45%, rgba(244,160,188,0.07), transparent 70%)',
    fogB:
      'radial-gradient(ellipse 55% 60% at 65% 50%, rgba(220,164,122,0.09), transparent 70%)',
  },
  dawn: {
    base: 'radial-gradient(ellipse 110% 70% at 50% -12%, #3d2130 0%, #22101e 48%, #0d060c 100%)',
    moon: 'radial-gradient(circle, rgba(255,190,120,0.16) 0%, rgba(255,170,100,0.05) 45%, transparent 70%)',
    fogA:
      'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(255,170,110,0.10), transparent 70%), radial-gradient(ellipse 45% 55% at 75% 45%, rgba(255,150,120,0.08), transparent 70%)',
    fogB:
      'radial-gradient(ellipse 55% 60% at 65% 50%, rgba(255,180,120,0.10), transparent 70%)',
  },
  moonlit: {
    base: 'radial-gradient(ellipse 110% 70% at 50% -12%, #1b2947 0%, #0d1626 48%, #05080f 100%)',
    moon: 'radial-gradient(circle, rgba(200,220,255,0.15) 0%, rgba(180,200,255,0.05) 45%, transparent 70%)',
    fogA:
      'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(170,190,240,0.10), transparent 70%), radial-gradient(ellipse 45% 55% at 75% 45%, rgba(150,170,230,0.07), transparent 70%)',
    fogB:
      'radial-gradient(ellipse 55% 60% at 65% 50%, rgba(170,190,240,0.08), transparent 70%)',
  },
  meadow: {
    base: 'radial-gradient(ellipse 110% 70% at 50% -12%, #12362a 0%, #0a2018 48%, #040d0a 100%)',
    moon: 'radial-gradient(circle, rgba(160,230,190,0.13) 0%, rgba(140,220,170,0.04) 45%, transparent 70%)',
    fogA:
      'radial-gradient(ellipse 50% 60% at 30% 50%, rgba(140,220,170,0.09), transparent 70%), radial-gradient(ellipse 45% 55% at 75% 45%, rgba(120,200,160,0.07), transparent 70%)',
    fogB:
      'radial-gradient(ellipse 55% 60% at 65% 50%, rgba(140,220,170,0.08), transparent 70%)',
  },
};

interface Star {
  x: number;
  y: number;
  r: number;
  dur: number;
  delay: number;
}

/**
 * Layered cinematic background: deep gradient sky, twinkling stars,
 * moon glow, distant garden silhouette (parallax), drifting fog, vignette.
 * Purely decorative — pointer-events none, aria-hidden.
 */
export default function Atmosphere({
  variant = 'night',
  theme = 'midnight',
  reducedMotion = false,
  parallax = true,
}: AtmosphereProps) {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 60,
        r: 0.25 + Math.random() * 0.55,
        dur: 2.5 + Math.random() * 4,
        delay: Math.random() * 6,
      })),
    [],
  );

  const sky = THEME_SKY[theme];
  const base =
    variant === 'night'
      ? sky.base
      : 'radial-gradient(ellipse 110% 70% at 50% -12%, #221a33 0%, #100c1e 48%, #050409 100%)';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* base sky */}
      <div className="absolute inset-0" style={{ background: base }} />

      {/* moon glow */}
      <div
        className="absolute -top-28 right-[-10%] h-80 w-80 rounded-full"
        style={{ background: sky.moon }}
      />

      {/* stars */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 62"
        preserveAspectRatio="xMidYMid slice"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#FFF4E6"
            opacity={0.55}
            className={reducedMotion ? undefined : 'animate-twinkle'}
            style={
              reducedMotion
                ? undefined
                : { animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }
            }
          />
        ))}
      </svg>

      {/* distant garden silhouette with subtle parallax */}
      <ParallaxLayer
        depth={16}
        disabled={!parallax || reducedMotion}
        className="absolute inset-x-[-4%] bottom-[-2%]"
      >
        <RoseSilhouette className="h-36 w-full sm:h-48" opacity={0.85} />
      </ParallaxLayer>

      {/* drifting fog */}
      {!reducedMotion && (
        <>
          <div
            className="animate-fog absolute inset-x-[-12%] top-[16%] h-60 opacity-40"
            style={{ background: sky.fogA }}
          />
          <div
            className="animate-fog absolute inset-x-[-12%] top-[60%] h-72 opacity-30"
            style={{
              background: sky.fogB,
              animationDelay: '-7s',
            }}
          />
        </>
      )}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(2,4,9,0.55) 100%)',
        }}
      />
    </div>
  );
}
