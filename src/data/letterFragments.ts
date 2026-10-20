/**
 * Letter fragments: each discovery unlocks one meaningful passage.
 * The letter scene assembles unlocked fragments in LETTER_ORDER,
 * then the central letter, then the signature — so the letter
 * literally grows with the journey and stays coherent even when
 * optional discoveries are missed.
 */

export const LETTER_FRAGMENTS: Record<string, string[]> = {
  spark: [
    'Mọi khu vườn đều bắt đầu từ một tia lửa nhỏ — và mọi hành trình đều bắt đầu từ một quyết định dám bước tiếp. Tia lửa bạn đánh thức tối nay là lời nhắc rằng: bạn không cần chờ ai cho phép mới được bắt đầu. Mỗi khởi đầu, dù nhỏ bé, đều xứng đáng được nâng niu.',
  ],
  gate: [
    'Có những cánh cổng trong đời chỉ mở ra khi ta dám chạm vào. Bạn đã bước qua — không phải vì con đường dễ dàng, mà vì bạn chọn đi tiếp. Mong rằng mỗi ngưỡng cửa bạn đối mặt sau này đều mở ra bằng sự can đảm dịu dàng ấy.',
  ],
  path: [
    'Trên lối đi trăng, những đốm sáng nhỏ đã dẫn đường cho bạn — như cách những người tử tế vẫn lặng lẽ soi sáng nhau trong đời. Mong bạn luôn gặp được những ánh sáng như thế, và cũng trở thành ánh sáng cho ai đó khi họ cần.',
  ],
  'virtue-love': [
    'Yêu thương không phải phần thưởng cho sự hoàn hảo, cũng không phải cái giá của hy sinh. Bạn xứng đáng được yêu thương vì chính con người bạn — được lắng nghe, được dịu dàng, được trân trọng mỗi ngày.',
  ],
  'virtue-gratitude': [
    'Có những nỗ lực chẳng ai gọi tên nhưng nâng đỡ cả một gia đình, một tập thể. Hôm nay, khu vườn xin được nhìn thấy tất cả những điều tốt đẹp bạn mang đến — và nói lời cảm ơn mà bạn xứng đáng nhận từ lâu.',
  ],
  'virtue-joy': [
    'Hạnh phúc không phải lúc nào cũng ồn ào. Đôi khi nó là quyền được nghỉ ngơi mà không thấy có lỗi, được cười vì chính mình, được theo đuổi điều mình yêu — không cần xin phép ai.',
  ],
  pond: [
    'Mặt hồ đã ghi nhớ: giá trị của bạn không đo bằng số việc hoàn thành hay số người bạn chăm lo. Bạn cũng xứng đáng được quan tâm, được giúp đỡ và được nghỉ ngơi — như bất kỳ ai khác.',
  ],
  resilience: [
    'Những mảnh vỡ không phải dấu chấm hết. Khi được gom lại bằng kiên nhẫn, chúng có thể thành một đóa hoa rực rỡ hơn trước. Mong bạn luôn có quyền được vỡ, được nghỉ, và được bắt đầu lại theo cách của mình.',
  ],
  pace: [
    'Đồng hồ của khu vườn không chạy theo nhịp của ai cả — nó chỉ mở ra khi bạn sẵn sàng. Mong bạn luôn được đi theo nhịp độ của chính mình: không vội vì người khác, không chậm vì sợ hãi.',
  ],
  dreams: [
    'Bảy vì sao bạn nối thành hoa là lời nhắc: trí tuệ, can đảm, sáng tạo và quyền tự chọn con đường của mình thuộc về bạn. Không ai phải giống ai để tỏa sáng — kể cả bạn.',
  ],
  seen: [
    'Nơi sâu thẳm khu vườn cất giữ một điều ước: mong mọi người phụ nữ đều được nhìn thấy, được lắng nghe và được yêu thương — không chỉ hôm nay, mà mỗi ngày bình thường khác.',
  ],
  perseverance: [
    'Thử thách ký ức không đo trí nhớ — nó đo sự kiên nhẫn quay lại sau mỗi lần vấp. Những chiến thắng thầm lặng như thế mới là điều làm nên một con người bản lĩnh.',
  ],
  butterfly: [
    'Bướm đêm chỉ xuất hiện với người chịu dừng lại và quan sát. Có những vẻ đẹp không phô trương — như sự tinh tế, lòng trắc ẩn và sức mạnh thầm lặng của bạn.',
  ],
  inscription: [
    'Minh văn cổ khắc rằng: người biết đọc những dấu vết nhỏ sẽ không bao giờ lạc đường. Cảm ơn bạn đã chịu khó nhìn kỹ — thế giới cần những đôi mắt như thế.',
  ],
};

/** Narrative order for assembling the letter. */
export const LETTER_ORDER = [
  'spark',
  'gate',
  'path',
  'virtue-love',
  'virtue-gratitude',
  'virtue-joy',
  'pond',
  'resilience',
  'pace',
  'dreams',
  'seen',
  'perseverance',
  'butterfly',
  'inscription',
];

/**
 * Deep Personalization — passages unlocked by the three branching choices.
 * Inserted after the discovery fragments, before the central letter.
 */
export const CHOICE_PASSAGES: Record<string, string[]> = {
  'path-fireflies': [
    'Bạn đã chọn lối đom đóm — con đường của những ánh sáng nhỏ bé mà ấm áp. Mong đời bạn luôn có những niềm vui giản dị như thế: một bữa cơm ngon, một tin nhắn hỏi thăm, một buổi tối không phải gồng mình.',
  ],
  'path-moonlight': [
    'Bạn đã chọn lối ánh trăng — con đường lặng lẽ mà sâu thẳm. Mong bạn luôn giữ được khoảng lặng cho riêng mình giữa ồn ào, nơi bạn được là chính mình mà không cần giải thích.',
  ],
  'virtue-love': [
    'Bạn đã chọn vun đắp yêu thương sâu hơn — và khu vườn đã ghi nhớ. Yêu thương bạn trao đi hôm nay sẽ quay về dưới những hình hài bất ngờ nhất, vào những lúc bạn cần nhất.',
  ],
  'virtue-gratitude': [
    'Bạn đã chọn vun đắp sự trân trọng sâu hơn — và khu vườn đã ghi nhớ. Những điều bạn lặng lẽ làm mỗi ngày không hề vô hình; có người đang nhìn thấy và biết ơn, dù họ chưa nói ra.',
  ],
  'virtue-joy': [
    'Bạn đã chọn vun đắp hạnh phúc sâu hơn — và khu vườn đã ghi nhớ. Hạnh phúc của bạn không phải món nợ phải trả bằng vất vả; nó là quyền, và bạn xứng đáng hưởng nó mỗi ngày.',
  ],
  'bloom-radiance': [
    'Điều ước bạn gửi trước khi hoa nở là “tỏa sáng” — vậy thì hãy rực rỡ đi, theo cách chỉ bạn mới có. Thế giới này cần ánh sáng của bạn hơn bạn tưởng.',
  ],
  'bloom-serenity': [
    'Điều ước bạn gửi trước khi hoa nở là “bình yên” — vậy thì mong những ồn ào sẽ lùi xa, để lại cho bạn những buổi sáng nhẹ nhõm và những đêm ngủ thật ngon.',
  ],
  'bloom-freedom': [
    'Điều ước bạn gửi trước khi hoa nở là “tự do” — vậy thì hãy sống đúng với mình, chọn con đường mình tin, yêu theo cách mình muốn. Không ai có quyền viết hộ cuộc đời bạn.',
  ],
};

/** Passages for the recipient's choices, in choice-point order. */
export function getChoicePassages(choices: Partial<Record<string, string>>): string[] {
  const out: string[] = [];
  const picks: Array<[string, string | undefined]> = [
    ['path', choices.path],
    ['virtue', choices.virtue],
    ['bloom', choices.bloom],
  ];
  for (const [cid, opt] of picks) {
    if (opt) {
      const key = `${cid}-${opt}`;
      const p = CHOICE_PASSAGES[key];
      if (p) out.push(...p);
    }
  }
  return out;
}

/**
 * Personal passages: choice passages plus the recipient's own whispered wish,
 * in their own words. Called with the full journey (may be null).
 */
export function getPersonalPassages(journey: {
  choices: Partial<Record<string, string>>;
  wishText?: string;
} | null): string[] {
  const out = getChoicePassages(journey?.choices ?? {});
  const wish = journey?.wishText?.trim();
  if (wish) {
    out.push(
      `Trước khi hoa nở, bạn đã thì thầm một điều ước của riêng mình: “${wish}”. Khu vườn đã nghe thấy — và sẽ giữ lời thì thầm ấy cẩn thận như giữ một hạt giống.`,
    );
  }
  return out;
}
