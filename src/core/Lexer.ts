import { ExpressionError } from './errors';
import { isOperatorSymbol, type Token } from './Token';

const NUMBER_PATTERN = /^(\d+(\.\d+)?|\.\d+)$/;

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isWhitespace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

/**
 * Analizador léxico (tokenizer).
 *
 * Recorre la cadena carácter por carácter y la convierte en una secuencia de
 * tokens: NÚMEROS (enteros de varios dígitos o decimales), OPERADORES y
 * PARÉNTESIS. Cualquier símbolo fuera del alfabeto se rechaza con su posición.
 */
export class Lexer {
  private readonly source: string;
  private position = 0;

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    this.position = 0;

    while (this.position < this.source.length) {
      const ch = this.source.charAt(this.position);

      if (isWhitespace(ch)) {
        this.position++;
      } else if (isDigit(ch) || ch === '.') {
        tokens.push(this.readNumber());
      } else if (isOperatorSymbol(ch)) {
        tokens.push({ type: 'OPERATOR', lexeme: ch, position: this.position++ });
      } else if (ch === '(') {
        tokens.push({ type: 'LPAREN', lexeme: ch, position: this.position++ });
      } else if (ch === ')') {
        tokens.push({ type: 'RPAREN', lexeme: ch, position: this.position++ });
      } else {
        throw new ExpressionError(
          'INVALID_CHARACTER',
          `El carácter '${ch}' (columna ${this.position + 1}) no pertenece al alfabeto: solo se admiten números, + - * / y paréntesis.`,
          this.position,
        );
      }
    }

    if (tokens.length === 0) {
      throw new ExpressionError('EMPTY_INPUT', 'Escribe una expresión aritmética para comenzar.');
    }
    return tokens;
  }

  /** Consume un literal numérico completo: dígitos y, opcionalmente, un punto decimal. */
  private readNumber(): Token {
    const start = this.position;
    while (this.position < this.source.length) {
      const ch = this.source.charAt(this.position);
      if (!isDigit(ch) && ch !== '.') break;
      this.position++;
    }
    const lexeme = this.source.slice(start, this.position);
    if (!NUMBER_PATTERN.test(lexeme)) {
      throw new ExpressionError(
        'INVALID_NUMBER',
        `El número '${lexeme}' (columna ${start + 1}) está mal formado.`,
        start,
      );
    }
    return { type: 'NUMBER', lexeme, position: start };
  }
}
