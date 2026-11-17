import type { TreeNode } from './Node';

/**
 * Recorridos recursivos clásicos de un árbol binario.
 * Cada función visita el nodo en un momento distinto respecto a sus hijos.
 */

/** PREORDEN: Raíz → Izquierdo → Derecho. Produce la notación prefija. */
export function preorden(nodo: TreeNode | null, visita: TreeNode[] = []): TreeNode[] {
  if (nodo === null) return visita;
  visita.push(nodo);
  preorden(nodo.izq, visita);
  preorden(nodo.der, visita);
  return visita;
}

/** INORDEN: Izquierdo → Raíz → Derecho. Produce la notación infija. */
export function inorden(nodo: TreeNode | null, visita: TreeNode[] = []): TreeNode[] {
  if (nodo === null) return visita;
  inorden(nodo.izq, visita);
  visita.push(nodo);
  inorden(nodo.der, visita);
  return visita;
}

/** POSORDEN: Izquierdo → Derecho → Raíz. Produce la notación posfija (RPN). */
export function posorden(nodo: TreeNode | null, visita: TreeNode[] = []): TreeNode[] {
  if (nodo === null) return visita;
  posorden(nodo.izq, visita);
  posorden(nodo.der, visita);
  visita.push(nodo);
  return visita;
}

/** Inorden totalmente parentizado: hace explícita la agrupación del árbol. */
export function inordenParentizado(nodo: TreeNode | null, format: (n: TreeNode) => string): string {
  if (nodo === null) return '';
  if (nodo.isLeaf()) {
    const texto = format(nodo);
    return typeof nodo.info === 'number' && nodo.info < 0 ? `(${texto})` : texto;
  }
  return `(${inordenParentizado(nodo.izq, format)} ${format(nodo)} ${inordenParentizado(nodo.der, format)})`;
}

/** Altura del árbol (número de niveles). */
export function altura(nodo: TreeNode | null): number {
  if (nodo === null) return 0;
  return 1 + Math.max(altura(nodo.izq), altura(nodo.der));
}
