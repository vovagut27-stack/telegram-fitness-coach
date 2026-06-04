import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nProvider } from "./i18n/context";
import { loadApiConfig } from "./config";
import { initTelegramWebApp } from "./services/telegram";

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element missing");
}

initTelegramWebApp();

const root = createRoot(container);

function renderApp(): void {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}

function renderBootError(message: string): void {
  root.render(
    <div className="app-shell" style={{ padding: "1.5rem" }}>
      <h1>FitBot</h1>
      <p className="error">{message}</p>
      <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
        Перезагрузить
      </button>
    </div>,
  );
}

root.render(<p className="muted center" style={{ padding: "2rem" }}>Загрузка…</p>);

void loadApiConfig()
  .then(() => {
    renderApp();
  })
  .catch((err: unknown) => {
    console.error("Boot failed:", err);
    const msg =
      err instanceof Error ? err.message : "Не удалось загрузить конфигурацию приложения.";
    renderBootError(msg);
  });
