import { AnimatePresence, motion } from "framer-motion";
import {
  ERROR_LABELS,
  formatInfo,
  formatNumber,
  type EvaluationStep,
} from "../core";
import { Section } from "./Section";

interface ResultBlockProps {
  step: EvaluationStep | null;
  history: readonly EvaluationStep[];
  finished: boolean;
}

/** Número con glifo − y entre paréntesis si es negativo: 8 − (−2). */
function operand(value: number): string {
  const text = formatInfo(value, true);
  return value < 0 ? `(${text})` : text;
}

export function ResultBlock({ step, history, finished }: ResultBlockProps) {
  const error = step?.kind === "ERROR" ? step.error : undefined;
  const result = finished && step?.kind === "RESULT" ? step.result : undefined;
  const operaciones = history.filter((s) => s.kind === "APPLY_OPERATOR");

  return (
    <Section label="D" title="Resultado">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className="sm:min-w-[9rem]">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-comfortaa text-3xl font-bold text-terracotta">
                  Indefinido
                </p>
                <p className="mt-1 font-comfortaa text-[11px] font-bold tracking-wide text-terracotta uppercase">
                  {ERROR_LABELS[error.code]}
                </p>
                <p className="mt-0.5 text-[13px] text-terracotta">
                  {error.message}
                </p>
              </motion.div>
            ) : result !== undefined ? (
              <motion.p
                key={`r-${result}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tabular font-rubik text-6xl leading-none font-medium tracking-tight text-graphite"
              >
                {formatNumber(result)}
              </motion.p>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="tabular font-rubik text-6xl leading-none font-light text-mute/40"
              >
                —
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {operaciones.length > 0 && (
          <div className="min-w-0 flex-1 border-t border-hairline pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <p className="mb-1.5 font-comfortaa text-[11px] font-bold tracking-wide text-mute uppercase">
              Resultados parciales (en orden de posorden)
            </p>
            <ol className="space-y-1">
              {operaciones.map((op, i) => {
                const actual = op === step;
                return (
                  <li
                    key={op.nodeId}
                    className={`tabular flex items-baseline gap-2 rounded-md px-2 py-0.5 font-rubik text-[13px] ${
                      actual
                        ? "bg-brand/10 text-graphite"
                        : "text-graphite-soft"
                    }`}
                  >
                    <span className="w-5 text-right text-[11px] text-mute">
                      {i + 1}.
                    </span>
                    <span>
                      {operand(op.izquierdo ?? 0)}{" "}
                      <span className="text-operator">
                        {formatInfo(op.info, true)}
                      </span>{" "}
                      {operand(op.derecho ?? 0)} ={" "}
                      <span className="font-medium">
                        {formatInfo(op.result ?? 0, true)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </Section>
  );
}
