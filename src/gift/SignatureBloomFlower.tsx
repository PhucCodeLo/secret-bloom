import { useMemo } from 'react';
import { mulberry32, type SignatureBloom } from './signatureBloom';

/** Renders a SignatureBloom as a layered SVG flower. Purely decorative. */
export default function SignatureBloomFlower({
  bloom,
  size = 220,
}: {
  bloom: SignatureBloom;
  size?: number;
}) {
  const petals = useMemo(() => {
    const rand = mulberry32(bloom.seed);
    const out: Array<{
      key: string;
      angle: number;
      rx: number;
      ry: number;
      fill: string;
      opacity: number;
    }> = [];
    const perLayer = Math.max(4, Math.round(bloom.petalCount / bloom.layers));
    for (let l = 0; l < bloom.layers; l++) {
      const rx = size * (0.30 - l * 0.075);
      const ry = size * (0.145 - l * 0.028);
      for (let i = 0; i < perLayer; i++) {
        const angle =
          (360 / perLayer) * i + l * (180 / perLayer) + (rand() - 0.5) * 12;
        out.push({
          key: `${l}-${i}`,
          angle,
          rx: rx * (0.92 + rand() * 0.16),
          ry: ry * (0.92 + rand() * 0.16),
          fill: l % 2 === 0 ? bloom.petalColor : bloom.petalColor2,
          opacity: 0.92 - l * 0.14,
        });
      }
    }
    return out;
  }, [bloom, size]);

  const c = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={bloom.name}
    >
      <defs>
        <radialGradient id="sbloom-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={bloom.petalColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={bloom.petalColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sbloom-center" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFF8EA" />
          <stop offset="45%" stopColor={bloom.centerColor} />
          <stop offset="100%" stopColor="#8a6a2f" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={c * 0.96} fill="url(#sbloom-glow)" />
      {petals.map((p) => (
        <ellipse
          key={p.key}
          cx={c}
          cy={c - size * 0.19}
          rx={p.rx * 0.44}
          ry={p.ry}
          fill={p.fill}
          opacity={p.opacity}
          stroke={bloom.centerColor}
          strokeOpacity="0.35"
          strokeWidth="1"
          transform={`rotate(${p.angle} ${c} ${c})`}
        />
      ))}
      <circle cx={c} cy={c} r={size * 0.11} fill="url(#sbloom-center)" />
      <circle
        cx={c}
        cy={c}
        r={size * 0.11}
        fill="none"
        stroke={bloom.centerColor}
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
    </svg>
  );
}
