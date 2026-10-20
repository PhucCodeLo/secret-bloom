/**
 * Object registry: every collectible in the experience has a stable ID,
 * a journal entry, an optional letter fragment, and a finale visual.
 * Collection is idempotent — collecting twice grants nothing twice.
 */

import { RELICS, type RelicId } from '../gift/types';

export interface CollectibleDef {
  id: string;
  /** Journal title */
  name: string;
  /** Journal text */
  text: string;
  /** Letter fragment unlocked by this collectible (optional) */
  fragmentId?: string;
  /** Mini-game completed by this collectible (optional) */
  gameId?: string;
  /** Glyph used in the finale */
  glyph: string;
  /** Glow color used in the finale */
  color: string;
}

export const REGISTRY: Record<string, CollectibleDef> = {
  'first-spark': {
    id: 'first-spark',
    name: 'Tia Lửa Đầu Tiên',
    text: 'Từ bóng tối, bạn đã đánh thức tia lửa đầu tiên của khu vườn.',
    fragmentId: 'spark',
    glyph: '✦',
    color: '#F3D79B',
  },
  'gate-seal': {
    id: 'gate-seal',
    name: 'Ấn Cổng Thiên Văn',
    text: 'Bạn đã chạm vào ấn sáng và mở cánh cổng thiên văn.',
    fragmentId: 'gate',
    glyph: '❖',
    color: '#E8C87E',
  },
  'firefly-path': {
    id: 'firefly-path',
    name: 'Lối Đom Đóm',
    text: 'Bạn đã lần theo bốn điểm sáng qua lối đi trăng.',
    fragmentId: 'path',
    glyph: '✧',
    color: '#8FD8C9',
  },
  butterfly: {
    id: 'butterfly',
    name: 'Bướm Đêm Bí Ẩn',
    text: 'Một con bướm đêm hiếm hoi đã bay ngang qua bạn trên lối đi trăng.',
    fragmentId: 'butterfly',
    glyph: '✺',
    color: '#B9A8E8',
  },
  inscription: {
    id: 'inscription',
    name: 'Minh Văn Cổ',
    text: 'Bạn đã khám phá phiến đá khắc minh văn cổ bị rêu phủ.',
    fragmentId: 'inscription',
    glyph: '❖',
    color: '#9FB8E8',
  },
  'flower-love': {
    id: 'flower-love',
    name: 'Hoa Yêu Thương',
    text: 'Đóa hoa của đức hạnh YÊU THƯƠNG đã nở.',
    fragmentId: 'virtue-love',
    glyph: '❀',
    color: '#F4A0BC',
  },
  'flower-gratitude': {
    id: 'flower-gratitude',
    name: 'Hoa Trân Trọng',
    text: 'Đóa hoa của đức hạnh TRÂN TRỌNG đã nở.',
    fragmentId: 'virtue-gratitude',
    glyph: '❀',
    color: '#F3D79B',
  },
  'flower-joy': {
    id: 'flower-joy',
    name: 'Hoa Hạnh Phúc',
    text: 'Đóa hoa của đức hạnh HẠNH PHÚC đã nở.',
    fragmentId: 'virtue-joy',
    glyph: '❀',
    color: '#B9A8E8',
  },
  'pond-memory': {
    id: 'pond-memory',
    name: 'Ký Ức Mặt Hồ',
    text: 'Bạn đã đọc đúng những hình phản chiếu trên hồ ký ức.',
    fragmentId: 'pond',
    gameId: 'pond',
    glyph: '☾',
    color: '#9FB8E8',
  },
  'memory-lantern': {
    id: 'memory-lantern',
    name: 'Đèn Kỷ Niệm',
    text: 'Một kỷ niệm bạn tự tay thả xuống mặt hồ — nó vẫn đang trôi đâu đó trong khu vườn.',
    fragmentId: 'pond',
    gameId: 'pond',
    glyph: '🏮',
    color: '#F3D79B',
  },
  'seed-planted': {
    id: 'seed-planted',
    name: 'Hạt Giống Đã Gieo',
    text: 'Bạn đã gieo một hạt giống đức hạnh xuống vườn — khu vườn sẽ nuôi nó lớn lên cùng hành trình của bạn.',
    fragmentId: 'garden',
    glyph: '🌱',
    color: '#8FD8A9',
  },
  'crossing-restored': {
    id: 'crossing-restored',
    name: 'Lối Đi Được Thắp Sáng',
    text: 'Con đường bạn đã chọn vẫn sáng đèn — khu vườn nhớ mãi lựa chọn ấy.',
    fragmentId: 'crossing',
    glyph: '✦',
    color: '#F3D79B',
  },
  'grove-restored': {
    id: 'grove-restored',
    name: 'Khu Vườn Tâm Ý',
    text: 'Nơi ẩn đã mở ra và sẽ ở đó mỗi khi bạn quay lại — đóa hoa đức hạnh vẫn đang nở.',
    fragmentId: 'garden',
    glyph: '❀',
    color: '#F4A0BC',
  },
  'crystal-flower': {
    id: 'crystal-flower',
    name: 'Hoa Pha Lê',
    text: 'Bốn mảnh vỡ đã hợp nhất thành một đóa hoa ánh sáng.',
    fragmentId: 'resilience',
    gameId: 'fragments',
    glyph: '✦',
    color: '#F4A0BC',
  },
  'clock-seed': {
    id: 'clock-seed',
    name: 'Hạt Giống Thời Gian',
    text: 'Ba vòng xoay đã thẳng hàng — cơ quan cổ mở ra một hạt giống ánh sáng.',
    fragmentId: 'pace',
    gameId: 'clock',
    glyph: '❖',
    color: '#E8C87E',
  },
  constellation: {
    id: 'constellation',
    name: 'Chòm Sao Của Nàng',
    text: 'Bảy vì sao đã nối thành một đóa hoa — biểu tượng của bản sắc và tự do.',
    fragmentId: 'dreams',
    gameId: 'constellation',
    glyph: '✦',
    color: '#F3D79B',
  },
  'sanctuary-secret': {
    id: 'sanctuary-secret',
    name: 'Bí Mật Thánh Địa',
    text: 'Ba cổ ngữ đã thắp sáng — quá khứ, hiện tại và tương lai cùng hội tụ.',
    fragmentId: 'seen',
    glyph: '❀',
    color: '#FFF4E6',
  },
  'golden-ribbon': {
    id: 'golden-ribbon',
    name: 'Dải Nơ Vàng',
    text: 'Bạn đã nới lỏng dải nơ trên món quà niêm phong.',
    glyph: '✧',
    color: '#E893A8',
  },
  'broken-seal': {
    id: 'broken-seal',
    name: 'Ấn Sáp Niêm Phong',
    text: 'Ấn sáp vẫn giữ chặt — chỉ Thử thách Ký ức mới có thể phá giải.',
    glyph: '❖',
    color: '#C96A8E',
  },
  'memory-trial': {
    id: 'memory-trial',
    name: 'Thử Thách Ký Ức',
    text: 'Bạn đã vượt qua cả ba cấp độ của thử thách ký ức.',
    fragmentId: 'perseverance',
    gameId: 'memory',
    glyph: '☾',
    color: '#B9A8E8',
  },
  'secret-reward': {
    id: 'secret-reward',
    name: 'Vì Sao Băng',
    text: 'Một vì sao băng đã rơi xuống sau khi ấn sáp vỡ ra.',
    glyph: '✦',
    color: '#8FD8C9',
  },
  'crystal-heart': {
    id: 'crystal-heart',
    name: 'Trái Tim Pha Lê',
    text: 'Dải nơ đã tháo, ấn sáp đã vỡ, nắp hộp đã mở — một viên pha lê bay lên, mang theo lá thư.',
    fragmentId: 'gift',
    glyph: '◆',
    color: '#F3D79B',
  },
};

/* Deep Personalization — relics earned at the three branching choice points.
   Registered here so they flow through the journal and the finale gathering
   like every other collectible. */
const RELIC_COLORS: Record<RelicId, string> = {
  'firefly-lantern': '#F3D79B',
  'moon-shard': '#B9A8E8',
  'virtue-seed-love': '#F4A0BC',
  'virtue-seed-gratitude': '#F3D79B',
  'virtue-seed-joy': '#8FD8C9',
  'bloom-petal-radiance': '#F3D79B',
  'bloom-petal-serenity': '#B9A8E8',
  'bloom-petal-freedom': '#8FD8C9',
};

for (const [rid, r] of Object.entries(RELICS) as Array<[RelicId, (typeof RELICS)[RelicId]]>) {
  const id = `relic-${rid}`;
  REGISTRY[id] = {
    id,
    name: r.name,
    text: r.text,
    glyph: r.glyph,
    color: RELIC_COLORS[rid],
  };
}

export const ALL_IDS = Object.keys(REGISTRY);
