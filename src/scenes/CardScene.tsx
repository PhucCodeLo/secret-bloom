import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import GreetingCard from '../components/GreetingCard';
import { CONFIG } from '../config';
import {
  BLESSINGS,
  CATEGORY_LABELS,
  MOOD_LABELS,
  pickBlessing,
  type Mood,
  type RecipientCategory,
} from '../data/blessings';
import type { CardStyle, Sfx } from '../types';
import { useGiftOptional } from '../gift/GiftContext';
import { CHOICES, ENDINGS, RELICS, type ThemeId, type VirtueId } from '../gift/types';
import { generateSignatureBloom } from '../gift/signatureBloom';
import SignatureBloomFlower from '../gift/SignatureBloomFlower';
import { getDedication } from '../ai/personalize';

interface CardSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  onReplay: () => void;
  /** number of collected objects (for the keepsake meaning line) */
  objectCount?: number;
}

const STYLES: Array<{ id: CardStyle; name: string; hint: string }> = [
  { id: 'midnight', name: 'Midnight Rose', hint: 'Xanh đêm & vàng hồng' },
  { id: 'champagne', name: 'Champagne Bloom', hint: 'Ngà & champagne' },
  { id: 'garden', name: 'Dreamy Garden', hint: 'Lavender & hồng' },
];

const CATEGORIES = Object.keys(CATEGORY_LABELS) as RecipientCategory[];
const MOODS = Object.keys(MOOD_LABELS) as Mood[];
const NAME_MAX = 40;
const MSG_MAX = 400;
const HISTORY_MAX = 8;

export default function CardScene({ sfx, reducedMotion, onReplay, objectCount = 0 }: CardSceneProps) {
  const giftSession = useGiftOptional();
  const gift = giftSession?.gift ?? null;
  const journey = giftSession?.journey ?? null;
  const [name, setName] = useState(gift?.recipientName ?? '');
  const [category, setCategory] = useState<RecipientCategory>('general');
  const [mood, setMood] = useState<Mood>('gentle');
  const [message, setMessage] = useState('');
  const [blessingId, setBlessingId] = useState<string | null>(null);
  const [sender, setSender] = useState<string>(gift?.senderName ?? CONFIG.senderName);
  const [style, setStyle] = useState<CardStyle>('midnight');
  const [created, setCreated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** Put the recipient's signature bloom on the card instead of the default flower. */
  const [useBloomOnCard, setUseBloomOnCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  const editedRef = useRef(false);

  /** Deep Personalization — the keepsake: signature bloom + message + summary. */
  const keepsake = useMemo(() => {
    const choices = journey?.choices ?? {};
    if (!choices.path && !choices.virtue && !choices.bloom) return null;
    const virtue = (choices.virtue as VirtueId | undefined) ?? 'love';
    const wish = choices.bloom ?? 'radiance';
    const theme = (gift?.theme ?? 'midnight') as ThemeId;
    const displayName = (gift?.recipientName || name || 'bạn').trim() || 'bạn';
    const bloom = generateSignatureBloom({
      displayName,
      theme,
      virtue,
      wish,
      relicCount: journey?.relics.length ?? 0,
      objectCount,
    });
    const choiceSummary = CHOICES.map((c) => {
      const optId = choices[c.id];
      const opt = c.options.find((o) => o.id === optId);
      return opt ? { title: c.title, name: opt.name } : null;
    }).filter((x): x is { title: string; name: string } => Boolean(x));
    const relicNames = (journey?.relics ?? []).map((r) => RELICS[r]?.name).filter(Boolean);
    const ending = journey?.endingId ? ENDINGS[journey.endingId] : null;
    const wishText = journey?.wishText?.trim() || null;
    const lanternText = journey?.lanternText?.trim() || null;
    return { bloom, choiceSummary, relicNames, ending, wishText, lanternText };
  }, [journey?.choices, journey?.relics, journey?.endingId, journey?.wishText, journey?.lanternText, gift?.theme, gift?.recipientName, name, objectCount]);

  /** Optional AI dedication — curated fallback, never blocks the keepsake. */
  const [dedication, setDedication] = useState<string | null>(null);
  useEffect(() => {
    if (!keepsake) return;
    let alive = true;
    getDedication({ gift, journey }).then((d) => {
      if (alive) setDedication(d.text);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepsake !== null]);

  const regenerate = useCallback(
    (cat: RecipientCategory, md: Mood, currentName: string) => {
      const picked = pickBlessing(cat, md, currentName, historyRef.current);
      historyRef.current = [...historyRef.current, picked.id].slice(-HISTORY_MAX);
      setBlessingId(picked.id);
      setMessage(picked.text);
      editedRef.current = false;
      return picked;
    },
    [],
  );

  // New blessing whenever the recipient category or mood changes.
  useEffect(() => {
    regenerate(category, mood, name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mood]);

  // Re-personalize the current blessing when the name changes,
  // unless the visitor has hand-edited the message.
  useEffect(() => {
    if (!blessingId || editedRef.current) return;
    const t = window.setTimeout(() => {
      const same = BLESSINGS.find((b) => b.id === blessingId);
      if (same) {
        setMessage(same.text.split('{name}').join(name.trim() || 'bạn'));
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [name, blessingId]);

  const anotherBlessing = () => {
    regenerate(category, mood, name);
    sfx.sparkle();
  };

  const downloadPng = async () => {
    const el = cardRef.current;
    if (!el || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
      const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true, backgroundColor: undefined });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'thiep-20-10.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setNotice('Đã tải thiệp PNG về máy của bạn. Hãy gửi tặng người thương nhé!');
      sfx.success();
    } catch {
      setNotice('Không tạo được file ảnh lúc này. Bạn có thể chụp màn hình tấm thiệp, hoặc dùng nút “Chia sẻ” để gửi liên kết nhé.');
      sfx.error();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setNotice(null);
    const url = CONFIG.siteUrl || window.location.href;
    const shareData = { title: 'The Secret Bloom — 20/10', text: 'Tặng bạn một tấm thiệp 20/10 thật đặc biệt!', url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setNotice('Đã mở trình chia sẻ — hãy chọn nơi bạn muốn gửi thiệp nhé.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setNotice('Đã sao chép liên kết website. Bạn dán vào tin nhắn để gửi thiệp nhé.');
      } else {
        setNotice(`Hãy sao chép liên kết này để chia sẻ: ${url}`);
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setNotice('Chia sẻ chưa thành công. Bạn thử lại giúp mình nhé.');
      }
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-md flex-col items-center gap-6"
      >
        <div className="text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
            Hồi X — Your Bloom
          </p>
          <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
            Xưởng thiệp <span className="text-champagne">của bạn</span>
          </h2>
          <p className="mt-2 text-[15px] text-ivory/70">
            Chọn người nhận, chọn cảm xúc — thiệp cập nhật ngay tức thì.
          </p>
        </div>

        {/* Final Keepsake — signature bloom, personal message, journey summary */}
        {keepsake && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            aria-label="Kỷ vật hành trình"
            className="flex w-full flex-col items-center gap-4 rounded-3xl border border-champagne/25 bg-deepblue/50 px-5 py-6 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
              Kỷ vật của bạn
            </p>
            <SignatureBloomFlower bloom={keepsake.bloom} size={200} />
            <div>
              <h3 className="font-display text-2xl font-bold text-ivory">
                {keepsake.bloom.name}
              </h3>
              <p className="mt-1 text-sm italic text-champagne/90">
                {keepsake.bloom.epithet}
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ivory/65">
                {keepsake.bloom.meaning}
              </p>
            </div>
            {gift?.personalMessage?.trim() && (
              <figure className="w-full rounded-2xl border border-champagne/30 bg-midnight/60 px-5 py-4">
                <blockquote className="font-display text-base italic leading-7 text-ivory/90">
                  “{gift.personalMessage.trim()}”
                </blockquote>
                <figcaption className="mt-2 text-sm text-champagne/80">
                  — {gift.senderName}
                </figcaption>
              </figure>
            )}
            {dedication ? (
              <figure className="w-full rounded-2xl border border-champagne/20 bg-midnight/40 px-5 py-4">
                <blockquote className="text-sm italic leading-6 text-ivory/75">
                  “{dedication}”
                </blockquote>
                <figcaption className="mt-2 text-xs uppercase tracking-[0.25em] text-ivory/45">
                  Lời đề tặng
                </figcaption>
              </figure>
            ) : (
              <p className="text-sm text-ivory/40" role="status">
                Đang dệt lời đề tặng…
              </p>
            )}
            <div className="w-full rounded-2xl bg-midnight/40 px-4 py-3 text-left">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-ivory/50">
                Hành trình của bạn
              </p>
              {keepsake.choiceSummary.map((c) => (
                <p key={c.title} className="text-sm leading-6 text-ivory/70">
                  <span className="text-ivory/45">{c.title}:</span>{' '}
                  <span className="text-champagne">{c.name}</span>
                </p>
              ))}
              {keepsake.relicNames.length > 0 && (
                <p className="text-sm leading-6 text-ivory/70">
                  <span className="text-ivory/45">Kỷ vật:</span>{' '}
                  {keepsake.relicNames.join(' · ')}
                </p>
              )}
              {keepsake.ending && (
                <p className="text-sm leading-6 text-ivory/70">
                  <span className="text-ivory/45">Kết thúc:</span>{' '}
                  <span className="text-champagne">{keepsake.ending.name}</span>
                </p>
              )}
              {keepsake.wishText && (
                <p className="text-sm leading-6 text-ivory/70">
                  <span className="text-ivory/45">Điều ước thì thầm:</span>{' '}
                  <span className="italic text-ivory/85">“{keepsake.wishText}”</span>
                </p>
              )}
              {keepsake.lanternText && (
                <p className="text-sm leading-6 text-ivory/70">
                  <span className="text-ivory/45">Đèn kỷ niệm:</span>{' '}
                  <span className="italic text-ivory/85">“{keepsake.lanternText}”</span>
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* Live preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative"
        >
          <GreetingCard
            ref={cardRef}
            recipient={name}
            message={message.trim() || CONFIG.defaultCardMessage}
            sender={sender.trim() || CONFIG.senderName}
            date={CONFIG.eventDate}
            style={style}
            bloom={useBloomOnCard ? keepsake?.bloom ?? null : null}
          />
          {created && !reducedMotion && (
            <div className="pointer-events-none absolute -inset-6" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className="petal"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    width: 9 + Math.random() * 7,
                    height: 12 + Math.random() * 9,
                    animationDuration: `${3.5 + Math.random() * 2.5}s`,
                    animationDelay: `${Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Studio controls */}
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-champagne/25 bg-deepblue/60 p-5">
          <div>
            <label htmlFor="card-name" className="mb-1.5 block text-sm font-medium text-champagne">
              Tên người nhận
            </label>
            <input
              id="card-name"
              type="text"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Chị Lan, Mẹ yêu… (để trống: “bạn”)"
              className="w-full rounded-xl border border-champagne/30 bg-midnight/60 px-4 py-3 text-base text-ivory placeholder:text-ivory/35 focus:border-champagne"
            />
            <p className="mt-1 text-right text-xs text-ivory/40">{name.length}/{NAME_MAX}</p>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-champagne" id="cat-label">
              Người nhận là…
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cat-label">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    sfx.pop();
                  }}
                  aria-pressed={category === c}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    category === c
                      ? 'bg-champagne/20 text-champagne ring-1 ring-champagne'
                      : 'text-ivory/65 ring-1 ring-ivory/15 hover:ring-champagne/50'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-champagne" id="mood-label">
              Cảm xúc muốn gửi…
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="mood-label">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMood(m);
                    sfx.pop();
                  }}
                  aria-pressed={mood === m}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    mood === m
                      ? 'bg-rose/20 text-rose ring-1 ring-rose'
                      : 'text-ivory/65 ring-1 ring-ivory/15 hover:ring-rose/50'
                  }`}
                >
                  {MOOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="card-msg" className="block text-sm font-medium text-champagne">
                Lời chúc
              </label>
              <button
                type="button"
                onClick={anotherBlessing}
                className="rounded-full px-3 py-1.5 text-sm text-champagne ring-1 ring-champagne/40 hover:bg-champagne/10"
              >
                Lời chúc khác ✦
              </button>
            </div>
            <textarea
              id="card-msg"
              value={message}
              maxLength={MSG_MAX}
              rows={4}
              onChange={(e) => {
                setMessage(e.target.value);
                editedRef.current = true;
              }}
              className="w-full resize-none rounded-xl border border-champagne/30 bg-midnight/60 px-4 py-3 text-base leading-6 text-ivory placeholder:text-ivory/35 focus:border-champagne"
            />
            <p className="mt-1 text-right text-xs text-ivory/40">{message.length}/{MSG_MAX}</p>
          </div>

          <div>
            <label htmlFor="card-sender" className="mb-1.5 block text-sm font-medium text-champagne">
              Người gửi / Đơn vị (tùy chọn)
            </label>
            <input
              id="card-sender"
              type="text"
              value={sender}
              maxLength={60}
              onChange={(e) => setSender(e.target.value)}
              className="w-full rounded-xl border border-champagne/30 bg-midnight/60 px-4 py-3 text-base text-ivory placeholder:text-ivory/35 focus:border-champagne"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-champagne" id="style-label">
              Phong cách thiệp
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="style-label">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setStyle(s.id);
                    sfx.pop();
                  }}
                  aria-pressed={style === s.id}
                  className={`rounded-xl border px-2 py-3 text-center transition ${
                    style === s.id
                      ? 'border-champagne bg-champagne/15 text-champagne'
                      : 'border-champagne/25 text-ivory/70 hover:border-champagne/50'
                  }`}
                >
                  <span className="block text-sm font-semibold">{s.name}</span>
                  <span className="mt-0.5 block text-xs opacity-70">{s.hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ivory/45">
              Đổi phong cách không làm mất lời chúc bạn đã chọn.
            </p>
          </div>

          {keepsake?.bloom && (
            <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-champagne/25 bg-midnight/40 px-4 py-3">
              <div className="text-left">
                <p className="text-sm font-medium text-champagne">Hoa chữ ký của bạn</p>
                <p className="text-xs text-ivory/50">Đặt {keepsake.bloom.name} lên thiệp</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useBloomOnCard}
                onClick={() => {
                  setUseBloomOnCard((v) => !v);
                  sfx.pop();
                }}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  useBloomOnCard ? 'bg-champagne' : 'bg-ivory/20'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    useBloomOnCard ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setCreated(true);
              sfx.success();
            }}
            className="btn-gold min-h-[52px] rounded-full px-8 text-lg font-semibold"
          >
            {created ? 'Đã tạo thiệp ✓' : 'Tạo thiệp của tôi'}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={downloadPng}
              disabled={busy}
              className="btn-ghost min-h-[48px] rounded-full px-4 text-base font-medium"
            >
              {busy ? 'Đang tạo ảnh…' : 'Tải thiệp PNG'}
            </button>
            <button
              type="button"
              onClick={share}
              className="btn-ghost min-h-[48px] rounded-full px-4 text-base font-medium"
            >
              Chia sẻ
            </button>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={anotherBlessing}
              className="text-sm text-ivory/55 underline underline-offset-4 hover:text-ivory/80"
            >
              Tạo thiệp khác
            </button>
            <button
              type="button"
              onClick={onReplay}
              className="text-sm text-ivory/55 underline underline-offset-4 hover:text-ivory/80"
            >
              Chơi lại hành trình
            </button>
          </div>
        </div>

        {notice && (
          <p role="status" aria-live="polite" className="max-w-sm text-center text-sm leading-6 text-champagne">
            {notice}
          </p>
        )}
      </motion.div>
    </div>
  );
}
