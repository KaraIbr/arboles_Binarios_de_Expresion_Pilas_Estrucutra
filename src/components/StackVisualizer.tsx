import { AnimatePresence, motion } from 'framer-motion';
import { formatNumber, type EvaluationStep, type StackEntry } from '../core';
import { Section } from './Section';

interface StackVisualizerProps {
  stack: readonly StackEntry[];
  step: EvaluationStep | null;
  /** Clave del elemento recién apilado en este paso (destello Brand Green). */
  pushedKey: string | null;
}

// Colores de animación (equivalentes a los tokens del tema).
const BRAND = 'rgba(18, 161, 95, 1)';
const TOP_BG = 'rgba(235, 230, 218, 1)';
const REST_BG = 'rgba(235, 230, 218, 0)';
const GRAPHITE = 'rgba(30, 35, 33, 1)';
const SOFT = 'rgba(61, 68, 65, 1)';
const BONE = 'rgba(244, 241, 234, 1)';

function operationTag(step: EvaluationStep | null): string {
  if (!step) return '—';
  switch (step.kind) {
    case 'PUSH_OPERAND':
      return 'PUSH';
    case 'APPLY_OPERATOR':
      return 'POP · POP · PUSH';
    case 'RESULT':
      return 'TOP';
    case 'ERROR':
      return 'POP · POP · ✕';
  }
}

/**
 * Contenedor vertical abierto por arriba: los elementos entran (PUSH) y
 * salen (POP) por el extremo superior. El marcador TOP sigue al tope.
 */
export function StackVisualizer({ stack, step, pushedKey }: StackVisualizerProps) {
  const fromTop = [...stack].reverse();

  return (
    <Section
      label="B"
      title="Pila (LIFO)"
      aside={
        <span className="tabular font-rubik text-[11px] tracking-wider text-mute">
          {operationTag(step)} · tamaño {stack.length}
        </span>
      }
    >
      <div className="flex items-end gap-3">
        {/* Columna del marcador TOP */}
        <div className="flex w-14 flex-col justify-end pb-px" aria-hidden>
          <motion.div
            className="flex h-10 items-center justify-end gap-1 font-rubik text-[11px] font-medium text-mute"
            initial={false}
            animate={{ marginBottom: 8 + Math.max(0, stack.length - 1) * 44, opacity: stack.length ? 1 : 0.45 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            TOP
            <svg width="14" height="8" viewBox="0 0 14 8" className="stroke-mute" fill="none">
              <path d="M0 4h12M9 1l3 3-3 3" strokeWidth="1" />
            </svg>
          </motion.div>
        </div>

        {/* Contenedor abierto por arriba */}
        <div
          className="relative flex min-h-[150px] flex-1 flex-col justify-end gap-1 rounded-b-md border-x border-b border-graphite px-2 pt-6 pb-2"
          aria-label={`Pila con ${stack.length} elementos`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {fromTop.map((entry, i) => {
              const isTop = i === 0;
              const justPushed = entry.key === pushedKey;
              return (
                <motion.div
                  key={entry.key}
                  layout
                  initial={
                    justPushed
                      ? { y: -36, opacity: 0, backgroundColor: BRAND, borderColor: BRAND, color: BONE }
                      : { y: -36, opacity: 0 }
                  }
                  animate={{
                    y: 0,
                    opacity: 1,
                    backgroundColor: isTop ? TOP_BG : REST_BG,
                    borderColor: isTop ? GRAPHITE : 'rgba(30, 35, 33, 0.24)',
                    color: isTop ? GRAPHITE : SOFT,
                  }}
                  exit={{ y: -36, opacity: 0, transition: { duration: 0.25 } }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    backgroundColor: { duration: 0.9, delay: 0.25, ease: 'easeOut' },
                    borderColor: { duration: 0.9, delay: 0.25, ease: 'easeOut' },
                    color: { duration: 0.9, delay: 0.25, ease: 'easeOut' },
                  }}
                  className="tabular flex h-10 items-center justify-between rounded border px-3 font-rubik text-[15px]"
                >
                  <span>{formatNumber(entry.value)}</span>
                  <span className={`text-[10px] ${justPushed ? 'opacity-70' : 'text-mute'}`}>
                    {justPushed ? 'PUSH · ' : ''}[{stack.length - 1 - i}]
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {stack.length === 0 && (
            <p className="absolute inset-x-0 bottom-3 text-center font-rubik text-[12px] text-mute">pila vacía</p>
          )}
        </div>
      </div>
    </Section>
  );
}
