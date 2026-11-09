import type { Metadata } from 'next';
import { Mark } from '@/components/ui';
import { signOut } from '../actions';

export const metadata: Metadata = { title: 'No access' };

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4 text-on-ink">
      <div className="w-full max-w-sm">
        <Mark size={26} onDark />
        <h1 className="mt-6 font-serif text-[38px] leading-tight">No admin access.</h1>
        <p className="mt-2 text-sm text-white/60">
          This account is signed in but is not listed in <code>public.admins</code>. Ask an existing admin to grant
          access, or sign in with a different account.
        </p>
        <form action={signOut} className="mt-8">
          <button className="h-11 w-full rounded-xl bg-white/10 font-semibold hover:bg-white/15">Sign out</button>
        </form>
      </div>
    </main>
  );
}
