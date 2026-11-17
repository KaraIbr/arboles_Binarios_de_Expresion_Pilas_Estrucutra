import { ExpressionError } from './errors';
import { TreeNode } from './Node';
import type { Operator, Token, TokenType } from './Token';

/**
 * Analizador sintáctico descendente recursivo.
 *
 * Gramática (la precedencia queda codificada en los niveles):
 *
 *   expresion → termino  ( ('+' | '-') termino )*
 *   termino   → factor   ( ('*' | '/') factor  )*
 *   factor    → ('-' | '+') factor | NUMERO | '(' expresion ')'
 *
 * Signo (operador unario): un '-' o '+' que aparece donde se espera un
 * OPERANDO (al inicio, tras otro operador o tras '(') es un signo, no una resta.
 *   -3        → hoja con valor −3
 *   -(4+2)    → (−1) × (4+2)   (el −1 es un nodo implícito)
 * Así el árbol sigue siendo binario y la evaluación con pila no cambia.
 *
 * Cada producción devuelve el subárbol que reconoce, de modo que el resultado
 * final ES el Árbol Binario de Expresión (AST). Los operadores del mismo nivel
 * se asocian por la izquierda: 8-2-1 se agrupa como (8-2)-1.
 */
export class Parser {
  private readonly tokens: readonly Token[];
  private current = 0;
  private nextId = 0;

  constructor(tokens: readonly Token[]) {
    this.tokens = tokens;
  }

  parse(): TreeNode {
    this.current = 0;
    this.nextId = 0;
    this.assertBalancedParentheses();

    const root = this.expresion();

    const leftover = this.peek();
    if (leftover) {
      throw new ExpressionError(
        'UNEXPECTED_TOKEN',
        `Símbolo inesperado '${leftover.lexeme}' en la columna ${leftover.position + 1}: falta un operador entre operandos.`,
        leftover.position,
      );
    }
    return root;
  }

  // ── Reglas gramaticales ──────────────────────────────────────────────

  private expresion(): TreeNode {
    let izq = this.termino();
    while (this.matchOperator('+', '-')) {
      const operador = this.previous().lexeme as Operator;
      const der = this.termino();
      izq = this.createNode(operador, izq, der);
    }
    return izq;
  }

  private termino(): TreeNode {
    let izq = this.factor();
    while (this.matchOperator('*', '/')) {
      const operador = this.previous().lexeme as Operator;
      const der = this.factor();
      izq = this.createNode(operador, izq, der);
    }
    return izq;
  }

  private factor(): TreeNode {
    const token = this.peek();

    if (!token) {
      const last = this.tokens[this.tokens.length - 1];
      throw new ExpressionError(
        'MISSING_OPERAND',
        `La expresión termina en '${last?.lexeme ?? ''}': falta el operando derecho.`,
        last ? last.position : null,
      );
    }

    switch (token.type) {
      case 'NUMBER':
        this.advance();
        return this.createNode(Number(token.lexeme));

      case 'LPAREN': {
        this.advance();
        const inner = this.peek();
        if (inner?.type === 'RPAREN') {
          throw new ExpressionError(
            'EMPTY_PARENTHESES',
            `Paréntesis vacíos '()' en la columna ${token.position + 1}.`,
            token.position,
          );
        }
        const node = this.expresion();
        this.consume('RPAREN', `Se esperaba ')' para cerrar el paréntesis de la columna ${token.position + 1}.`);
        return node;
      }

      case 'OPERATOR':
        // Un '-' o '+' en posición de operando es un SIGNO (operador unario).
        if (token.lexeme === '-' || token.lexeme === '+') {
          this.advance();
          const operando = this.factor();
          return token.lexeme === '-' ? this.negate(operando) : operando;
        }
        throw new ExpressionError(
          'MISSING_OPERAND',
          `Falta un operando antes del operador '${token.lexeme}' (columna ${token.position + 1}).`,
          token.position,
        );

      case 'RPAREN':
        throw new ExpressionError(
          'MISSING_OPERAND',
          `Se esperaba un número antes de ')' en la columna ${token.position + 1}.`,
          token.position,
        );
    }
  }

  // ── Validación previa ────────────────────────────────────────────────

  /** Verifica el balance de paréntesis con una pila de posiciones de apertura. */
  private assertBalancedParentheses(): void {
    const aperturas: number[] = [];
    for (const token of this.tokens) {
      if (token.type === 'LPAREN') {
        aperturas.push(token.position);
      } else if (token.type === 'RPAREN') {
        if (aperturas.length === 0) {
          throw new ExpressionError(
            'UNBALANCED_PARENTHESES',
            `Paréntesis de cierre ')' en la columna ${token.position + 1} sin su '(' correspondiente.`,
            token.position,
          );
        }
        aperturas.pop();
      }
    }
    const pendiente = aperturas[aperturas.length - 1];
    if (pendiente !== undefined) {
      const faltan = aperturas.length;
      throw new ExpressionError(
        'UNBALANCED_PARENTHESES',
        `Falta${faltan > 1 ? 'n' : ''} ${faltan} paréntesis de cierre: '(' de la columna ${pendiente + 1} nunca se cierra.`,
        pendiente,
      );
    }
  }

  // ── Utilidades de navegación ─────────────────────────────────────────

  private createNode(
    info: number | Operator,
    izq: TreeNode | null = null,
    der: TreeNode | null = null,
    synthetic = false,
  ): TreeNode {
    return new TreeNode(`n${this.nextId++}`, info, izq, der, synthetic);
  }

  /** Aplica un signo negativo a un operando ya reconocido. */
  private negate(operando: TreeNode): TreeNode {
    if (typeof operando.info === 'number') {
      // Número (o número con signo previo): basta con invertir su valor en la hoja.
      return this.createNode(-operando.info, null, null, operando.synthetic);
    }
    // Subexpresión: −(x) se representa como (−1) × x para conservar el árbol binario.
    const menosUno = this.createNode(-1, null, null, true);
    return this.createNode('*', menosUno, operando, true);
  }

  private peek(): Token | undefined {
    return this.tokens[this.current];
  }

  private previous(): Token {
    const token = this.tokens[this.current - 1];
    if (!token) throw new ExpressionError('MALFORMED_TREE', 'Lectura fuera de rango en el parser.');
    return token;
  }

  private advance(): Token | undefined {
    const token = this.peek();
    if (token) this.current++;
    return token;
  }

  private matchOperator(...operators: Operator[]): boolean {
    const token = this.peek();
    if (token?.type === 'OPERATOR' && (operators as string[]).includes(token.lexeme)) {
      this.current++;
      return true;
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    const token = this.peek();
    if (token?.type === type) {
      this.current++;
      return token;
    }
    throw new ExpressionError('UNEXPECTED_TOKEN', message, token?.position ?? null);
  }
}
