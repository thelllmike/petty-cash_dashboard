'use client';

import { useState, useTransition } from 'react';
import { setAdmin } from '@/app/actions';

export function AdminToggle({ userId, isAdmin, isSelf }: { userId: string; isAdmin: boolean; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-sm text-muted">This is you</span>;

  const run = () =>
    start(async () => {
      setError(null);
      const result = await setAdmin(userId, !isAdmin);
      if (result?.error) setError(result.error);
      setConfirming(false);
    });

  return (
    <div className="flex flex-col items-end gap-1.5">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{isAdmin ? 'Remove admin access?' : 'Give full admin access?'}</span>
          <button
            onClick={run}
            disabled={pending}
            className={`h-9 rounded-xl px-3.5 text-sm font-semibold disabled:opacity-60 ${
              isAdmin ? 'bg-red text-paper' : 'bg-green text-white hover:bg-green-hover'
            }`}
          >
            {pending ? 'Saving…' : 'Confirm'}
          </button>
          <button onClick={() => setConfirming(false)} className="h-9 rounded-xl border border-line px-3 text-sm">
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="h-9 rounded-xl border border-line bg-card px-3.5 text-sm font-medium hover:border-line-strong"
        >
          {isAdmin ? 'Remove admin' : 'Make admin'}
        </button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
