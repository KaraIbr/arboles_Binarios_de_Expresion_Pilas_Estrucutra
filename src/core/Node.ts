import type { INode } from './contracts';
import type { Operator } from './Token';

/** Contenido de un nodo: un operando numérico o un operador. */
export type NodeInfo = number | Operator;

/**
 * Nodo del Árbol Binario de Expresión.
 *
 *  - `info`: dato almacenado (número en las hojas, operador en nodos internos).
 *  - `izq`:  subárbol izquierdo (operando izquierdo).
 *  - `der`:  subárbol derecho (operando derecho).
 */
export class TreeNode implements INode<NodeInfo> {
  /** Identificador estable, útil para enlazar el nodo con su representación visual. */
  readonly id: string;
  readonly info: NodeInfo;
  readonly izq: TreeNode | null;
  readonly der: TreeNode | null;
  /**
   * `true` cuando el nodo no se escribió en la entrada: lo agrega el parser
   * al traducir un signo negativo, p. ej. −(4+2) se representa como (−1) × (4+2).
   */
  readonly synthetic: boolean;

  constructor(
    id: string,
    info: NodeInfo,
    izq: TreeNode | null = null,
    der: TreeNode | null = null,
    synthetic = false,
  ) {
    this.id = id;
    this.info = info;
    this.izq = izq;
    this.der = der;
    this.synthetic = synthetic;
  }

  isOperator(): boolean {
    return typeof this.info === 'string';
  }

  isLeaf(): boolean {
    return this.izq === null && this.der === null;
  }
}
