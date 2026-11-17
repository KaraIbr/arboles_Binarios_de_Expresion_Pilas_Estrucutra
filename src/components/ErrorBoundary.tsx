import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * Red de seguridad final: si un error inesperado escapa de la lógica,
 * se muestra un aviso en lugar de cerrar la aplicación.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error de interfaz interceptado:', error, info.componentStack);
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-bone p-8 text-center">
        <p className="font-comfortaa text-lg font-bold text-terracotta">Algo salió mal en la interfaz</p>
        <p className="max-w-md text-[13px] text-graphite-soft">{this.state.error.message}</p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="rounded-md border border-graphite/30 px-4 py-2 font-comfortaa text-[13px] font-semibold text-graphite hover:border-graphite"
        >
          Reintentar
        </button>
      </div>
    );
  }
}
