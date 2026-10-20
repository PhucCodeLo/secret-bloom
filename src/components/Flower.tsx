import { useId } from 'react';
import { motion } from 'framer-motion';

export interface FlowerPalette {
  petal: string;
  petalDark: string;
  center: string;
  glow: string;
}

interface FlowerProps {
  name: string;
  palette: FlowerPalette;
  open: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function Stem() {
  return (
    <g>
      <path
        d="M60 158 C60 128 58 112 60 96"
        stroke="#2f6b4f"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="46" cy="132" rx="12" ry="6" fill="#3a7d5c" transform="rotate(-28 46 132)" />
      <ellipse cx="74" cy="142" rx="12" ry="6" fill="#3a7d5c" transform="rotate(24 74 142)" />
    </g>
  );
}

function Bud({ dark }: { dark: string }) {
  return (
    <g>
      <path
        d="M60 52 C44 66 42 84 60 100 C78 84 76 66 60 52 Z"
        fill={dark}
        opacity="0.92"
      />
      <path
        d="M60 52 C52 62 50 74 60 88 C70 74 68 62 60 52 Z"
        fill={dark}
        opacity="0.55"
      />
      <path d="M52 96 L46 108 M68 96 L74 108" stroke="#2f6b4f" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Bloom({ palette, glowId }: { palette: FlowerPalette; glowId: string }) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <g>
      <circle cx="60" cy="66" r="46" fill={`url(#${glowId})`} />
      {petals.map((angle) => (
        <ellipse
          key={angle}
          cx="60"
          cy="36"
          rx="13"
          ry="30"
          fill={palette.petal}
          stroke={palette.petalDark}
          strokeWidth="1.5"
          opacity="0.96"
          transform={`rotate(${angle} 60 66)`}
        />
      ))}
      {petals.map((angle) => (
        <ellipse
          key={`i-${angle}`}
          cx="60"
          cy="46"
          rx="9"
          ry="20"
          fill={palette.petal}
          opacity="0.9"
          transform={`rotate(${angle + 22.5} 60 66)`}
        />
      ))}
      <circle cx="60" cy="66" r="11" fill={palette.center} />
      <circle cx="60" cy="66" r="11" fill="none" stroke={palette.petalDark} strokeWidth="1.5" opacity="0.7" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <circle
            key={`d-${i}`}
            cx={60 + Math.cos(a) * 6}
            cy={66 + Math.sin(a) * 6}
            r="1.6"
            fill={palette.petalDark}
            opacity="0.8"
          />
        );
      })}
    </g>
  );
}

/**
 * An interactive glowing flower. Crossfades between a closed bud and an open
 * bloom (transforms are applied to wrapper divs for reliable animation).
 */
export default function Flower({ name, palette, open, onSelect, disabled }: FlowerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const glowId = `glow-${uid}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={open ? `${name} — đã nở` : `Chạm để đánh thức ${name}`}
      aria-pressed={open}
      className="relative h-44 w-28 shrink-0 cursor-pointer touch-manipulation sm:h-48 sm:w-32"
    >
      <span className="stage-glow absolute inset-0" aria-hidden="true" />
      <motion.span
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: open ? 0 : 1, scale: open ? 0.7 : 1 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <Stem />
          <Bud dark={palette.petalDark} />
        </svg>
      </motion.span>
      <motion.span
        className="absolute inset-0"
        initial={false}
        animate={{
          opacity: open ? 1 : 0,
          scale: open ? 1 : 0.7,
        }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={
          open
            ? { filter: `drop-shadow(0 0 14px ${palette.glow})` }
            : undefined
        }
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <defs>
            <radialGradient id={glowId}>
              <stop offset="0%" stopColor={palette.glow} stopOpacity="0.55" />
              <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <Stem />
          <Bloom palette={palette} glowId={glowId} />
        </svg>
      </motion.span>
      {open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute -right-1 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-champagne text-sm font-bold text-midnight"
          aria-hidden="true"
        >
          ✓
        </motion.span>
      )}
    </button>
  );
}
