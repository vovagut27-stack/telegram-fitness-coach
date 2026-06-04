import type { ReactElement } from "react";

/** Лёгкий экран до первого рендера App — без тяжёлых импортов. */
export function AppBootSplash(): ReactElement {
  return (
    <div className="app-shell boot-splash">
      <header className="top-bar">
        <h1>FitBot</h1>
      </header>
      <main className="main-pane">
        <div className="card skeleton-card" aria-hidden />
        <div className="card skeleton-card short" aria-hidden />
      </main>
      <p className="muted center boot-splash-text">…</p>
    </div>
  );
}
