/**
 * Finale flower species — HỒI XIV "Vườn hoa bừng nở".
 *
 * The giant bloom at the garden's heart is no longer a single fixed rose:
 * each playthrough opens a DIFFERENT species, so every visitor unlocks
 * their own flower. Pick one per mount (useMemo) per playthrough.
 */

export interface FlowerLayer {
  /** Petals in this layer. */
  count: number;
  rx: number;
  ry: number;
  /** Ellipse center-y before rotation (center of flower is 100,100). */
  cy: number;
  fill: string;
  opacity: number;
  rotateOffset: number;
}

export interface FlowerSpecies {
  id: string;
  /** Vietnamese display name, e.g. "Lan Tím". */
  name: string;
  /** One-line meaning shown under the bloom. */
  meaning: string;
  layers: FlowerLayer[];
  centerOuter: string;
  centerInner: string;
  stroke: string;
}

export const FINALE_FLOWERS: FlowerSpecies[] = [
  {
    id: 'hong-nhung',
    name: 'Hồng Nhung',
    meaning: 'tình yêu sâu đậm và lòng dũng cảm dịu dàng',
    layers: [
      { count: 6, rx: 26, ry: 40, cy: 58, fill: '#C96A8E', opacity: 0.88, rotateOffset: 0 },
      { count: 6, rx: 21, ry: 33, cy: 46, fill: '#E893A8', opacity: 0.88, rotateOffset: 24 },
      { count: 6, rx: 16, ry: 26, cy: 34, fill: '#F7C6D4', opacity: 0.88, rotateOffset: 48 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#E8A33D',
    stroke: '#8E2F4D',
  },
  {
    id: 'lan-tim',
    name: 'Lan Tím',
    meaning: 'sự thủy chung và vẻ đẹp kiêu sa',
    layers: [
      { count: 5, rx: 22, ry: 44, cy: 52, fill: '#B9A8E8', opacity: 0.88, rotateOffset: 0 },
      { count: 5, rx: 17, ry: 36, cy: 44, fill: '#D9C6F2', opacity: 0.9, rotateOffset: 36 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#8F7CC9',
    stroke: '#6A5A9E',
  },
  {
    id: 'nguyet-que',
    name: 'Nguyệt Quế',
    meaning: 'ánh sáng dịu dàng soi đường trong đêm',
    layers: [
      { count: 8, rx: 20, ry: 42, cy: 54, fill: '#F3D79B', opacity: 0.88, rotateOffset: 0 },
      { count: 8, rx: 15, ry: 34, cy: 46, fill: '#FFF8EC', opacity: 0.9, rotateOffset: 22 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#E8A33D',
    stroke: '#B98A2F',
  },
  {
    id: 'san-ho',
    name: 'San Hô',
    meaning: 'sức sống rực rỡ và niềm vui lan tỏa',
    layers: [
      { count: 7, rx: 24, ry: 38, cy: 58, fill: '#E0705A', opacity: 0.88, rotateOffset: 0 },
      { count: 7, rx: 19, ry: 31, cy: 47, fill: '#F4A08A', opacity: 0.88, rotateOffset: 26 },
      { count: 7, rx: 14, ry: 24, cy: 36, fill: '#FFC9B3', opacity: 0.9, rotateOffset: 52 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#C9502F',
    stroke: '#A03E28',
  },
  {
    id: 'dien-vi',
    name: 'Diên Vĩ',
    meaning: 'niềm tin và hy vọng trong trẻo',
    layers: [
      { count: 6, rx: 24, ry: 42, cy: 52, fill: '#8FD0DC', opacity: 0.88, rotateOffset: 0 },
      { count: 6, rx: 18, ry: 34, cy: 44, fill: '#BFE3EA', opacity: 0.9, rotateOffset: 30 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#3D9DB5',
    stroke: '#2F7E94',
  },
  {
    id: 'sen-hong',
    name: 'Sen Hồng',
    meaning: 'tâm hồn thanh khiết vươn lên từ bùn lầy',
    layers: [
      { count: 8, rx: 16, ry: 40, cy: 56, fill: '#F4A0BC', opacity: 0.88, rotateOffset: 0 },
      { count: 8, rx: 12, ry: 32, cy: 48, fill: '#F9D2DE', opacity: 0.9, rotateOffset: 22 },
    ],
    centerOuter: '#FFF4E6',
    centerInner: '#E8A33D',
    stroke: '#B65A7E',
  },
];

/** Pick one species at random. Call once per mount (useMemo) per playthrough. */
export function pickFinaleFlower(): FlowerSpecies {
  return FINALE_FLOWERS[Math.floor(Math.random() * FINALE_FLOWERS.length)];
}
