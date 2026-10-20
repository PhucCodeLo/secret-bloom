import { useMemo } from 'react';

interface FloatingPetalsProps {
  count?: number;
  reducedMotion?: boolean;
}

interface PetalSpec {
  left: number;
  delay: number;
  duration: number;
  size: number;
}

/** Slowly drifting rose petals, pure CSS animation. */
export default function FloatingPetals({
  count = 10,
  reducedMotion = false,
}: FloatingPetalsProps) {
  const petals = useMemo<PetalSpec[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 10 + Math.random() * 9,
        size: 9 + Math.random() * 11,
      })),
    [count],
  );

  if (reducedMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
