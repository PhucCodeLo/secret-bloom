import { useCallback, useEffect, useState } from 'react';
import {
  emptyGarden,
  parseGardenState,
  type AreaId,
  type GardenState,
  type PathId,
  type VirtueId,
} from './types';

const keyFor = (giftId: string) => `secret-bloom-garden-v1-${giftId}`;

function load(giftId: string): GardenState {
  try {
    const raw = localStorage.getItem(keyFor(giftId));
    if (!raw) return emptyGarden();
    const parsed = parseGardenState(JSON.parse(raw));
    // Invalid or outdated data is discarded gracefully — the garden
    // simply starts fresh instead of crashing.
    return parsed ?? emptyGarden();
  } catch {
    return emptyGarden();
  }
}

function save(giftId: string, state: GardenState) {
  try {
    localStorage.setItem(keyFor(giftId), JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    /* storage unavailable (private mode) — the garden just won't persist */
  }
}

export interface GardenApi {
  state: GardenState;
  /** Idempotent: blooming the same flower twice changes nothing. */
  bloomFlower: (id: string) => void;
  /** Idempotent: restoring an area twice changes nothing. */
  restoreArea: (id: AreaId) => void;
  /** Idempotent: unlocking a path twice changes nothing. */
  unlockPath: (id: PathId) => void;
  /** Idempotent: only one seed per journey; replanting is ignored. */
  plantSeed: (virtue: VirtueId) => void;
  /** A new journey starts with a fresh garden. */
  resetGarden: () => void;
}

/**
 * The garden's environmental memory, persisted per gift in localStorage.
 * Survives page reloads; invalid data falls back to an empty garden.
 */
export function useGarden(giftId: string): GardenApi {
  const [state, setState] = useState<GardenState>(() => load(giftId));

  // Reload when the active gift changes (loading → ready).
  useEffect(() => {
    setState(load(giftId));
  }, [giftId]);

  useEffect(() => {
    save(giftId, state);
  }, [giftId, state]);

  const bloomFlower = useCallback((id: string) => {
    setState((s) => (s.bloomed.includes(id) ? s : { ...s, bloomed: [...s.bloomed, id] }));
  }, []);

  const restoreArea = useCallback((id: AreaId) => {
    setState((s) => (s.restored.includes(id) ? s : { ...s, restored: [...s.restored, id] }));
  }, []);

  const unlockPath = useCallback((id: PathId) => {
    setState((s) => (s.paths.includes(id) ? s : { ...s, paths: [...s.paths, id] }));
  }, []);

  const plantSeed = useCallback((virtue: VirtueId) => {
    setState((s) =>
      s.seed ? s : { ...s, seed: { virtue, plantedAt: Date.now() } },
    );
  }, []);

  const resetGarden = useCallback(() => {
    setState(emptyGarden());
  }, []);

  return { state, bloomFlower, restoreArea, unlockPath, plantSeed, resetGarden };
}
