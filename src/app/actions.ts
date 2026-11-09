'use server';

import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/dal';

export type FormState = { error?: string } | undefined;

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function setAdmin(userId: string, makeAdmin: boolean): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc('admin_set_admin', { p_user_id: userId, p_admin: makeAdmin });
  if (error) return { error: error.message };
  refresh();
  return undefined;
}
