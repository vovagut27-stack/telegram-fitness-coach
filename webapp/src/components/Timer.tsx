import { useEffect, useState } from "react";
import type { ReactElement } from "react";

interface TimerProps {
  seconds: number;
  label: string;
  onDone?: () => void;
}

export function Timer({ seconds, label, onDone }: TimerProps): ReactElement {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) {
      onDone?.();
      return;
    }
    const id = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, onDone]);

  return (
    <div className="timer">
      <span>{label}</span>
      <strong>{left}s</strong>
    </div>
  );
}
