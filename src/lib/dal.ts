import 'server-only';
import { cache } from 'react';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createClient } from './supabase/server';
import type { AdminOverview, AdminUser, AdminUserDetail } from './types';

/**
 * Data access layer. Every read checks the session here, and the database
 * checks public.admins again inside each RPC — the anon key alone gets nothing.
 */

export type Viewer = { id: string; email: string | null; isAdmin: boolean };

export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login');

  const { data: isAdmin } = await supabase.rpc('is_admin');
  return { id: data.user.id, email: data.user.email ?? null, isAdmin: isAdmin === true };
});

/** Signed-out visitors go to /login, signed-in non-admins to /no-access. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer.isAdmin) redirect('/no-access');
  return viewer;
}

/** Turns a missing-function error into a hint to run the migration. */
function explain(error: { message: string; code?: string }, fn: string): Error {
  if (error.code === 'PGRST202' || /could not find the function/i.test(error.message)) {
    return new Error(
      `The database function ${fn}() is missing. Run supabase/migrations/0009_admin_dashboard.sql in the Supabase SQL Editor.`,
    );
  }
  return new Error(error.message);
}

export async function listUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_list_users');
  if (error) throw explain(error, 'admin_list_users');
  return (data ?? []) as AdminUser[];
}

/** The list plus the moment it was read, so "active / seen 3d ago" agree across server and client. */
export async function listUsersSnapshot(): Promise<{ users: AdminUser[]; now: number }> {
  const users = await listUsers();
  return { users, now: Date.now() };
}

export async function getOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_overview');
  if (error) throw explain(error, 'admin_overview');
  return data as AdminOverview;
}

export async function getUserDetail(id: string): Promise<AdminUserDetail | null> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('admin_user_detail', { p_user_id: id });
  if (error) throw explain(error, 'admin_user_detail');
  return (data ?? null) as AdminUserDetail | null;
}

/**
 * Runs a read and hands back either its data or the error, so a page can show
 * an error card in place. Next's own redirects and not-found are re-thrown.
 */
export async function attempt<T>(promise: Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, data: await promise };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, error };
  }
}
