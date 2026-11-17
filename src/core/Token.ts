/** Operadores aritméticos admitidos por el sistema. */
export type Operator = '+' | '-' | '*' | '/';

export const OPERATORS: readonly Operator[] = ['+', '-', '*', '/'];

export function isOperatorSymbol(symbol: string): symbol is Operator {
  return (OPERATORS as readonly string[]).includes(symbol);
}

export type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

/** Unidad léxica producida por el `Lexer`. */
export interface Token {
  readonly type: TokenType;
  /** Texto original del token (ej. "12.5", "+", "("). */
  readonly lexeme: string;
  /** Posición (base 0) del primer carácter en la cadena de entrada. */
  readonly position: number;
}
