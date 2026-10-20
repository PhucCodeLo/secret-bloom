import { useRef, useState } from 'react';

interface HoldButtonProps {
  duration?: number;
  onComplete: () => void;
  className?: string;
  ringColor?: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/**
 * Press-and-hold button with a visible charge ring. Keyboard accessible
 * (hold Space/Enter). If reduced motion is on, a single click completes it.
 */
export default function HoldButton({
  duration = 1200,
  onComplete,
  className = '',
  ringColor = '#F3D79B',
  label,
  hint,
  disabled = false,
}: HoldButtonProps) {
  const [charge, setCharge] = useState(0);
  const [holding, setHolding] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const done = useRef(false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = () => {
    if (done.current || disabled) return;
    done.current = true;
    cancelAnimationFrame(raf.current);
    setCharge(1);
    setHolding(false);
    onComplete();
  };

  const tick = () => {
    const p = Math.min(1, (performance.now() - start.current) / duration);
    setCharge(p);
    if (p >= 1) {
      finish();
    } else {
      raf.current = requestAnimationFrame(tick);
    }
  };

  const begin = () => {
    if (disabled || done.current) return;
    if (reduced) {
      finish();
      return;
    }
    done.current = false;
    setHolding(true);
    start.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (done.current) return;
    cancelAnimationFrame(raf.current);
    setHolding(false);
    setCharge(0);
  };

  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            begin();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') cancel();
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative flex h-24 w-24 touch-none select-none items-center justify-center rounded-full ${className}`}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      >
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(243,215,155,0.18)" strokeWidth="4" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - charge)}
            style={{ filter: 'drop-shadow(0 0 6px rgba(243,215,155,0.8))' }}
          />
        </svg>
        <span
          className={`font-display text-2xl transition-transform ${holding ? 'scale-125' : 'scale-100'}`}
          aria-hidden="true"
        >
          ✦
        </span>
      </button>
      <p className="text-sm text-ivory/70">{hint ?? 'Nhấn giữ để tiếp tục'}</p>
    </div>
  );
}
