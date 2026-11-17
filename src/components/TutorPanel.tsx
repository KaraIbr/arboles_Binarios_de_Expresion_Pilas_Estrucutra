import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { formatInfo, type EvaluationStep, type TreeNode } from '../core';
import { Section } from './Section';

interface TutorPanelProps {
  history: readonly EvaluationStep[];
  current: EvaluationStep | null;
  totalSteps: number;
  postorder: readonly TreeNode[] | null;
  ready: boolean;
  /** Controles de reproducción, se dibujan debajo de la narración. */
  controls: ReactNode;
}

function introText(postorder: readonly TreeNode[] | null, ready: boolean): string {
  if (!postorder) return 'Genera un árbol válido para que el tutor pueda explicar su evaluación.';
  const seq = postorder.map((n) => formatInfo(n.info)).join('  ');
  if (!ready) {
    return `El árbol está listo. Pulsa Evaluar: la pila leerá el Posorden (${seq}) de izquierda a derecha.`;
  }
  return `Se leerá el Posorden ${seq} de izquierda a derecha. Cada número se apila con PUSH; cada operador hace dos POP (primero el derecho, luego el izquierdo), calcula y apila el resultado.`;
}

export function TutorPanel({ history, current, totalSteps, postorder, ready, controls }: TutorPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [history.length]);

  const isError = current?.kind === 'ERROR';

  return (
    <Section
      label="C"
      title="Modo Tutor"
      aside={
        <span className="tabular font-rubik text-[11px] text-mute">
          {current ? `Paso ${current.index + 1} de ${totalSteps}` : ready ? `0 de ${totalSteps}` : ''}
        </span>
      }
    >
      {/* Narración didáctica */}
      <div className="flex gap-3" aria-live="polite">
        <GraduationCap size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-mute" aria-hidden />
        <AnimatePresence mode="wait">
          <motion.p
            key={current ? `s-${current.index}` : 'intro'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`min-h-[60px] text-[14px] leading-relaxed ${isError ? 'text-terracotta' : 'text-graphite'}`}
          >
            {current ? current.narration : introText(postorder, ready)}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Registro técnico de una línea, alto contraste */}
      <div
        className={`tabular mt-3 rounded-md px-3 py-2 font-rubik text-[13px] leading-snug text-bone ${
          isError ? 'bg-terracotta' : 'bg-graphite'
        }`}
      >
        {current ? (
          <>
            <span className="mr-2 text-bone/50">{String(current.index + 1).padStart(2, '0')}</span>
            {current.log}
          </>
        ) : (
          <span className="text-bone/60">{ready ? 'Listo para el primer paso.' : 'Esperando evaluación…'}</span>
        )}
      </div>

      {/* Controles de reproducción */}
      <div className="mt-3">{controls}</div>

      {history.length > 1 && (
        <ol ref={listRef} className="scrollbar-thin mt-3 max-h-24 space-y-0.5 overflow-y-auto border-t border-hairline pt-2 pr-1">
          {history.slice(0, -1).map((step) => (
            <li key={step.index} className="tabular font-rubik text-[12px] text-mute">
              <span className="mr-2 text-mute/60">{String(step.index + 1).padStart(2, '0')}</span>
              {step.log}
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
