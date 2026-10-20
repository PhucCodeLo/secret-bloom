import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * "Nguyễn Phúc - sự tôn trọng không hồi kết" → handwritten name + printed tagline.
 * Senders without " - " just get the handwritten name.
 */
export function splitSignature(full: string): { name: string; tagline: string } {
  const idx = full.indexOf(' - ');
  if (idx < 0) return { name: full.trim() || full, tagline: '' };
  return {
    name: full.slice(0, idx).trim() || full,
    tagline: full.slice(idx + 3).trim(),
  };
}

interface HandwrittenSignatureProps {
  name: string;
  color: string;
  /**
   * When true, the signature draws itself like real handwriting once it
   * scrolls into view. When false (PNG export, reduced motion), the
   * finished signature renders immediately.
   */
  animated?: boolean;
  delayMs?: number;
}

/**
 * A signature that writes itself: glyph outlines are stroked progressively
 * (dash length measured from the actual rendered text so the timing stays
 * honest), then the ink fill fades in.
 */
export default function HandwrittenSignature({
  name,
  color,
  animated = true,
  delayMs = 700,
}: HandwrittenSignatureProps) {
  const textRef = useRef<SVGTextElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dashLen, setDashLen] = useState(1400);
  const [inView, setInView] = useState(false);

  const fontSize = name.length > 16 ? 30 : name.length > 10 ? 37 : 44;

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    try {
      const advance = el.getComputedTextLength();
      // Script glyph outlines run ~4x the advance width.
      setDashLen(Math.max(600, Math.ceil(advance * 4.2)));
    } catch {
      /* keep the fallback length */
    }
  }, [name, fontSize]);

  useLayoutEffect(() => {
    if (!animated) return;
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animated]);

  const draw = animated && inView;

  return (
    <div ref={wrapRef} className="flex justify-center">
      <svg
        viewBox="0 0 320 96"
        className="h-[72px] w-56"
        role="img"
        aria-label={`Chữ ký của ${name}`}
      >
        <text
          ref={textRef}
          x="160"
          y="64"
          textAnchor="middle"
          className={draw ? 'handwritten-draw' : 'handwritten-final'}
          style={
            {
              fontSize,
              '--sig-len': dashLen,
              '--sig-delay': `${delayMs}ms`,
              '--sig-color': color,
            } as CSSProperties
          }
        >
          {name}
        </text>
      </svg>
    </div>
  );
}
