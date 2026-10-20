import type { VirtueId } from '../gift/types';

export type { VirtueId };

/**
 * THE GARDEN KNOWS — environmental memory of the recipient's actions.
 *
 * GardenState is the garden's *visible* memory, separate from:
 * - JourneyState (choices, relics, ending — the narrative facts), and
 * - progression (collectibles/journal — the inventory).
 *
 * The garden derives some visuals directly from JourneyState (single source
 * of truth for choices); GardenState stores only genuinely environmental
 * facts: which flowers were bloomed, which areas were restored, which paths
 * were unlocked, and the planted seed. All mutating actions are idempotent.
 */

export const GARDEN_VERSION = 1 as const;

export type AreaId = 'crossing' | 'grove';
export type PathId = 'grove';

export interface PlantedSeed {
  virtue: VirtueId;
  plantedAt: number;
}

export interface GardenState {
  version: typeof GARDEN_VERSION;
  /** ids of virtue flowers bloomed in the living garden */
  bloomed: string[];
  /** restored area ids — they render illuminated on revisit */
  restored: AreaId[];
  /** unlocked path ids */
  paths: PathId[];
  /** the single seed the recipient planted (one per journey) */
  seed: PlantedSeed | null;
  updatedAt: number;
}

export function emptyGarden(): GardenState {
  return {
    version: GARDEN_VERSION,
    bloomed: [],
    restored: [],
    paths: [],
    seed: null,
    updatedAt: Date.now(),
  };
}

function isAreaId(v: unknown): v is AreaId {
  return v === 'crossing' || v === 'grove';
}

function isPathId(v: unknown): v is PathId {
  return v === 'grove';
}

function isVirtueId(v: unknown): v is VirtueId {
  return v === 'love' || v === 'gratitude' || v === 'joy';
}

/** Validate raw storage data; return null when it must be discarded. */
export function parseGardenState(raw: unknown): GardenState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const g = raw as Record<string, unknown>;
  if (g.version !== GARDEN_VERSION) return null;
  if (!Array.isArray(g.bloomed) || !g.bloomed.every((x) => typeof x === 'string')) return null;
  if (!Array.isArray(g.restored) || !g.restored.every(isAreaId)) return null;
  if (!Array.isArray(g.paths) || !g.paths.every(isPathId)) return null;
  let seed: PlantedSeed | null = null;
  if (g.seed !== null && g.seed !== undefined) {
    const s = g.seed as Record<string, unknown>;
    if (typeof s !== 'object' || !isVirtueId(s.virtue) || typeof s.plantedAt !== 'number') return null;
    seed = { virtue: s.virtue, plantedAt: s.plantedAt };
  }
  return {
    version: GARDEN_VERSION,
    bloomed: [...new Set(g.bloomed as string[])],
    restored: [...new Set(g.restored as AreaId[])],
    paths: [...new Set(g.paths as PathId[])],
    seed,
    updatedAt: typeof g.updatedAt === 'number' ? g.updatedAt : Date.now(),
  };
}

/**
 * Growth stage of the planted seed, derived from journey milestones —
 * never stored, so it can never go stale:
 * 0 = just planted (garden) · 1 = sprout (grove) · 2 = budding (wish made) · 3 = full bloom (finale)
 */
export function seedStage(
  seed: PlantedSeed | null,
  journey: { choices: Partial<Record<string, string>> } | null,
  atFinale = false,
): 0 | 1 | 2 | 3 {
  if (!seed) return 0;
  if (atFinale) return 3;
  if (journey?.choices.bloom) return 2;
  if (journey?.choices.virtue) return 1;
  return 0;
}

export const SEED_GLYPH: Record<0 | 1 | 2 | 3, string> = {
  0: '🌰',
  1: '🌱',
  2: '🌿',
  3: '❀',
};

export const SEED_LABEL: Record<0 | 1 | 2 | 3, string> = {
  0: 'Hạt giống vừa được gieo',
  1: 'Mầm non đang vươn lên',
  2: 'Nụ hoa đang hé nở',
  3: 'Đóa hoa từ hạt giống của bạn',
};
