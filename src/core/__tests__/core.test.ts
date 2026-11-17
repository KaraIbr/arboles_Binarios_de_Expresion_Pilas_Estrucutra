import { describe, expect, it } from 'vitest';
import {
  ExpressionError,
  ExpressionTree,
  Lexer,
  Stack,
  evaluateNotations,
  evaluatePostorder,
  formatInfo,
  type TreeNode,
} from '../index';

const seq = (nodes: TreeNode[]) => nodes.map((n) => formatInfo(n.info)).join(' ');

function evaluate(expr: string) {
  return evaluatePostorder(ExpressionTree.fromExpression(expr));
}

function expectError(fn: () => unknown, code: string) {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ExpressionError);
    expect((e as ExpressionError).code).toBe(code);
    return;
  }
  throw new Error(`Se esperaba el error ${code}`);
}

describe('Stack (LIFO)', () => {
  it('push / pop / peek / isEmpty respetan LIFO', () => {
    const s = new Stack<number>();
    expect(s.isEmpty()).toBe(true);
    expect(s.peek()).toBeNull();
    s.push(1);
    s.push(2);
    s.push(3);
    expect(s.top()).toBe(3);
    expect(s.toArray()).toEqual([1, 2, 3]);
    expect(s.pop()).toBe(3);
    expect(s.pop()).toBe(2);
    expect(s.size).toBe(1);
    expect(s.pop()).toBe(1);
    expect(s.isEmpty()).toBe(true);
  });

  it('pop sobre pila vacía lanza STACK_UNDERFLOW', () => {
    expectError(() => new Stack<number>().pop(), 'STACK_UNDERFLOW');
  });
});

describe('Lexer', () => {
  it('reconoce números de varios dígitos y decimales', () => {
    const tokens = new Lexer(' 124 + 3.75*.5 ').tokenize();
    expect(tokens.map((t) => t.lexeme)).toEqual(['124', '+', '3.75', '*', '.5']);
  });

  it('rechaza caracteres fuera del alfabeto', () => {
    expectError(() => new Lexer('5 + a').tokenize(), 'INVALID_CHARACTER');
    expectError(() => new Lexer('2^3').tokenize(), 'INVALID_CHARACTER');
  });

  it('rechaza números mal formados y entrada vacía', () => {
    expectError(() => new Lexer('1.2.3').tokenize(), 'INVALID_NUMBER');
    expectError(() => new Lexer('   ').tokenize(), 'EMPTY_INPUT');
  });
});

describe('Casos de prueba críticos de la rúbrica', () => {
  it('1) 5+3 = 8', () => {
    const tree = ExpressionTree.fromExpression('5+3');
    expect(seq(tree.preorden())).toBe('+ 5 3');
    expect(seq(tree.inorden())).toBe('5 + 3');
    expect(seq(tree.posorden())).toBe('5 3 +');
    expect(evaluatePostorder(tree).result).toBe(8);
  });

  it('2) (5+3)*2 = 16', () => {
    const tree = ExpressionTree.fromExpression('(5+3)*2');
    expect(seq(tree.preorden())).toBe('* + 5 3 2');
    expect(seq(tree.posorden())).toBe('5 3 + 2 *');
    const trace = evaluatePostorder(tree);
    expect(trace.result).toBe(16);
    const mult = trace.steps.find((s) => s.operator === '*');
    expect(mult?.log).toBe('POP(2), POP(8) → 8 * 2 = 16 → PUSH(16)');
  });

  it('3) 7+3*2 = 13 (precedencia)', () => {
    const tree = ExpressionTree.fromExpression('7+3*2');
    expect(seq(tree.preorden())).toBe('+ 7 * 3 2');
    expect(seq(tree.posorden())).toBe('7 3 2 * +');
    expect(evaluatePostorder(tree).result).toBe(13);
  });

  it('4) ((8+2)*3)-(12/4) = 27 (árbol profundo)', () => {
    const tree = ExpressionTree.fromExpression('((8+2)*3)-(12/4)');
    expect(seq(tree.preorden())).toBe('- * + 8 2 3 / 12 4');
    expect(seq(tree.inorden())).toBe('8 + 2 * 3 - 12 / 4');
    expect(seq(tree.posorden())).toBe('8 2 + 3 * 12 4 / -');
    expect(tree.altura()).toBe(4);
    expect(evaluatePostorder(tree).result).toBe(27);
  });

  it('5) (18-6)/(2+1) = 4 (orden riguroso de POPs)', () => {
    const trace = evaluate('(18-6)/(2+1)');
    expect(trace.result).toBe(4);
    const resta = trace.steps.find((s) => s.operator === '-');
    expect(resta).toMatchObject({ derecho: 6, izquierdo: 18, result: 12 });
    const div = trace.steps.find((s) => s.operator === '/');
    expect(div).toMatchObject({ derecho: 3, izquierdo: 12, result: 4 });
    expect(div?.log).toBe('POP(3), POP(12) → 12 / 3 = 4 → PUSH(4)');
  });

  it('6) 9/(3-3) → división entre cero controlada', () => {
    const trace = evaluate('9/(3-3)');
    expect(trace.result).toBeNull();
    expect(trace.error?.code).toBe('DIVISION_BY_ZERO');
    const last = trace.steps[trace.steps.length - 1];
    expect(last?.kind).toBe('ERROR');
    expect(last).toMatchObject({ izquierdo: 9, derecho: 0 });
  });

  it('7) (5+3 → paréntesis no balanceados', () => {
    expectError(() => ExpressionTree.fromExpression('(5+3'), 'UNBALANCED_PARENTHESES');
    expectError(() => ExpressionTree.fromExpression('5+3)'), 'UNBALANCED_PARENTHESES');
  });
});

describe('Números negativos (signo unario)', () => {
  it('evalúa negativos al inicio, tras un operador y tras un paréntesis', () => {
    expect(evaluate('-5+3').result).toBe(-2);
    expect(evaluate('8-(-2)').result).toBe(10);
    expect(evaluate('8--2').result).toBe(10);
    expect(evaluate('2*-3').result).toBe(-6);
    expect(evaluate('-3-2').result).toBe(-5);
    expect(evaluate('(-4)/(-2)').result).toBe(2);
    expect(evaluate('--3').result).toBe(3);
    expect(evaluate('+5').result).toBe(5);
    expect(evaluate('-2.5*2').result).toBe(-5);
  });

  it('un número negativo es una hoja (el árbol sigue siendo binario)', () => {
    const tree = ExpressionTree.fromExpression('8-(-2)');
    expect(seq(tree.posorden())).toBe('8 -2 -');
    expect(tree.size()).toBe(3);
    expect(tree.inordenParentizado()).toBe('(8 - (-2))');
  });

  it('−(subexpresión) se representa como (−1) × subexpresión', () => {
    const tree = ExpressionTree.fromExpression('-(4+2)*3');
    expect(seq(tree.posorden())).toBe('-1 4 2 + * 3 *');
    expect(tree.root.izq?.synthetic).toBe(true);
    expect(tree.root.izq?.izq?.synthetic).toBe(true);
    expect(evaluatePostorder(tree).result).toBe(-18);
  });

  it('el signo respeta la regla de los POP (derecho primero)', () => {
    const trace = evaluate('-6/3');
    const div = trace.steps.find((s) => s.operator === '/');
    expect(div).toMatchObject({ derecho: 3, izquierdo: -6, result: -2 });
  });

  it('signos sin operando o mal ubicados siguen siendo errores', () => {
    expectError(() => ExpressionTree.fromExpression('-'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('5*'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('5*/2'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('-()'), 'EMPTY_PARENTHESES');
  });

  it('dividir entre cero negativo también se intercepta', () => {
    expect(evaluate('9/-0').error?.code).toBe('DIVISION_BY_ZERO');
  });
});

describe('Validaciones adicionales', () => {
  it('asociatividad izquierda en resta y división', () => {
    expect(evaluate('8-2-1').result).toBe(5);
    expect(evaluate('16/4/2').result).toBe(2);
  });

  it('decimales sin ruido de punto flotante en el registro', () => {
    const trace = evaluate('0.1+0.2');
    expect(trace.steps.at(-1)?.log).toContain('0.3');
  });

  it('el Modo Tutor narra el orden de los POP (derecho primero)', () => {
    const trace = evaluate('5+3');
    const suma = trace.steps.find((s) => s.operator === '+');
    expect(suma?.narration).toContain('Visitando operador (+). POP Derecho (3), POP Izquierdo (5).');
    expect(suma?.narration).toContain('PUSH(8)');
  });

  it('detecta operandos faltantes, paréntesis vacíos y operadores contiguos', () => {
    expectError(() => ExpressionTree.fromExpression('5+'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('*5'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('5+*3'), 'MISSING_OPERAND');
    expectError(() => ExpressionTree.fromExpression('()'), 'EMPTY_PARENTHESES');
    expectError(() => ExpressionTree.fromExpression('5 3'), 'UNEXPECTED_TOKEN');
    expectError(() => ExpressionTree.fromExpression('(5)(3)'), 'UNEXPECTED_TOKEN');
  });

  it('el último paso usa TOP para leer el resultado', () => {
    const trace = evaluate('(5+3)*2');
    const last = trace.steps.at(-1);
    expect(last?.kind).toBe('RESULT');
    expect(last?.stackAfter.map((e) => e.value)).toEqual([16]);
  });

  it('cada recorrido produce su valor: prefija = posfija; el inorden sin paréntesis puede cambiar', () => {
    const v = evaluateNotations(ExpressionTree.fromExpression('(18-6)/(2+1)'));
    expect(v.prefija).toEqual({ value: 4 });
    expect(v.posfija).toEqual({ value: 4 });
    expect(v.infija).toEqual({ value: 4 });
    expect(v.infijaSinParentesis).toEqual({ value: 16 });
    const n = evaluateNotations(ExpressionTree.fromExpression('-(4+2)*3'));
    expect(n.prefija).toEqual({ value: -18 });
    expect(n.infijaSinParentesis).toEqual({ value: 2 });
    const z = evaluateNotations(ExpressionTree.fromExpression('9/(3-3)'));
    expect('error' in z.prefija && z.prefija.error.code).toBe('DIVISION_BY_ZERO');
  });
});
