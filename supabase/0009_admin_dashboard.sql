-- Ledger — web admin dashboard (admin-web/)
--
-- Read-only views across every account, plus granting and revoking admin.
-- Each function is security definer and refuses any caller not in
-- public.admins, the same gate as admin_list_users() in 0008.
--
-- Money is left out on purpose: every user keeps books in their own base
-- currency, so a platform-wide sum would add rupees to dollars. The dashboard
-- reports counts and activity instead.
--
-- Safe to run more than once.

-- ------------------------------------------------------------ overview

create or replace function public.admin_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can read the overview.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'totals', jsonb_build_object(
      'users',       (select count(*) from auth.users),
      'admins',      (select count(*) from public.admins),
      'businesses',  (select count(*) from public.businesses),
      'expenses',    (select count(*) from public.expenses),
      'income',      (select count(*) from public.income),
      'invoices',    (select count(*) from public.invoices),
      'quotations',  (select count(*) from public.quotations),
      'receipts',    (select count(*) from public.receipts),
      'contacts',    (select count(*) from public.contacts)
    ),
    'active', jsonb_build_object(
      'day',   (select count(*) from auth.users where last_sign_in_at > now() - interval '1 day'),
      'week',  (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
      'month', (select count(*) from auth.users where last_sign_in_at > now() - interval '30 days')
    ),
    'unconfirmed', (select count(*) from auth.users where email_confirmed_at is null),
    'onboarded',   (select count(*) from public.profiles where onboarded_at is not null),
    -- One row per day for the last 30 days, zero-filled, oldest first.
    'signups', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'count', d.n) order by d.day), '[]'::jsonb)
      from (
        select g.day::date as day,
               (select count(*) from auth.users u
                 where u.created_at >= g.day and u.created_at < g.day + interval '1 day') as n
        from generate_series(current_date - 29, current_date, interval '1 day') as g(day)
      ) d
    ),
    -- Entries written per day (expenses + income) for the same window.
    'entries', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'count', d.n) order by d.day), '[]'::jsonb)
      from (
        select g.day::date as day,
               (select count(*) from public.expenses e
                 where e.created_at >= g.day and e.created_at < g.day + interval '1 day')
             + (select count(*) from public.income i
                 where i.created_at >= g.day and i.created_at < g.day + interval '1 day') as n
        from generate_series(current_date - 29, current_date, interval '1 day') as g(day)
      ) d
    ),
    'business_kinds', (
      select coalesce(jsonb_agg(jsonb_build_object('kind', k.kind, 'count', k.n) order by k.n desc), '[]'::jsonb)
      from (select kind::text as kind, count(*) as n from public.businesses group by kind) k
    ),
    'currencies', (
      select coalesce(jsonb_agg(jsonb_build_object('currency', c.currency, 'count', c.n) order by c.n desc), '[]'::jsonb)
      from (select base_currency as currency, count(*) as n from public.profiles group by base_currency) c
    )
  ) into result;

  return result;
end;
$$;

-- ------------------------------------------------------------ one user

create or replace function public.admin_user_detail(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can read a user.' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id',                 u.id,
    'email',              u.email,
    'phone',              u.phone,
    'provider',           u.raw_app_meta_data ->> 'provider',
    'created_at',         u.created_at,
    'last_sign_in_at',    u.last_sign_in_at,
    'email_confirmed_at', u.email_confirmed_at,
    'is_admin',           exists (select 1 from public.admins a where a.user_id = u.id),
    'profile', case when p.id is null then null else jsonb_build_object(
      'full_name',         p.full_name,
      'base_currency',     p.base_currency,
      'fy_start_month',    p.fy_start_month,
      'invoice_numbering', p.invoice_numbering,
      'onboarded_at',      p.onboarded_at
    ) end,
    'counts', jsonb_build_object(
      'businesses', (select count(*) from public.businesses b    where b.owner_id = u.id),
      'expenses',   (select count(*) from public.expenses e      where e.owner_id = u.id),
      'income',     (select count(*) from public.income i        where i.owner_id = u.id),
      'invoices',   (select count(*) from public.invoices v      where v.owner_id = u.id),
      'quotations', (select count(*) from public.quotations q    where q.owner_id = u.id),
      'receipts',   (select count(*) from public.receipts r      where r.owner_id = u.id),
      'contacts',   (select count(*) from public.contacts c      where c.owner_id = u.id),
      'accounts',   (select count(*) from public.accounts a      where a.owner_id = u.id)
    ),
    'last_entry_at', greatest(
      (select max(e.created_at) from public.expenses e where e.owner_id = u.id),
      (select max(i.created_at) from public.income i   where i.owner_id = u.id),
      (select max(v.created_at) from public.invoices v where v.owner_id = u.id)
    ),
    'businesses', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id',         b.id,
        'name',       b.name,
        'kind',       b.kind,
        'currency',   b.currency,
        'is_default', b.is_default,
        'created_at', b.created_at,
        'expenses',   (select count(*) from public.expenses e where e.business_id = b.id),
        'income',     (select count(*) from public.income i   where i.business_id = b.id),
        'invoices',   (select count(*) from public.invoices v where v.business_id = b.id)
      ) order by b.created_at), '[]'::jsonb)
      from public.businesses b
      where b.owner_id = u.id
    )
  )
  into result
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = p_user_id;

  return result; -- null when no such user
end;
$$;

-- ------------------------------------------------------------ admin access

create or replace function public.admin_set_admin(p_user_id uuid, p_admin boolean)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change admin access.' using errcode = '42501';
  end if;
  if not p_admin and p_user_id = auth.uid() then
    raise exception 'You cannot remove your own admin access.' using errcode = '42501';
  end if;

  if p_admin then
    insert into public.admins (user_id) values (p_user_id) on conflict do nothing;
  else
    delete from public.admins where user_id = p_user_id;
  end if;
end;
$$;

revoke all on function public.admin_overview()                 from public, anon;
revoke all on function public.admin_user_detail(uuid)          from public, anon;
revoke all on function public.admin_set_admin(uuid, boolean)   from public, anon;
grant execute on function public.admin_overview()               to authenticated;
grant execute on function public.admin_user_detail(uuid)        to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
