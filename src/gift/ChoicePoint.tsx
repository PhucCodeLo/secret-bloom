import { motion } from 'framer-motion';
import { RELICS, type ChoiceDefinition, type ChoiceOption } from './types';

/**
 * Reusable branching choice point. Presents the choice; once chosen,
 * shows a compact badge of the decision (choices are final — no skips,
 * no take-backs, matching the app's philosophy).
 */
export default function ChoicePoint({
  def,
  chosenId,
  onChoose,
}: {
  def: ChoiceDefinition;
  chosenId?: string;
  onChoose: (opt: ChoiceOption) => void;
}) {
  const chosen = def.options.find((o) => o.id === chosenId);

  if (chosen) {
    const relic = RELICS[chosen.relicId];
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border border-champagne/25 bg-midnight/50 px-5 py-4"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-champagne/60">{def.title}</p>
        <p className="font-display text-lg text-ivory">
          Bạn đã chọn: <span className="text-champagne">{chosen.name}</span>{' '}
          <span aria-hidden="true">{relic.glyph}</span>
        </p>
        <p className="text-sm italic text-ivory/60">Đã nhận: {relic.name} — ghi vào nhật ký ✦</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="flex w-full flex-col items-center gap-4"
    >
      <p className="text-xs font-medium uppercase tracking-[0.4em] text-champagne/70">
        {def.title}
      </p>
      <p className="max-w-xs text-center font-display text-xl leading-8 text-ivory">
        {def.prompt}
      </p>
      <div className="flex w-full flex-col gap-3">
        {def.options.map((opt) => {
          const relic = RELICS[opt.relicId];
          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => onChoose(opt)}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center gap-4 rounded-2xl border border-champagne/25 bg-deepblue/60 px-5 py-4 text-left transition-colors hover:border-champagne/60 hover:bg-deepblue/90"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne/40 bg-midnight/60 font-display text-2xl text-champagne"
                style={{ boxShadow: '0 0 18px rgba(243,215,155,0.3)' }}
                aria-hidden="true"
              >
                {relic.glyph}
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-ivory">
                  {opt.name}
                </span>
                <span className="block text-sm leading-6 text-ivory/60">
                  {opt.description}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
