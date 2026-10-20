/**
 * Blessing variants for each minigame / virtue moment.
 *
 * Every payoff card the recipient reads after a minigame now picks ONE
 * variant at random per playthrough (variant 0 is the original approved
 * text), so no two journeys read exactly the same. Scenes report the shown
 * text upward so the final letters can weave them back in.
 */

export const SCENE_BLESSINGS: Record<string, string[]> = {
  'virtue-love': [
    'Yêu thương — Bạn không cần phải hoàn hảo hay hy sinh tất cả mới xứng đáng được yêu thương. Mong bạn luôn nhận được sự dịu dàng, được lắng nghe và được trân trọng — đúng như con người bạn.',
    'Yêu thương — Có những ngày bạn cho đi rất nhiều mà quên mất mình cũng cần được ôm lấy. Hôm nay, khu vườn ôm bạn một cái thật chặt: bạn xứng đáng được yêu thương, đơn giản vì bạn là bạn.',
    'Yêu thương — Người ta hay nói yêu thương là cho đi, nhưng khu vườn nghĩ khác: yêu thương cũng là dám nhận về. Mong bạn dám nhận những điều tốt đẹp như cách bạn vẫn hào phóng trao đi.',
  ],
  'virtue-gratitude': [
    'Trân trọng — Có những nỗ lực thầm lặng chẳng ai gọi tên, nhưng chúng nâng đỡ cả một gia đình, một tập thể. Hôm nay, xin được nhìn thấy và cảm ơn tất cả những điều tốt đẹp bạn mang đến mỗi ngày.',
    'Trân trọng — Bạn hay nói “có gì đâu” mỗi khi được cảm ơn, nhưng khu vườn đã thấy hết: những bữa cơm, những lần thức khuya, những lo toan không tên. Cảm ơn bạn, thật nhiều.',
    'Trân trọng — Biết ơn không làm cuộc đời bớt khó, nhưng làm lòng mình bớt nặng. Mong bạn luôn nhìn thấy những điều tốt đẹp mình đang có — bắt đầu từ chính bạn.',
  ],
  'virtue-joy': [
    'Hạnh phúc — Mong bạn có quyền được nghỉ ngơi mà không thấy có lỗi, được theo đuổi ước mơ của riêng mình và được cười thật tươi — không phải vì ai khác, mà vì chính bạn.',
    'Hạnh phúc — Đừng đợi đến khi mọi việc xong xuôi mới cho phép mình vui. Hạnh phúc không phải phần thưởng ở cuối đường — nó là cách ta đi trên đường. Mong bạn vui, ngay hôm nay.',
    'Hạnh phúc — Có người tìm hạnh phúc ở những điều lớn lao, nhưng khu vườn thấy bạn cười tươi nhất bên những điều giản dị. Giữ lấy nụ cười ấy nhé — nó hợp với bạn lắm.',
  ],
  pond: [
    'Có những đóng góp không xuất hiện trên sân khấu, có những nỗ lực chẳng được gọi tên. Hôm nay, mong bạn nhớ rằng giá trị của mình không đo bằng số việc hoàn thành — bạn cũng xứng đáng được quan tâm, được giúp đỡ và được nghỉ ngơi mà không phải cảm thấy có lỗi.',
    'Mặt hồ phẳng lặng soi rõ một điều: bạn đã làm rất tốt rồi. Những gì bạn lo hôm nay, ngày mai sẽ nhẹ đi. Hãy thả lỏng vai một chút — mặt hồ sẽ giữ hộ bạn những muộn phiền.',
    'Có những câu trả lời chỉ đến khi ta ngừng hỏi và lặng nhìn. Mặt hồ đã nghe hết những điều bạn chưa nói thành lời — và nó thì thầm lại: bạn đủ rồi, bạn xứng đáng được bình yên.',
  ],
  sanctuary: [
    'Nơi sâu thẳm của khu vườn cất giữ một điều ước: mong mọi người phụ nữ đều được nhìn thấy, được lắng nghe và được yêu thương — không chỉ hôm nay, mà mỗi ngày.',
    'Ba ngọn rune đã sáng — quá khứ, hiện tại, tương lai cùng chúc phúc cho bạn. Mong mọi người phụ nữ, trong đó có bạn, đều được sống đúng với mình — hôm nay và mỗi ngày.',
    'Thánh địa thì thầm điều ước cổ xưa nhất của khu vườn: mong không người phụ nữ nào phải thu mình lại để vừa với thế giới — mà thế giới sẽ rộng ra để vừa với cô ấy.',
  ],
  constellation: [
    'Mỗi người phụ nữ là một chòm sao riêng — với trí tuệ, can đảm, sáng tạo và quyền được tự chọn con đường của mình. Không ai phải giống ai để tỏa sáng.',
    'Bảy vì sao bạn vừa nối là bảy lời nhắc: trí tuệ, can đảm, sáng tạo, kiên nhẫn, dịu dàng, tự do và yêu thương. Tất cả đều đã ở trong bạn từ lâu.',
    'Đêm nay, trên bầu trời có thêm một chòm sao mang dấu ấn của bạn. Mỗi lần ngước nhìn trời sao, hãy nhớ: bạn cũng là một vì sao của ai đó.',
  ],
  memory: [
    'Bạn đã vượt qua cả ba cấp độ của Thử thách Ký ức. Phần thưởng dành cho kẻ kiên nhẫn: một vì sao băng vừa lướt qua khu vườn — hãy ước một điều cho người bạn thương nhất.',
    'Ba cấp độ đã qua — trí nhớ của bạn chỉ giữ lại những điều đáng giữ. Phần thưởng của người kiên nhẫn không phải vật chất, mà là niềm tin: mình làm được.',
    'Bạn đã quay lại sau mỗi lần vấp ngã và đi đến cùng. Khu vườn ghi nhận: sự kiên nhẫn của bạn chính là phép màu thầm lặng nhất.',
  ],
  fragments: [
    'Bốn mảnh pha lê vỡ đã về đúng chỗ — như cách bạn vẫn luôn gom những điều vụn vỡ về lại với nhau. Không có gì vỡ mà không thể lành, nếu ta đủ kiên nhẫn.',
    'Đóa hoa pha lê đã nguyên vẹn trở lại, rực rỡ hơn cả trước khi vỡ. Những vết nứt không làm ta kém đi — chúng là nơi ánh sáng lọt vào.',
    'Bạn đã đặt từng mảnh về đúng chỗ bằng đôi tay kiên nhẫn của mình. Khu vườn tin rằng: bàn tay ấy cũng sẽ chắp vá được mọi điều trong đời.',
  ],
  clock: [
    'Cơ quan đã mở — một hạt giống ánh sáng đang chờ được gieo.',
    'Ba vòng thời gian đã thẳng hàng — quá khứ, hiện tại, tương lai cùng mở ra. Hạt giống ánh sáng này là của bạn: gieo nó ở bất cứ nơi nào bạn muốn.',
    'Cơ quan đã mở. Đồng hồ khu vườn không chạy theo nhịp của ai — nó chỉ mở ra khi bạn sẵn sàng. Và bạn đã sẵn sàng.',
  ],
};

/** Pick one variant at random. Call once per mount (useMemo) per playthrough. */
export function pickSceneBlessing(key: string): string {
  const pool = SCENE_BLESSINGS[key] ?? [];
  if (pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)];
}
