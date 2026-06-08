'use client';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const LOCALES = [
  { code: 'hu', label: 'Magyar' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale as string;
  const [open, setOpen] = useState(false);

  function switchLocale(newLocale: string) {
    // Replace the current locale segment in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  }

  const current = LOCALES.find(l => l.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-crimson text-sm transition-all"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {current?.label}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 rounded-lg overflow-hidden z-50"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {LOCALES.map(locale => (
              <button
                key={locale.code}
                onClick={() => switchLocale(locale.code)}
                className="w-full text-left px-4 py-2 font-crimson text-sm transition-all"
                style={{
                  color: locale.code === currentLocale ? 'var(--gold-primary)' : 'var(--text-secondary)',
                  background: locale.code === currentLocale ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                }}
              >
                {locale.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
