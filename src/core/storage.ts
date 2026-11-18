import { ERROR_LABELS } from './errors';
import type { EvaluationTrace } from './evaluator';
import type { ExpressionTree } from './ExpressionTree';
import { formatInfo, formatNumber } from './format';

/**
 * Registro plano de una evaluación: guarda únicamente la entrada (input)
 * y las salidas producidas (recorridos y resultado o error).
 */
export interface HistoryRecord {
  readonly id: string;
  readonly timestamp: string;
  /** Entrada (Input) */
  readonly input: string;
  /** Salidas (Outputs): los 3 recorridos y el resultado final o error */
  readonly preorden: string;
  readonly inorden: string;
  readonly posorden: string;
  readonly result: number | null;
  readonly error: string | null;
}

/** Construye un registro plano a partir del árbol y su traza de evaluación. */
export function createHistoryRecord(
  tree: ExpressionTree,
  trace: EvaluationTrace,
  now: Date = new Date(),
): HistoryRecord {
  const seq = (nodes: { info: number | '+' | '-' | '*' | '/' }[]) =>
    nodes.map((n) => formatInfo(n.info)).join(' ');

  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp,
    input: tree.source.trim(),
    preorden: seq(tree.preorden()),
    inorden: seq(tree.inorden()),
    posorden: seq(tree.posorden()),
    result: trace.result,
    error: trace.error ? `${ERROR_LABELS[trace.error.code]}: ${trace.error.message}` : null,
  };
}

/**
 * Formatea el historial completo como texto plano (.txt) listo para
 * guardarse en almacenamiento secundario (archivo descargable).
 */
export function formatHistoryTxt(records: readonly HistoryRecord[]): string {
  const lines: string[] = [
    '================================================================',
    'HISTORIAL DE EVALUACIONES — ÁRBOL DE EXPRESIÓN Y PILA',
    'Global University · Estructuras de Datos y Compiladores',
    `Total de registros: ${records.length}`,
    '================================================================',
    '',
  ];

  if (records.length === 0) {
    lines.push('Sin evaluaciones registradas.');
    return lines.join('\r\n');
  }

  records.forEach((rec, idx) => {
    const salida = rec.error !== null ? `ERROR (${rec.error})` : formatNumber(rec.result ?? 0);
    lines.push(`#${String(idx + 1).padStart(2, '0')} [${rec.timestamp}]`);
    lines.push(`  Entrada (Input)   : ${rec.input}`);
    lines.push(`  Salida Preorden   : ${rec.preorden}`);
    lines.push(`  Salida Inorden    : ${rec.inorden}`);
    lines.push(`  Salida Posorden   : ${rec.posorden}`);
    lines.push(`  Resultado Final   : ${salida}`);
    lines.push('----------------------------------------------------------------');
  });

  return lines.join('\r\n');
}
