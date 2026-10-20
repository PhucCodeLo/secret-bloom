import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  THEMES,
  VIRTUES,
  defaultGiftConfig,
  validateGiftConfig,
  type GiftConfig,
  type ThemeId,
  type VirtueId,
} from './types';
import { THEME_VISUALS } from './themes';
import { deleteGift, giftShareUrl, listGifts, saveGift } from './store';

function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(
    n.getDate(),
  ).padStart(2, '0')}`;
}

const inputCls =
  'w-full rounded-xl border border-champagne/25 bg-midnight/60 px-4 py-3 text-base text-ivory placeholder:text-ivory/30 outline-none focus:border-champagne/60';

export default function GiftBuilder({ onExit }: { onExit: () => void }) {
  const [draft, setDraft] = useState<GiftConfig>(() => ({
    ...defaultGiftConfig(),
    senderName: 'Nguyễn Phúc - sự tôn trọng không hồi kết',
  }));
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState<GiftConfig | null>(null);
  const [savedList, setSavedList] = useState<GiftConfig[]>(() => listGifts());
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof GiftConfig>(k: K, v: GiftConfig[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const shareUrl = useMemo(() => (saved ? giftShareUrl(saved.id) : ''), [saved]);

  const submit = () => {
    const errs = validateGiftConfig(draft);
    setErrors(errs);
    if (errs.length > 0) {
      window.scrollTo(0, 0);
      return;
    }
    try {
      const s = saveGift(draft);
      setSaved(s);
      setSavedList(listGifts());
      setErrors([]);
      window.scrollTo(0, 0);
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Không lưu được món quà.']);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the readonly input
      document.getElementById('gift-share-url')?.focus();
    }
  };

  const remove = (id: string) => {
    if (!window.confirm('Xóa món quà này khỏi máy? Người nhận sẽ không mở được link nữa.'))
      return;
    deleteGift(id);
    setSavedList(listGifts());
    if (saved?.id === id) setSaved(null);
  };

  const visual = THEME_VISUALS[draft.theme];

  /* ------------------------------- done screen ------------------------------ */
  if (saved) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex w-full max-w-md flex-col items-center gap-5 text-center"
        >
          <span className="font-display text-5xl text-champagne" aria-hidden="true">🎁</span>
          <h2 className="font-display text-2xl font-bold text-ivory sm:text-3xl">
            Món quà đã sẵn sàng!
          </h2>
          <p className="max-w-xs text-[15px] leading-7 text-ivory/70">
            Dành cho <strong className="text-ivory">{saved.recipientName}</strong>
            {saved.revealDate && (
              <> — sẽ mở vào ngày {saved.revealDate.split('-').reverse().join('.')}</>
            )}
          </p>

          <div className="w-full rounded-2xl border border-champagne/25 bg-midnight/60 p-4">
            <p className="mb-2 text-left text-xs uppercase tracking-[0.25em] text-ivory/50">
              Link quà tặng
            </p>
            <div className="flex items-center gap-2">
              <input
                id="gift-share-url"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-xl border border-champagne/25 bg-black/30 px-3 py-2.5 text-sm text-champagne"
              />
              <button
                type="button"
                onClick={copyLink}
                className="btn-gold shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                {copied ? 'Đã copy ✓' : 'Copy'}
              </button>
            </div>
            <p className="mt-3 text-left text-xs leading-5 text-ivory/55">
              ⚠️ Bản hiện tại lưu quà <strong className="text-ivory/75">trên máy này</strong> —
              link chỉ mở được trên đúng thiết bị này. Lời nhắn riêng không nằm trong link.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = shareUrl;
              }}
              className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
            >
              Mở thử món quà →
            </button>
            <button
              type="button"
              onClick={() => {
                setSaved(null);
                setDraft({ ...defaultGiftConfig(), senderName: draft.senderName });
              }}
              className="btn-ghost rounded-full px-8 py-2.5 text-base"
            >
              Tạo quà khác
            </button>
            <button type="button" onClick={onExit} className="text-sm text-ivory/50 underline">
              Về trang chủ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* --------------------------------- form --------------------------------- */
  return (
    <div className="relative flex min-h-dvh flex-col items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex w-full max-w-md flex-col gap-6"
      >
        <div className="text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Xưởng tạo quà
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Gói một <span className="text-champagne">món quà</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-ivory/70">
            Đặt tên người nhận, chọn chủ đề, viết lời nhắn — rồi gửi link cho họ.
          </p>
        </div>

        {errors.length > 0 && (
          <div role="alert" className="rounded-2xl border border-rose/50 bg-rose/10 px-4 py-3">
            {errors.map((e) => (
              <p key={e} className="text-sm leading-6 text-rose">• {e}</p>
            ))}
          </div>
        )}

        {/* live preview */}
        <div
          className="overflow-hidden rounded-3xl border border-champagne/25"
          style={{ background: visual.cardBg }}
        >
          <div className="px-5 py-6 text-center" style={{ background: visual.bg }}>
            <p className="text-[11px] uppercase tracking-[0.35em]" style={{ color: visual.accent }}>
              {THEMES[draft.theme].name} · {THEMES[draft.theme].tagline}
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-ivory">
              {draft.recipientName.trim() || 'Tên người nhận'}
            </p>
            <p className="mt-2 text-sm italic leading-6 text-ivory/70">
              {draft.personalMessage.trim()
                ? draft.personalMessage.trim().slice(0, 90) +
                  (draft.personalMessage.trim().length > 90 ? '…' : '')
                : 'Lời nhắn của bạn sẽ hiện ở đây…'}
            </p>
            <p className="mt-3 text-xs text-ivory/50">từ {draft.senderName.trim() || '…'}</p>
          </div>
        </div>

        {/* names */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ivory/80">
              Tên người nhận <span className="text-rose">*</span>
            </span>
            <input
              type="text"
              value={draft.recipientName}
              maxLength={40}
              onChange={(e) => set('recipientName', e.target.value)}
              placeholder="VD: Mẹ, Lan, cô Mai…"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ivory/80">
              Tên người gửi <span className="text-rose">*</span>
            </span>
            <input
              type="text"
              value={draft.senderName}
              maxLength={60}
              onChange={(e) => set('senderName', e.target.value)}
              placeholder="VD: Con trai của mẹ"
              className={inputCls}
            />
          </label>
        </div>

        {/* theme */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ivory/80">Chủ đề khu vườn</span>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEMES) as ThemeId[]).map((t) => {
              const v = THEME_VISUALS[t];
              const active = draft.theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('theme', t)}
                  aria-pressed={active}
                  className={`rounded-2xl border p-3 text-left transition-transform ${
                    active
                      ? 'border-champagne scale-[1.03]'
                      : 'border-champagne/20'
                  }`}
                  style={{ background: v.cardBg }}
                >
                  <span
                    className="mb-2 block h-10 rounded-xl"
                    style={{ background: v.bg, boxShadow: `inset 0 0 12px ${v.glow}` }}
                    aria-hidden="true"
                  />
                  <span className="block text-sm font-semibold text-ivory">{THEMES[t].name}</span>
                  <span className="block text-xs leading-5 text-ivory/55">{THEMES[t].tagline}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* invitation: salutation + opening line */}
        <div className="flex flex-col gap-3 rounded-2xl border border-champagne/20 bg-midnight/40 p-4">
          <p className="text-sm font-medium text-ivory/80">Thiệp mời mở đầu</p>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ivory/80">
              Cách xưng hô
              <span className="ml-2 text-xs font-normal text-ivory/50">
                ({draft.salutation.length}/20)
              </span>
            </span>
            <input
              value={draft.salutation}
              maxLength={20}
              onChange={(e) => set('salutation', e.target.value)}
              placeholder="em"
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ivory/80">
              Lời dẫn trên thiệp mời
              <span className="ml-2 text-xs font-normal text-ivory/50">
                ({draft.invitationText.length}/300)
              </span>
            </span>
            <textarea
              value={draft.invitationText}
              maxLength={300}
              rows={3}
              onChange={(e) => set('invitationText', e.target.value)}
              placeholder="Có một khu vườn đã chờ em từ rất lâu. Tối nay, cánh cửa ấy chỉ mở cho em thôi."
              className={`${inputCls} resize-none`}
            />
            <span className="text-xs leading-5 text-ivory/45">
              Để trống sẽ dùng lời dẫn mặc định — màu phong thư theo chủ đề bạn chọn.
            </span>
          </label>
        </div>

        {/* personal message */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ivory/80">
            Lời nhắn riêng
            <span className="ml-2 text-xs font-normal text-ivory/50">
              ({draft.personalMessage.length}/500)
            </span>
          </span>
          <textarea
            value={draft.personalMessage}
            maxLength={500}
            rows={4}
            onChange={(e) => set('personalMessage', e.target.value)}
            placeholder="Điều bạn muốn nói riêng với họ — sẽ hiện ở cuối hành trình…"
            className={`${inputCls} resize-none`}
          />
          <span className="text-xs leading-5 text-ivory/45">
            🔒 Lời nhắn chỉ lưu trên máy này và hiện cho người nhận khi mở quà — không nằm trong link.
          </span>
        </label>

        {/* reveal timing */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ivory/80">Hẹn giờ mở quà</span>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={draft.revealDate ?? ''}
              min={todayISO()}
              onChange={(e) => set('revealDate', e.target.value || null)}
              className={`${inputCls} flex-1`}
              style={{ colorScheme: 'dark' }}
            />
            {draft.revealDate && (
              <button
                type="button"
                onClick={() => set('revealDate', null)}
                className="btn-ghost shrink-0 rounded-xl px-4 py-2.5 text-sm"
              >
                Xóa
              </button>
            )}
          </div>
          <span className="text-xs leading-5 text-ivory/45">
            Để trống = mở bất cứ lúc nào. Nếu đặt ngày, link sẽ khóa đến đúng ngày đó.
          </span>
        </div>

        {/* virtue focus */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ivory/80">Nhấn mạnh điều gì?</span>
          <div className="grid grid-cols-2 gap-2">
            {(['balanced', 'love', 'gratitude', 'joy'] as const).map((v) => {
              const active = draft.virtueFocus === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('virtueFocus', v as VirtueId | 'balanced')}
                  aria-pressed={active}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition-transform ${
                    active
                      ? 'border-champagne bg-champagne/10 text-ivory'
                      : 'border-champagne/20 text-ivory/60'
                  }`}
                >
                  {v === 'balanced' ? 'Cân bằng cả ba' : VIRTUES[v as VirtueId].name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          className="btn-gold min-h-[54px] rounded-full text-lg font-semibold"
        >
          Tạo link quà tặng ✦
        </button>

        {/* manage existing */}
        {savedList.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-champagne/15 pt-5">
            <span className="text-sm font-medium text-ivory/80">
              Quà đã tạo trên máy này ({savedList.length})
            </span>
            {savedList.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 rounded-2xl border border-champagne/15 bg-midnight/50 px-4 py-3"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-ivory">{g.recipientName}</p>
                  <p className="truncate text-xs text-ivory/50">
                    {THEMES[g.theme].name}
                    {g.revealDate ? ` · mở ${g.revealDate.split('-').reverse().join('.')}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = giftShareUrl(g.id);
                  }}
                  className="btn-ghost shrink-0 rounded-xl px-3 py-1.5 text-sm"
                >
                  Mở
                </button>
                <button
                  type="button"
                  onClick={() => remove(g.id)}
                  aria-label={`Xóa quà cho ${g.recipientName}`}
                  className="shrink-0 rounded-xl px-2 py-1.5 text-sm text-rose/80"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={onExit} className="text-sm text-ivory/50 underline">
          ← Quay lại
        </button>
      </motion.div>
    </div>
  );
}
