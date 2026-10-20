import type { FlowerSpecies } from '../data/finaleFlowers';

/**
 * The giant bloom at the garden's heart in the finale.
 * Rendered from a FlowerSpecies so every playthrough opens a different flower.
 */
export default function FinaleFlower({ species }: { species: FlowerSpecies }) {
  return (
    <svg viewBox="0 0 200 200" className="h-52 w-52" role="img" aria-label={`Hoa ${species.name}`}>
      {species.layers.map((layer, li) => (
        <g key={li} transform={`rotate(${layer.rotateOffset} 100 100)`}>
          {Array.from({ length: layer.count }, (_, p) => (
            <ellipse
              key={p}
              cx="100"
              cy={layer.cy}
              rx={layer.rx}
              ry={layer.ry}
              transform={`rotate(${(p * 360) / layer.count} 100 100)`}
              fill={layer.fill}
              fillOpacity={layer.opacity}
              stroke={species.stroke}
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
      <circle cx="100" cy="100" r="16" fill={species.centerOuter} />
      <circle cx="100" cy="100" r="9" fill={species.centerInner} />
    </svg>
  );
}
