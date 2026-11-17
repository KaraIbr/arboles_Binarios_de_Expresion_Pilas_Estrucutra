/**
 * Errores de dominio del núcleo lógico.
 *
 * Toda falla (léxica, sintáctica o matemática) se representa con una
 * `ExpressionError` tipada. La capa de UI nunca recibe excepciones genéricas:
 * las intercepta y las convierte en estado visual sin detener la aplicación.
 */
export type ExpressionErrorCode =
  | 'EMPTY_INPUT'
  | 'INVALID_CHARACTER'
  | 'INVALID_NUMBER'
  | 'UNBALANCED_PARENTHESES'
  | 'EMPTY_PARENTHESES'
  | 'MISSING_OPERAND'
  | 'UNEXPECTED_TOKEN'
  | 'DIVISION_BY_ZERO'
  | 'STACK_UNDERFLOW'
  | 'MALFORMED_TREE';

export class ExpressionError extends Error {
  readonly code: ExpressionErrorCode;
  /** Posición (base 0) del carácter que originó el error, si aplica. */
  readonly position: number | null;

  constructor(code: ExpressionErrorCode, message: string, position: number | null = null) {
    super(message);
    this.name = 'ExpressionError';
    this.code = code;
    this.position = position;
    Object.setPrototypeOf(this, ExpressionError.prototype);
  }
}

export function isExpressionError(value: unknown): value is ExpressionError {
  return value instanceof ExpressionError;
}

/** Normaliza cualquier valor lanzado a una `ExpressionError`. */
export function toExpressionError(value: unknown): ExpressionError {
  if (isExpressionError(value)) return value;
  const message = value instanceof Error ? value.message : String(value);
  return new ExpressionError('MALFORMED_TREE', `Error interno: ${message}`);
}

/** Etiquetas legibles para cada código de error. */
export const ERROR_LABELS: Record<ExpressionErrorCode, string> = {
  EMPTY_INPUT: 'Expresión vacía',
  INVALID_CHARACTER: 'Carácter no válido',
  INVALID_NUMBER: 'Número mal formado',
  UNBALANCED_PARENTHESES: 'Paréntesis no balanceados',
  EMPTY_PARENTHESES: 'Paréntesis vacíos',
  MISSING_OPERAND: 'Falta un operando',
  UNEXPECTED_TOKEN: 'Símbolo inesperado',
  DIVISION_BY_ZERO: 'División entre cero',
  STACK_UNDERFLOW: 'Desbordamiento inferior de pila',
  MALFORMED_TREE: 'Árbol mal formado',
};
