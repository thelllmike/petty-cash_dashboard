import { Suspense } from 'react';
import Link from 'next/link';
import { Avatar, Badge, Card, ErrorBox, PageHeader, Skeleton, StatTile } from '@/components/ui';
import { DailyBars, ShareList } from '@/components/bar-chart';
import { attempt, getOverview, listUsers } from '@/lib/dal';
import { formatAgo, nf } from '@/lib/format';

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Overview" subtitle="Everyone using Cash Book, at a glance." />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewData />
      </Suspense>
    </div>
  );
}

async function OverviewData() {
  const result = await attempt(Promise.all([getOverview(), listUsers()]));
  if (!result.ok) return <ErrorBox error={result.error} />;
  const [overview, users] = result.data;

  const { totals, active } = overview;
  const newThisMonth = overview.signups.reduce((sum, d) => sum + d.count, 0);
  const pct = (n: number) => (totals.users ? `${Math.round((n / totals.users) * 100)}% of users` : undefined);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total users" value={nf.format(totals.users)} hint={`${totals.admins} admin${totals.admins === 1 ? '' : 's'}`} />
        <StatTile label="Active · 7 days" value={nf.format(active.week)} hint={pct(active.week)} />
        <StatTile label="New · 30 days" value={nf.format(newThisMonth)} hint={`${active.day} signed in today`} />
        <StatTile label="Businesses" value={nf.format(totals.businesses)} hint={`${overview.onboarded} users onboarded`} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <DailyBars data={overview.signups} label="Sign-ups per day" unit={['sign-up', 'sign-ups']} />
        </Card>
        <Card className="p-5">
          <DailyBars data={overview.entries} label="Entries per day" unit={['entry', 'entries']} />
        </Card>
      </div>

      <Card className="p-5">
        <div className="micro">Records across all accounts</div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ['Expenses', totals.expenses],
              ['Income', totals.income],
              ['Invoices', totals.invoices],
              ['Quotations', totals.quotations],
              ['Receipts', totals.receipts],
              ['Contacts', totals.contacts],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-0.5 font-serif text-[28px] leading-none tabular">{nf.format(value)}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-5">
          <div className="micro mb-4">Business types</div>
          <ShareList rows={overview.business_kinds.map((k) => ({ label: k.kind, count: k.count }))} empty="No businesses yet." />
        </Card>
        <Card className="p-5">
          <div className="micro mb-4">Base currencies</div>
          <ShareList rows={overview.currencies.map((c) => ({ label: c.currency, count: c.count }))} empty="No profiles yet." />
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="micro">Newest users</div>
            <Link href="/users" className="text-sm font-medium text-green-text hover:underline">
              All users →
            </Link>
          </div>
          <ul className="space-y-3">
            {users.slice(0, 6).map((u) => {
              const name = u.full_name || u.email || 'Unnamed';
              return (
                <li key={u.id}>
                  <Link href={`/users/${u.id}`} className="flex items-center gap-3 rounded-xl hover:bg-track">
                    <Avatar name={name} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{name}</span>
                      <span className="block text-xs text-muted">joined {formatAgo(u.created_at)}</span>
                    </span>
                    {!u.email_confirmed_at ? <Badge tone="amber">unconfirmed</Badge> : null}
                  </Link>
                </li>
              );
            })}
            {users.length === 0 ? <li className="text-sm text-muted">No users yet.</li> : null}
          </ul>
        </Card>
      </div>
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px]" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
