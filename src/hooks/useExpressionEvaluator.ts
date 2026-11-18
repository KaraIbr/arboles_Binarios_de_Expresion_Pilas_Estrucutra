import { useEffect, useMemo, useReducer } from 'react';
import {
  ExpressionTree,
  createHistoryRecord,
  evaluateNotations,
  evaluatePostorder,
  toExpressionError,
  type EvaluationStep,
  type EvaluationTrace,
  type ExpressionErrorCode,
  type HistoryRecord,
  type NotationValues,
  type StackEntry,
  type TreeNode,
} from '../core';

export type Speed = 'lenta' | 'normal' | 'rapida';

export const SPEED_MS: Record<Speed, number> = { lenta: 1700, normal: 1000, rapida: 450 };

const STORAGE_KEY = 'gu_estructuras_historial_v1';

function loadStoredHistory(): HistoryRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export interface UiError {
  readonly code: ExpressionErrorCode;
  readonly message: string;
  readonly position: number | null;
}

export interface Traversals {
  readonly preorden: TreeNode[];
  readonly inorden: TreeNode[];
  readonly posorden: TreeNode[];
  readonly parentizado: string;
  /** Valor que produce cada recorrido leído como notación. */
  readonly valores: NotationValues;
}

export interface EvaluatorState {
  readonly input: string;
  readonly tree: ExpressionTree | null;
  readonly traversals: Traversals | null;
  readonly trace: EvaluationTrace | null;
  /** -1 = evaluación preparada, ningún paso ejecutado. */
  readonly stepIndex: number;
  readonly isPlaying: boolean;
  readonly speed: Speed;
  readonly parseError: UiError | null;
  /** Historial acumulado de evaluaciones (entradas y salidas). */
  readonly historyLog: readonly HistoryRecord[];
}

export type EvaluatorAction =
  | { type: 'SET_INPUT'; input: string }
  | { type: 'BUILD' }
  | { type: 'EVALUATE' }
  | { type: 'LOAD_EXAMPLE'; input: string }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'GO_TO_END' }
  | { type: 'RESTART' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_SPEED'; speed: Speed }
  | { type: 'CLEAR' }
  | { type: 'CLEAR_HISTORY' };

const initialState: EvaluatorState = {
  input: '((8+2)*3)-(12/4)',
  tree: null,
  traversals: null,
  trace: null,
  stepIndex: -1,
  isPlaying: false,
  speed: 'normal',
  parseError: null,
  historyLog: [],
};

/** Construye el árbol interceptando cualquier error del núcleo. */
function build(state: EvaluatorState, input: string): EvaluatorState {
  const base = { ...state, input, trace: null, stepIndex: -1, isPlaying: false };
  try {
    const tree = ExpressionTree.fromExpression(input);
    return {
      ...base,
      tree,
      parseError: null,
      traversals: {
        preorden: tree.preorden(),
        inorden: tree.inorden(),
        posorden: tree.posorden(),
        parentizado: tree.inordenParentizado(),
        valores: evaluateNotations(tree),
      },
    };
  } catch (cause) {
    const err = toExpressionError(cause);
    return {
      ...base,
      tree: null,
      traversals: null,
      parseError: { code: err.code, message: err.message, position: err.position },
    };
  }
}

function lastIndex(state: EvaluatorState): number {
  return (state.trace?.steps.length ?? 0) - 1;
}

export function evaluatorReducer(state: EvaluatorState, action: EvaluatorAction): EvaluatorState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.input, parseError: null };

    case 'BUILD':
      return build(state, state.input);

    case 'LOAD_EXAMPLE':
      return build(state, action.input);

    case 'EVALUATE': {
      const built = state.tree && state.tree.source === state.input ? state : build(state, state.input);
      if (!built.tree) return built;
      const trace = evaluatePostorder(built.tree);
      const record = createHistoryRecord(built.tree, trace);
      return {
        ...built,
        trace,
        stepIndex: -1,
        isPlaying: true,
        historyLog: [record, ...built.historyLog],
      };
    }

    case 'STEP_FORWARD': {
      if (!state.trace) return state;
      const next = Math.min(state.stepIndex + 1, lastIndex(state));
      return { ...state, stepIndex: next, isPlaying: state.isPlaying && next < lastIndex(state) };
    }

    case 'STEP_BACKWARD':
      return state.trace ? { ...state, stepIndex: Math.max(-1, state.stepIndex - 1), isPlaying: false } : state;

    case 'GO_TO_END':
      return state.trace ? { ...state, stepIndex: lastIndex(state), isPlaying: false } : state;

    case 'RESTART':
      return state.trace ? { ...state, stepIndex: -1, isPlaying: false } : state;

    case 'TOGGLE_PLAY': {
      if (!state.trace) return state;
      const atEnd = state.stepIndex >= lastIndex(state);
      if (atEnd) return { ...state, stepIndex: -1, isPlaying: true };
      return { ...state, isPlaying: !state.isPlaying };
    }

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'CLEAR':
      return { ...initialState, input: '', speed: state.speed, historyLog: state.historyLog };

    case 'CLEAR_HISTORY':
      return { ...state, historyLog: [] };
  }
}

export interface EvaluatorView {
  readonly currentStep: EvaluationStep | null;
  readonly stack: readonly StackEntry[];
  /** Nodos ya procesados por la evaluación (posorden) y su valor parcial. */
  readonly partials: ReadonlyMap<string, number>;
  readonly visitedIds: ReadonlySet<string>;
  readonly history: readonly EvaluationStep[];
  readonly totalSteps: number;
  readonly finished: boolean;
}

export function useExpressionEvaluator() {
  const [state, dispatch] = useReducer(evaluatorReducer, initialState, (s) => ({
    ...build(s, s.input),
    historyLog: loadStoredHistory(),
  }));

  // Persistencia automática del historial en almacenamiento local del navegador.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.historyLog));
    } catch {
      // Ignorar si el navegador bloquea localStorage
    }
  }, [state.historyLog]);

  // Reproducción automática paso a paso.
  useEffect(() => {
    if (!state.isPlaying || !state.trace) return;
    const timer = window.setTimeout(() => dispatch({ type: 'STEP_FORWARD' }), SPEED_MS[state.speed]);
    return () => window.clearTimeout(timer);
  }, [state.isPlaying, state.stepIndex, state.speed, state.trace]);

  const view = useMemo<EvaluatorView>(() => {
    const steps = state.trace?.steps ?? [];
    const history = steps.slice(0, state.stepIndex + 1);
    const currentStep = history[history.length - 1] ?? null;
    const partials = new Map<string, number>();
    const visitedIds = new Set<string>();
    for (const step of history) {
      visitedIds.add(step.nodeId);
      if (step.result !== undefined) partials.set(step.nodeId, step.result);
    }
    return {
      currentStep,
      stack: currentStep?.stackAfter ?? [],
      partials,
      visitedIds,
      history,
      totalSteps: steps.length,
      finished: steps.length > 0 && state.stepIndex === steps.length - 1,
    };
  }, [state.trace, state.stepIndex]);

  return { state, view, dispatch };
}
