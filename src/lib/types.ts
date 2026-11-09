/** One row of `admin_list_users()` (migration 0008). */
export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  business_count: number;
  is_admin: boolean;
};

export type DayCount = { day: string; count: number };

/** `admin_overview()` (migration 0009). */
export type AdminOverview = {
  totals: {
    users: number;
    admins: number;
    businesses: number;
    expenses: number;
    income: number;
    invoices: number;
    quotations: number;
    receipts: number;
    contacts: number;
  };
  active: { day: number; week: number; month: number };
  unconfirmed: number;
  onboarded: number;
  signups: DayCount[];
  entries: DayCount[];
  business_kinds: { kind: string; count: number }[];
  currencies: { currency: string; count: number }[];
};

/** `admin_user_detail(uuid)` (migration 0009). */
export type AdminUserDetail = {
  id: string;
  email: string | null;
  phone: string | null;
  provider: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_admin: boolean;
  profile: {
    full_name: string | null;
    base_currency: string;
    fy_start_month: number;
    invoice_numbering: string;
    onboarded_at: string | null;
  } | null;
  counts: {
    businesses: number;
    expenses: number;
    income: number;
    invoices: number;
    quotations: number;
    receipts: number;
    contacts: number;
    accounts: number;
  };
  last_entry_at: string | null;
  businesses: {
    id: string;
    name: string;
    kind: string;
    currency: string;
    is_default: boolean;
    created_at: string;
    expenses: number;
    income: number;
    invoices: number;
  }[];
};
