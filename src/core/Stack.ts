import type { IStack } from './contracts';
import { ExpressionError } from './errors';

/** Nodo interno de la lista enlazada que respalda a la pila. */
interface StackCell<T> {
  readonly value: T;
  readonly next: StackCell<T> | null;
}

/**
 * Pila (Stack) LIFO implementada como lista simplemente enlazada.
 *
 * Solo se puede acceder al elemento del TOPE:
 *   - push(x): inserta x en el tope            O(1)
 *   - pop():   extrae y devuelve el tope        O(1)
 *   - peek() / top(): consulta el tope sin extraerlo  O(1)
 *   - isEmpty(): indica si no hay elementos     O(1)
 */
export class Stack<T> implements IStack<T> {
  private topCell: StackCell<T> | null = null;
  private count = 0;

  push(value: T): void {
    this.topCell = { value, next: this.topCell };
    this.count++;
  }

  pop(): T {
    const cell = this.topCell;
    if (cell === null) {
      throw new ExpressionError(
        'STACK_UNDERFLOW',
        'Se intentó hacer POP sobre una pila vacía: faltan operandos en la expresión.',
      );
    }
    this.topCell = cell.next;
    this.count--;
    return cell.value;
  }

  /** Devuelve el elemento del tope sin extraerlo (o `null` si la pila está vacía). */
  peek(): T | null {
    return this.topCell === null ? null : this.topCell.value;
  }

  /** Alias de `peek()` con la nomenclatura clásica TOP. */
  top(): T | null {
    return this.peek();
  }

  isEmpty(): boolean {
    return this.topCell === null;
  }

  get size(): number {
    return this.count;
  }

  /** Instantánea inmutable del contenido, ordenada de la BASE al TOPE. */
  toArray(): T[] {
    const fromTop: T[] = [];
    for (let cell = this.topCell; cell !== null; cell = cell.next) {
      fromTop.push(cell.value);
    }
    return fromTop.reverse();
  }
}
