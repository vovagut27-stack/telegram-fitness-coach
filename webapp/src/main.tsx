import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./i18n/context";
import { loadApiConfig } from "./config";

const root = document.getElementById("root")!;

root.innerHTML = '<p class="muted center" style="padding:2rem">Загрузка…</p>';

void loadApiConfig().then(() => {
  root.innerHTML = "";
  createRoot(root).render(
    <StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </StrictMode>,
  );
});
