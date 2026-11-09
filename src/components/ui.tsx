import type { ReactNode } from 'react';
import { initials } from '@/lib/format';

export function Mark({ size = 22, onDark = false }: { size?: number; onDark?: boolean }) {
  const bar = onDark ? '#F5F3EE' : 'currentColor';
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden>
      <rect x="2" y="8" width="38" height="9" rx="4.5" fill={bar} />
      <rect x="2" y="25.5" width="56" height="9" rx="4.5" fill="#0FA36B" />
      <rect x="2" y="43" width="26" height="9" rx="4.5" fill={bar} />
    </svg>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[34px] leading-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-card ${className}`}>{children}</section>;
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <div className="micro">{label}</div>
      <div className="mt-2 font-serif text-[38px] leading-none tabular">{value}</div>
      {hint ? <div className="mt-2 text-xs text-muted">{hint}</div> : null}
    </Card>
  );
}

type Tone = 'green' | 'amber' | 'blue' | 'red' | 'neutral';
const tones: Record<Tone, string> = {
  green: 'bg-green-soft text-green-text',
  amber: 'bg-amber-soft text-amber-text',
  blue: 'bg-blue-soft text-blue-text',
  red: 'bg-red-soft text-red',
  neutral: 'bg-track text-muted',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-green-soft font-semibold text-green-text"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  return (
    <div role="alert" className="rounded-2xl border border-red/30 bg-red-soft p-5 text-sm text-red">
      <div className="font-semibold">Could not load this data</div>
      <div className="mt-1">{error instanceof Error ? error.message : 'Try again in a moment.'}</div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}
