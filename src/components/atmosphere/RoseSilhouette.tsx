interface RoseSilhouetteProps {
  className?: string;
  opacity?: number;
}

/**
 * Distant midnight-garden silhouette: rolling hill, rose bushes, stems.
 * Rendered very dark — a background layer, not a focal object.
 */
export default function RoseSilhouette({ className = '', opacity = 1 }: RoseSilhouetteProps) {
  const bushes = [
    { x: 30, s: 1.1 },
    { x: 95, s: 0.8 },
    { x: 160, s: 1.25 },
    { x: 235, s: 0.9 },
    { x: 310, s: 1.15 },
    { x: 372, s: 0.75 },
  ];
  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* hill */}
      <path
        d="M0 120 L0 88 Q80 62 160 80 Q240 96 320 74 Q370 62 400 72 L400 120 Z"
        fill="#070b16"
      />
      {/* bushes */}
      {bushes.map((b, i) => (
        <g key={i} transform={`translate(${b.x} 0) scale(${b.s})`}>
          <path d="M0 92 C-2 70 -6 58 -12 48 M0 92 C2 68 6 56 14 46" stroke="#0a1224" strokeWidth="4" fill="none" />
          {[
            [-13, 44, 9],
            [15, 42, 10],
            [0, 34, 11],
            [-6, 52, 8],
            [8, 54, 7],
          ].map(([cx, cy, r], j) => (
            <g key={j}>
              <circle cx={cx} cy={cy} r={r} fill="#0a1224" />
              <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.45} fill="#101a30" />
            </g>
          ))}
        </g>
      ))}
      {/* grass blades */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = (i * 163) % 400;
        const h = 8 + ((i * 37) % 14);
        return (
          <path
            key={i}
            d={`M${x} 120 q ${(i % 2 === 0 ? 3 : -3)} ${-h} 0 ${-h - 4}`}
            stroke="#0a1224"
            strokeWidth="2.5"
            fill="none"
          />
        );
      })}
    </svg>
  );
}
