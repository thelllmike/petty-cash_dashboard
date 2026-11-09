import type { Metadata } from 'next';
import { Mark } from '@/components/ui';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-4 py-12 text-on-ink">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5">
          <Mark size={26} onDark />
          <span className="text-[15px] font-semibold">Cash Book</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide">ADMIN</span>
        </div>
        <h1 className="mt-8 font-serif text-[44px] leading-[1.05]">Welcome back.</h1>
        <p className="mt-2 text-sm text-white/60">Sign in with an admin account from the app.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
