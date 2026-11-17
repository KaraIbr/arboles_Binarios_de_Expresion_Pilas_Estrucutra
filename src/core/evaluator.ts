import { ExpressionError, toExpressionError } from './errors';
import type { ExpressionTree } from './ExpressionTree';
import { formatNumber } from './format';
import type { NodeInfo, TreeNode } from './Node';
import { Stack } from './Stack';
import type { Operator } from './Token';

/** Elemento almacenado en la pila: valor + nodo que lo originó (para la UI). */
export interface StackEntry {
  /** Clave estable (id del nodo productor). */
  readonly key: string;
  readonly value: number;
}

export type StepKind = 'PUSH_OPERAND' | 'APPLY_OPERATOR' | 'RESULT' | 'ERROR';

/** Fotografía de un paso de la evaluación en posorden. */
export interface EvaluationStep {
  readonly index: number;
  readonly kind: StepKind;
  readonly nodeId: string;
  readonly info: NodeInfo;
  /** Valores extraídos: primer POP = derecho, segundo POP = izquierdo. */
  readonly derecho?: number;
  readonly izquierdo?: number;
  readonly operator?: Operator;
  readonly result?: number;
  readonly stackBefore: readonly StackEntry[];
  readonly stackAfter: readonly StackEntry[];
  /** Registro de una línea, ej. "POP(2), POP(8) → 8 * 2 = 16 → PUSH(16)". */
  readonly log: string;
  /** Narración didáctica del paso para el Modo Tutor. */
  readonly narration: string;
  readonly error?: ExpressionError;
}

export interface EvaluationTrace {
  readonly postorder: readonly TreeNode[];
  readonly steps: readonly EvaluationStep[];
  readonly result: number | null;
  readonly error: ExpressionError | null;
}

/** Aplica `izquierdo [operador] derecho`. La división entre cero se intercepta aquí. */
export function applyOperator(izquierdo: number, operador: Operator, derecho: number): number {
  switch (operador) {
    case '+':
      return izquierdo + derecho;
    case '-':
      return izquierdo - derecho;
    case '*':
      return izquierdo * derecho;
    case '/':
      if (derecho === 0) {
        throw new ExpressionError(
          'DIVISION_BY_ZERO',
          `División entre cero: ${formatNumber(izquierdo)} / ${formatNumber(derecho)} no está definida.`,
        );
      }
      return izquierdo / derecho;
  }
}

/**
 * Evalúa el árbol recorriéndolo en POSORDEN con una pila real.
 *
 *  - Operando → PUSH(valor)
 *  - Operador → derecho = POP(); izquierdo = POP();
 *               resultado = izquierdo [op] derecho; PUSH(resultado)
 *  - Fin      → TOP() contiene el resultado (la pila debe tener 1 elemento)
 *
 * Nunca lanza: los errores quedan registrados en la traza para que la UI
 * los muestre sin interrumpir la ejecución.
 */
export function evaluatePostorder(tree: ExpressionTree): EvaluationTrace {
  const postorder = tree.posorden();
  const pila = new Stack<StackEntry>();
  const steps: EvaluationStep[] = [];

  try {
    for (const nodo of postorder) {
      const stackBefore = pila.toArray();

      if (typeof nodo.info === 'number') {
        pila.push({ key: nodo.id, value: nodo.info });
        steps.push({
          index: steps.length,
          kind: 'PUSH_OPERAND',
          nodeId: nodo.id,
          info: nodo.info,
          result: nodo.info,
          stackBefore,
          stackAfter: pila.toArray(),
          log: `Operando ${formatNumber(nodo.info)} → PUSH(${formatNumber(nodo.info)})`,
          narration:
            `Visitando operando (${formatNumber(nodo.info)}). ` +
            (nodo.synthetic ? 'Este −1 no estaba escrito: lo agregó el analizador para aplicar el signo negativo. ' : '') +
            `Un número no se opera: se guarda en la pila. ` +
            `PUSH(${formatNumber(nodo.info)}) → TOP = ${formatNumber(nodo.info)}, la pila tiene ${pila.size} ${pila.size === 1 ? 'elemento' : 'elementos'}.`,
        });
        continue;
      }

      const operador = nodo.info;
      const derecho = pila.pop().value; // 1er POP → operando DERECHO
      const izquierdo = pila.pop().value; // 2do POP → operando IZQUIERDO
      const der = formatNumber(derecho);
      const izq = formatNumber(izquierdo);

      let resultado: number;
      try {
        resultado = applyOperator(izquierdo, operador, derecho);
      } catch (cause) {
        const error = toExpressionError(cause);
        steps.push({
          index: steps.length,
          kind: 'ERROR',
          nodeId: nodo.id,
          info: operador,
          operator: operador,
          derecho,
          izquierdo,
          stackBefore,
          stackAfter: pila.toArray(),
          log: `POP(${der}), POP(${izq}) → ${izq} ${operador} ${der} → ERROR`,
          narration:
            `Visitando operador (${operador}). POP Derecho (${der}), POP Izquierdo (${izq}). ` +
            `Al calcular ${izq} ${operador} ${der} el divisor es 0: la operación no está definida, ` +
            `así que la evaluación se detiene sin hacer PUSH.`,
          error,
        });
        throw error;
      }

      pila.push({ key: nodo.id, value: resultado });
      const res = formatNumber(resultado);
      steps.push({
        index: steps.length,
        kind: 'APPLY_OPERATOR',
        nodeId: nodo.id,
        info: operador,
        operator: operador,
        derecho,
        izquierdo,
        result: resultado,
        stackBefore,
        stackAfter: pila.toArray(),
        log: `POP(${der}), POP(${izq}) → ${izq} ${operador} ${der} = ${res} → PUSH(${res})`,
        narration:
          `Visitando operador (${operador}). POP Derecho (${der}), POP Izquierdo (${izq}). ` +
          `Se calcula izquierdo ${operador} derecho: ${izq} ${operador} ${der} = ${res}. PUSH(${res}) → TOP = ${res}.`,
      });
    }

    const tope = pila.top();
    if (tope === null || pila.size !== 1) {
      throw new ExpressionError(
        'MALFORMED_TREE',
        `Al terminar el posorden la pila debe contener exactamente 1 elemento (contiene ${pila.size}).`,
      );
    }

    const snapshot = pila.toArray();
    steps.push({
      index: steps.length,
      kind: 'RESULT',
      nodeId: tree.root.id,
      info: tree.root.info,
      result: tope.value,
      stackBefore: snapshot,
      stackAfter: snapshot,
      log: `Fin del posorden → TOP() = ${formatNumber(tope.value)} → Resultado`,
      narration:
        `Posorden terminado. La pila contiene un único elemento, así que TOP() = ${formatNumber(tope.value)} ` +
        `es el resultado de la expresión.`,
    });

    return { postorder, steps, result: tope.value, error: null };
  } catch (cause) {
    return { postorder, steps, result: null, error: toExpressionError(cause) };
  }
}
