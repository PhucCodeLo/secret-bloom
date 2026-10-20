import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GiftBox from './GiftBox';
import LightBurst from './atmosphere/LightBurst';
import type { Sfx } from '../types';

interface GiftOpeningProps {
  sfx: Sfx;
  reducedMotion: boolean;
  onDone: () => void;
}

// Multi-stage opening timeline (ms). Skippable at any moment.
const STAGE_TIMES = [1100, 2300, 3400, 4400, 5600];
const CAPTIONS = [
  'Một món quà đang hiện ra từ xa…',
  'Chiếc nơ từ từ nới lỏng…',
  'Ánh sáng đang len qua nắp hộp…',
  'Nắp hộp đang mở ra…',
  'Điều kỳ diệu đang bung nở…',
];

export default function GiftOpening({ sfx, reducedMotion, onDone }: GiftOpeningProps) {
  const [stage, setStage] = useState(0);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFinished(true);
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    // let the final burst breathe, then advance
    window.setTimeout(onDone, reducedMotion ? 200 : 1400);
  };

  useEffect(() => {
    if (reducedMotion) {
      setStage(4);
      const id = window.setTimeout(finish, 1200);
      return () => window.clearTimeout(id);
    }
    STAGE_TIMES.forEach((t, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setStage(i + 1);
          if (i === 1) sfx.pop();
          if (i === 3) sfx.reveal();
          if (i === 4) sfx.success();
        }, t),
      );
    });
    timers.current.push(window.setTimeout(finish, STAGE_TIMES[STAGE_TIMES.length - 1] + 1500));
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const openStage = finished ? 5 : stage;

  return (
    <div className="relative flex flex-col items-center gap-6 text-center">
      <p className="font-display text-2xl italic text-champagne" role="status" aria-live="polite">
        {openStage >= 5 ? 'Món quà đã mở!' : CAPTIONS[Math.min(openStage, CAPTIONS.length - 1)]}
      </p>

      <div className="relative">
        <GiftBox
          opened={openStage >= 4}
          distant={openStage === 0}
          ribbonLoose={openStage >= 2}
          lidGlow={openStage >= 3}
          tilt={false}
          size="lg"
          reducedMotion={reducedMotion}
        />
        {openStage >= 5 && !reducedMotion && (
          <>
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <LightBurst burstKey="gift-open" size={380} />
            </div>
            <div className="pointer-events-none absolute inset-[-40px]" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className="petal"
                  style={{
                    left: `${6 + Math.random() * 88}%`,
                    width: 9 + Math.random() * 8,
                    height: 13 + Math.random() * 10,
                    animationDuration: `${3.5 + Math.random() * 3}s`,
                    animationDelay: `${Math.random() * 1.2}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!finished && (
          <button
            type="button"
            onClick={finish}
            className="btn-ghost rounded-full px-6 py-2 text-sm"
          >
            Bỏ qua
          </button>
        )}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={openStage >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.6 }}
          onClick={finish}
          className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
          style={{ visibility: openStage >= 4 ? 'visible' : 'hidden' }}
        >
          Xem thư →
        </motion.button>
      </div>
    </div>
  );
}
