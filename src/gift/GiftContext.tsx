import { createContext, useContext } from 'react';
import type { GiftConfig, JourneyState } from './types';

export interface GiftSession {
  /** The active gift, or null when playing the default (non-personalized) journey. */
  gift: GiftConfig | null;
  journey: JourneyState | null;
  /** Record a branching choice (idempotent per choice point). */
  choose: (choiceId: keyof JourneyState['choices'], optionId: string) => void;
  /** Collect a relic (idempotent). */
  collectRelic: (relicId: JourneyState['relics'][number]) => void;
  setEnding: (endingId: NonNullable<JourneyState['endingId']>) => void;
  /** Save the recipient's whispered wish (free text). */
  setWishText: (text: string) => void;
  /** Save the memory released onto the pond (free text). */
  setLanternText: (text: string) => void;
  resetJourney: () => void;
}

export const GiftContext = createContext<GiftSession | null>(null);

export function useGift(): GiftSession {
  const ctx = useContext(GiftContext);
  if (!ctx) throw new Error('useGift must be used inside GiftProvider');
  return ctx;
}

/** Safe variant for components that work with or without a gift. */
export function useGiftOptional(): GiftSession | null {
  return useContext(GiftContext);
}
