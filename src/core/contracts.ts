/**
 * Contratos (interfaces) de las estructuras de datos del núcleo.
 * Las implementaciones concretas son `TreeNode` (Node.ts) y `Stack<T>` (Stack.ts).
 */

/** Nodo de un árbol binario: un dato y dos referencias a subárboles. */
export interface INode<T> {
  readonly info: T;
  readonly izq: INode<T> | null;
  readonly der: INode<T> | null;
}

/** Pila LIFO: solo se accede al elemento del tope. */
export interface IStack<T> {
  push(value: T): void;
  pop(): T;
  peek(): T | null;
  isEmpty(): boolean;
}
