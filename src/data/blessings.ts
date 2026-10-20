export type RecipientCategory =
  | 'mother'
  | 'sister'
  | 'friend'
  | 'colleague'
  | 'community'
  | 'general';

export type Mood =
  | 'gentle'
  | 'gratitude'
  | 'peace'
  | 'radiant'
  | 'inspiring'
  | 'joyful';

export interface Blessing {
  id: string;
  text: string;
  cats: RecipientCategory[];
  moods: Mood[];
}

export const CATEGORY_LABELS: Record<RecipientCategory, string> = {
  mother: 'Mẹ',
  sister: 'Chị / em',
  friend: 'Bạn bè',
  colleague: 'Đồng nghiệp',
  community: 'Cán bộ, hội viên',
  general: 'Lời chúc chung',
};

export const MOOD_LABELS: Record<Mood, string> = {
  gentle: 'Dịu dàng',
  gratitude: 'Biết ơn',
  peace: 'Bình yên',
  radiant: 'Rực rỡ',
  inspiring: 'Truyền cảm hứng',
  joyful: 'Vui vẻ',
};

const B = (
  id: string,
  text: string,
  cats: RecipientCategory[],
  moods: Mood[],
): Blessing => ({ id, text, cats, moods });

/**
 * 72 hand-written Vietnamese Women's Day blessings.
 * {name} is replaced with the recipient's name (or "bạn" when empty).
 */
export const BLESSINGS: Blessing[] = [
  // ——— MẸ ———
  B('m01', '{name} thân mến, cảm ơn mẹ vì những hy sinh lặng thầm suốt bao năm. Chúc mẹ luôn khỏe mạnh, an yên và mỉm cười mỗi ngày.', ['mother'], ['gratitude', 'gentle']),
  B('m02', 'Mong mẹ {name} luôn bình an, ngủ ngon giấc và thức dậy với niềm vui giản dị. Mẹ xứng đáng với những điều dịu dàng nhất.', ['mother'], ['gentle', 'peace']),
  B('m03', 'Mẹ là người phụ nữ mạnh mẽ nhất mà con biết. Cảm ơn mẹ đã dạy con cách yêu thương và kiên cường, {name} nhé.', ['mother'], ['gratitude', 'inspiring']),
  B('m04', 'Chúc mẹ {name} một ngày 20/10 thật rực rỡ: nhiều hoa, nhiều quà và thật nhiều tiếng cười bên những người thân yêu.', ['mother'], ['joyful', 'radiant']),
  B('m05', 'Cả đời mẹ vất vả vì gia đình, giờ là lúc mẹ được thảnh thơi. Chúc {name} luôn an nhiên, khỏe mạnh và hạnh phúc.', ['mother'], ['peace', 'gentle']),
  B('m06', 'Cảm ơn mẹ vì đã luôn là bến đỗ bình yên của cả nhà. Chúc mẹ {name} ngày 20/10 tràn ngập yêu thương.', ['mother'], ['gratitude', 'joyful']),
  B('m07', '{name} ơi, mẹ chính là tấm gương sáng nhất đời con. Chúc mẹ luôn tỏa sáng theo cách rất riêng của mình.', ['mother'], ['inspiring', 'radiant']),
  B('m08', 'Những món ăn mẹ nấu, những lời mẹ dặn — con mang theo suốt đời. Thương mẹ nhiều lắm, {name} ơi.', ['mother'], ['gentle', 'gratitude']),
  B('m09', 'Mong mẹ {name} luôn giữ được sự lạc quan và nụ cười hiền. Mẹ là niềm tự hào lớn nhất của chúng con.', ['mother'], ['peace', 'inspiring']),
  B('m10', 'Chúc {name} ngày Phụ nữ Việt Nam thật vui: mặc đẹp, cười tươi và nhận thật nhiều lời chúc ngọt ngào nhé.', ['mother'], ['radiant', 'joyful']),
  B('m11', 'Con biết ơn mẹ vì tất cả, kể cả những điều mẹ chưa từng kể. Chúc mẹ {name} một đời bình an.', ['mother'], ['gratitude', 'peace']),
  B('m12', 'Gửi đến {name} ngàn đóa hoa và vạn lời chúc tốt đẹp nhất nhân ngày 20/10. Mẹ mãi là số một trong lòng con.', ['mother'], ['gentle', 'joyful']),

  // ——— CHỊ / EM ———
  B('s01', 'Chúc {name} ngày 20/10 thật xinh đẹp, vui vẻ và nhận được thật nhiều yêu thương từ mọi người.', ['sister'], ['gentle', 'joyful']),
  B('s02', 'Cảm ơn {name} vì đã luôn ở bên, lắng nghe và sẻ chia. Có {name} ở bên là điều may mắn lớn nhất đời mình.', ['sister'], ['gratitude', 'gentle']),
  B('s03', '{name} à, hãy cứ tự tin theo đuổi ước mơ của mình. Chúc bạn tỏa sáng rực rỡ như chính con người bạn.', ['sister'], ['inspiring', 'radiant']),
  B('s04', 'Chúc {name} 20/10 cười thật tươi, ăn ngon, mặc đẹp và quẩy hết mình cùng hội chị em nhé.', ['sister'], ['joyful', 'radiant']),
  B('s05', 'Mong {name} luôn bình yên giữa những bộn bề. Mệt thì nghỉ, buồn thì kể — mình luôn ở đây.', ['sister'], ['peace', 'gentle']),
  B('s06', 'Ngưỡng mộ sự mạnh mẽ và dịu dàng của {name}. Cảm ơn vì đã truyền cảm hứng cho mình mỗi ngày.', ['sister'], ['gratitude', 'inspiring']),
  B('s07', 'Gửi {name} một cái ôm thật chặt nhân ngày 20/10. Chúc bạn luôn được yêu thương như cách bạn yêu thương mọi người.', ['sister'], ['gentle', 'joyful']),
  B('s08', 'Phụ nữ đẹp nhất khi tự tin là chính mình — và {name} thì luôn như vậy. Chúc mừng 20/10 nhé.', ['sister'], ['radiant', 'inspiring']),
  B('s09', 'Cảm ơn {name} vì những lời khuyên chân thành và những lần kéo mình dậy khỏi muộn phiền. Chúc bạn an yên.', ['sister'], ['peace', 'gratitude']),
  B('s10', 'Chúc {name} ngày 20/10 ngập tràn hoa, quà và những bất ngờ ngọt ngào.', ['sister'], ['joyful', 'gentle']),
  B('s11', 'Hãy cứ sống hết mình, yêu hết mình nhé {name}. 20/10 này, chúc bạn thêm thật nhiều niềm vui và những chuyến đi đáng nhớ.', ['sister'], ['inspiring', 'joyful']),
  B('s12', '{name} ơi, đừng quên chăm sóc bản thân giữa những lo toan nhé. Chúc bạn luôn khỏe và an nhiên.', ['sister'], ['gentle', 'peace']),

  // ——— BẠN BÈ ———
  B('f01', '{name} ơi, 20/10 này phải thật hoành tráng nhé: hẹn hò, cà phê, chụp ảnh cháy máy cùng nhau.', ['friend'], ['joyful', 'radiant']),
  B('f02', 'Cảm ơn {name} vì đã là người bạn tuyệt vời suốt những năm qua. Chúc bạn 20/10 ấm áp và hạnh phúc.', ['friend'], ['gratitude', 'gentle']),
  B('f03', 'Chúc {name} luôn dám mơ lớn và sống trọn từng khoảnh khắc. 20/10 rực rỡ nhé, bạn tôi.', ['friend'], ['inspiring', 'joyful']),
  B('f04', 'Mong {name} luôn tìm được bình yên sau những ngày mệt mỏi. Có gì cứ alo, mình luôn sẵn sàng.', ['friend'], ['peace', 'gentle']),
  B('f05', '{name} chính là định nghĩa của sự tỏa sáng tự nhiên. Chúc mừng ngày của chúng ta — 20/10.', ['friend'], ['radiant', 'inspiring']),
  B('f06', 'Cảm ơn vì những trận cười không ngớt và những bí mật chỉ hai đứa biết. Chúc {name} 20/10 vui hết nấc.', ['friend'], ['joyful', 'gratitude']),
  B('f07', 'Gửi {name} một ngày 20/10 thật nhẹ nhàng: ngủ nướng, ăn ngon và không phải lo nghĩ gì.', ['friend'], ['gentle', 'peace']),
  B('f08', 'Tuổi trẻ này, hãy cứ rực rỡ nhé {name}. Chúc bạn 20/10 và cả 364 ngày còn lại đều đáng nhớ.', ['friend'], ['inspiring', 'radiant']),
  B('f09', 'Biết ơn vì {name} đã xuất hiện trong đời mình. 20/10 này, mình bao bạn một chầu nhé.', ['friend'], ['gratitude', 'joyful']),
  B('f10', 'Chúc {name} đủ mạnh mẽ để vượt qua mọi thử thách, và đủ dịu dàng để tận hưởng cuộc sống.', ['friend'], ['peace', 'inspiring']),
  B('f11', '{name} ơi, chúc bạn 20/10 xinh như hoa, tươi như nắng và ngọt ngào như chính bạn vậy.', ['friend'], ['joyful', 'gentle']),
  B('f12', 'Cảm ơn {name} vì luôn là ánh nắng trong những ngày mưa của mình. Chúc mừng 20/10.', ['friend'], ['radiant', 'gratitude']),

  // ——— ĐỒNG NGHIỆP ———
  B('c01', 'Cảm ơn {name} vì sự tận tâm và chuyên nghiệp trong công việc. Chúc bạn 20/10 thật nhiều niềm vui.', ['colleague'], ['gratitude', 'inspiring']),
  B('c02', 'Chúc {name} ngày 20/10 rạng rỡ: công việc thuận lợi, đồng nghiệp quý mến và thật nhiều thành công.', ['colleague'], ['radiant', 'joyful']),
  B('c03', 'Ngưỡng mộ tinh thần làm việc và sự chu đáo của {name}. Chúc bạn luôn giữ vững phong độ và tỏa sáng.', ['colleague'], ['inspiring', 'gratitude']),
  B('c04', 'Chúc {name} 20/10 thật thư thái: ít deadline, nhiều niềm vui và những buổi chiều thảnh thơi.', ['colleague'], ['peace', 'gentle']),
  B('c05', 'Gửi đến {name} lời chúc 20/10 tốt đẹp nhất: luôn xinh đẹp, tự tin và thành công trên mọi nẻo đường.', ['colleague'], ['joyful', 'radiant']),
  B('c06', 'Cảm ơn {name} đã luôn hỗ trợ đồng đội hết mình. Chúc bạn một ngày 20/10 an yên, hạnh phúc.', ['colleague'], ['gratitude', 'peace']),
  B('c07', 'Chúc {name} tiếp tục gặt hái nhiều thành tựu và luôn là nguồn cảm hứng cho cả đội.', ['colleague'], ['inspiring', 'joyful']),
  B('c08', '{name} thân mến, sự dịu dàng và tỉ mỉ của bạn khiến nơi làm việc trở nên đáng yêu hơn. Chúc mừng 20/10.', ['colleague'], ['gentle', 'gratitude']),
  B('c09', 'Phụ nữ hiện đại, tự tin, bản lĩnh — đó chính là {name}. Chúc bạn 20/10 thật đáng nhớ.', ['colleague'], ['radiant', 'inspiring']),
  B('c10', 'Mong {name} luôn cân bằng giữa công việc và cuộc sống, để mỗi ngày đều là một ngày vui.', ['colleague'], ['peace', 'joyful']),
  B('c11', 'Cảm ơn {name} vì những đóng góp thầm lặng mà vô cùng quý giá. Chúc bạn 20/10 ngập tràn yêu thương.', ['colleague'], ['gratitude', 'radiant']),
  B('c12', 'Chúc {name} 20/10: sáng nhận hoa, chiều nhận quà, tối quây quần bên gia đình thân yêu.', ['colleague'], ['joyful', 'gentle']),

  // ——— CÁN BỘ, HỘI VIÊN ———
  B('u01', 'Trân trọng cảm ơn {name} vì những đóng góp tận tụy cho cộng đồng. Chúc bạn 20/10 mạnh khỏe, hạnh phúc.', ['community'], ['gratitude', 'inspiring']),
  B('u02', 'Chúc {name} luôn là ngọn lửa tiên phong, lan tỏa yêu thương và sức mạnh đến mọi người xung quanh.', ['community'], ['inspiring', 'radiant']),
  B('u03', 'Cảm ơn {name} vì đã luôn hết lòng vì tập thể. Chúc bạn ngày 20/10 thật vui và ý nghĩa.', ['community'], ['gratitude', 'joyful']),
  B('u04', 'Mong {name} luôn an yên, khỏe mạnh để tiếp tục cống hiến và lan tỏa những điều tốt đẹp.', ['community'], ['peace', 'gentle']),
  B('u05', '{name} là minh chứng cho vẻ đẹp của người phụ nữ Việt Nam: đảm đang, bản lĩnh và nhân hậu. Chúc mừng 20/10.', ['community'], ['radiant', 'inspiring']),
  B('u06', 'Chúc {name} 20/10 thật nhiều niềm vui, tiếng cười và những khoảnh khắc đáng nhớ bên đồng đội.', ['community'], ['joyful', 'gratitude']),
  B('u07', 'Mong {name} tiếp tục truyền cảm hứng và dẫn dắt phong trào ngày càng phát triển rực rỡ.', ['community'], ['inspiring', 'joyful']),
  B('u08', 'Gửi đến {name} lời chúc bình an và hạnh phúc. Cảm ơn bạn vì tất cả những gì đã làm cho cộng đồng.', ['community'], ['gentle', 'peace']),
  B('u09', 'Trân trọng những hy sinh thầm lặng của {name} cho công việc chung. Chúc bạn 20/10 tỏa sáng.', ['community'], ['gratitude', 'radiant']),
  B('u10', 'Chúc {name} luôn giữ được nhiệt huyết và niềm tin, để mỗi ngày cống hiến đều là niềm vui.', ['community'], ['peace', 'inspiring']),
  B('u11', 'Chúc {name} ngày Phụ nữ Việt Nam: khỏe để cống hiến, vui để lan tỏa, đẹp để tỏa sáng.', ['community'], ['joyful', 'radiant']),
  B('u12', 'Biết ơn {name} vì sự tận tụy không mệt mỏi. Chúc bạn và gia đình luôn hạnh phúc, an khang.', ['community'], ['gratitude', 'gentle']),

  // ——— LỜI CHÚC CHUNG ———
  B('g01', 'Chúc {name} ngày 20/10 thật rực rỡ: xinh đẹp, tự tin và ngập tràn hạnh phúc.', ['general'], ['radiant', 'joyful']),
  B('g02', 'Mong {name} luôn được bình an, được yêu thương và được là chính mình — hôm nay và mọi ngày.', ['general'], ['gentle', 'peace']),
  B('g03', 'Cảm ơn {name} vì đã mang đến thế giới này sự dịu dàng và ấm áp. Chúc mừng ngày 20/10.', ['general'], ['gratitude', 'gentle']),
  B('g04', 'Hãy cứ tỏa sáng theo cách riêng của mình nhé {name}. Chúc bạn một ngày 20/10 thật đáng nhớ.', ['general'], ['inspiring', 'radiant']),
  B('g05', 'Gửi đến {name} ngàn lời chúc tốt đẹp nhất nhân ngày Phụ nữ Việt Nam 20/10.', ['general'], ['joyful', 'radiant']),
  B('g06', 'Chúc {name} 20/10 an nhiên: tâm tĩnh lặng, lòng vui vẻ và nụ cười luôn nở trên môi.', ['general'], ['peace', 'joyful']),
  B('g07', 'Chúc {name} đủ dũng cảm để ước mơ, đủ kiên trì để thành công và đủ hạnh phúc để sẻ chia.', ['general'], ['inspiring', 'joyful']),
  B('g08', '{name} ơi, bạn xứng đáng với mọi điều tốt đẹp nhất. Chúc mừng 20/10.', ['general'], ['gentle', 'gratitude']),
  B('g09', 'Mong nụ cười của {name} luôn rạng rỡ như nắng sớm, và tâm hồn luôn thanh thản như mặt hồ thu.', ['general'], ['radiant', 'peace']),
  B('g10', '20/10 này, chúc {name} thêm yêu đời, thêm tự tin và thêm thật nhiều lý do để mỉm cười.', ['general'], ['joyful', 'inspiring']),
  B('g11', 'Cảm ơn {name} vì sự mạnh mẽ, tử tế và kiên cường. Bạn là niềm cảm hứng của rất nhiều người.', ['general'], ['gratitude', 'inspiring']),
  B('g12', 'Chúc {name} một ngày 20/10 thật nhẹ nhàng, và một cuộc đời thật an yên, hạnh phúc.', ['general'], ['peace', 'gentle']),

  // ——— BỔ SUNG: phẩm giá, tự do, được lắng nghe, quyền nghỉ ngơi ———
  B('m13', '{name} ơi, ngoài vai trò làm mẹ, mẹ còn là một con người với ước mơ và sở thích riêng. Chúc mẹ 20/10 dám dành thời gian cho chính mình.', ['mother'], ['inspiring', 'radiant']),
  B('m14', 'Mong mẹ {name} biết rằng mẹ không cần lúc nào cũng mạnh mẽ. Mệt thì nghỉ, buồn thì nói — con luôn ở đây.', ['mother'], ['peace', 'gentle']),
  B('m15', 'Cảm ơn mẹ đã cho con thấy phụ nữ có thể vừa dịu dàng vừa bản lĩnh. Chúc {name} luôn tự hào về chính mình.', ['mother'], ['gratitude', 'inspiring']),
  B('m16', 'Chúc mẹ {name} 20/10 thật đẹp: không chỉ đẹp vì người khác ngắm, mà đẹp vì mẹ thấy vui.', ['mother'], ['radiant', 'joyful']),

  B('s13', 'Chúc {name} dám chọn con đường của riêng mình, dù nó khác với kỳ vọng của mọi người. 20/10 này, hãy sống cho mình trước nhé.', ['sister'], ['inspiring', 'radiant']),
  B('s14', '{name} à, bạn có quyền từ chối những điều khiến mình mệt mỏi. Chúc bạn 20/10 thật nhẹ nhõm.', ['sister'], ['peace', 'gentle']),
  B('s15', 'Cảm ơn {name} vì đã dám nói lên suy nghĩ của mình — điều đó truyền cảm hứng cho mình nhiều lắm.', ['sister'], ['gratitude', 'inspiring']),
  B('s16', 'Chúc {name} 20/10: tự tin khoe cá tính, tự do làm điều mình thích và luôn được tôn trọng.', ['sister'], ['joyful', 'radiant']),

  B('f13', '{name} ơi, đừng thu nhỏ ước mơ của mình để vừa với kỳ vọng của người khác. Chúc bạn 20/10 thật rực rỡ.', ['friend'], ['inspiring', 'joyful']),
  B('f14', 'Mong {name} luôn có một nơi để trở về và những người không bắt bạn phải gồng mình. Nghỉ ngơi cũng là một quyền.', ['friend'], ['peace', 'gentle']),
  B('f15', 'Sự thông minh và hài hước của {name} là điều mình ngưỡng mộ nhất. Chúc mừng 20/10, bạn tôi.', ['friend'], ['radiant', 'inspiring']),
  B('f16', 'Biết ơn vì {name} luôn lắng nghe mà không phán xét. Chúc bạn gặp được những người cũng đối xử với bạn như vậy.', ['friend'], ['gratitude', 'peace']),

  B('c13', 'Chúc {name} 20/10: ý tưởng của bạn được lắng nghe, năng lực của bạn được ghi nhận xứng đáng và con đường thăng tiến rộng mở.', ['colleague'], ['inspiring', 'radiant']),
  B('c14', 'Cảm ơn {name} vì đã chứng minh rằng sự tử tế và sự chuyên nghiệp có thể đi cùng nhau. Chúc bạn an yên.', ['colleague'], ['gratitude', 'peace']),
  B('c15', 'Mong {name} luôn dám đề xuất, dám dẫn dắt và dám nhận những cơ hội lớn. 20/10 này, hãy mơ lớn hơn nhé.', ['colleague'], ['inspiring', 'joyful']),
  B('c16', 'Chúc {name} không phải mang việc về nhà trong ngày 20/10 — và có đủ thời gian cho những điều mình yêu.', ['colleague'], ['peace', 'gentle']),

  B('u13', 'Chúc {name} tiếp tục là tiếng nói mạnh mẽ cho những người chưa thể lên tiếng. 20/10 này, xin dành sự trân trọng cho chính bạn.', ['community'], ['inspiring', 'radiant']),
  B('u14', 'Cảm ơn {name} vì đã chọn cống hiến — đó là lựa chọn đáng quý, không phải nghĩa vụ. Chúc bạn bình an.', ['community'], ['gratitude', 'peace']),
  B('u15', 'Mong {name} luôn có cơ hội học hỏi, phát triển và đưa cộng đồng đi xa hơn nữa. Chúc mừng 20/10.', ['community'], ['inspiring', 'joyful']),
  B('u16', '{name} cho thấy phụ nữ có thể dẫn dắt bằng cả trí tuệ và lòng nhân ái. Trân trọng và chúc mừng bạn.', ['community'], ['radiant', 'gratitude']),

  B('g13', 'Chúc {name} 20/10: được là chính mình mà không cần xin phép, được theo đuổi điều mình tin và được tôn trọng vì điều đó.', ['general'], ['inspiring', 'radiant']),
  B('g14', 'Mong {name} có những ngày không phải gồng mình mạnh mẽ — được yếu đuối, được nghỉ ngơi và được yêu thương.', ['general'], ['peace', 'gentle']),
  B('g15', 'Cảm ơn {name} vì đã dám sống khác với khuôn mẫu. Thế giới cần thêm những người như bạn.', ['general'], ['gratitude', 'inspiring']),
  B('g16', 'Chúc {name} một ngày 20/10 thật vui — và một cuộc đời mà mỗi lựa chọn đều là của chính bạn.', ['general'], ['radiant', 'joyful']),
];

export interface ResolvedBlessing {
  id: string;
  text: string;
}

/**
 * Pick a blessing matching the category + mood, avoiding recently shown ids.
 * Falls back gracefully: category match → any blessing. Never returns
 * undefined or an unfilled template.
 */
export function pickBlessing(
  cat: RecipientCategory,
  mood: Mood,
  name: string,
  excludeIds: string[] = [],
): ResolvedBlessing {
  const displayName = name.trim() || 'bạn';
  const fill = (b: Blessing): ResolvedBlessing => ({
    id: b.id,
    text: b.text.split('{name}').join(displayName),
  });

  const matching = BLESSINGS.filter((b) => b.cats.includes(cat) && b.moods.includes(mood));
  const fresh = matching.filter((b) => !excludeIds.includes(b.id));
  if (fresh.length > 0) return fill(fresh[Math.floor(Math.random() * fresh.length)]);
  if (matching.length > 0) return fill(matching[Math.floor(Math.random() * matching.length)]);

  const catOnly = BLESSINGS.filter((b) => b.cats.includes(cat));
  const catFresh = catOnly.filter((b) => !excludeIds.includes(b.id));
  if (catFresh.length > 0) return fill(catFresh[Math.floor(Math.random() * catFresh.length)]);
  if (catOnly.length > 0) return fill(catOnly[Math.floor(Math.random() * catOnly.length)]);

  const anyFresh = BLESSINGS.filter((b) => !excludeIds.includes(b.id));
  const pool = anyFresh.length > 0 ? anyFresh : BLESSINGS;
  return fill(pool[Math.floor(Math.random() * pool.length)]);
}
