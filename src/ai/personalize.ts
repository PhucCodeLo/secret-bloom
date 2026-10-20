/**
 * Optional AI personalization — interface + curated fallback.
 *
 * If a server-side endpoint is configured (see PERSONALIZE_API_URL below),
 * the keepsake dedication is crafted by it. Otherwise — e.g. on the current
 * static hosting with no backend — a curated, deterministic dedication is
 * used. Gameplay NEVER depends on this: failures fall back silently and the
 * journey always completes.
 *
 * To enable a real backend later: deploy any HTTP endpoint accepting
 * POST { gift, journey } and returning { "text": "..." }, then set
 * PERSONALIZE_API_URL at build time (Vite: import.meta.env.VITE_PERSONALIZE_API_URL).
 * Keep API keys server-side in that endpoint — never in this client code.
 */

import type { GiftConfig, JourneyState } from '../gift/types';
import { ENDINGS } from '../gift/types';

const API_URL: string | undefined =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PERSONALIZE_API_URL;

const TIMEOUT_MS = 4000;

export interface DedicationInput {
  gift: GiftConfig | null;
  journey: JourneyState | null;
}

export interface Dedication {
  text: string;
  /** 'api' when a server crafted it, 'curated' for the built-in fallback */
  source: 'api' | 'curated';
}

const CURATED: string[] = [
  'Dành cho {name} — người đã đi qua cả khu vườn bằng sự kiên nhẫn và dịu dàng. Món quà này là của bạn, và chỉ bạn mới mở được nó theo cách này.',
  '{name} ơi, mỗi lựa chọn bạn đưa ra tối nay đều để lại một cánh hoa. Hãy giữ đóa hoa này như giữ những điều tốt đẹp bạn xứng đáng nhận.',
  'Khu vườn đã ghi nhớ từng bước chân của {name}. Mong rằng ngoài đời thực, bạn cũng luôn được dẫn đường bởi những ánh sáng tử tế như thế.',
  'Gửi {name}: bạn không cần phải rực rỡ mỗi ngày. Chỉ cần là chính mình — khu vườn này đã nở vì bạn, không vì ai khác.',
];

function curatedFor(input: DedicationInput): string {
  const name = input.gift?.recipientName?.trim() || 'bạn';
  const key = `${name}|${input.journey?.choices.path}|${input.journey?.choices.virtue}|${input.journey?.choices.bloom}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (Math.imul(h, 31) + key.charCodeAt(i)) | 0;
  const tpl = CURATED[Math.abs(h) % CURATED.length];
  const ending = input.journey?.endingId ? ENDINGS[input.journey.endingId] : null;
  const suffix = ending ? ` ${ending.message}` : '';
  return tpl.replaceAll('{name}', name) + suffix;
}

export async function getDedication(input: DedicationInput): Promise<Dedication> {
  if (API_URL) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: input.gift?.recipientName ?? null,
          theme: input.gift?.theme ?? null,
          choices: input.journey?.choices ?? {},
          relics: input.journey?.relics ?? [],
          ending: input.journey?.endingId ?? null,
        }),
        signal: ctrl.signal,
      });
      window.clearTimeout(t);
      if (res.ok) {
        const data = (await res.json()) as { text?: unknown };
        if (typeof data.text === 'string' && data.text.trim().length > 0) {
          return { text: data.text.trim().slice(0, 600), source: 'api' };
        }
      }
    } catch {
      // fall through to curated
    }
  }
  return { text: curatedFor(input), source: 'curated' };
}
