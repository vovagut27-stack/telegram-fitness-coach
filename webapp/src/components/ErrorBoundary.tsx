import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Mini App crash:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="app-shell" style={{ padding: "1.5rem" }}>
          <h1>FitBot</h1>
          <p className="error">
            Приложение столкнулось с ошибкой. Закройте и откройте снова из бота (/start →
            «Открыть приложение»).
          </p>
          <p className="muted small">{this.state.error.message}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
