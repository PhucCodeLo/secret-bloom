import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import Envelope from '../components/Envelope';
import LetterCard from '../components/LetterCard';
import { CONFIG } from '../config';
import type { Sfx } from '../types';

interface LetterSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  /** Assembled letter paragraphs (fragments → central letter → signature). */
  letterParagraphs: string[];
  /** Number of discovery fragments woven into the letter. */
  fragmentCount: number;
  onNext: () => void;
}

export default function LetterScene({
  sfx,
  reducedMotion,
  letterParagraphs,
  fragmentCount,
  onNext,
}: LetterSceneProps) {
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [letterDone, setLetterDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(() => setLetterDone(true), []);

  /** Save the finished letter as a PNG keepsake. */
  const saveLetter = async () => {
    const el = letterRef.current;
    if (!el || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: '#FFF4E6' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'buc-thu-20-10.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSaveMsg('Đã lưu bức thư về máy của bạn.');
      sfx.success();
    } catch {
      setSaveMsg('Không tạo được file ảnh lúc này. Bạn có thể chụp màn hình để giữ bức thư nhé.');
      sfx.error();
    } finally {
      setSaving(false);
    }
  };

  // letterParagraphs ends with the signature; LetterCard renders it separately.
  const { lines, signature } = useMemo(() => {
    if (letterParagraphs.length === 0) {
      return { lines: [...CONFIG.letterLines], signature: CONFIG.letterSignature };
    }
    return {
      lines: letterParagraphs.slice(0, -1),
      signature: letterParagraphs[letterParagraphs.length - 1],
    };
  }, [letterParagraphs]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full flex-col items-center gap-8"
      >
        {!envelopeOpen ? (
          <>
            <div className="text-center">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
                Hồi XIII — Lá thư
              </p>
              <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
                Một lá thư <span className="text-rose">dành cho bạn</span>
              </h2>
              {fragmentCount > 0 && (
                <p className="mt-3 font-display text-base italic text-champagne/90">
                  Được dệt từ {fragmentCount} khám phá của bạn trong khu vườn
                </p>
              )}
            </div>
            <Envelope reducedMotion={reducedMotion} onOpened={() => setEnvelopeOpen(true)} />
          </>
        ) : (
          <>
            <div ref={letterRef} className="w-full">
              <LetterCard
                lines={lines}
                signature={signature}
                reducedMotion={reducedMotion}
                onComplete={handleComplete}
              />
            </div>

            {letterDone && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex w-full max-w-md flex-col gap-3"
              >
                <button
                  type="button"
                  onClick={saveLetter}
                  disabled={saving}
                  className="min-h-[52px] rounded-full border border-champagne/40 bg-deepblue/60 px-8 text-base font-semibold text-champagne transition hover:bg-deepblue"
                >
                  {saving ? 'Đang tạo ảnh…' : '🖼️ Lưu bức thư (PNG)'}
                </button>
                {saveMsg && (
                  <p className="text-center text-sm text-champagne/90" role="status">
                    {saveMsg}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sfx.sparkle();
                    onNext();
                  }}
                  className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
                >
                  Chứng kiến vườn hoa bừng nở →
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
