interface ProgressIndicatorProps {
  total: number;
  done: number;
  label: string;
}

/**
 * Step progress — uses filled vs. hollow dots AND a text counter,
 * so progress is never communicated by color alone.
 */
export default function ProgressIndicator({
  total,
  done,
  label,
}: ProgressIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={`${label}: ${done} trên ${total}`}
      className="flex items-center justify-center gap-3"
    >
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`block h-3 w-3 rounded-full transition-all duration-500 ${
              i < done
                ? 'bg-champagne shadow-[0_0_10px_rgba(243,215,155,0.9)]'
                : 'border border-champagne/50 bg-transparent'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium tracking-wide text-champagne/90">
        {done}/{total} {label}
      </span>
    </div>
  );
}
