import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import type { JournalEntry, Sfx } from '../types';
import { CONFIG } from '../config';
import { useGiftOptional } from '../gift/GiftContext';
import { CHOICES, RELICS, type ThemeId, type VirtueId } from '../gift/types';
import { generateSignatureBloom } from '../gift/signatureBloom';
import SignatureBloomFlower from '../gift/SignatureBloomFlower';
import { composeSecretLetter } from '../ai/secretLetter';
import KaleidoscopeStudio from '../components/KaleidoscopeStudio';
import HandwrittenSignature, { splitSignature } from '../components/HandwrittenSignature';
import Journal from '../components/Journal';
import LightBurst from '../components/atmosphere/LightBurst';
import type { GardenApi } from '../garden/useGarden';

interface FinalBloomSceneProps {
  sfx: Sfx;
  reducedMotion: boolean;
  garden: GardenApi;
  journal: JournalEntry[];
  objectCount: number;
  /** Blessings whispered during scene transitions, in journey order. */
  receivedBlessings: Array<{ id: string; text: string }>;
  onReplay: () => void;
}

type Stage = 'silence' | 'return' | 'bloom' | 'message' | 'epilogue';

const VIRTUE_COLOR: Record<VirtueId, string> = {
  love: '#F4A0BC',
  gratitude: '#F3D79B',
  joy: '#8FD8C9',
};

/** Types text while active; tap to reveal instantly. */
function useTypewriter(text: string, active: boolean, speed = 30) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) return;
    setShown(0);
    if (speed <= 0) {
      setShown(text.length);
      return;
    }
    const t = window.setInterval(() => {
      setShown((s) => {
        if (s >= text.length) {
          window.clearInterval(t);
          return s;
        }
        return s + 1;
      });
    }, speed);
    return () => window.clearInterval(t);
  }, [text, active, speed]);
  return {
    shown: text.slice(0, shown),
    done: shown >= text.length,
    complete: () => setShown(text.length),
  };
}

const HOLD_MS = 1200;

/**
 * "Tâm tư gửi Nguyễn Phúc" — the recipient's reply channel.
 * Google blocks automated POSTs to forms (abuse protection), so the reply
 * is written directly in the owner's embedded Google Form (in-site modal,
 * no new tab). The human taps Google's own Gửi button, and the reply
 * reliably lands in the form's responses, where Nguyễn Phúc can read it.
 */
const NOTE_VIEWFORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdTGGGrYbBogsIFO3DBHbj-rEUdlZx6AXLn8mXIrUzWmtrR6g/viewform';

export default function FinalBloomScene({
  sfx,
  reducedMotion,
  garden,
  journal,
  objectCount,
  receivedBlessings,
  onReplay,
}: FinalBloomSceneProps) {
  const giftSession = useGiftOptional();
  const gift = giftSession?.gift ?? null;
  const journey = giftSession?.journey ?? null;

  const [stage, setStage] = useState<Stage>('silence');
  const [journalOpen, setJournalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sealOpen, setSealOpen] = useState(false);
  const [sealGlow, setSealGlow] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [noteFrameUrl, setNoteFrameUrl] = useState<string | null>(null);
  // Final touchpoint: tapping the signature bloom releases light + petals.
  const [bloomBurst, setBloomBurst] = useState(0);
  const timers = useRef<number[]>([]);
  const stageRef = useRef<Stage>('silence');
  stageRef.current = stage;
  const holdTimer = useRef<number | null>(null);
  const secretLetterRef = useRef<HTMLDivElement>(null);

  const theme = (gift?.theme ?? 'midnight') as ThemeId;
  const displayName = (gift?.recipientName || 'bạn').trim() || 'bạn';
  const senderName = gift?.senderName?.trim() || CONFIG.senderName;
  const secretMessage = gift?.personalMessage?.trim() || null;

  /**
   * Keepsake card message: the sender's own words when present, otherwise a
   * blessing picked at random from the full collection — never the same
   * single line twice in a row of visits.
   */

  /**
   * The garden's farewell — one closing paragraph woven from what the
   * recipient actually did tonight, so the ending feels written for them.
   */
  const farewell = useMemo(() => {
    const ch = journey?.choices ?? {};
    const bits: string[] = [];
    if (ch.path === 'fireflies') bits.push('chọn lối đom đóm rực rỡ');
    else if (ch.path === 'moonlight') bits.push('chọn lối ánh trăng lặng lẽ');
    const virtueName: Record<string, string> = { love: 'Yêu thương', gratitude: 'Trân trọng', joy: 'Hạnh phúc' };
    const wishName: Record<string, string> = { radiance: 'Tỏa sáng', serenity: 'Bình yên', freedom: 'Tự do' };
    const v = virtueName[String(ch.virtue ?? '')];
    if (v) bits.push(`vun đắp ${v}`);
    const w = wishName[String(ch.bloom ?? '')];
    if (w) bits.push(`thì thầm điều ước “${w}”`);
    if (bits.length === 0) return null;
    const journeyPart =
      bits.length === 1 ? bits[0] : `${bits.slice(0, -1).join(', ')} và ${bits[bits.length - 1]}`;
    return `Đêm nay, bạn đã ${journeyPart}. Khu vườn sẽ giữ những điều ấy — như giữ một buổi tối mà mọi ánh sáng đều hướng về bạn.`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = useMemo(() => {
    const choices = journey?.choices ?? {};
    const virtue = (choices.virtue as VirtueId | undefined) ?? 'love';
    const wish = choices.bloom ?? 'radiance';
    const bloom = generateSignatureBloom({
      displayName,
      theme,
      virtue,
      wish,
      relicCount: journey?.relics.length ?? 0,
      objectCount,
    });
    const relics = (journey?.relics ?? []).map((id) => ({ id, ...RELICS[id] }));
    const choiceSummary = CHOICES.map((c) => {
      const opt = c.options.find((o) => o.id === choices[c.id]);
      return opt ? { title: c.title, name: opt.name } : null;
    }).filter((x): x is { title: string; name: string } => Boolean(x));
    const areas: string[] = [];
    if (garden.state.bloomed.length > 0)
      areas.push(`Khu vườn sống — ${garden.state.bloomed.length} đóa hoa bạn đánh thức vẫn đang nở`);
    if (garden.state.restored.includes('crossing'))
      areas.push('Lối đi trăng — con đường bạn chọn vẫn sáng đèn');
    if (garden.state.restored.includes('grove'))
      areas.push('Khu vườn tâm ý — đóa hoa đức hạnh vẫn đang nở');
    if (garden.state.seed) areas.push('Hạt giống bạn gieo — đã thành hoa ở trung tâm vườn');
    if (journey?.lanternText) areas.push('Đèn kỷ niệm — vẫn trôi trên mặt hồ');
    return { bloom, relics, choiceSummary, areas, virtue };
  }, [journey, garden.state, displayName, theme, objectCount]);

  const go = (next: Stage) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    // Internal stage changes (e.g. letter -> epilogue) must also start at top.
    window.scrollTo(0, 0);
    setStage(next);
  };

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, reducedMotion ? Math.min(ms, 1200) : ms));
  };

  useEffect(() => {
    // Cinematic auto-pacing for the first two stages; the rest wait for a tap.
    if (stage === 'silence') later(5200, () => stageRef.current === 'silence' && go('return'));
    if (stage === 'return') later(6500, () => stageRef.current === 'return' && go('bloom'));
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(
    () => () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    },
    [],
  );

  const messageText =
    secretMessage ??
    composeSecretLetter({
      displayName,
      salutation: gift?.salutation ?? '',
      journey: journey ?? { giftId: '', choices: {}, relics: [], endingId: null, startedAt: Date.now() },
      journalIds: journal.map((e) => e.id),
      receivedBlessings: receivedBlessings.map((b) => b.text),
    });
  const messageTyping = useTypewriter(messageText, sealOpen, 26);

  const beginSealHold = () => {
    if (sealOpen) return;
    setSealGlow(true);
    holdTimer.current = window.setTimeout(() => {
      setSealOpen(true);
      setSealGlow(false);
      sfx.swell();
    }, HOLD_MS);
  };
  const endSealHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    setSealGlow(false);
  };

  /** Open the owner's Google Form embedded in-site — the recipient writes
   *  once, directly in the form, and taps Google's own Gửi button. No new tab. */
  const openNoteForm = () => {
    setNoteFrameUrl(`${NOTE_VIEWFORM_URL}?embedded=true`);
    sfx.pop();
  };

  const closeNoteFrame = () => {
    setNoteFrameUrl(null);
    setNoteSent(true);
    setNotice('Cảm ơn bạn đã chia sẻ ♡ Nguyễn Phúc sẽ đọc được những dòng này.');
    sfx.success();
  };


  /** Save the secret letter as a PNG keepsake. */
  const saveSecretLetter = async () => {
    const el = secretLetterRef.current;
    if (!el || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      try {
        await document.fonts.ready;
      } catch {
        /* non-fatal */
      }
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true, backgroundColor: '#FFF4E6' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'buc-thu-bi-mat-20-10.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setNotice('Đã lưu bức thư về máy của bạn.');
      sfx.success();
    } catch {
      setNotice('Không tạo được file ảnh lúc này. Bạn có thể chụp màn hình để giữ bức thư nhé.');
      sfx.error();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-10">
      <AnimatePresence mode="wait">
        {/* 1 — THE GARDEN FALLS SILENT */}
        {stage === 'silence' && (
          <motion.div
            key="silence"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.3 : 1.4 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(20,32,58,0.55), transparent 70%)' }}
              animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
              Hồi cuối — The Final Bloom
            </p>
            <h2 className="font-display text-3xl font-bold text-ivory sm:text-4xl">
              Khu vườn <span className="text-champagne">lặng đi</span>
            </h2>
            <p className="max-w-xs text-[15px] leading-7 text-ivory/65">
              Mọi âm thanh lắng xuống. Những nơi bạn đã đi qua, từng nơi một, sáng lên lần nữa — để chào bạn.
            </p>
            <div className="flex w-full flex-col gap-2">
              {data.areas.map((a, i) => (
                <motion.p
                  key={a}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : 1 + i * 0.7, duration: 0.9 }}
                  className="rounded-xl border border-champagne/20 bg-deepblue/50 px-4 py-2.5 text-sm text-champagne/90"
                >
                  ✦ {a}
                </motion.p>
              ))}
              {data.areas.length === 0 && (
                <p className="text-sm text-ivory/50">Khu vườn vẫn ở đây, chờ dấu chân đầu tiên của bạn.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                go('return');
              }}
              className="text-sm text-ivory/50 underline-offset-4 hover:underline"
            >
              Chạm để tiếp tục →
            </button>
          </motion.div>
        )}

        {/* 2 — EVERY CHOICE RETURNS */}
        {stage === 'return' && (
          <motion.div
            key="return"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.3 : 1.2 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-ivory">
              Mọi lựa chọn <span className="text-champagne">trở về</span>
            </h2>
            {data.relics.length > 0 && (
              <div className="flex flex-wrap items-start justify-center gap-3">
                {data.relics.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 24, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: reducedMotion ? 0 : 0.4 + i * 0.35, duration: 0.8 }}
                    className="flex w-20 flex-col items-center gap-1 rounded-xl border border-champagne/20 bg-deepblue/50 px-2 py-3"
                  >
                    <span className="text-2xl" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 8px rgba(243,215,155,0.7))' }}>
                      {r.glyph}
                    </span>
                    <span className="text-[11px] leading-4 text-ivory/75">{r.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="flex w-full flex-col gap-2 text-left">
              {data.choiceSummary.map((c, i) => (
                <motion.p
                  key={c.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reducedMotion ? 0 : 1.2 + i * 0.5, duration: 0.7 }}
                  className="text-sm leading-6 text-ivory/70"
                >
                  <span className="text-ivory/45">{c.title}:</span>{' '}
                  <span className="text-champagne">{c.name}</span>
                </motion.p>
              ))}
              {journey?.wishText?.trim() && (
                <motion.p
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reducedMotion ? 0 : 2.6, duration: 0.7 }}
                  className="text-sm italic leading-6 text-ivory/70"
                >
                  Điều ước bạn thì thầm: “{journey.wishText.trim()}”
                </motion.p>
              )}
              {journey?.lanternText?.trim() && (
                <motion.p
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reducedMotion ? 0 : 3, duration: 0.7 }}
                  className="text-sm italic leading-6 text-ivory/70"
                >
                  Đèn kỷ niệm của bạn: “{journey.lanternText.trim()}”
                </motion.p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                go('bloom');
              }}
              className="text-sm text-ivory/50 underline-offset-4 hover:underline"
            >
              Chạm để tiếp tục →
            </button>
          </motion.div>
        )}

        {/* 3 — THE THOUSAND-BLOOM FINALE */}
        {stage === 'bloom' && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.3 : 1.2 }}
            className="flex w-full max-w-md flex-col items-center gap-5 text-center"
          >
            {!reducedMotion && <LightBurst burstKey="final-bloom" size={340} />}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={reducedMotion ? { duration: 0.4 } : { type: 'spring', stiffness: 46, damping: 11 }}
              className="relative"
            >
              <div
                className="absolute inset-0 -m-10 rounded-full"
                style={{ background: `radial-gradient(circle, ${VIRTUE_COLOR[data.virtue]}55 0%, transparent 70%)` }}
                aria-hidden="true"
              />
              <SignatureBloomFlower bloom={data.bloom} size={240} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.9, duration: 0.9 }}
            >
              <h2 className="font-display text-3xl font-bold text-ivory">{data.bloom.name}</h2>
              <p className="mt-1 text-sm italic text-champagne/90">{data.bloom.epithet}</p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-ivory/65">{data.bloom.meaning}</p>
            </motion.div>
            <button
              type="button"
              onClick={() => {
                sfx.sparkle();
                go('message');
              }}
              className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
            >
              Mở thư riêng →
            </button>
          </motion.div>
        )}

        {/* 4 — THE SECRET MESSAGE */}
        {stage === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.3 : 1 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
              Thư riêng
            </p>
            {!sealOpen ? (
              <div className="flex flex-col items-center gap-4">
                <p className="max-w-xs text-[15px] leading-7 text-ivory/70">
                  {secretMessage
                    ? `${senderName} đã để lại một bức thư chỉ dành cho ${displayName}.`
                    : 'Có một bức thư ở đây — không phải của ai khác, chỉ của riêng khoảnh khắc này.'}
                </p>
                <button
                  type="button"
                  aria-label="Con dấu sáp — nhấn giữ để mở thư riêng"
                  onPointerDown={beginSealHold}
                  onPointerUp={endSealHold}
                  onPointerLeave={endSealHold}
                  onPointerCancel={endSealHold}
                  onContextMenu={(e) => e.preventDefault()}
                  className="touch-none select-none"
                  style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                >
                  <span
                    className="flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl text-midnight transition-all"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #F3D79B, #DCA47A)',
                      boxShadow: sealGlow
                        ? '0 0 38px 12px rgba(243,215,155,0.5), 0 0 10px 3px #F3D79B'
                        : '0 2px 12px rgba(0,0,0,0.5), 0 0 0 3px rgba(243,215,155,0.25)',
                      transform: sealGlow ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    ❀
                  </span>
                </button>
                <p className="text-sm text-ivory/55">Nhấn giữ con dấu để mở thư.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex w-full flex-col items-center gap-5"
              >
                <div
                  ref={secretLetterRef}
                  className="w-full rounded-2xl border border-champagne/30 bg-ivory px-6 py-6 text-left shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => messageTyping.complete()}
                    className="block w-full text-left"
                    aria-label="Thư riêng — chạm để hiện toàn bộ"
                  >
                    <p className="font-display text-base italic leading-8 text-midnight">
                      “{messageTyping.shown}
                      {!messageTyping.done && <span className="animate-pulse">▍</span>}”
                    </p>
                  </button>
                  {messageTyping.done && (
                    <div className="mt-4">
                      {(() => {
                        const { name, tagline } = splitSignature(senderName);
                        return (
                          <>
                            <HandwrittenSignature name={name} color="#3a2a1c" delayMs={400} />
                            {tagline ? (
                              <p className="-mt-1 text-center text-xs italic text-midnight/60">
                                {tagline}
                              </p>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                {messageTyping.done && (
                  <div className="flex w-full flex-col gap-3">
                    <button
                      type="button"
                      onClick={saveSecretLetter}
                      disabled={busy}
                      className="min-h-[52px] rounded-full border border-champagne/40 bg-deepblue/60 px-8 text-base font-semibold text-champagne transition hover:bg-deepblue"
                    >
                      {busy ? 'Đang tạo ảnh…' : '🖼️ Lưu bức thư (PNG)'}
                    </button>
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        sfx.sparkle();
                        go('epilogue');
                      }}
                      className="btn-gold min-h-[52px] rounded-full px-10 text-lg font-semibold"
                    >
                      Khép lại hành trình →
                    </motion.button>
                  </div>
                )}
                {notice && (
                  <p className="text-sm text-champagne/90" role="status">
                    {notice}
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 5 — EPILOGUE */}
        {stage === 'epilogue' && (
          <motion.div
            key="epilogue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0.3 : 1.4 }}
            className="flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <motion.div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 62%, rgba(243,215,155,0.13), transparent 70%)',
              }}
              animate={reducedMotion ? {} : { opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Signature bloom — the final touchpoint. Tap it. */}
            <div className="relative flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBloomBurst((k) => k + 1);
                  sfx.chime();
                }}
                aria-label="Chạm vào đóa hoa chữ ký"
                className="relative transition-transform active:scale-95"
              >
                <SignatureBloomFlower bloom={data.bloom} size={132} />
                {bloomBurst > 0 && (
                  <LightBurst key={bloomBurst} burstKey={`epilogue-${bloomBurst}`} size={280} />
                )}
              </button>
              {bloomBurst > 0 && (
                <div
                  key={`petals-${bloomBurst}`}
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/3 h-3 w-2 rounded-full"
                        style={{ background: ['#F4A0BC', '#F3D79B', '#B9A8E8'][i % 3] }}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                          x: Math.cos(a) * 110,
                          y: Math.sin(a) * 90,
                          opacity: 0,
                          scale: 0.5,
                          rotate: 120,
                        }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                      />
                    );
                  })}
                </div>
              )}
              <p className="text-xs tracking-[0.25em] text-champagne/70">❀ chạm vào đóa hoa ❀</p>
              <p className="font-display text-sm italic text-ivory/60">{data.bloom.name}</p>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-ivory">
                Vườn hoa <span className="text-champagne">của bạn</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-[15px] leading-7 text-ivory/65">
                Hành trình khép lại, nhưng khu vườn vẫn ở đây — với mọi lựa chọn, mọi kỷ niệm và đóa hoa mang tên {displayName}.
              </p>
              {farewell && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1.2 }}
                  className="mx-auto mt-4 max-w-xs font-display text-[15px] italic leading-8 text-champagne/90"
                >
                  “{farewell}”
                </motion.p>
              )}
            </div>
            {notice && (
              <p className="text-sm text-champagne/90" role="status">
                {notice}
              </p>
            )}
            {/* Tâm tư gửi Nguyễn Phúc — the recipient's reply channel */}
            {!noteSent ? (
              <div className="w-full rounded-2xl border border-champagne/25 bg-deepblue/50 px-5 py-4 text-left">
                <p className="text-base font-semibold text-champagne">💌 Tâm tư gửi Nguyễn Phúc</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">
                  Đi qua cả khu vườn rồi — bạn muốn nói gì với Nguyễn Phúc không?
                </p>
                <button
                  type="button"
                  onClick={openNoteForm}
                  className="mt-3 min-h-[48px] rounded-full bg-champagne px-8 text-base font-semibold text-midnight transition active:scale-95"
                >
                  Viết tâm tư →
                </button>
              </div>
            ) : (
              <p className="text-sm italic leading-6 text-champagne/90" role="status">
                Cảm ơn bạn đã chia sẻ ♡ Nguyễn Phúc sẽ đọc được những dòng này.
              </p>
            )}
            {/* Embedded reply form — no new tab needed */}
            {noteFrameUrl && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/85 p-4 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label="Gửi tâm tư cho Nguyễn Phúc"
              >
                <div className="flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-champagne/30 bg-deepblue shadow-2xl">
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <p className="text-base font-semibold text-champagne">💌 Gửi tâm tư cho Nguyễn Phúc</p>
                    <button
                      type="button"
                      onClick={closeNoteFrame}
                      aria-label="Đóng"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne/30 text-lg text-champagne"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="px-5 pb-3 text-sm leading-6 text-ivory/60">
                    Viết lời nhắn của bạn trong form, rồi bấm <span className="font-semibold text-champagne">Gửi</span> là xong.
                  </p>
                  <iframe
                    src={noteFrameUrl}
                    title="Form gửi tâm tư"
                    className="h-[54vh] w-full border-0 bg-white"
                  />
                </div>
              </div>
            )}
            {/* KÍNH VẠN HOA — the finale reward: a living kaleidoscope */}
            <div className="flex w-full flex-col items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-champagne/70">
                Kính vạn hoa
              </p>
              <p className="font-display max-w-xs text-center text-sm italic leading-6 text-ivory/60">
                Ngàn mảnh vườn vỡ ra thành muôn hình vạn trạng — xoay ống kính, giữ lại khoảnh khắc bạn yêu nhất.
              </p>
              <KaleidoscopeStudio sfx={sfx} />
            </div>
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  sfx.pop();
                  setJournalOpen(true);
                }}
                className="min-h-[52px] rounded-full border border-champagne/40 bg-deepblue/60 px-8 text-base font-semibold text-champagne transition hover:bg-deepblue"
              >
                📖 Xem lại nhật ký hành trình
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.sparkle();
                  onReplay();
                }}
                className="text-sm text-ivory/50 underline-offset-4 hover:underline"
              >
                Chơi lại từ đầu ↺
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {journalOpen && <Journal entries={journal} onClose={() => setJournalOpen(false)} />}
    </div>
  );
}
