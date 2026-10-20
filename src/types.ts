export type Scene =
  | 'invitation'
  | 'void'
  | 'gate'
  | 'crossing'
  | 'garden'
  | 'grove'
  | 'pond'
  | 'fragments'
  | 'clock'
  | 'constellation'
  | 'sanctuary'
  | 'gift'
  | 'memory'
  | 'unveiling'
  | 'letter'
  | 'finale'
  | 'finalbloom';

export type CardStyle = 'midnight' | 'champagne' | 'garden';

export interface Sfx {
  enabled: boolean;
  toggle: () => void;
  chime: () => void;
  pop: () => void;
  success: () => void;
  error: () => void;
  reveal: () => void;
  sparkle: () => void;
  swell: () => void;
}

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
}
