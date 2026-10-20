/**
 * Central configuration for The Secret Bloom.
 * Edit the sender/organization name, letter text, card message and date here —
 * no code changes needed elsewhere.
 */

export const CONFIG = {
  /** Shown on the final greeting card as the sender. */
  senderName: 'Nguyễn Phúc - sự tôn trọng không hồi kết',

  /** Date printed on the greeting card. */
  eventDate: '20.10.2026',

  /** Default short message on the personalized card. */
  defaultCardMessage:
    'Chúc bạn luôn được yêu thương, trân trọng và tỏa sáng theo cách riêng của mình.',

  /** The letter revealed after the gift opens, line by line. */
  letterLines: [
    'Gửi bạn,',
    '',
    'Nhân ngày 20/10, xin gửi đến bạn lời chúc cùng sự trân trọng chân thành nhất. Mong rằng trong mọi không gian bạn bước vào, tiếng nói của bạn đều được lắng nghe, những nỗ lực của bạn được nhìn nhận công bằng và những lựa chọn của bạn được tôn trọng.',
    '',
    'Bạn không cần phải trở thành một hình mẫu hoàn hảo để xứng đáng nhận được yêu thương. Bạn có quyền được khác biệt, được học hỏi, được thay đổi, được nói lên suy nghĩ của mình và được đi theo con đường mà bạn tin là đúng.',
    '',
    'Mong cuộc sống sẽ dành cho bạn thật nhiều cơ hội để phát triển, những người biết tôn trọng ranh giới của bạn, những mối quan hệ đem lại sự bình yên và những ngày mà bạn có thể tự hào về chính mình.',
    '',
    'Chúc mừng Ngày Phụ nữ Việt Nam 20/10!',
  ],

  letterSignature: 'Nguyễn Phúc - sự tôn trọng không hồi kết.',

  /** Public URL used by the Share fallback (copied to clipboard). */
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
} as const;
