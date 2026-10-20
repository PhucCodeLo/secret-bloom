import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import HandwrittenSignature, { splitSignature } from './HandwrittenSignature';

interface LetterCardProps {
  lines: string[];
  signature: string;
  reducedMotion: boolean;
  onComplete: () => void;
}

const LINE_MS = 1400;

/**
 * Ivory letter revealed line by line, with "read all" and replay controls.
 * The user can always advance immediately — never forced to wait.
 */
export default function LetterCard({
  lines,
  signature,
  reducedMotion,
  onComplete,
}: LetterCardProps) {
  const [count, setCount] = useState(1);
  const [runId, setRunId] = useState(0);
  const doneRef = useRef(false);

  // Empty strings are paragraph separators in the source data — filter them
  // so every reveal tick shows a real paragraph and spacing stays uniform.
  const paras = useMemo(() => lines.filter((l) => l.trim() !== ''), [lines]);
  const total = paras.length;

  useEffect(() => {
    doneRef.current = false;
    if (reducedMotion) {
      setCount(total);
      return;
    }
    setCount(1);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= total) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, LINE_MS);
    return () => window.clearInterval(id);
  }, [runId, total, reducedMotion]);

  useEffect(() => {
    if (count >= total && !doneRef.current) {
      doneRef.current = true;
      onComplete();
    }
  }, [count, total, onComplete]);

  const readAll = () => setCount(lines.length);
  const replay = () => {
    doneRef.current = false;
    setRunId((r) => r + 1);
  };

  const complete = count >= total;

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="letter-paper gold-frame relative rounded-lg p-6 sm:p-8"
        role="article"
        aria-label="Thư chúc mừng 20/10"
      >
        <div className="mb-4 flex justify-center" aria-hidden="true">
          <svg width="72" height="40" viewBox="0 0 72 40">
            <path
              d="M36 6 C28 14 24 18 24 24 a12 12 0 0 0 24 0 C48 18 44 14 36 6 Z"
              fill="#F4A0BC"
              stroke="#C96A8E"
              strokeWidth="1.5"
            />
            <circle cx="36" cy="24" r="3.4" fill="#F3D79B" />
            <path d="M20 34 Q36 28 52 34" stroke="#DCA47A" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="font-display space-y-5 text-[17px] leading-9 text-[#3a2a1c] sm:text-lg sm:leading-10">
          {paras.slice(0, count).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={i === 0 ? 'letter-dropcap' : undefined}
            >
              {line}
            </motion.p>
          ))}
          {!complete && (
            <span className="mt-2 inline-block h-5 w-2 animate-pulse bg-rosegold/70" aria-hidden="true" />
          )}
        </div>

        {complete && (
          <>
            <div className="my-7 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-16 bg-[#c9a86a]/60" />
              <span className="text-sm text-[#c9a86a]">✦</span>
              <span className="font-display text-base text-[#c9a86a]">❀</span>
              <span className="text-sm text-[#c9a86a]">✦</span>
              <span className="h-px w-16 bg-[#c9a86a]/60" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {(() => {
                const { name, tagline } = splitSignature(signature);
                return (
                  <>
                    <HandwrittenSignature name={name} color="#6b4a2e" delayMs={400} />
                    {tagline ? (
                      <p className="-mt-1 text-center text-sm italic text-[#6b4a2e]/80">
                        {tagline}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </motion.div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {!complete ? (
          <button
            type="button"
            onClick={readAll}
            className="btn-ghost rounded-full px-6 py-2.5 text-base"
          >
            Đọc toàn bộ
          </button>
        ) : (
          <button
            type="button"
            onClick={replay}
            className="btn-ghost rounded-full px-6 py-2.5 text-base"
          >
            Xem lại thư
          </button>
        )}
      </div>
      <p className="sr-only" role="status">
        {complete ? 'Đã đọc xong thư.' : `Đang đọc thư: đoạn ${Math.min(count, total)} trên ${total}.`}
      </p>
    </div>
  );
}
