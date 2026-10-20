import { forwardRef, useLayoutEffect, useRef } from 'react';
import type { CardStyle } from '../types';
import SignatureBloomFlower from '../gift/SignatureBloomFlower';
import type { SignatureBloom } from '../gift/signatureBloom';
import HandwrittenSignature, { splitSignature } from './HandwrittenSignature';

interface GreetingCardProps {
  recipient: string;
  message: string;
  sender: string;
  date: string;
  style: CardStyle;
  /** When set, the recipient's signature bloom replaces the default flower. */
  bloom?: SignatureBloom | null;
  /**
   * When true, the signature draws itself like handwriting (visible
   * preview). The PNG export instance keeps this false so the finished
   * signature is captured.
   */
  animatedSignature?: boolean;
}

interface StyleMeta {
  foil: string;
  bg: string;
  title: string;
  body: string;
  accent: string;
  sub: string;
  hairline: string;
  botanical: string;
}

const STYLE_META: Record<CardStyle, StyleMeta> = {
  midnight: {
    foil: 'linear-gradient(135deg, #8a6a2f 0%, #F3D79B 25%, #DCA47A 50%, #F3D79B 75%, #8a6a2f 100%)',
    bg: 'linear-gradient(168deg, #0d1428 0%, #111a32 45%, #070c1a 100%)',
    title: '#F3D79B',
    body: '#FFF4E6',
    accent: '#F4A0BC',
    sub: 'rgba(243,215,155,0.72)',
    hairline: 'rgba(243,215,155,0.45)',
    botanical: '#C96A8E',
  },
  champagne: {
    foil: 'linear-gradient(135deg, #b98a3f 0%, #F3D79B 30%, #fff3d9 50%, #F3D79B 70%, #b98a3f 100%)',
    bg: 'linear-gradient(168deg, #fffbf3 0%, #fff4e2 55%, #f6e6cb 100%)',
    title: '#8a5a2b',
    body: '#3d2c1c',
    accent: '#C96A8E',
    sub: 'rgba(138,90,43,0.78)',
    hairline: 'rgba(138,90,43,0.4)',
    botanical: '#9a7c46',
  },
  garden: {
    foil: 'linear-gradient(135deg, #8f7cc9 0%, #c9b8ec 30%, #f4a0bc 50%, #c9b8ec 70%, #8f7cc9 100%)',
    bg: 'linear-gradient(168deg, #f7f2ff 0%, #fbeef4 55%, #f1e2ec 100%)',
    title: '#6a4fa3',
    body: '#34264e',
    accent: '#C96A8E',
    sub: 'rgba(106,79,163,0.8)',
    hairline: 'rgba(106,79,163,0.38)',
    botanical: '#7d9b6a',
  },
};

/** Delicate botanical corner: stem, leaves, rose buds. */
function BotanicalCorner({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true"
      style={flip ? { transform: 'scale(-1,-1)' } : undefined}>
      <g fill="none" stroke={color} strokeWidth="1.8" opacity="0.9">
        <path d="M6 90 Q30 60 34 30 Q36 16 46 8" />
        <path d="M20 66 Q34 62 42 50" />
        <path d="M30 44 Q18 40 12 28" />
        <path d="M20 66 q10 -2 16 -12 q-10 0 -16 12" fill={color} stroke="none" opacity="0.55" />
        <path d="M30 44 q-10 -2 -16 -14 q10 0 16 14" fill={color} stroke="none" opacity="0.55" />
      </g>
      <g>
        <circle cx="46" cy="10" r="7" fill={color} />
        <circle cx="44" cy="8" r="3.4" fill="#ffffff" opacity="0.28" />
        <circle cx="12" cy="26" r="5" fill={color} opacity="0.85" />
      </g>
      <circle cx="70" cy="20" r="1.6" fill={color} opacity="0.6" />
      <circle cx="78" cy="34" r="1.2" fill={color} opacity="0.5" />
    </svg>
  );
}

/** Small flourish divider. */
function Flourish({ color }: { color: string }) {
  return (
    <svg width="120" height="16" viewBox="0 0 120 16" aria-hidden="true">
      <g stroke={color} strokeWidth="1.4" fill="none" opacity="0.8">
        <path d="M8 8 H44" />
        <path d="M76 8 H112" />
        <circle cx="60" cy="8" r="3" fill={color} stroke="none" />
        <circle cx="50" cy="8" r="1.4" fill={color} stroke="none" />
        <circle cx="70" cy="8" r="1.4" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

/**
 * The finished greeting card — premium printed-keepsake styling.
 * Rendered as plain DOM (no app chrome inside) so it exports to PNG as-is.
 * Name is rendered as plain text; layout adapts to short/long/empty names.
 */
const GreetingCard = forwardRef<HTMLDivElement, GreetingCardProps>(
  ({ recipient, message, sender, date, style, bloom, animatedSignature = false }, ref) => {
    const meta = STYLE_META[style];
    const displayName = recipient.trim() || 'bạn';
    // "Nguyễn Phúc - sự tôn trọng không hồi kết" → handwritten name + printed tagline.
    const { name: sigName, tagline: sigTagline } = splitSignature(sender);
    const nameSize =
      displayName.length > 18 ? 'text-xl'
      : displayName.length > 10 ? 'text-2xl'
      : 'text-[1.7rem]';
    const nameRef = useRef<HTMLHeadingElement>(null);

    // Never break a name mid-word ("Gian" + orphan "g"). If the name still
    // overflows its line (e.g. a long single word, or wider fallback fonts
    // during PNG export), shrink the font until it fits. The inline size is
    // cloned by the PNG exporter, so preview and export stay identical.
    useLayoutEffect(() => {
      const el = nameRef.current;
      if (!el) return;
      const fit = () => {
        el.style.fontSize = '';
        let size = parseFloat(getComputedStyle(el).fontSize);
        let guard = 40;
        while (el.scrollWidth > el.clientWidth + 1 && size > 11 && guard-- > 0) {
          size -= 0.5;
          el.style.fontSize = `${size}px`;
        }
      };
      fit();
      if (document.fonts?.ready) {
        document.fonts.ready.then(fit).catch(() => {});
      }
    }, [displayName, nameSize]);

    return (
      <div
        ref={ref}
        role="img"
        aria-label={`Thiệp chúc mừng 20/10 gửi ${displayName}`}
        className="relative w-full max-w-[340px] overflow-hidden rounded-2xl"
        style={{ background: meta.foil, padding: 7, aspectRatio: '3/4.5' }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl" style={{ background: meta.bg }}>
          <div className="absolute left-1 top-1 opacity-90">
            <BotanicalCorner color={meta.botanical} />
          </div>
          <div className="absolute bottom-1 right-1 opacity-90">
            <BotanicalCorner color={meta.botanical} flip />
          </div>
          <div className="pointer-events-none absolute inset-4 rounded-lg border"
            style={{ borderColor: meta.hairline }} aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.10), transparent)' }}
            aria-hidden="true" />

          <div className="relative flex h-full flex-col items-center justify-between px-9 py-12 text-center">
            <div>
              <p className="text-[11px] font-medium uppercase"
                style={{ color: meta.sub, letterSpacing: '0.35em' }}>
                Ngày Phụ nữ Việt Nam
              </p>
              <p className="font-display mt-2 text-4xl font-bold"
                style={{ color: meta.title, letterSpacing: '0.18em' }}>
                20·10
              </p>
              <div className="mt-3 flex justify-center">
                <Flourish color={meta.hairline} />
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-3">
              <p className="font-display text-sm italic" style={{ color: meta.sub }}>
                Thân gửi
              </p>
              <h2 ref={nameRef} className={`font-display ${nameSize} font-bold leading-tight`}
                style={{ color: meta.body, maxWidth: '100%', overflowWrap: 'normal', wordBreak: 'normal' }}>
                {displayName}
              </h2>
              {bloom ? (
                <SignatureBloomFlower bloom={bloom} size={72} />
              ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="20" cy="10" rx="5.5" ry="10" fill={meta.accent}
                    opacity="0.9" transform={`rotate(${a} 20 20)`} />
                ))}
                <circle cx="20" cy="20" r="5" fill={meta.title} />
              </svg>
              )}
              <p className="text-[15px] leading-7" style={{ color: meta.body }}>
                {message}
              </p>
            </div>

            <div>
              <div className="mb-3 flex justify-center">
                <Flourish color={meta.hairline} />
              </div>
              <p className="text-xs font-medium uppercase"
                style={{ color: meta.sub, letterSpacing: '0.3em' }}>
                {date}
              </p>
              <div className="mt-1">
                <HandwrittenSignature
                  name={sigName}
                  color={meta.title}
                  animated={animatedSignature}
                />
                {sigTagline ? (
                  <p className="mt-1 text-[11px] italic" style={{ color: meta.sub }}>
                    {sigTagline}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

GreetingCard.displayName = 'GreetingCard';
export default GreetingCard;
