import { Header } from "./components/Header";
import { HistoryBlock } from "./components/HistoryBlock";
import { PlaybackControls } from "./components/PlaybackControls";
import { ResultBlock } from "./components/ResultBlock";
import { StackVisualizer } from "./components/StackVisualizer";
import { TraversalsBlock } from "./components/TraversalsBlock";
import { TreeCanvas } from "./components/TreeCanvas";
import { TutorPanel } from "./components/TutorPanel";
import { useExpressionEvaluator } from "./hooks/useExpressionEvaluator";

export default function App() {
  const { state, view, dispatch } = useExpressionEvaluator();
  const { currentStep } = view;
  const activeNodeId =
    currentStep && currentStep.kind !== "ERROR" ? currentStep.nodeId : null;
  const errorNodeId = currentStep?.kind === "ERROR" ? currentStep.nodeId : null;
  // Un paso "apila" si es un operando o el resultado de un operador: ambos hacen PUSH.
  const isPushStep =
    currentStep?.kind === "PUSH_OPERAND" ||
    currentStep?.kind === "APPLY_OPERATOR";
  const pushPulse =
    isPushStep && currentStep
      ? { nodeId: currentStep.nodeId, key: `push-${currentStep.index}` }
      : null;

  return (
    <div className="flex min-h-full flex-col lg:h-full">
      <Header
        input={state.input}
        parseError={state.parseError}
        dispatch={dispatch}
      />

      <div className="grid flex-1 grid-cols-12 lg:min-h-0">
        {/* Lienzo principal — 6 columnas */}
        <main className="col-span-12 flex min-h-[420px] min-w-0 flex-col lg:col-span-6 lg:min-h-0">
          <div className="flex items-center justify-between px-6 pt-4 lg:px-10">
            <p className="font-comfortaa text-[12px] font-semibold text-mute">
              Árbol binario de expresión
              {state.tree && (
                <span className="tabular ml-2 font-rubik font-normal">
                  · {state.tree.size()} nodos · altura {state.tree.altura()}
                </span>
              )}
            </p>
            <Legend />
          </div>
          <div className="min-h-0 flex-1 px-6 pt-2 pb-4 lg:px-10">
            <TreeCanvas
              tree={state.tree}
              activeNodeId={activeNodeId}
              errorNodeId={errorNodeId}
              visitedIds={view.visitedIds}
              partials={view.partials}
              pushPulse={pushPulse}
            />
          </div>
        </main>

        {/* Panel de evaluación — 6 columnas: cuadrícula A | B, D abajo y el Modo Tutor al hacer scroll */}
        <aside className="scrollbar-thin col-span-12 flex min-w-0 flex-col border-t border-hairline lg:col-span-6 lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:min-h-full lg:auto-rows-min lg:content-start">
            <div className="min-w-0 border-b border-hairline sm:border-r">
              <TraversalsBlock
                traversals={state.traversals}
                activeNodeId={activeNodeId}
                visitedIds={view.visitedIds}
                showValues={view.finished}
              />
            </div>
            <div className="min-w-0 border-b border-hairline">
              <StackVisualizer
                stack={view.stack}
                step={currentStep}
                pushedKey={pushPulse?.nodeId ?? null}
              />
            </div>
            <div className="min-w-0 border-b border-hairline sm:col-span-2">
              <ResultBlock
                step={currentStep}
                history={view.history}
                finished={view.finished}
              />
            </div>
          </div>
          <TutorPanel
            history={view.history}
            current={currentStep}
            totalSteps={view.totalSteps}
            postorder={state.traversals?.posorden ?? null}
            ready={state.trace !== null}
            controls={
              <PlaybackControls
                enabled={state.trace !== null}
                isPlaying={state.isPlaying}
                stepIndex={state.stepIndex}
                totalSteps={view.totalSteps}
                speed={state.speed}
                dispatch={dispatch}
              />
            }
          />
          <HistoryBlock records={state.historyLog} dispatch={dispatch} />
        </aside>
      </div>

      <footer className="flex flex-wrap justify-between gap-2 border-t border-hairline px-6 py-2 font-rubik text-[11px] text-mute lg:px-10">
        <span>
          Proyecto Integrador · Parcial 02 · Estructuras de Datos y Compiladores
        </span>
        <span>
          Karina Patricia Ibarra Morales · Dra. Blanca Guadalupe Estrada
          Rentería
        </span>
      </footer>
    </div>
  );
}

function Legend() {
  const item = "flex items-center gap-1.5";
  return (
    <ul className="hidden items-center gap-4 font-rubik text-[11px] text-mute sm:flex">
      <li className={item}>
        <span className="size-2.5 rounded-full border border-operator bg-operator-tint" />{" "}
        Operador
      </li>
      <li className={item}>
        <span className="size-2.5 rounded-full border border-graphite bg-bone" />{" "}
        Operando
      </li>
      <li className={item}>
        <span className="size-2.5 rounded-full bg-brand" /> Nodo activo
      </li>
    </ul>
  );
}
