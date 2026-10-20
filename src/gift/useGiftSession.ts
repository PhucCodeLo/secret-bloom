import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChoiceId, EndingId, GiftConfig, JourneyState, RelicId } from './types';
import { builderRequested, giftIdFromUrl, isGiftLocked, loadGift } from './store';
import type { GiftSession } from './GiftContext';

export type GiftLoadStatus =
  | 'loading'
  | 'none'
  | 'ready'
  | 'notfound'
  | 'locked'
  | 'builder';

const journeyKey = (giftId: string) => `secret-bloom-journey-${giftId}`;

export function useGiftSession() {
  const [status, setStatus] = useState<GiftLoadStatus>('loading');
  const [gift, setGift] = useState<GiftConfig | null>(null);
  const [giftParam, setGiftParam] = useState<string | null>(null);
  const [journey, setJourney] = useState<JourneyState | null>(null);

  useEffect(() => {
    if (builderRequested()) {
      setStatus('builder');
      return;
    }
    const id = giftIdFromUrl();
    // A journey exists in every mode (default journey uses giftId 'default'),
    // so branching choices work with or without a personalized gift.
    const gid = id ?? 'default';
    const initJourney = () => {
      try {
        const raw = sessionStorage.getItem(journeyKey(gid));
        if (raw) {
          const j = JSON.parse(raw) as JourneyState;
          if (j && j.giftId === gid && Array.isArray(j.relics)) {
            setJourney(j);
            return;
          }
        }
      } catch {
        // corrupted state — start fresh
      }
      setJourney({ giftId: gid, choices: {}, relics: [], endingId: null, startedAt: Date.now() });
    };
    if (!id) {
      initJourney();
      setStatus('none');
      return;
    }
    setGiftParam(id);
    const config = loadGift(id);
    if (!config) {
      setStatus('notfound');
      return;
    }
    setGift(config);
    if (isGiftLocked(config)) {
      setStatus('locked');
      return;
    }
    initJourney();
    setStatus('ready');
  }, []);

  useEffect(() => {
    if (journey) {
      try {
        sessionStorage.setItem(journeyKey(journey.giftId), JSON.stringify(journey));
      } catch {
        // private mode — journey just won't survive reload
      }
    }
  }, [journey]);

  const choose = useCallback((choiceId: ChoiceId, optionId: string) => {
    setJourney((j) =>
      j ? { ...j, choices: { ...j.choices, [choiceId]: optionId } } : j,
    );
  }, []);

  const collectRelic = useCallback((relicId: RelicId) => {
    setJourney((j) =>
      j && !j.relics.includes(relicId) ? { ...j, relics: [...j.relics, relicId] } : j,
    );
  }, []);

  const setEnding = useCallback((endingId: EndingId) => {
    setJourney((j) => (j ? { ...j, endingId } : j));
  }, []);

  const setWishText = useCallback((text: string) => {
    setJourney((j) => (j ? { ...j, wishText: text } : j));
  }, []);

  const setLanternText = useCallback((text: string) => {
    setJourney((j) => (j ? { ...j, lanternText: text } : j));
  }, []);

  const resetJourney = useCallback(() => {
    setJourney((j) =>
      j
        ? { giftId: j.giftId, choices: {}, relics: [], endingId: null, startedAt: Date.now() }
        : j,
    );
  }, []);

  /** Leave gift mode and play the default journey. */
  const dismissGift = useCallback(() => {
    setStatus('none');
    setGift(null);
    setJourney(null);
    setGiftParam(null);
  }, []);

  const session: GiftSession = useMemo(
    () => ({ gift, journey, choose, collectRelic, setEnding, setWishText, setLanternText, resetJourney }),
    [gift, journey, choose, collectRelic, setEnding, setWishText, setLanternText, resetJourney],
  );

  return { status, gift, giftParam, session, dismissGift };
}
