import { Download, Trash2 } from 'lucide-react';
import type { Dispatch } from 'react';
import { formatHistoryTxt, formatNumber, type HistoryRecord } from '../core';
import type { EvaluatorAction } from '../hooks/useExpressionEvaluator';
import { Section } from './Section';
import { Tooltip } from './Tooltip';

interface HistoryBlockProps {
  records: readonly HistoryRecord[];
  dispatch: Dispatch<EvaluatorAction>;
}

function downloadTxtFile(records: readonly HistoryRecord[]) {
  const content = formatHistoryTxt(records);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'historial_evaluaciones.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function HistoryBlock({ records, dispatch }: HistoryBlockProps) {
  return (
    <Section
      label="E"
      title="Almacenamiento e Historial"
      aside={
        <div className="flex items-center gap-2">
          <span className="tabular font-rubik text-[11px] text-mute">
            {records.length} {records.length === 1 ? 'registro' : 'registros'}
          </span>
          <Tooltip content="Exporta el historial completo (entradas y salidas) a un archivo de texto plano (.txt).">
            <button
              type="button"
              disabled={records.length === 0}
              onClick={() => downloadTxtFile(records)}
              className="inline-flex items-center gap-1.5 rounded border border-graphite/30 px-2.5 py-1 font-comfortaa text-[11px] font-semibold text-graphite transition-colors hover:border-graphite hover:bg-bone-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={12} strokeWidth={1.8} />
              Descargar .txt
            </button>
          </Tooltip>
          {records.length > 0 && (
            <Tooltip content="Vacía el historial almacenado." placement="bottom-end">
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_HISTORY' })}
                aria-label="Limpiar historial"
                className="inline-flex items-center rounded p-1 text-mute transition-colors hover:bg-bone-deep hover:text-terracotta"
              >
                <Trash2 size={13} strokeWidth={1.6} />
              </button>
            </Tooltip>
          )}
        </div>
      }
    >
      {records.length === 0 ? (
        <p className="font-rubik text-[13px] text-mute">
          Aún no hay evaluaciones guardadas. Pulsa <span className="font-medium text-graphite">Evaluar</span> para
          registrar la entrada (expresión) y sus salidas (recorridos y resultado) en el historial.
        </p>
      ) : (
        <ul className="scrollbar-thin max-h-56 space-y-2 overflow-y-auto pr-1">
          {records.map((rec, idx) => {
            const num = records.length - idx;
            return (
              <li
                key={rec.id}
                className="rounded-md border border-hairline bg-bone-deep/40 px-3 py-2 font-rubik text-[12px]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <Tooltip content="Clic para volver a cargar esta expresión en el árbol.">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'LOAD_EXAMPLE', input: rec.input })}
                      className="tabular text-left font-medium text-graphite hover:text-brand"
                    >
                      <span className="mr-1.5 text-[11px] text-mute">#{String(num).padStart(2, '0')}</span>
                      {rec.input}
                    </button>
                  </Tooltip>
                  <div className="flex items-baseline gap-2">
                    <span className="tabular text-[11px] text-mute">{rec.timestamp}</span>
                    {rec.error !== null ? (
                      <span className="rounded bg-terracotta-tint px-1.5 py-0.5 font-comfortaa text-[10px] font-bold text-terracotta">
                        Indefinido
                      </span>
                    ) : (
                      <span className="tabular font-medium text-brand">
                        = {formatNumber(rec.result ?? 0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="tabular mt-1.5 grid grid-cols-1 gap-0.5 border-t border-hairline pt-1 text-[11px] text-graphite-soft sm:grid-cols-3">
                  <div>
                    <span className="text-mute">Pre: </span>
                    {rec.preorden}
                  </div>
                  <div>
                    <span className="text-mute">In: </span>
                    {rec.inorden}
                  </div>
                  <div>
                    <span className="text-mute">Pos: </span>
                    {rec.posorden}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
