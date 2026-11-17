import type { TreeNode } from '../core';

/**
 * Cálculo de coordenadas para dibujar el árbol (solo presentación).
 * x = posición del nodo en el recorrido inorden  → nunca se solapan
 * y = profundidad del nodo
 */
export interface LayoutNode {
  readonly node: TreeNode;
  readonly x: number;
  readonly y: number;
  readonly depth: number;
}

export interface LayoutEdge {
  readonly id: string;
  readonly parentId: string;
  readonly childId: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface TreeLayout {
  readonly nodes: LayoutNode[];
  readonly edges: LayoutEdge[];
  readonly width: number;
  readonly height: number;
}

interface LayoutOptions {
  hGap: number;
  vGap: number;
  padding: number;
}

const DEFAULTS: LayoutOptions = { hGap: 58, vGap: 86, padding: 44 };

export function layoutTree(root: TreeNode, options: Partial<LayoutOptions> = {}): TreeLayout {
  const { hGap, vGap, padding } = { ...DEFAULTS, ...options };
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  let column = 0;
  let maxDepth = 0;

  const place = (node: TreeNode, depth: number): LayoutNode => {
    const left = node.izq ? place(node.izq, depth + 1) : null;
    const placed: LayoutNode = { node, depth, x: padding + column++ * hGap, y: padding + depth * vGap };
    const right = node.der ? place(node.der, depth + 1) : null;
    maxDepth = Math.max(maxDepth, depth);
    nodes.push(placed);
    for (const child of [left, right]) {
      if (!child) continue;
      edges.push({
        id: `${node.id}-${child.node.id}`,
        parentId: node.id,
        childId: child.node.id,
        x1: placed.x,
        y1: placed.y,
        x2: child.x,
        y2: child.y,
      });
    }
    return placed;
  };

  place(root, 0);

  return {
    nodes,
    edges,
    width: padding * 2 + Math.max(0, column - 1) * hGap,
    height: padding * 2 + maxDepth * vGap + 18,
  };
}
