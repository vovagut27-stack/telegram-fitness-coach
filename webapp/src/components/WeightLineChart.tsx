import type { ReactElement } from "react";
import type { WeightLogEntry } from "../types";

const W = 320;
const H = 120;
const PAD = { top: 12, right: 8, bottom: 22, left: 36 };

interface WeightLineChartProps {
  entries: WeightLogEntry[];
}

export function WeightLineChart({ entries }: WeightLineChartProps): ReactElement | null {
  const sorted = [...entries]
    .sort((a, b) => a.logDate.localeCompare(b.logDate))
    .slice(-30);
  if (sorted.length < 2) {
    return null;
  }

  const weights = sorted.map((e) => e.weightKg);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const padKg = rawMax === rawMin ? 1 : (rawMax - rawMin) * 0.12;
  const yMin = rawMin - padKg;
  const yMax = rawMax + padKg;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xAt = (i: number): number =>
    PAD.left + (sorted.length === 1 ? innerW / 2 : (i / (sorted.length - 1)) * innerW);
  const yAt = (kg: number): number =>
    PAD.top + innerH - ((kg - yMin) / (yMax - yMin)) * innerH;

  const points = sorted.map((e, i) => `${xAt(i)},${yAt(e.weightKg)}`).join(" ");

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  const firstLabel = sorted[0].logDate.slice(5);
  const lastLabel = sorted[sorted.length - 1].logDate.slice(5);

  return (
    <svg
      className="weight-line-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-hidden
    >
      {yTicks.map((kg, i) => {
        const y = yAt(kg);
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              className="weight-chart-grid"
            />
            <text x={PAD.left - 4} y={y + 3} textAnchor="end" className="weight-chart-label">
              {kg.toFixed(1)}
            </text>
          </g>
        );
      })}
      <polyline points={points} className="weight-chart-line" fill="none" />
      {sorted.map((e, i) => (
        <circle
          key={e.id}
          cx={xAt(i)}
          cy={yAt(e.weightKg)}
          r={3}
          className="weight-chart-dot"
        />
      ))}
      <text x={PAD.left} y={H - 4} className="weight-chart-label">
        {firstLabel}
      </text>
      <text x={W - PAD.right} y={H - 4} textAnchor="end" className="weight-chart-label">
        {lastLabel}
      </text>
    </svg>
  );
}
