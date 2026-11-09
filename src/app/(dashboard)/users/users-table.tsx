'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar, Badge, Card } from '@/components/ui';
import { formatAgo, formatDate, MONTH_MS, nf, WEEK_MS, within } from '@/lib/format';
import type { AdminUser } from '@/lib/types';

type Filter = 'all' | 'active' | 'new' | 'unconfirmed' | 'admins';
type Sort = 'created' | 'seen' | 'businesses' | 'name';

const nameOf = (u: AdminUser) => u.full_name || u.email || 'Unnamed account';

/** `now` comes from the server so render stays pure and matches on hydration. */
export function UsersTable({ users, now }: { users: AdminUser[]; now: number }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('created');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    return {
      all: users,
      active: users.filter((u) => within(u.last_sign_in_at, WEEK_MS, now)),
      new: users.filter((u) => within(u.created_at, MONTH_MS, now)),
      unconfirmed: users.filter((u) => !u.email_confirmed_at),
      admins: users.filter((u) => u.is_admin),
    } satisfies Record<Filter, AdminUser[]>;
  }, [users, now]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? groups[filter].filter(
          (u) => (u.full_name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
        )
      : groups[filter];
    const time = (iso: string | null) => (iso ? new Date(iso).getTime() : 0);
    return [...pool].sort((a, b) => {
      switch (sort) {
        case 'seen':
          return time(b.last_sign_in_at) - time(a.last_sign_in_at);
        case 'businesses':
          return b.business_count - a.business_count;
        case 'name':
          return nameOf(a).localeCompare(nameOf(b));
        default:
          return time(b.created_at) - time(a.created_at);
      }
    });
  }, [groups, filter, query, sort]);

  const exportCsv = () => {
    const head = ['id', 'email', 'full_name', 'created_at', 'last_sign_in_at', 'email_confirmed_at', 'business_count', 'is_admin'];
    const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = shown.map((u) => head.map((k) => cell(u[k as keyof AdminUser])).join(','));
    const blob = new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cashbook-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tabs: [Filter, string][] = [
    ['all', 'All'],
    ['active', 'Active 7d'],
    ['new', 'New 30d'],
    ['unconfirmed', 'Unconfirmed'],
    ['admins', 'Admins'],
  ];

  return (
    <div className="space-y-4">
      {/* Filters: one row above the data */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          aria-label="Search users"
          className="h-10 w-full rounded-xl border border-line bg-card px-3.5 text-sm outline-none focus:border-green sm:w-72"
        />
        <div role="tablist" aria-label="Filter users" className="flex flex-wrap gap-1.5">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`h-9 rounded-full border px-3.5 text-sm transition ${
                filter === key ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-muted hover:text-ink'
              }`}
            >
              {label} <span className="tabular opacity-70">{groups[key].length}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-muted">
            Sort{' '}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-xl border border-line bg-card px-2 text-sm text-ink"
            >
              <option value="created">Newest</option>
              <option value="seen">Last seen</option>
              <option value="businesses">Businesses</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button onClick={exportCsv} className="h-9 rounded-xl border border-line bg-card px-3 text-sm hover:border-line-strong">
            Export CSV
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="micro px-5 py-3 font-semibold">User</th>
                <th className="micro px-3 py-3 font-semibold">Status</th>
                <th className="micro px-3 py-3 text-right font-semibold">Businesses</th>
                <th className="micro px-3 py-3 font-semibold">Joined</th>
                <th className="micro px-5 py-3 font-semibold">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0 hover:bg-track">
                  <td className="px-5 py-3">
                    <Link href={`/users/${u.id}`} className="flex items-center gap-3">
                      <Avatar name={nameOf(u)} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{nameOf(u)}</span>
                        {u.full_name && u.email ? (
                          <span className="block truncate text-xs text-muted">{u.email}</span>
                        ) : null}
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex flex-wrap gap-1">
                      {u.is_admin ? <Badge tone="blue">admin</Badge> : null}
                      {u.email_confirmed_at ? <Badge tone="green">confirmed</Badge> : <Badge tone="amber">unconfirmed</Badge>}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular">{nf.format(u.business_count)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted">{formatDate(u.created_at)}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-muted">{formatAgo(u.last_sign_in_at, now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {query.trim() ? `Nobody matches “${query.trim()}”.` : 'No users in this view.'}
          </p>
        ) : null}
      </Card>
      <p className="text-xs text-muted">
        Showing {shown.length} of {users.length}
      </p>
    </div>
  );
}
