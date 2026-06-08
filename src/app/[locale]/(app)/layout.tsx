'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

const HermeticLogo = () => (
  <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
    <polygon points="30,5 56,50 4,50" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
    <circle cx="30" cy="30" r="12" stroke="#c9a84c" strokeWidth="1" fill="none"/>
  </svg>
);

const NavItem = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    href={href}
    className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all md:flex-row md:gap-3 md:px-4 md:py-3 md:w-full"
    style={{
      color: active ? 'var(--gold-primary)' : 'var(--text-secondary)',
      background: active ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
    }}
  >
    <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
    <span className="text-xs md:text-sm font-crimson">{label}</span>
  </Link>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(`/${locale}/auth/login`);
      } else {
        setLoading(false);
      }
    });
  }, [locale, router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/auth/login`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <HermeticLogo />
          <p className="mt-4 font-crimson" style={{ color: 'var(--text-secondary)' }}>Betöltés...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', path: `/${locale}/dashboard`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { key: 'steps', path: `/${locale}/steps`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/></svg> },
    { key: 'practice', path: `/${locale}/practice`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg> },
    { key: 'journal', path: `/${locale}/journal`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { key: 'mirror', path: `/${locale}/mirror`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M12 6v6l4 4"/></svg> },
    { key: 'progress', path: `/${locale}/progress`, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-6 flex items-center gap-3">
          <HermeticLogo />
          <span className="font-cinzel text-lg" style={{ color: 'var(--gold-primary)' }}>Hermetic Path</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <NavItem
              key={item.key}
              href={item.path}
              icon={item.icon}
              label={t(item.key as keyof typeof t)}
              active={pathname.startsWith(item.path)}
            />
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-crimson text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {tAuth('logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Bottom nav - Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around px-2 py-3 border-t z-50"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          {navItems.map(item => (
            <NavItem
              key={item.key}
              href={item.path}
              icon={item.icon}
              label={t(item.key as keyof typeof t)}
              active={pathname.startsWith(item.path)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
