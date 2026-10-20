import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  life: number;
  size: number;
}

/**
 * Desktop-only pointer sparkle trail. Renders nothing on touch devices
 * or when reduced motion is preferred.
 */
export default function PointerTrail({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const sparks: Spark[] = [];
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 28) return; // throttle
      last = now;
      sparks.push({ x: e.clientX, y: e.clientY, life: 1, size: 2 + Math.random() * 3 });
      if (sparks.length > 60) sparks.shift();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= 0.045;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life * 0.7;
        ctx.fillStyle = '#F3D79B';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
    />
  );
}
