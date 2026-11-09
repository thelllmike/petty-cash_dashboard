import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ErrorBox, PageHeader, Skeleton } from '@/components/ui';
import { attempt, listUsersSnapshot } from '@/lib/dal';
import { UsersTable } from './users-table';

export const metadata: Metadata = { title: 'Users' };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Every account, newest first." />
      <Suspense fallback={<Skeleton className="h-[480px]" />}>
        <UsersData />
      </Suspense>
    </div>
  );
}

async function UsersData() {
  const result = await attempt(listUsersSnapshot());
  if (!result.ok) return <ErrorBox error={result.error} />;
  return <UsersTable users={result.data.users} now={result.data.now} />;
}
