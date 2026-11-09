'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview' },
  { href: '/users', label: 'Users' },
] as const;

/** The links themselves; `pathname` is null in the prerendered shell. */
export function NavLinks({ pathname = null }: { pathname?: string | null }) {
  return (
    <nav aria-label="Main" className="flex gap-1 md:flex-col">
      {links.map((link) => {
        const active =
          pathname !== null && (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              active ? 'bg-ink text-paper' : 'text-muted hover:bg-track hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Highlights the current section. Render inside <Suspense fallback={<NavLinks />}>. */
export function Nav() {
  return <NavLinks pathname={usePathname()} />;
}
