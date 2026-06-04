import { Component, type ErrorInfo, type ReactNode } from "react";
import { reloadMiniApp } from "../services/telegram";

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
      const detail = this.state.error.message || "Unknown error";
      return (
        <div className="app-shell" style={{ padding: "1.5rem" }}>
          <h1>FitBot</h1>
          <p className="error">
            Ошибка при запуске. Нажмите «Перезагрузить» или закройте и откройте снова из бота.
          </p>
          <p className="muted small" style={{ wordBreak: "break-word" }}>
            {detail}
          </p>
          <button type="button" className="btn-primary" onClick={() => reloadMiniApp()}>
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
