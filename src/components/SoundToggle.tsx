interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      title={enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-champagne/40 bg-midnight/70 text-xl text-champagne backdrop-blur-sm transition hover:bg-midnight/90"
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
    </button>
  );
}
