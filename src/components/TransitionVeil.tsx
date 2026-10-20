import { motion } from 'framer-motion';

/**
 * Cinematic transition veil: on every scene change a large soft petal
 * sweeps across the frame with a light streak, so cuts feel like camera
 * movement rather than page changes. Remount (change key) to replay.
 */
export default function TransitionVeil({ reducedMotion = false }: { reducedMotion?: boolean }) {
  if (reducedMotion) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {/* travelling petal */}
      <motion.div
        className="absolute top-[-20%] h-[140%] w-40"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(244,160,188,0.5) 0%, rgba(201,106,142,0.28) 45%, transparent 72%)',
          filter: 'blur(14px)',
          transform: 'rotate(18deg)',
          borderRadius: '50%',
        }}
        initial={{ x: '-30vw', opacity: 0 }}
        animate={{ x: '130vw', opacity: [0, 0.9, 0.9, 0] }}
        transition={{ duration: 1.05, ease: 'easeInOut' }}
      />
      {/* light streak */}
      <motion.div
        className="absolute top-[-20%] h-[140%] w-10"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,244,230,0.55), transparent)',
          filter: 'blur(8px)',
          transform: 'rotate(18deg)',
        }}
        initial={{ x: '-30vw', opacity: 0 }}
        animate={{ x: '130vw', opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.08 }}
      />
    </div>
  );
}
