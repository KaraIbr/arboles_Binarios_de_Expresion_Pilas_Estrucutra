import { useId, type ReactElement, type ReactNode } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'top-end' | 'bottom-end' | 'top-start';

interface TooltipProps {
  /** Texto descriptivo del "info tool". */
  content: ReactNode;
  placement?: Placement;
  children: ReactElement;
  className?: string;
}

const PLACEMENT: Record<Placement, string> = {
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2 translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2 -translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
  'bottom-end': 'top-full right-0 mt-2 translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
  'top-end': 'bottom-full right-0 mb-2 -translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
  'top-start': 'bottom-full left-0 mb-2 -translate-y-1 group-hover/tt:translate-y-0 group-focus-within/tt:translate-y-0',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2 -translate-x-1 group-hover/tt:translate-x-0 group-focus-within/tt:translate-x-0',
};

/**
 * Info tool flotante: aparece al pasar el cursor o al enfocar con teclado.
 */
export function Tooltip({ content, placement = 'bottom', children, className = '' }: TooltipProps) {
  const id = useId();
  return (
    <span className={`group/tt relative inline-flex ${className}`} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-50 w-max max-w-64 rounded-md bg-graphite px-3 py-2 font-rubik text-[12px] leading-snug font-normal text-bone opacity-0 transition duration-200 ease-out group-hover/tt:opacity-100 group-focus-within/tt:opacity-100 ${PLACEMENT[placement]}`}
      >
        {content}
      </span>
    </span>
  );
}
