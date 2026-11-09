'use client';

import { useState } from 'react';
import type { DayCount } from '@/lib/types';

const fmtDay = (day: string) =>
  new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/**
 * Single-series daily bar chart. One hue (the brand green), 4px rounded tops
 * anchored to the baseline, 2px gaps, hover/focus tooltip and a hidden table
 * for screen readers.
 */
export function DailyBars({ data, label, unit }: { data: DayCount[]; label: string; unit: [string, string] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const active = hover !== null ? data[hover] : null;
  const word = (n: number) => (n === 1 ? unit[0] : unit[1]);

  return (
    <figure>
      <div className="flex items-baseline justify-between gap-3">
        <figcaption className="micro">{label}</figcaption>
        <div className="text-sm text-muted tabular" aria-live="polite">
          {active ? (
            <>
              <span className="font-semibold text-ink">{active.count}</span> {word(active.count)} · {fmtDay(active.day)}
            </>
          ) : (
            <>
              <span className="font-semibold text-ink">{total}</span> {word(total)} · 30 days
            </>
          )}
        </div>
      </div>

      <div className="relative mt-4 h-40" aria-hidden onMouseLeave={() => setHover(null)}>
        {/* recessive gridlines */}
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
        <div className="absolute inset-x-0 bottom-0 border-t border-line-strong" />
        <div className="absolute top-0 right-0 -translate-y-1/2 bg-card pl-1 text-[10px] text-muted2 tabular">{max}</div>

        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((d, i) => (
            <div
              key={d.day}
              className="flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
            >
              <div
                className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-green-hover' : 'bg-green'}`}
                style={{ height: d.count === 0 ? 0 : `max(${(d.count / max) * 100}%, 3px)` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted2" aria-hidden>
        <span>{data[0] ? fmtDay(data[0].day) : ''}</span>
        <span>Today</span>
      </div>

      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>{unit[1]}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{fmtDay(d.day)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Horizontal share bars for a short ranked list (kinds, currencies). */
export function ShareList({ rows, empty }: { rows: { label: string; count: number }[]; empty: string }) {
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm">
            <span className="capitalize">{r.label}</span>
            <span className="text-muted tabular">
              {r.count} · {Math.round((r.count / total) * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-track">
            <div className="h-2 rounded-full bg-green" style={{ width: `${(r.count / total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
