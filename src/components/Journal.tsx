import { motion } from 'framer-motion';
import type { JournalEntry } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onClose: () => void;
}

/** Discovery journal overlay: every collected memory fragment. */
export default function Journal({ entries, onClose }: JournalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Nhật ký khám phá"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-champagne/30 bg-deepblue"
      >
        <div className="flex items-center justify-between border-b border-champagne/20 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-champagne">Nhật ký khám phá</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng nhật ký"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory/70"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-ivory/60">
              Chưa có gì ở đây. Hãy khám phá khu vườn — mỗi điều kỳ diệu bạn tìm thấy sẽ được ghi lại.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {entries.map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="rounded-2xl border border-ivory/10 bg-midnight/60 px-4 py-3"
                >
                  <p className="font-display text-base font-semibold text-champagne">{e.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ivory/75">{e.text}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-champagne/20 px-6 py-3 text-center text-xs text-ivory/45">
          {entries.length} kỷ niệm đã sưu tầm
        </p>
      </motion.div>
    </motion.div>
  );
}
