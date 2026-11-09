import { Suspense } from 'react';
import { Mark, Skeleton } from '@/components/ui';
import { Nav, NavLinks } from '@/components/nav';
import { getViewer } from '@/lib/dal';
import { signOut } from '../actions';

async function ViewerBadge() {
  const viewer = await getViewer();
  return (
    <div className="min-w-0">
      <div className="micro">Signed in</div>
      <div className="mt-1 truncate text-sm" title={viewer.email ?? undefined}>
        {viewer.email}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="md:flex md:min-h-screen">
      <aside className="border-b border-line bg-card px-4 py-4 md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0 md:px-5 md:py-6">
        <div className="flex items-center justify-between gap-3 md:block">
          <div className="flex items-center gap-2.5">
            <Mark size={22} />
            <span className="text-[15px] font-semibold">Cash Book</span>
            <span className="rounded-full bg-track px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted">
              ADMIN
            </span>
          </div>
          <div className="md:mt-8">
            <Suspense fallback={<NavLinks />}>
              <Nav />
            </Suspense>
          </div>
        </div>
        <div className="mt-auto hidden space-y-3 md:block">
          <Suspense fallback={<Skeleton className="h-9" />}>
            <ViewerBadge />
          </Suspense>
          <form action={signOut}>
            <button className="w-full rounded-xl border border-line px-3 py-2 text-left text-sm text-muted hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={signOut} className="mt-10 md:hidden">
          <button className="text-sm text-muted underline">Sign out</button>
        </form>
      </main>
    </div>
  );
}
