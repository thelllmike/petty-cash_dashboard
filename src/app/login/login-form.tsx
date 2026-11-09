'use client';

import { useActionState } from 'react';
import { signIn, type FormState } from '../actions';

const field =
  'mt-1.5 h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 text-[15px] text-on-ink outline-none placeholder:text-white/35 focus:border-green';

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm text-white/70">
        Email
        <input name="email" type="email" autoComplete="email" required className={field} placeholder="you@example.com" />
      </label>
      <label className="block text-sm text-white/70">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={field} />
      </label>
      {state?.error ? (
        <p role="alert" className="rounded-xl bg-[#3A1A17] px-3.5 py-2.5 text-sm text-[#FF8A7A]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-xl bg-[#0FA36B] font-semibold text-white transition hover:bg-[#0B7C51] disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
