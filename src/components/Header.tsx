import { Eraser, GitFork, Play } from 'lucide-react';
import type { Dispatch } from 'react';
import { ERROR_LABELS } from '../core';
import type { EvaluatorAction, UiError } from '../hooks/useExpressionEvaluator';
import logo from '../logo.png';
import { Tooltip } from './Tooltip';

const TEST_CASES: { expr: string; hint: string }[] = [
  { expr: '5+3', hint: 'Operación sencilla' },
  { expr: '(5+3)*2', hint: 'Agrupación explícita con paréntesis' },
  { expr: '7+3*2', hint: 'Precedencia: × se resuelve antes que +' },
  { expr: '((8+2)*3)-(12/4)', hint: 'Árbol profundo de varios niveles' },
  { expr: '(18-6)/(2+1)', hint: 'División: el 1er POP es el divisor (derecho)' },
  { expr: '9/(3-3)', hint: 'División entre cero interceptada por la lógica' },
  { expr: '(5+3', hint: 'Paréntesis no balanceados' },
];

const NEGATIVE_CASES: { expr: string; hint: string }[] = [
  { expr: '-5+3', hint: 'Signo al inicio: −5 es una hoja con valor negativo' },
  { expr: '8-(-2)', hint: 'Resta de un negativo: 8 − (−2) = 10' },
  { expr: '2*-3', hint: 'Signo después de un operador: 2 × (−3)' },
  { expr: '-(4+2)*3', hint: 'Signo sobre un paréntesis: se representa como (−1) × (4+2)' },
];

interface HeaderProps {
  input: string;
  parseError: UiError | null;
  dispatch: Dispatch<EvaluatorAction>;
}

export function Header({ input, parseError, dispatch }: HeaderProps) {
  return (
    <header className="border-b border-hairline px-6 pt-5 pb-4 lg:px-10">
      <div className="grid grid-cols-12 items-end gap-x-8 gap-y-4">
        {/* Título institucional */}
        <div className="col-span-12 lg:col-span-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Global University" className="h-6 w-auto mix-blend-multiply opacity-90" />
            <span className="font-rubik text-[11px] tracking-[0.14em] whitespace-nowrap text-mute uppercase">
              Parcial 02
            </span>
          </div>
          <h1 className="mt-1 font-comfortaa text-xl font-bold tracking-tight text-graphite">
            Árbol de Expresión <span className="font-normal text-mute">/</span> Pila
          </h1>
        </div>

        {/* Barra de captura */}
        <div className="col-span-12 lg:col-span-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: 'BUILD' });
            }}
          >
            <Tooltip
              className="w-full"
              content="Escribe una expresión con números (enteros o decimales), + − × ÷ y paréntesis. Presiona Enter para generar el árbol."
            >
              <label className="w-full">
                <span className="sr-only">Expresión aritmética</span>
                <input
                  value={input}
                  onChange={(e) => dispatch({ type: 'SET_INPUT', input: e.target.value })}
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="Ej. (18-6)/(2+1)"
                  aria-invalid={parseError !== null}
                  className={`tabular w-full border-0 border-b bg-transparent pt-1 pb-2 font-rubik text-2xl tracking-wide text-graphite placeholder:text-mute/60 focus:outline-none ${
                    parseError ? 'border-terracotta' : 'border-graphite/40 focus:border-graphite'
                  }`}
                />
              </label>
            </Tooltip>
          </form>
        </div>

        {/* Controles primarios */}
        <div className="col-span-12 flex items-center gap-2 lg:col-span-3 lg:justify-end">
          <Tooltip content="Analiza la expresión (Lexer → Parser) y dibuja el Árbol Binario con sus tres recorridos.">
            <button
              type="button"
              onClick={() => dispatch({ type: 'BUILD' })}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-graphite/30 px-3.5 py-2 font-comfortaa text-[13px] font-semibold text-graphite transition-colors hover:border-graphite hover:bg-bone-deep"
            >
              <GitFork size={15} strokeWidth={1.6} className="rotate-180" />
              Generar Árbol
            </button>
          </Tooltip>
          <Tooltip content="Recorre el árbol en Posorden usando la Pila: PUSH para operandos, dos POP + PUSH para operadores. Se reproduce paso a paso.">
            <button
              type="button"
              onClick={() => dispatch({ type: 'EVALUATE' })}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-comfortaa text-[13px] font-bold text-bone transition-colors hover:bg-brand-deep"
            >
              <Play size={14} strokeWidth={2} />
              Evaluar
            </button>
          </Tooltip>
          <Tooltip content="Borra la expresión, el árbol, los recorridos y la pila." placement="bottom-end">
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR' })}
              aria-label="Limpiar"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-comfortaa text-[13px] font-semibold text-mute transition-colors hover:bg-bone-deep hover:text-graphite"
            >
              <Eraser size={15} strokeWidth={1.6} />
              Limpiar
            </button>
          </Tooltip>
        </div>

        {/* Mensaje de error / casos de prueba */}
        <div className="col-span-12 space-y-2 lg:col-span-6 lg:col-start-4">
          {parseError && <ErrorLine input={input} error={parseError} />}
          <CaseRow label="Casos de prueba" cases={TEST_CASES} input={input} dispatch={dispatch} />
          <CaseRow label="Negativos" cases={NEGATIVE_CASES} input={input} dispatch={dispatch} />
        </div>
      </div>
    </header>
  );
}

function CaseRow({
  label,
  cases,
  input,
  dispatch,
}: {
  label: string;
  cases: { expr: string; hint: string }[];
  input: string;
  dispatch: Dispatch<EvaluatorAction>;
}) {
  return (
          <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 w-[6.5rem] whitespace-nowrap font-comfortaa text-[11px] font-semibold text-mute">{label}</span>
              {cases.map(({ expr, hint }) => (
                <Tooltip key={expr} content={`${hint}. Clic para cargar y generar el árbol.`}>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'LOAD_EXAMPLE', input: expr })}
                    className={`tabular rounded border px-2 py-0.5 font-rubik text-[12px] transition-colors ${
                      expr === input
                        ? 'border-graphite bg-graphite text-bone'
                        : 'border-hairline-strong text-graphite-soft hover:border-graphite hover:text-graphite'
                    }`}
                  >
                    {expr}
                  </button>
                </Tooltip>
              ))}
          </div>
  );
}

function ErrorLine({ input, error }: { input: string; error: UiError }) {
  return (
    <div role="alert" className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
      <span className="rounded bg-terracotta-tint px-2 py-0.5 font-comfortaa text-[11px] font-bold text-terracotta">
        {ERROR_LABELS[error.code]}
      </span>
      <span className="text-terracotta">{error.message}</span>
      {error.position !== null && input.length > 0 && (
        <code className="tabular basis-full font-rubik text-[13px] text-graphite-soft">
          {input.slice(0, error.position)}
          <mark className="rounded-sm bg-terracotta px-0.5 text-bone">{input.charAt(error.position) || ' '}</mark>
          {input.slice(error.position + 1)}
        </code>
      )}
    </div>
  );
}
