import { useEffect, useRef } from 'react';

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
  hue: number;
}

/**
 * Glowing fireflies drifting slowly, drawn on canvas with a pre-rendered
 * glow sprite (no shadowBlur per frame). Pauses when tab is hidden.
 */
export default function Fireflies({
  className = '',
  reducedMotion = false,
}: {
  className?: string;
  reducedMotion?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // pre-rendered glow sprite
    const sprite = document.createElement('canvas');
    sprite.width = 64;
    sprite.height = 64;
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,240,200,1)');
      g.addColorStop(0.25, 'rgba(243,215,155,0.55)');
      g.addColorStop(1, 'rgba(243,215,155,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }

    const isMobile = window.innerWidth < 640;
    const n = isMobile ? 7 : 14;
    const flies: Firefly[] = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: 0.25 + Math.random() * 0.7,
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00012,
      phase: Math.random() * Math.PI * 2,
      size: 5 + Math.random() * 7,
      hue: 0,
    }));

    const tick = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        f.x += f.vx + Math.sin(t * 0.0003 + f.phase) * 0.00008;
        f.y += f.vy + Math.cos(t * 0.00023 + f.phase) * 0.00006;
        if (f.x < -0.03) f.x = 1.03;
        if (f.x > 1.03) f.x = -0.03;
        if (f.y < 0.15) f.y = 0.15;
        if (f.y > 1.02) f.y = 1.02;
        const blink = 0.25 + 0.75 * Math.pow(Math.sin(t * 0.0011 + f.phase) * 0.5 + 0.5, 2);
        ctx.globalAlpha = blink * 0.85;
        const s = f.size * (0.8 + 0.4 * blink);
        ctx.drawImage(sprite, f.x * w - s / 2, f.y * h - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
