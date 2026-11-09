import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, Badge, Card, ErrorBox, Skeleton } from '@/components/ui';
import { attempt, getUserDetail, getViewer } from '@/lib/dal';
import { formatAgo, formatDate, formatDateTime, nf } from '@/lib/format';
import { AdminToggle } from './admin-toggle';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function UserPage({ params }: PageProps<'/users/[id]'>) {
  return (
    <div className="space-y-6">
      <Link href="/users" className="text-sm text-muted hover:text-ink">
        ← All users
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <UserDetail params={params} />
      </Suspense>
    </div>
  );
}

async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await attempt(Promise.all([getUserDetail(id), getViewer()]));
  if (!result.ok) return <ErrorBox error={result.error} />;
  const [user, viewer] = result.data;
  if (!user) notFound();

  const name = user.profile?.full_name || user.email || 'Unnamed account';
  const facts: [string, string][] = [
    ['Email', user.email ?? '—'],
    ['Phone', user.phone || '—'],
    ['Sign-in method', user.provider ?? '—'],
    ['Joined', formatDateTime(user.created_at)],
    ['Last sign-in', user.last_sign_in_at ? `${formatDateTime(user.last_sign_in_at)} (${formatAgo(user.last_sign_in_at)})` : 'Never'],
    ['Email confirmed', user.email_confirmed_at ? formatDateTime(user.email_confirmed_at) : 'Not yet'],
    ['Last entry', user.last_entry_at ? formatAgo(user.last_entry_at) : 'None'],
    ['Base currency', user.profile?.base_currency ?? '—'],
    ['Financial year starts', user.profile ? MONTHS[(user.profile.fy_start_month - 1) % 12] ?? '—' : '—'],
    ['Onboarded', user.profile?.onboarded_at ? formatDate(user.profile.onboarded_at) : 'Not yet'],
    ['User ID', user.id],
  ];

  return (
    <>
      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={name} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-[34px] leading-tight">{name}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {user.is_admin ? <Badge tone="blue">admin</Badge> : null}
            {user.email_confirmed_at ? <Badge tone="green">confirmed</Badge> : <Badge tone="amber">unconfirmed</Badge>}
            {user.profile?.onboarded_at ? <Badge>onboarded</Badge> : null}
          </div>
        </div>
        <AdminToggle userId={user.id} isAdmin={user.is_admin} isSelf={user.id === viewer.id} />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['Businesses', user.counts.businesses],
            ['Expenses', user.counts.expenses],
            ['Income', user.counts.income],
            ['Invoices', user.counts.invoices],
            ['Quotations', user.counts.quotations],
            ['Receipts', user.counts.receipts],
            ['Contacts', user.counts.contacts],
            ['Accounts', user.counts.accounts],
          ] as const
        ).map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="micro">{label}</div>
            <div className="mt-1.5 font-serif text-[30px] leading-none tabular">{nf.format(value)}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="micro mb-3">Account</div>
          <dl className="divide-y divide-line text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="min-w-0 text-right break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="overflow-hidden lg:col-span-3">
          <div className="micro px-5 pt-5 pb-3">Businesses</div>
          {user.businesses.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted">This user has not created a business yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-y border-line text-left">
                    <th className="micro px-5 py-2.5 font-semibold">Name</th>
                    <th className="micro px-3 py-2.5 font-semibold">Type</th>
                    <th className="micro px-3 py-2.5 text-right font-semibold">Expenses</th>
                    <th className="micro px-3 py-2.5 text-right font-semibold">Income</th>
                    <th className="micro px-5 py-2.5 text-right font-semibold">Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {user.businesses.map((b) => (
                    <tr key={b.id} className="border-b border-line last:border-0">
                      <td className="px-5 py-3">
                        <div className="font-medium">
                          {b.name} {b.is_default ? <Badge>default</Badge> : null}
                        </div>
                        <div className="text-xs text-muted">
                          {b.currency} · since {formatDate(b.created_at)}
                        </div>
                      </td>
                      <td className="px-3 py-3 capitalize text-muted">{b.kind}</td>
                      <td className="px-3 py-3 text-right tabular">{nf.format(b.expenses)}</td>
                      <td className="px-3 py-3 text-right tabular">{nf.format(b.income)}</td>
                      <td className="px-5 py-3 text-right tabular">{nf.format(b.invoices)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading user">
      <Skeleton className="h-14 w-72" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[84px]" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
