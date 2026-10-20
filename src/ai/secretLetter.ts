/**
 * The Secret Letter, synthesized from the recipient's own journey.
 *
 * When the sender leaves no personal message, the garden writes one —
 * composed entirely from what the recipient actually did: the path they
 * chose, the virtue they deepened, the wish they made, and the minigames
 * they completed. Deterministic per journey (no fake randomness), so the
 * letter always rings true.
 */
import type { JourneyState, EndingId } from '../gift/types';

export interface SecretLetterInput {
  displayName: string;
  salutation: string;
  journey: JourneyState;
  /** Collected journal entry ids, in journey order. */
  journalIds: string[];
  /** Blessing texts whispered during scene transitions, in journey order. */
  receivedBlessings?: string[];
}

const VIRTUE_WORD: Record<string, string> = {
  love: 'Yêu thương',
  gratitude: 'Trân trọng',
  joy: 'Hạnh phúc',
};

const WISH_WORD: Record<string, string> = {
  radiance: 'Tỏa sáng',
  serenity: 'Bình yên',
  freedom: 'Tự do',
};

const ENDING_WORD: Record<EndingId, string> = {
  radiant: 'rực rỡ',
  serene: 'an nhiên',
  free: 'tự tại',
};

/** One memory sentence per minigame, keyed by journal entry id. */
const MEMORIES: Array<{ id: string; line: (j: JourneyState) => string }> = [
  {
    id: 'pond-memory',
    line: () =>
      'Bạn đã lặng nhìn mặt hồ và đọc đúng những hình phản chiếu — có những điều chỉ hiện ra khi ta đủ kiên nhẫn.',
  },
  {
    id: 'memory-lantern',
    line: (j) =>
      j.lanternText
        ? `Bạn đã thả xuống hồ một chiếc đèn mang theo dòng chữ của riêng mình: “${j.lanternText}” — mặt hồ sẽ giữ hộ bạn điều ấy.`
        : 'Bạn đã thả xuống hồ một chiếc đèn kỷ niệm — ngọn lửa nhỏ ấy sẽ trôi mãi trong khu vườn này.',
  },
  {
    id: 'crystal-flower',
    line: () =>
      'Bốn mảnh pha lê vỡ, bạn đã đặt từng mảnh về đúng chỗ — như cách bạn vẫn luôn gom những điều vụn vỡ về lại với nhau.',
  },
  {
    id: 'clock-seed',
    line: () =>
      'Bạn đã xoay ba vòng thời gian để mặt trăng, đóa hoa và vì sao cùng hướng về một điểm — kiên trì như thế, chẳng điều gì là không thể.',
  },
  {
    id: 'constellation',
    line: () =>
      'Bảy vì sao, bạn đã nối thành chòm sao của riêng mình — từ nay trên trời có một hình vẽ mang dấu ấn của bạn.',
  },
  {
    id: 'sanctuary-secret',
    line: () =>
      'Ba ngọn rune quá khứ — hiện tại — tương lai, bạn đã thắp sáng cả ba — người dám nhìn lại quá khứ mới đi xa được.',
  },
  {
    id: 'memory-trial',
    line: () =>
      'Ba cấp độ thử thách ký ức, bạn đã vượt qua — trí nhớ của bạn chỉ giữ lại những điều đáng giữ.',
  },
  {
    id: 'seed-planted',
    line: () =>
      'Hạt giống bạn gieo ở khu vườn sống giờ đã thành hoa — điều bạn vun trồng bằng lòng tốt sẽ luôn nở.',
  },
];

export function composeSecretLetter(input: SecretLetterInput): string {
  const { displayName, salutation, journey, journalIds, receivedBlessings = [] } = input;
  const name = displayName.trim() || 'bạn';
  const dear = salutation.trim() ? `${salutation.trim()} ${name}` : name;

  const path = journey.choices.path;
  const virtue = journey.choices.virtue;
  const wish = journey.choices.bloom;
  const ending = journey.endingId;

  // Slight deterministic variety between journeys (never random per render).
  const variant = journalIds.length % 2;

  const openings = [
    `${dear} thương mến,\n\nKhi bạn đọc những dòng này, hành trình qua khu vườn đã khép lại — nhưng những gì bạn để lại thì còn mãi.`,
    `${dear} thương mến,\n\nKhu vườn đã ghi nhớ từng bước chân của bạn, và nhờ tôi gửi lại bạn những dòng này.`,
  ];

  const pathLine =
    path === 'moonlight'
      ? 'Bạn đã chọn lối ánh trăng — con đường lặng lẽ nhưng sáng rõ, như chính cách bạn vẫn đi qua cuộc đời.'
      : 'Bạn đã chọn lối đom đóm — con đường rực rỡ và ấm áp, như chính cách bạn vẫn sưởi ấm những người xung quanh.';

  const virtueLine = virtue
    ? `Bạn đã chọn đi sâu vào ${VIRTUE_WORD[virtue] ?? virtue} — và khu vườn đã đáp lại bằng cả một khu vườn tâm ý chỉ mở cho riêng bạn.`
    : 'Mỗi đóa hoa trong vườn — Yêu thương, Trân trọng, Hạnh phúc — đều đã cúi đầu chào bạn đi qua.';

  const mems = MEMORIES.filter((m) => journalIds.includes(m.id))
    .slice(0, 3)
    .map((m) => m.line(journey));
  const memoryPara =
    mems.length > 0
      ? `Tôi đã nhìn thấy bạn trong từng thử thách: ${mems.join(' ')}`
      : 'Dù bạn đi nhanh hay chậm, mỗi bước chân trong vườn đêm nay đều là của riêng bạn — và thế là đủ.';

  const wishPara = wish
    ? `Điều ước bạn gửi trước khi vườn hoa bừng nở là “${WISH_WORD[wish] ?? wish}”.${
        journey.wishText
          ? ` Bạn còn thì thầm: “${journey.wishText}” — tôi tin điều ấy sẽ thành.`
          : ' Tôi cũng ước điều ấy cho bạn, mỗi ngày.'
      }`
    : 'Trước khi vườn hoa bừng nở, bạn đã gửi một điều ước — tôi cũng ước điều ấy cho bạn, mỗi ngày.';

  const closings = [
    `Khu vườn này từ nay${ending ? ` sẽ nở theo cách ${ENDING_WORD[ending]}` : ' sẽ mãi'} — như chính bạn. Chúc mừng 20/10, bạn xứng đáng với mọi điều đẹp đẽ.`,
    `Cảm ơn bạn đã đi hết khu vườn đêm nay${ending ? `, theo cách ${ENDING_WORD[ending]} của riêng mình` : ''}. Chúc mừng 20/10 — mong bạn luôn được yêu thương như cách bạn xứng đáng.`,
  ];

  const heard = receivedBlessings.filter((b) => b.trim() !== '').slice(0, 2);
  const blessingPara =
    heard.length > 0
      ? `Dọc đường đi, khu vườn đã thì thầm những lời này cho bạn: ${heard.map((b) => `“${b}”`).join(' ')}`
      : null;

  const paras = [openings[variant], `${pathLine} ${virtueLine}`, memoryPara, wishPara];
  if (blessingPara) paras.push(blessingPara);
  paras.push(closings[variant]);
  return paras.join('\n\n');
}
