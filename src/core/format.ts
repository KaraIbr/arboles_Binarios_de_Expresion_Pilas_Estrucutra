import type { NodeInfo } from './Node';

/**
 * Representa un número para lectura humana, eliminando el ruido de punto
 * flotante (ej. 0.30000000000000004 → 0.3).
 */
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number.parseFloat(value.toPrecision(12)));
}

const OPERATOR_GLYPHS: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

/** Texto de un nodo; con `pretty` usa los glifos tipográficos (× ÷ −). */
export function formatInfo(info: NodeInfo, pretty = false): string {
  if (typeof info === 'number') {
    const text = formatNumber(info);
    return pretty ? text.replace('-', '−') : text;
  }
  return pretty ? (OPERATOR_GLYPHS[info] ?? info) : info;
}
