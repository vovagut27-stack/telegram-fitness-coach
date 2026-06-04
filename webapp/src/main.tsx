import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nProvider } from "./i18n/context";
import { loadApiConfig } from "./config";
import { initTelegramWebApp, reloadMiniApp } from "./services/telegram";

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element missing");
}

const root = createRoot(container);

function renderApp(): void {
  const tree = (
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  );
  root.render(import.meta.env.DEV ? <StrictMode>{tree}</StrictMode> : tree);
}

function renderBootError(message: string): void {
  root.render(
    <div className="app-shell" style={{ padding: "1.5rem" }}>
      <h1>FitBot</h1>
      <p className="error">{message}</p>
      <button type="button" className="btn-primary" onClick={() => reloadMiniApp()}>
        Перезагрузить
      </button>
    </div>,
  );
}

root.render(<p className="muted center" style={{ padding: "2rem" }}>Загрузка…</p>);

void loadApiConfig()
  .then(() => initTelegramWebApp())
  .then(() => {
    renderApp();
  })
  .catch((err: unknown) => {
    console.error("Boot failed:", err);
    const msg =
      err instanceof Error ? err.message : "Не удалось загрузить конфигурацию приложения.";
    renderBootError(msg);
  });
