import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { formatInfo, formatNumber, type ExpressionTree } from '../core';
import { layoutTree } from '../lib/treeLayout';
import { PanZoom } from './PanZoom';

interface TreeCanvasProps {
  tree: ExpressionTree | null;
  activeNodeId: string | null;
  errorNodeId: string | null;
  visitedIds: ReadonlySet<string>;
  partials: ReadonlyMap<string, number>;
  /** Clave del destello verde: cambia en cada PUSH (null si el paso no apila). */
  pushPulse: { nodeId: string; key: string } | null;
}

const R = 21;

export function TreeCanvas({ tree, activeNodeId, errorNodeId, visitedIds, partials, pushPulse }: TreeCanvasProps) {
  const layout = useMemo(() => (tree ? layoutTree(tree.root) : null), [tree]);

  if (!tree || !layout) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="font-comfortaa text-base font-semibold text-graphite-soft">Sin árbol que mostrar</p>
        <p className="max-w-sm text-[13px] text-mute">
          Escribe una expresión válida y pulsa <span className="font-medium text-graphite">Generar Árbol</span> para
          construir el Árbol Binario de Expresión.
        </p>
      </div>
    );
  }

  return (
    <PanZoom contentWidth={layout.width} contentHeight={layout.height} resetKey={tree.source}>
      <svg
        key={tree.source}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width={layout.width}
        height={layout.height}
        className="overflow-visible"
        role="img"
        aria-label={`Árbol binario de la expresión ${tree.source}`}
      >
        {layout.edges.map((edge, i) => {
          const done = visitedIds.has(edge.childId);
          return (
            <motion.line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.05 * i }}
              strokeWidth={1}
              className={`transition-[stroke] duration-500 ${done ? 'stroke-graphite' : 'stroke-graphite/30'}`}
            />
          );
        })}

        {layout.nodes.map(({ node, x, y, depth }) => {
          const isOp = node.isOperator();
          const isActive = node.id === activeNodeId;
          const isError = node.id === errorNodeId;
          const isVisited = visitedIds.has(node.id);
          const partial = partials.get(node.id);

          let circle = isOp ? 'fill-operator-tint stroke-operator' : 'fill-bone stroke-graphite';
          let text = isOp ? 'fill-operator' : 'fill-graphite';
          if (isVisited && !isActive) {
            circle = isOp ? 'fill-operator-tint stroke-operator' : 'fill-bone-deep stroke-graphite/50';
            text = isOp ? 'fill-operator' : 'fill-graphite/60';
          }
          if (isActive) {
            circle = 'fill-brand stroke-brand';
            text = 'fill-bone';
          }
          if (isError) {
            circle = 'fill-terracotta-tint stroke-terracotta';
            text = 'fill-terracotta';
          }

          return (
            <g key={node.id} transform={`translate(${x} ${y})`}>
              {/* Destello Brand Green sincronizado con el PUSH en la pila */}
              <AnimatePresence>
                {pushPulse?.nodeId === node.id && (
                  <motion.circle
                    key={pushPulse.key}
                    r={R}
                    className="fill-brand/25 stroke-brand"
                    strokeWidth={1}
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>

              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.08 * depth }}
              >
                {isActive && (
                  <motion.circle
                    r={R + 6}
                    className="fill-none stroke-brand"
                    strokeWidth={1}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}
                <circle
                  r={R}
                  strokeWidth={1}
                  strokeDasharray={node.synthetic ? '3 3' : undefined}
                  className={`transition-colors duration-300 ${circle}`}
                >
                  {node.synthetic && <title>Nodo implícito: lo agrega el signo negativo, −(x) = (−1) × x</title>}
                </circle>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`tabular font-rubik transition-colors duration-300 ${text} ${isOp ? 'text-[18px] font-medium' : 'text-[14px]'}`}
                >
                  {formatInfo(node.info, true)}
                </text>
              </motion.g>

              <AnimatePresence>
                {isOp && partial !== undefined && (
                  <motion.g
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <text
                      y={R + 15}
                      textAnchor="middle"
                      className="tabular fill-graphite-soft font-rubik text-[11px] font-medium"
                    >
                      = {formatNumber(partial)}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}
      </svg>
    </PanZoom>
  );
}
