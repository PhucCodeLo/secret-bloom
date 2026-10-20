import { motion } from 'framer-motion';
import type { GiftConfig } from './types';

/** Shown when a gift has a future reveal date. No way to peek early. */
export default function GiftLocked({ gift }: { gift: GiftConfig }) {
  const firstName = gift.recipientName.trim().split(/\s+/).pop() ?? 'bạn';
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-md flex-col items-center gap-5"
      >
        <motion.span
          className="font-display text-6xl text-champagne"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          🎁
        </motion.span>
        <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
          Món quà dành cho {firstName}
        </h2>
        <p className="max-w-xs text-[15px] leading-7 text-ivory/70">
          Người gửi muốn bạn mở món quà này vào đúng dịp đặc biệt.
        </p>
        <p className="rounded-full border border-champagne/30 bg-midnight/60 px-6 py-2.5 font-display text-lg text-champagne">
          Mở vào ngày {gift.revealDate?.split('-').reverse().join('.')}
        </p>
        <p className="max-w-xs text-sm leading-6 text-ivory/50">
          Hãy quay lại đúng ngày nhé — khu vườn đang chờ bạn.
        </p>
      </motion.div>
    </div>
  );
}
