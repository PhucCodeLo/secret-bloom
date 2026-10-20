/**
 * The Main Letter, synthesized from the recipient's own journey.
 *
 * Instead of concatenating every unlocked fragment verbatim (which grows
 * long enough to skim past), this composes one tight letter that LINKS the
 * scenes: each paragraph distills a journey beat the recipient actually
 * lived — the spark, the gate, their path choice, the virtue they deepened,
 * the trials they passed — then weaves in the blessings whispered during
 * scene transitions, and closes with the 20/10 wish.
 *
 * Short, respectful, complete. The signature stays the last paragraph
 * (LetterScene renders it separately, handwritten).
 */
import type { JourneyState } from '../gift/types';
import { CONFIG } from '../config';

export interface MainLetterInput {
  displayName: string;
  salutation: string;
  /** Unlocked fragment ids, in narrative order. */
  fragmentIds: string[];
  journey: JourneyState | null;
  /** Blessing texts whispered during scene transitions, in journey order. */
  receivedBlessings: string[];
  /** Short passages from the recipient's explicit story choices. */
  choicePassages: string[];
}

const VIRTUE_ESSENCE: Record<string, string> = {
  love: 'Bạn đã chọn đi sâu vào Yêu thương — và khu vườn đáp lại: bạn xứng đáng được yêu thương vì chính con người bạn, không phải vì sự hoàn hảo.',
  gratitude:
    'Bạn đã chọn đi sâu vào Trân trọng — và khu vườn xin được nhìn thấy những nỗ lực thầm lặng của bạn, nói lời cảm ơn bạn xứng đáng nhận từ lâu.',
  joy: 'Bạn đã chọn đi sâu vào Hạnh phúc — và khu vườn nhắc bạn: hạnh phúc đôi khi chỉ là quyền được nghỉ ngơi mà không thấy có lỗi.',
};

/** One tight clause per trial scene, used only when that scene was lived. */
const TRIAL_ESSENCE: Record<string, string> = {
  pond: 'mặt hồ dạy bạn kiên nhẫn — có những điều chỉ hiện ra khi ta đủ lặng nhìn',
  resilience: 'những mảnh pha lê vỡ dạy bạn gom những điều vụn vỡ về lại với nhau',
  perseverance: 'thử thách ký ức dạy bạn quay lại sau mỗi lần vấp ngã',
  dreams: 'bảy vì sao bạn nối thành hoa nhắc bạn: không ai phải giống ai để tỏa sáng',
  pace: 'đồng hồ khu vườn dạy bạn đi theo nhịp độ của chính mình',
  butterfly: 'bướm đêm chỉ hiện ra với người chịu dừng lại quan sát',
  inscription: 'minh văn cổ cảm ơn đôi mắt chịu khó nhìn kỹ của bạn',
};

const TRIAL_ORDER = [
  'pond',
  'resilience',
  'perseverance',
  'dreams',
  'pace',
  'butterfly',
  'inscription',
];

export function composeMainLetter(input: MainLetterInput): string[] {
  const { displayName, salutation, fragmentIds, journey, receivedBlessings, choicePassages } =
    input;
  const name = displayName.trim() || 'bạn';
  const dear = salutation.trim() ? `${salutation.trim()} ${name}` : name;
  const have = new Set(fragmentIds);
  const choices = journey?.choices ?? {};

  const paras: string[] = [];

  // 1 — the spark (opening beat; always included)
  paras.push(
    `${dear} thương mến,\n\nMọi khu vườn đều bắt đầu từ một tia lửa nhỏ — và mọi hành trình đều bắt đầu từ một quyết định dám bước tiếp. Tia lửa bạn đánh thức tối nay là lời nhắc: bạn không cần chờ ai cho phép mới được bắt đầu.`,
  );

  // 2 — the gate + the path choice
  const pathLine =
    choices.path === 'moonlight'
      ? 'Trên lối ánh trăng, những đốm sáng nhỏ đã dẫn đường cho bạn — lặng lẽ mà sáng rõ, như cách bạn vẫn đi qua cuộc đời.'
      : choices.path === 'fireflies'
        ? 'Trên lối đom đóm, những đốm sáng nhỏ đã dẫn đường cho bạn — rực rỡ và ấm áp, như cách bạn vẫn sưởi ấm những người xung quanh.'
        : 'Trên lối đi của riêng mình, những đốm sáng nhỏ đã dẫn đường cho bạn — như cách những người tử tế vẫn lặng lẽ soi sáng nhau trong đời.';
  paras.push(
    `Bạn đã bước qua cánh cổng — không phải vì con đường dễ dàng, mà vì bạn chọn đi tiếp. ${pathLine}`,
  );

  // 3 — the deepened virtue
  const virtueKey = String(choices.virtue ?? '');
  paras.push(
    VIRTUE_ESSENCE[virtueKey] ??
      'Ba đóa hoa Yêu thương, Trân trọng, Hạnh phúc đều đã cúi đầu chào bạn đi qua — mỗi đóa hoa là một lời nhắc để bạn mang theo.',
  );

  // 4 — the trials, synthesized into one paragraph (only lived scenes)
  const livedTrials = TRIAL_ORDER.filter((id) => have.has(id)).slice(0, 4);
  if (livedTrials.length > 0) {
    const clauses = livedTrials.map((id) => TRIAL_ESSENCE[id]);
    paras.push(`Trong các thử thách, ${clauses.join('; ')}.`);
  }

  // 5 — the sanctuary's 20/10 wish (the heart of the garden; keep when lived)
  if (have.has('seen')) {
    paras.push(
      'Nơi sâu thẳm khu vườn cất giữ một điều ước: mong mọi người phụ nữ đều được nhìn thấy, được lắng nghe và được yêu thương — không chỉ hôm nay, mà mỗi ngày bình thường khác.',
    );
  }

  // 6 — the recipient's explicit story choices (short, already personal)
  for (const cp of choicePassages) {
    if (cp.trim() !== '') paras.push(cp);
  }

  // 7 — blessings whispered along the way (links the transition moments)
  const heard = receivedBlessings.filter((b) => b.trim() !== '').slice(0, 2);
  if (heard.length > 0) {
    paras.push(
      `Dọc đường đi, khu vườn đã thì thầm những lời này cho bạn: ${heard.map((b) => `“${b}”`).join(' ')}`,
    );
  }

  // 8 — the 20/10 closing (condensed central wish)
  paras.push(
    'Nhân ngày 20/10, xin gửi đến bạn lời chúc cùng sự trân trọng chân thành nhất. Mong rằng trong mọi không gian bạn bước vào, tiếng nói của bạn đều được lắng nghe, nỗ lực của bạn được nhìn nhận công bằng, và lựa chọn của bạn được tôn trọng. Chúc mừng Ngày Phụ nữ Việt Nam 20/10!',
  );

  // Signature stays last — LetterScene renders it separately, handwritten.
  paras.push(CONFIG.letterSignature);
  return paras;
}
