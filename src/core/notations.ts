import { toExpressionError, type ExpressionError } from './errors';
import { ExpressionTree } from './ExpressionTree';
import { applyOperator, evaluatePostorder } from './evaluator';
import { formatInfo } from './format';
import type { TreeNode } from './Node';
import { Stack } from './Stack';

/** Valor de una notación: un número o el error que impidió calcularlo. */
export type NotationValue = { readonly value: number } | { readonly error: ExpressionError };

export interface NotationValues {
  /** Preorden leído como notación prefija. */
  readonly prefija: NotationValue;
  /** Inorden con la agrupación del árbol (equivale al posorden). */
  readonly infija: NotationValue;
  /** Inorden leído tal cual, sin paréntesis: aplica la precedencia normal. */
  readonly infijaSinParentesis: NotationValue;
  /** Posorden evaluado con la pila (el algoritmo principal). */
  readonly posfija: NotationValue;
}

function attempt(fn: () => number): NotationValue {
  try {
    return { value: fn() };
  } catch (cause) {
    return { error: toExpressionError(cause) };
  }
}

/**
 * Evalúa la notación PREFIJA (preorden) con una pila.
 * Se recorre de DERECHA a IZQUIERDA:
 *   - Operando → PUSH(valor)
 *   - Operador → izquierdo = POP(); derecho = POP(); PUSH(izquierdo op derecho)
 * Es el espejo del posorden: aquí el PRIMER POP es el operando IZQUIERDO.
 */
export function evaluatePrefix(preorden: readonly TreeNode[]): number {
  const pila = new Stack<number>();
  for (let i = preorden.length - 1; i >= 0; i--) {
    const nodo = preorden[i]!;
    if (typeof nodo.info === 'number') {
      pila.push(nodo.info);
    } else {
      const izquierdo = pila.pop();
      const derecho = pila.pop();
      pila.push(applyOperator(izquierdo, nodo.info, derecho));
    }
  }
  return pila.pop();
}

/**
 * Lee el inorden como texto plano (sin paréntesis) y lo vuelve a analizar.
 * Sirve para demostrar que el inorden pierde la agrupación del árbol.
 */
export function evaluateInfixWithoutParentheses(inorden: readonly TreeNode[]): number {
  const texto = inorden.map((n) => formatInfo(n.info)).join(' ');
  const trace = evaluatePostorder(ExpressionTree.fromExpression(texto));
  if (trace.error) throw trace.error;
  return trace.result ?? Number.NaN;
}

/** Calcula el valor que produce cada uno de los tres recorridos. */
export function evaluateNotations(tree: ExpressionTree): NotationValues {
  const posfija = attempt(() => {
    const trace = evaluatePostorder(tree);
    if (trace.error) throw trace.error;
    return trace.result ?? Number.NaN;
  });
  return {
    prefija: attempt(() => evaluatePrefix(tree.preorden())),
    infija: posfija,
    infijaSinParentesis: attempt(() => evaluateInfixWithoutParentheses(tree.inorden())),
    posfija,
  };
}
