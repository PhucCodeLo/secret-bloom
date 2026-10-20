import { useCallback, useMemo, useState } from 'react';
import { REGISTRY, type CollectibleDef } from '../data/registry';
import { LETTER_FRAGMENTS, LETTER_ORDER } from '../data/letterFragments';
import { CONFIG } from '../config';

const STORAGE_KEY = 'secret-bloom-progress-v1';

function load(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // drop unknown/outdated ids safely
    return parsed.filter((id): id is string => typeof id === 'string' && id in REGISTRY);
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Central progression model for the whole experience.
 * - collect(id) is idempotent: same object twice grants nothing twice.
 * - Letter fragments unlock from collected objects, ordered narratively.
 * - Journal entries derive from the registry (single source of truth).
 * - Persisted to sessionStorage; replay resets everything.
 */
export function useProgression(choicePassages: string[] = []) {
  const [collected, setCollected] = useState<string[]>(load);

  const collect = useCallback((id: string) => {
    if (!(id in REGISTRY)) return;
    setCollected((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCollected([]);
    save([]);
  }, []);

  const objects: CollectibleDef[] = useMemo(
    () => collected.map((id) => REGISTRY[id]).filter(Boolean),
    [collected],
  );

  /** Unlocked letter fragment ids in narrative order. */
  const fragments: string[] = useMemo(() => {
    const have = new Set(
      objects.map((o) => o.fragmentId).filter((f): f is string => Boolean(f)),
    );
    return LETTER_ORDER.filter((fid) => have.has(fid));
  }, [objects]);

  /** Journal entries derived from the registry. */
  const journal = useMemo(
    () => objects.map((o) => ({ id: o.id, title: o.name, text: o.text })),
    [objects],
  );

  /** Full letter paragraphs: fragments → choice passages → central letter → signature. */
  const letterParagraphs: string[] = useMemo(() => {
    const paras: string[] = [];
    for (const fid of fragments) {
      paras.push(...(LETTER_FRAGMENTS[fid] ?? []));
    }
    paras.push(...choicePassages);
    for (const line of CONFIG.letterLines) {
      if (line.trim() !== '') paras.push(line);
    }
    paras.push(CONFIG.letterSignature);
    return paras;
  }, [fragments, choicePassages]);

  const gamesCompleted = useMemo(
    () => objects.map((o) => o.gameId).filter((g): g is string => Boolean(g)),
    [objects],
  );

  return { collected, collect, reset, objects, fragments, journal, letterParagraphs, gamesCompleted };
}
