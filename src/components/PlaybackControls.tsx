import { ChevronLeft, ChevronsRight, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { Dispatch, ReactNode } from 'react';
import type { EvaluatorAction, Speed } from '../hooks/useExpressionEvaluator';
import { Tooltip } from './Tooltip';

interface PlaybackControlsProps {
  enabled: boolean;
  isPlaying: boolean;
  stepIndex: number;
  totalSteps: number;
  speed: Speed;
  dispatch: Dispatch<EvaluatorAction>;
}

const SPEEDS: { value: Speed; label: string; hint: string }[] = [
  { value: 'lenta', label: 'Lenta', hint: 'Un paso cada 1.7 s: ideal para explicar en clase.' },
  { value: 'normal', label: 'Normal', hint: 'Un paso por segundo.' },
  { value: 'rapida', label: 'Rápida', hint: 'Un paso cada 0.45 s.' },
];

const BASE =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border font-comfortaa text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:border-hairline disabled:text-mute/50 disabled:hover:bg-transparent';

function Control({
  hint,
  label,
  onClick,
  disabled,
  pressed,
  className = '',
  placement = 'top',
  children,
}: {
  hint: string;
  label: string;
  onClick: () => void;
  disabled: boolean;
  pressed?: boolean;
  className?: string;
  placement?: 'top' | 'top-end' | 'top-start';
  children: ReactNode;
}) {
  return (
    <Tooltip content={hint} placement={placement} className={className}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
        disabled={disabled}
        className={`${BASE} w-full px-2 whitespace-nowrap ${
          pressed ? 'border-graphite bg-graphite text-bone' : 'border-hairline-strong text-graphite hover:bg-bone-deep'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

/** Reproductor de la evaluación: Reiniciar · Auto-Play · Siguiente Paso + velocidad. */
export function PlaybackControls({ enabled, isPlaying, stepIndex, totalSteps, speed, dispatch }: PlaybackControlsProps) {
  const atStart = stepIndex < 0;
  const atEnd = stepIndex >= totalSteps - 1;

  return (
    <div className="space-y-2">
      <div className="flex items-stretch gap-1.5">
        <Control
          label="Reiniciar"
          hint="Regresa al inicio de la evaluación con la pila vacía."
          onClick={() => dispatch({ type: 'RESTART' })}
          disabled={!enabled || atStart}
          className="flex-1"
          placement="top-start"
        >
          <SkipBack size={14} strokeWidth={1.7} /> Reiniciar
        </Control>
        <Control
          label="Paso anterior"
          hint="Retrocede un paso y restaura el estado previo de la pila."
          onClick={() => dispatch({ type: 'STEP_BACKWARD' })}
          disabled={!enabled || atStart}
        >
          <ChevronLeft size={15} strokeWidth={1.7} />
        </Control>
        <Control
          label={isPlaying ? 'Pausar' : 'Auto-Play'}
          hint={
            isPlaying
              ? 'Pausa la reproducción automática.'
              : atEnd && enabled
                ? 'Vuelve a reproducir la evaluación desde el inicio.'
                : 'Reproduce automáticamente la evaluación nodo por nodo.'
          }
          onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
          disabled={!enabled}
          pressed={isPlaying}
          className="flex-1"
        >
          {isPlaying ? <Pause size={14} strokeWidth={1.7} /> : <Play size={14} strokeWidth={1.7} />}
          {isPlaying ? 'Pausa' : 'Auto-Play'}
        </Control>
        <Control
          label="Siguiente Paso"
          hint="Avanza iterativamente al siguiente nodo del recorrido en Posorden."
          onClick={() => dispatch({ type: 'STEP_FORWARD' })}
          disabled={!enabled || atEnd}
          className="flex-1"
          placement="top-end"
        >
          Siguiente <SkipForward size={14} strokeWidth={1.7} />
        </Control>
        <Control
          label="Ir al final"
          hint="Ejecuta todos los pasos restantes y muestra el resultado."
          onClick={() => dispatch({ type: 'GO_TO_END' })}
          disabled={!enabled || atEnd}
          placement="top-end"
        >
          <ChevronsRight size={15} strokeWidth={1.7} />
        </Control>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-comfortaa text-[11px] font-semibold text-mute">Velocidad</span>
        <div className="flex rounded-md border border-hairline-strong p-0.5">
          {SPEEDS.map((s) => (
            <Tooltip key={s.value} content={s.hint} placement="top-end">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_SPEED', speed: s.value })}
                aria-pressed={speed === s.value}
                className={`rounded px-2.5 py-1 font-comfortaa text-[11px] font-semibold transition-colors ${
                  speed === s.value ? 'bg-graphite text-bone' : 'text-graphite-soft hover:text-graphite'
                }`}
              >
                {s.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
