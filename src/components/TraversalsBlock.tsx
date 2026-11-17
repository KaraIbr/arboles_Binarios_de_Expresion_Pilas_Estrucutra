import {
  ERROR_LABELS,
  formatNumber,
  formatInfo,
  type NotationValue,
  type TreeNode,
} from "../core";
import type { Traversals } from "../hooks/useExpressionEvaluator";
import { Section } from "./Section";

interface TraversalsBlockProps {
  traversals: Traversals | null;
  activeNodeId: string | null;
  visitedIds: ReadonlySet<string>;
  /** Al terminar la evaluación se muestra, en tono tenue, el valor de cada recorrido. */
  showValues: boolean;
}

const ROWS: {
  key: "preorden" | "inorden" | "posorden";
  title: string;
  notation: string;
  rule: string;
}[] = [
  {
    key: "preorden",
    title: "Preorden",
    notation: "Prefija",
    rule: "Raíz · Izq · Der",
  },
  {
    key: "inorden",
    title: "Inorden",
    notation: "Infija",
    rule: "Izq · Raíz · Der",
  },
  {
    key: "posorden",
    title: "Posorden",
    notation: "Posfija · entrada de la pila",
    rule: "Izq · Der · Raíz",
  },
];

export function TraversalsBlock({
  traversals,
  activeNodeId,
  visitedIds,
  showValues,
}: TraversalsBlockProps) {
  return (
    <Section label="A" title="Recorridos recursivos">
      {traversals ? (
        <dl className="space-y-2.5">
          {ROWS.map(({ key, title, notation, rule }) => (
            <div key={key}>
              <dt className="mb-1 flex items-baseline justify-between">
                <span className="font-comfortaa text-[12px] font-semibold text-graphite">
                  {title}{" "}
                  <span className="font-rubik text-[11px] font-normal text-mute">
                    ({notation})
                  </span>
                </span>
                <span className="font-rubik text-[11px] text-mute">{rule}</span>
              </dt>
              <dd className="flex flex-wrap gap-1">
                {traversals[key].map((node) => (
                  <Token
                    key={node.id}
                    node={node}
                    tracked={key === "posorden"}
                    active={key === "posorden" && node.id === activeNodeId}
                    visited={visitedIds.has(node.id)}
                  />
                ))}
              </dd>
              {showValues && <ValueLine row={key} traversals={traversals} />}
            </div>
          ))}
          <div className="pt-1">
            <dt className="mb-1 font-rubik text-[11px] text-mute">
              Agrupación implícita del árbol
            </dt>
            <dd className="tabular font-rubik text-[13px] break-all text-graphite-soft">
              {traversals.parentizado}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-[13px] text-mute">
          Los recorridos aparecerán al generar el árbol.
        </p>
      )}
    </Section>
  );
}

function Token({
  node,
  tracked,
  active,
  visited,
}: {
  node: TreeNode;
  tracked: boolean;
  active: boolean;
  visited: boolean;
}) {
  const isOp = node.isOperator();
  let tone = isOp
    ? "border-operator/50 text-operator"
    : "border-hairline-strong text-graphite";
  if (tracked && visited)
    tone = "border-graphite/60 bg-bone-deep text-graphite";
  if (active) tone = "border-brand bg-brand text-bone";
  return (
    <span
      className={`tabular inline-grid min-w-7 place-items-center rounded border px-1.5 py-0.5 font-rubik text-[13px] transition-colors duration-300 ${tone}`}
    >
      {formatInfo(node.info, true)}
    </span>
  );
}

function show(v: NotationValue): string {
  return "value" in v
    ? formatNumber(v.value).replace("-", "−")
    : `indefinido (${ERROR_LABELS[v.error.code].toLowerCase()})`;
}

const NOTES: Record<"preorden" | "inorden" | "posorden", string> = {
  preorden: "leída de derecha a izquierda con una pila",
  inorden: "con la agrupación del árbol",
  posorden: "evaluada con la pila",
};

function ValueLine({
  row,
  traversals,
}: {
  row: "preorden" | "inorden" | "posorden";
  traversals: Traversals;
}) {
  const { valores } = traversals;
  const v =
    row === "preorden"
      ? valores.prefija
      : row === "inorden"
        ? valores.infija
        : valores.posfija;
  const sin = valores.infijaSinParentesis;
  const difiere =
    row === "inorden" &&
    "value" in sin &&
    "value" in valores.infija &&
    sin.value !== valores.infija.value;
  return (
    <p className="tabular mt-1 font-rubik text-[12px] text-mute">
      = <span className="font-medium text-graphite-soft">{show(v)}</span> ·{" "}
      {NOTES[row]}
      {difiere && (
        <span className="block italic">
          leído sin paréntesis daría {show(sin)}: el inorden pierde la
          agrupación
        </span>
      )}
    </p>
  );
}
