import { useRef } from 'react';

interface ParallaxLayerProps {
  depth?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Subtle pointer parallax for background layers (desktop, fine pointer only).
 * Manipulates the DOM node directly — no React re-renders on pointermove.
 */
export default function ParallaxLayer({
  depth = 12,
  disabled = false,
  className = '',
  children,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const apply = () => {
    raf.current = 0;
    const t = target.current;
    const c = current.current;
    c.x += (t.x - c.x) * 0.06;
    c.y += (t.y - c.y) * 0.06;
    if (ref.current) {
      ref.current.style.transform = `translate3d(${(-c.x * depth).toFixed(2)}px, ${(-c.y * depth).toFixed(2)}px, 0)`;
    }
    if (Math.abs(t.x - c.x) > 0.0008 || Math.abs(t.y - c.y) > 0.0008) {
      raf.current = requestAnimationFrame(apply);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (disabled) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    target.current.x = e.clientX / window.innerWidth - 0.5;
    target.current.y = e.clientY / window.innerHeight - 0.5;
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  };

  const onPointerLeave = () => {
    target.current.x = 0;
    target.current.y = 0;
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: 'transform' }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}
