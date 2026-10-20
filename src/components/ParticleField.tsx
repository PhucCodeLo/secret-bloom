import { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  count?: number;
  className?: string;
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  phase: number;
}

/**
 * Lightweight canvas particle field — slow drifting golden dust.
 * No per-particle React re-renders; pauses when the tab is hidden.
 */
export default function ParticleField({
  count = 70,
  className = '',
  reducedMotion = false,
}: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

    const isMobile = window.innerWidth < 640;
    const n = reducedMotion
      ? 24
      : Math.round(count * (isMobile ? 0.45 : 1));
    const particles: Particle[] = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 2.1,
      speed: 0.00035 + Math.random() * 0.0011,
      alpha: 0.22 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const twinkle = 0.6 + 0.4 * Math.sin(t * 0.0012 + p.phase);
        ctx.globalAlpha = p.alpha * twinkle;
        ctx.fillStyle = '#F3D79B';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (t: number) => {
      if (!running) return;
      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(t * 0.0004 + p.phase) * 0.00035;
        if (p.y < -0.03) {
          p.y = 1.03;
          p.x = Math.random();
        }
      }
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reducedMotion && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, reducedMotion]);

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}
