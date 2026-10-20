/**
 * Deep Personalization — versioned data models.
 *
 * GiftConfig: everything the sender defines (stored per gift, never in URLs).
 * JourneyState: everything the recipient's playthrough produces.
 * Choice / relic / ending IDs are stable strings so saved journeys stay
 * readable across app versions.
 */

export const GIFT_VERSION = 1 as const;

export type ThemeId = 'midnight' | 'dawn' | 'moonlit' | 'meadow';

export const THEMES: Record<
  ThemeId,
  { name: string; tagline: string }
> = {
  midnight: { name: 'Nửa đêm', tagline: 'Vườn hoa dưới ánh trăng nguyên bản' },
  dawn: { name: 'Bình minh', tagline: 'Ấm áp, rực rỡ như nắng sớm' },
  moonlit: { name: 'Nguyệt quang', tagline: 'Bạc và lam dịu dàng' },
  meadow: { name: 'Đồng cỏ', tagline: 'Xanh tươi, đầy sức sống' },
};

export type VirtueId = 'love' | 'gratitude' | 'joy';

export const VIRTUES: Record<VirtueId, { name: string }> = {
  love: { name: 'Yêu thương' },
  gratitude: { name: 'Trân trọng' },
  joy: { name: 'Hạnh phúc' },
};

/** The three branching choice points of the journey. */
export type ChoiceId = 'path' | 'virtue' | 'bloom';

export interface ChoiceOption {
  id: string;
  name: string;
  description: string;
  relicId: RelicId;
}

export interface ChoiceDefinition {
  id: ChoiceId;
  scene: string;
  title: string;
  prompt: string;
  options: ChoiceOption[];
}

export const CHOICES: ChoiceDefinition[] = [
  {
    id: 'path',
    scene: 'crossing',
    title: 'Ngã ba ánh sáng',
    prompt: 'Đom đóm và ánh trăng cùng dẫn đường. Bạn sẽ theo lối nào?',
    options: [
      {
        id: 'fireflies',
        name: 'Lối đom đóm',
        description: 'Những đốm sáng nhỏ bé, ấm áp và gần gũi.',
        relicId: 'firefly-lantern',
      },
      {
        id: 'moonlight',
        name: 'Lối ánh trăng',
        description: 'Con đường bạc lặng lẽ, sâu thẳm và mơ màng.',
        relicId: 'moon-shard',
      },
    ],
  },
  {
    id: 'virtue',
    scene: 'garden',
    title: 'Khu vườn tâm ý',
    prompt: 'Ba đóa hoa, ba điều quý giá. Bạn muốn vun đắp điều nào sâu nhất?',
    options: [
      { id: 'love', name: 'Yêu thương', description: 'Dành cho những cái ôm chưa kịp trao.', relicId: 'virtue-seed-love' },
      { id: 'gratitude', name: 'Trân trọng', description: 'Dành cho những điều thầm lặng mỗi ngày.', relicId: 'virtue-seed-gratitude' },
      { id: 'joy', name: 'Hạnh phúc', description: 'Dành cho những nụ cười xứng đáng.', relicId: 'virtue-seed-joy' },
    ],
  },
  {
    id: 'bloom',
    scene: 'unveiling',
    title: 'Điều ước cuối cùng',
    prompt: 'Trước khi vườn hoa bừng nở, hãy gửi gắm một điều ước cho chính mình:',
    options: [
      { id: 'radiance', name: 'Tỏa sáng', description: 'Mong bạn rực rỡ theo cách riêng của mình.', relicId: 'bloom-petal-radiance' },
      { id: 'serenity', name: 'Bình yên', description: 'Mong bạn có những ngày thật an nhiên.', relicId: 'bloom-petal-serenity' },
      { id: 'freedom', name: 'Tự do', description: 'Mong bạn được sống đúng với mình.', relicId: 'bloom-petal-freedom' },
    ],
  },
];

export type RelicId =
  | 'firefly-lantern'
  | 'moon-shard'
  | 'virtue-seed-love'
  | 'virtue-seed-gratitude'
  | 'virtue-seed-joy'
  | 'bloom-petal-radiance'
  | 'bloom-petal-serenity'
  | 'bloom-petal-freedom';

export const RELICS: Record<RelicId, { name: string; text: string; glyph: string }> = {
  'firefly-lantern': { name: 'Đèn đom đóm', text: 'Ánh sáng nhỏ bé nhưng đủ soi một đoạn đường.', glyph: '✦' },
  'moon-shard': { name: 'Mảnh trăng', text: 'Một mảnh trăng vỡ, vẫn vẹn nguyên ánh bạc.', glyph: '☾' },
  'virtue-seed-love': { name: 'Hạt yêu thương', text: 'Gieo xuống, nở thành những cái ôm.', glyph: '❀' },
  'virtue-seed-gratitude': { name: 'Hạt trân trọng', text: 'Gieo xuống, nở thành lời cảm ơn.', glyph: '❀' },
  'virtue-seed-joy': { name: 'Hạt hạnh phúc', text: 'Gieo xuống, nở thành tiếng cười.', glyph: '❀' },
  'bloom-petal-radiance': { name: 'Cánh rực rỡ', text: 'Điều ước tỏa sáng.', glyph: '✧' },
  'bloom-petal-serenity': { name: 'Cánh bình yên', text: 'Điều ước an nhiên.', glyph: '✧' },
  'bloom-petal-freedom': { name: 'Cánh tự do', text: 'Điều ước tự tại.', glyph: '✧' },
};

export type EndingId = 'radiant' | 'serene' | 'free';

export const ENDINGS: Record<
  EndingId,
  { name: string; message: string; virtue: VirtueId }
> = {
  radiant: {
    name: 'Rực rỡ',
    message: 'Vườn hoa bừng nở rực rỡ — như chính bạn, luôn tỏa sáng theo cách riêng của mình.',
    virtue: 'joy',
  },
  serene: {
    name: 'An nhiên',
    message: 'Vườn hoa khép lại trong bình yên — mong những ngày tới của bạn cũng an nhiên như thế.',
    virtue: 'gratitude',
  },
  free: {
    name: 'Tự tại',
    message: 'Vườn hoa mở ra chân trời mới — chúc bạn luôn được sống đúng với mình, tự do và kiêu hãnh.',
    virtue: 'love',
  },
};

/** What the sender creates. Stored per gift ID, never placed in URLs. */
export interface GiftConfig {
  version: typeof GIFT_VERSION;
  id: string;
  /** Recipient's name — shown across the journey. */
  recipientName: string;
  senderName: string;
  theme: ThemeId;
  /** Private message, revealed at the end. Never put in a URL. */
  personalMessage: string;
  /** ISO date (YYYY-MM-DD) or null = open anytime. Local timezone. */
  revealDate: string | null;
  /** Which virtue the garden emphasizes; 'balanced' keeps all three equal. */
  virtueFocus: VirtueId | 'balanced';
  /** How the sender addresses the recipient ("em", "chị", "bạn"…). */
  salutation: string;
  /** The sender's opening line on the invitation. Empty = poetic default. */
  invitationText: string;
  createdAt: number;
}

/** What the recipient's playthrough produces. */
export interface JourneyState {
  giftId: string;
  choices: Partial<Record<ChoiceId, string>>;
  relics: RelicId[];
  endingId: EndingId | null;
  startedAt: number;
  /** The recipient's own whispered wish (free text, optional). */
  wishText?: string;
  /** A memory the recipient released onto the pond (free text, optional). */
  lanternText?: string;
}

export function defaultGiftConfig(): GiftConfig {
  return {
    version: GIFT_VERSION,
    id: '',
    recipientName: '',
    senderName: 'Nguyễn Phúc - sự tôn trọng không hồi kết',
    theme: 'midnight',
    personalMessage: '',
    revealDate: null,
    virtueFocus: 'balanced',
    salutation: 'em',
    invitationText: '',
    createdAt: Date.now(),
  };
}

/** Validate a gift config; returns human-readable errors (Vietnamese). */
export function validateGiftConfig(c: GiftConfig): string[] {
  const errors: string[] = [];
  const name = c.recipientName.trim();
  if (!name) errors.push('Vui lòng nhập tên người nhận.');
  else if (name.length > 40) errors.push('Tên người nhận tối đa 40 ký tự.');
  const sender = c.senderName.trim();
  if (!sender) errors.push('Vui lòng nhập tên người gửi.');
  else if (sender.length > 60) errors.push('Tên người gửi tối đa 60 ký tự.');
  if (!(c.theme in THEMES)) errors.push('Chủ đề không hợp lệ.');
  if (c.personalMessage.length > 500)
    errors.push('Lời nhắn tối đa 500 ký tự.');
  if (c.revealDate && !/^\d{4}-\d{2}-\d{2}$/.test(c.revealDate))
    errors.push('Ngày mở quà không hợp lệ.');
  if (c.virtueFocus !== 'balanced' && !(c.virtueFocus in VIRTUES))
    errors.push('Lựa chọn đức tính không hợp lệ.');
  if (c.salutation.length > 20)
    errors.push('Cách xưng hô tối đa 20 ký tự.');
  if (c.invitationText.length > 300)
    errors.push('Lời dẫn trên thiệp mời tối đa 300 ký tự.');
  return errors;
}

/** Runtime guard for configs read back from storage (versioned). */
export function isGiftConfig(v: unknown): v is GiftConfig {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    c.version === GIFT_VERSION &&
    typeof c.id === 'string' &&
    typeof c.recipientName === 'string' &&
    typeof c.senderName === 'string' &&
    typeof c.theme === 'string' &&
    typeof c.personalMessage === 'string' &&
    (c.revealDate === null || typeof c.revealDate === 'string') &&
    typeof c.virtueFocus === 'string' &&
    typeof c.createdAt === 'number'
  );
}

/**
 * Resolve the invitation display values with graceful fallbacks.
 * Old stored gifts (without the new fields) still work.
 */
export function resolveInvitation(gift: GiftConfig | null): {
  name: string;
  salutation: string;
  text: string;
} {
  const name = gift?.recipientName?.trim() || 'bạn';
  const salutation = (gift as { salutation?: unknown } | null)?.salutation;
  const sal = typeof salutation === 'string' && salutation.trim() ? salutation.trim() : 'em';
  const raw = (gift as { invitationText?: unknown } | null)?.invitationText;
  const text =
    typeof raw === 'string' && raw.trim()
      ? raw.trim()
      : `Có một khu vườn đã chờ ${sal} từ rất lâu. Tối nay, cánh cửa ấy chỉ mở cho ${sal} thôi.`;
  return { name, salutation: sal, text };
}
