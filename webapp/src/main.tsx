import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { I18nProvider } from "./i18n/context";
import { AppBootSplash } from "./components/AppBootSplash";
import { loadApiConfig } from "./config";
import { initTelegramWebApp, reloadMiniApp } from "./services/telegram";

const App = lazy(() => import("./App.tsx"));

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element missing");
}

const root = createRoot(container);

function renderApp(): void {
  const tree = (
    <ErrorBoundary>
      <I18nProvider>
        <Suspense fallback={<AppBootSplash />}>
          <App />
        </Suspense>
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

root.render(<AppBootSplash />);

void (async () => {
  try {
    await Promise.all([loadApiConfig(), initTelegramWebApp()]);
    renderApp();
  } catch (err: unknown) {
    console.error("Boot failed:", err);
    const msg =
      err instanceof Error ? err.message : "Не удалось загрузить конфигурацию приложения.";
    renderBootError(msg);
  }
})();
