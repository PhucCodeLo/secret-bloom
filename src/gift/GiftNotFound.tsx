import { motion } from 'framer-motion';

/**
 * Shown when ?gift=<id> is present but the gift can't be loaded on this
 * device. Honest about the local-prototype limitation; never pretends
 * the gift exists somewhere else.
 */
export default function GiftNotFound({
  giftId,
  onPlayDefault,
  onCreate,
}: {
  giftId: string;
  onPlayDefault: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-md flex-col items-center gap-5"
      >
        <span className="font-display text-5xl text-champagne/70" aria-hidden="true">✦</span>
        <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
          Không tìm thấy món quà này
        </h2>
        <p className="max-w-xs text-[15px] leading-7 text-ivory/70">
          Liên kết bạn mở có mã <code className="rounded bg-white/10 px-1.5 py-0.5 text-champagne">{giftId}</code>,
          nhưng món quà không có trên thiết bị này.
        </p>
        <p className="max-w-xs rounded-2xl border border-champagne/25 bg-midnight/60 px-4 py-3 text-sm leading-6 text-ivory/60">
          Phiên bản hiện tại lưu quà <strong className="text-ivory/80">trên máy của người tạo</strong>,
          nên link chỉ mở được trên đúng máy đó. Hãy nhờ người gửi mở lại link trên máy họ,
          hoặc tạo một món quà mới ngay tại đây.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onCreate}
            className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
          >
            Tạo món quà mới ✦
          </button>
          <button
            type="button"
            onClick={onPlayDefault}
            className="btn-ghost rounded-full px-8 py-2.5 text-base"
          >
            Chơi hành trình mặc định
          </button>
        </div>
      </motion.div>
    </div>
  );
}
