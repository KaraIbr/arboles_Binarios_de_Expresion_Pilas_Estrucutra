import { Maximize2, Move, ZoomIn, ZoomOut } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Tooltip } from './Tooltip';

interface PanZoomProps {
  /** Tamaño natural del contenido (px). */
  contentWidth: number;
  contentHeight: number;
  /** Al cambiar, la vista se reajusta para encuadrar el contenido. */
  resetKey: string;
  children: ReactNode;
}

interface View {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.25;
const MAX_K = 3;
const clamp = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

/**
 * Lienzo interactivo: arrastrar para mover, rueda del ratón para escalar.
 * Implementado con CSS transform (translate + scale), sin dependencias.
 */
export function PanZoom({ contentWidth, contentHeight, resetKey, children }: PanZoomProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const touchedRef = useRef(false);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState(false);

  /** Encuadra todo el árbol centrado (sin ampliar más de 1.35×). */
  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el || el.clientWidth === 0) return;
    const k = clamp(Math.min((el.clientWidth * 0.92) / contentWidth, (el.clientHeight * 0.92) / contentHeight, 1.35));
    setView({ k, x: (el.clientWidth - contentWidth * k) / 2, y: (el.clientHeight - contentHeight * k) / 2 });
    touchedRef.current = false;
  }, [contentWidth, contentHeight]);

  useLayoutEffect(() => {
    fit();
  }, [fit, resetKey]);

  // Reencuadra al redimensionar, salvo que el usuario ya haya movido la vista.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!touchedRef.current) fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    touchedRef.current = true;
    setView((v) => {
      const k = clamp(v.k * factor);
      const r = k / v.k;
      return { k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r };
    });
  }, []);

  const zoomCenter = (factor: number) => {
    const el = viewportRef.current;
    if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2);
  };

  // La rueda necesita un listener no pasivo para poder cancelar el scroll de la página.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    touchedRef.current = true;
    setView((v) => ({ ...v, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py }));
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={fit}
        className={`h-full w-full touch-none overflow-hidden select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            transformOrigin: '0 0',
            transition: dragging ? 'none' : 'transform 120ms ease-out',
          }}
        >
          {children}
        </div>
      </div>

      {/* Controles de vista */}
      <div className="absolute right-0 bottom-0 flex items-center gap-0.5 rounded-md border border-hairline bg-bone/90 p-0.5 backdrop-blur-sm">
        <Tooltip content="Arrastra el lienzo para mover el árbol; usa la rueda del ratón para acercar o alejar. Doble clic reencuadra." placement="top">
          <span className="grid size-7 place-items-center text-mute" tabIndex={0} aria-label="Ayuda de navegación">
            <Move size={14} strokeWidth={1.6} />
          </span>
        </Tooltip>
        <Tooltip content="Alejar (reduce la escala del árbol)." placement="top">
          <button type="button" aria-label="Alejar" onClick={() => zoomCenter(1 / 1.2)} className={BTN}>
            <ZoomOut size={15} strokeWidth={1.6} />
          </button>
        </Tooltip>
        <span className="tabular w-11 text-center font-rubik text-[11px] text-graphite-soft">{Math.round(view.k * 100)}%</span>
        <Tooltip content="Acercar (aumenta la escala del árbol)." placement="top">
          <button type="button" aria-label="Acercar" onClick={() => zoomCenter(1.2)} className={BTN}>
            <ZoomIn size={15} strokeWidth={1.6} />
          </button>
        </Tooltip>
        <Tooltip content="Encuadrar: centra y ajusta el árbol completo al lienzo." placement="top-end">
          <button type="button" aria-label="Encuadrar" onClick={fit} className={BTN}>
            <Maximize2 size={14} strokeWidth={1.6} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

const BTN = 'grid size-7 place-items-center rounded text-graphite transition-colors hover:bg-bone-deep';
