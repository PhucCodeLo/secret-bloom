import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Atmosphere from './components/atmosphere/Atmosphere';
import Fireflies from './components/atmosphere/Fireflies';
import ParticleField from './components/ParticleField';
import FloatingPetals from './components/FloatingPetals';
import PointerTrail from './components/PointerTrail';
import SoundToggle from './components/SoundToggle';
import Journal from './components/Journal';
import { useProgression } from './hooks/useProgression';
import { useGarden } from './garden/useGarden';
import TransitionVeil from './components/TransitionVeil';
import { composeMainLetter } from './ai/mainLetter';
// Scenes are lazy-loaded so each deploys as a small chunk
// (and the opening screen appears fast on mobile networks).
const VoidScene = lazy(() => import('./scenes/VoidScene'));
const InvitationScene = lazy(() => import('./scenes/InvitationScene'));
const GateScene = lazy(() => import('./scenes/GateScene'));
const CrossingScene = lazy(() => import('./scenes/CrossingScene'));
const GardenScene = lazy(() => import('./scenes/GardenScene'));
const PondScene = lazy(() => import('./scenes/PondScene'));
const FragmentsScene = lazy(() => import('./scenes/FragmentsScene'));
const ClockScene = lazy(() => import('./scenes/ClockScene'));
const ConstellationScene = lazy(() => import('./scenes/ConstellationScene'));
const SanctuaryScene = lazy(() => import('./scenes/SanctuaryScene'));
const GiftScene = lazy(() => import('./scenes/GiftScene'));
const MemoryScene = lazy(() => import('./scenes/MemoryScene'));
const UnveilingScene = lazy(() => import('./scenes/UnveilingScene'));
const LetterScene = lazy(() => import('./scenes/LetterScene'));
const FinalBloomScene = lazy(() => import('./scenes/FinalBloomScene'));
const FinaleScene = lazy(() => import('./scenes/FinaleScene'));
import { useSound } from './hooks/useSound';
import { useReducedMotion } from './hooks/useReducedMotion';
import type { Scene } from './types';
import { GiftContext } from './gift/GiftContext';
import { useGiftSession } from './gift/useGiftSession';
import GiftNotFound from './gift/GiftNotFound';
import GiftLocked from './gift/GiftLocked';
import { getPersonalPassages } from './data/letterFragments';
const GiftBuilder = lazy(() => import('./gift/GiftBuilder'));
const GroveScene = lazy(() => import('./scenes/GroveScene'));

function SceneLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Đang tải cảnh tiếp theo">
      <span className="animate-glow-pulse font-display text-3xl text-champagne" aria-hidden="true">✦</span>
    </div>
  );
}

export default function App() {
  const [scene, setScene] = useState<Scene>('invitation');
  const [journalOpen, setJournalOpen] = useState(false);
  const [cinematic, setCinematic] = useState(false);
  // Fullscreen entry: a warm invitation to open the garden fullscreen.
  const [entered, setEntered] = useState(false);
  const sound = useSound();
  const reducedMotion = useReducedMotion();
  // Deep Personalization: gift session (null gift = default journey)
  const { status: giftStatus, gift, giftParam, session: giftSession, dismissGift } = useGiftSession();
  // Choice-driven letter passages (branching story → growing letter)
  const choicePassages = useMemo(
    () => getPersonalPassages(giftSession.journey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(giftSession.journey?.choices ?? {}), giftSession.journey?.wishText],
  );
  const { journal, collect, reset, objects, fragments } = useProgression(choicePassages);
  // THE GARDEN KNOWS: environmental memory, persisted per gift across reloads.
  const garden = useGarden(giftSession.journey?.giftId ?? 'default');

  // Blessings received at minigame / virtue moments — reported by scenes,
  // collected for the final letters to weave back in.
  const [receivedBlessings, setReceivedBlessings] = useState<Array<{ id: string; text: string }>>(
    [],
  );
  const handleSceneBlessing = useCallback((key: string, text: string) => {
    if (!text) return;
    setReceivedBlessings((prev) =>
      prev.some((b) => b.id === key) ? prev : [...prev, { id: key, text }],
    );
  }, []);

  // The main letter: a tight synthesis linking the lived scenes (not a dump
  // of every fragment) + the blessings heard along the way.
  const mainLetterParagraphs = useMemo(
    () =>
      composeMainLetter({
        displayName: gift?.recipientName ?? '',
        salutation: gift?.salutation ?? '',
        fragmentIds: fragments,
        journey: giftSession.journey ?? null,
        receivedBlessings: receivedBlessings.map((b) => b.text),
        choicePassages,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      fragments,
      gift?.recipientName,
      gift?.salutation,
      giftSession.journey,
      receivedBlessings,
      JSON.stringify(choicePassages),
    ],
  );

  const go = useCallback((next: Scene) => {
    window.scrollTo(0, 0);
    setScene(next);
  }, []);

  // The exit/enter transition swaps scene content mid-flight; settle at the
  // top once it completes so a scene never lands mid-page.
  useEffect(() => {
    const t = window.setTimeout(() => window.scrollTo(0, 0), 650);
    return () => window.clearTimeout(t);
  }, [scene]);

  const replay = useCallback(() => {
    window.scrollTo(0, 0);
    reset();
    garden.resetGarden();
    setReceivedBlessings([]);
    setScene('invitation');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const onFinalScene = scene === 'finalbloom';
  const onLetterScene = scene === 'letter';
  const showChrome = !cinematic;

  /** Tap the entry button: go fullscreen for the best experience, then enter. */
  const enterFullscreen = async () => {
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
      };
      if (!document.fullscreenElement && !('webkitFullscreenElement' in document && (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement)) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      }
    } catch {
      /* fullscreen unsupported — the garden is still beautiful */
    }
    setEntered(true);
  };

  // gift-mode gates (personalized links, reveal timing, builder)
  if (giftStatus === 'loading') {
    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-midnight">
        <span className="animate-glow-pulse font-display text-3xl text-champagne" aria-hidden="true">✦</span>
      </div>
    );
  }

  return (
    <GiftContext.Provider value={giftSession}>
    <div
      className="safe-area relative min-h-dvh overflow-x-clip bg-midnight font-body text-ivory"
      data-theme={gift?.theme ?? undefined}
    >
      {giftStatus === 'notfound' && giftParam && (
        <GiftNotFound
          giftId={giftParam}
          onPlayDefault={dismissGift}
          onCreate={() => {
            window.location.search = '?builder=1';
          }}
        />
      )}
      {giftStatus === 'locked' && gift && <GiftLocked gift={gift} />}
      {giftStatus === 'builder' && (
        <Suspense fallback={<SceneLoader />}>
          <GiftBuilder
            onExit={() => {
              window.location.search = '';
            }}
          />
        </Suspense>
      )}
      {(giftStatus === 'ready' || giftStatus === 'none') && (
      <>
      {/* Cinematic atmosphere engine */}
      <Atmosphere
        variant={onLetterScene ? 'intimate' : 'night'}
        theme={gift?.theme ?? 'midnight'}
        reducedMotion={reducedMotion}
        parallax
      />
      <ParticleField
        className="pointer-events-none absolute inset-0 h-full w-full"
        reducedMotion={reducedMotion}
      />
      {!onLetterScene && (
        <Fireflies
          className="pointer-events-none absolute inset-0 h-full w-full"
          reducedMotion={reducedMotion}
        />
      )}
      {!onFinalScene && <FloatingPetals reducedMotion={reducedMotion} />}
      <PointerTrail reducedMotion={reducedMotion} />

      {/* top chrome: journal + cinematic + sound */}
      <AnimatePresence>
        {showChrome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-30"
          >
            <div className="flex items-start justify-between p-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
              <button
                type="button"
                onClick={() => setJournalOpen(true)}
                aria-label={`Mở nhật ký khám phá (${journal.length} kỷ niệm)`}
                className="btn-ghost pointer-events-auto relative flex h-11 min-w-[44px] items-center gap-2 rounded-full px-4 text-sm"
              >
                <span aria-hidden="true" className="font-display text-base">❧</span>
                <span className="hidden sm:inline">Nhật ký</span>
                {journal.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose px-1 text-[11px] font-bold text-ivory">
                    {journal.length}
                  </span>
                )}
              </button>
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCinematic(true)}
                  aria-label="Bật chế độ điện ảnh (ẩn giao diện)"
                  title="Chế độ điện ảnh"
                  className="btn-ghost flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 9h20M2 15h20" />
                  </svg>
                </button>
                <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* cinematic-mode exit */}
      {cinematic && (
        <button
          type="button"
          onClick={() => setCinematic(false)}
          aria-label="Thoát chế độ điện ảnh"
          className="btn-ghost fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full text-sm"
        >
          ✕
        </button>
      )}

      <AnimatePresence>
        {journalOpen && (
          <Journal entries={journal} onClose={() => setJournalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          key={scene}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.55, ease: 'easeInOut' }}
          className="relative z-10"
        >
          {/* petal-sweep transition veil, replayed on every scene change */}
          <TransitionVeil key={`veil-${scene}`} reducedMotion={reducedMotion} />
          <Suspense fallback={<SceneLoader />}>
          {scene === 'invitation' && (
            <InvitationScene
              sfx={sound}
              reducedMotion={reducedMotion}
              onEnter={() => go('void')}
            />
          )}
          {scene === 'void' && (
            <VoidScene reducedMotion={reducedMotion} collect={collect} onAwaken={() => go('gate')} />
          )}
          {scene === 'gate' && (
            <GateScene sfx={sound} reducedMotion={reducedMotion} collect={collect} onEnter={() => go('crossing')} />
          )}
          {scene === 'crossing' && (
            <CrossingScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              garden={garden}
              onNext={() => go('garden')}
            />
          )}
          {scene === 'garden' && (
            <GardenScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              garden={garden}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('grove')}
            />
          )}
          {scene === 'grove' && (
            <GroveScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              garden={garden}
              onNext={() => go('pond')}
            />
          )}
          {scene === 'pond' && (
            <PondScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('fragments')}
            />
          )}
          {scene === 'fragments' && (
            <FragmentsScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('clock')}
            />
          )}
          {scene === 'clock' && (
            <ClockScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('constellation')}
            />
          )}
          {scene === 'constellation' && (
            <ConstellationScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('sanctuary')}
            />
          )}
          {scene === 'sanctuary' && (
            <SanctuaryScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onSceneBlessing={handleSceneBlessing}
              onNext={() => go('gift')}
            />
          )}
          {scene === 'gift' && (
            <GiftScene sfx={sound} reducedMotion={reducedMotion} collect={collect} onNext={() => go('memory')} />
          )}
          {scene === 'memory' && (
            <MemoryScene sfx={sound} collect={collect} onSceneBlessing={handleSceneBlessing} onComplete={() => go('unveiling')} />
          )}
          {scene === 'unveiling' && (
            <UnveilingScene
              sfx={sound}
              reducedMotion={reducedMotion}
              collect={collect}
              onNext={() => go('letter')}
            />
          )}
          {scene === 'letter' && (
            <LetterScene
              sfx={sound}
              reducedMotion={reducedMotion}
              letterParagraphs={mainLetterParagraphs}
              fragmentCount={fragments.length}
              onNext={() => go('finale')}
            />
          )}
          {scene === 'finale' && (
            <FinaleScene
              sfx={sound}
              reducedMotion={reducedMotion}
              objects={objects}
              endingId={giftSession.journey?.endingId}
              garden={garden}
              onNext={() => go('finalbloom')}
            />
          )}
          {scene === 'finalbloom' && (
            <FinalBloomScene
              sfx={sound}
              reducedMotion={reducedMotion}
              garden={garden}
              journal={journal}
              objectCount={objects.length}
              receivedBlessings={receivedBlessings}
              onReplay={replay}
            />
          )}
          </Suspense>
        </motion.main>
      </AnimatePresence>
      {/* Fullscreen entry invitation — the garden is best with nothing in the way */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            key="enter"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-7 bg-midnight/95 px-8 text-center backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            role="dialog"
            aria-modal="true"
            aria-label="Bắt đầu trải nghiệm"
          >
            <motion.span
              className="font-display text-4xl text-champagne"
              style={{ textShadow: '0 0 24px rgba(243,215,155,0.8)' }}
              animate={reducedMotion ? {} : { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              ✦
            </motion.span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.45em] text-champagne/70">
                The Secret Bloom
              </p>
              <p className="mx-auto mt-4 max-w-xs font-display text-lg italic leading-8 text-ivory/85">
                Hãy mở toàn màn hình để có trải nghiệm tốt nhất — khu vườn đẹp nhất khi không còn gì che khuất.
              </p>
            </div>
            <button
              type="button"
              onClick={enterFullscreen}
              className="btn-gold min-h-[56px] rounded-full px-10 text-lg font-semibold"
            >
              ⛶ Mở toàn màn hình
            </button>
            <button
              type="button"
              onClick={() => setEntered(true)}
              className="text-sm text-ivory/50 underline underline-offset-4"
            >
              Bỏ qua
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
    </GiftContext.Provider>
  );
}
