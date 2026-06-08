'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/${locale}/dashboard`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto mb-4" fill="none">
            <polygon points="30,5 56,50 4,50" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
            <circle cx="30" cy="30" r="12" stroke="#c9a84c" strokeWidth="1" fill="none"/>
            <line x1="30" y1="5" x2="30" y2="55" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5"/>
            <line x1="4" y1="50" x2="56" y2="50" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5"/>
          </svg>
          <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>Hermetic Path</h1>
          <p className="text-sm mt-2 font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('auth.tagline')}</p>
        </div>

        <div className="card-glass p-8">
          <h2 className="text-xl font-cinzel mb-6 text-center" style={{ color: 'var(--text-primary)' }}>{t('auth.register')}</h2>

          {error && (
            <div className="mb-4 p-3 rounded text-sm" style={{ background: 'rgba(232, 93, 58, 0.1)', color: 'var(--fire)', border: '1px solid rgba(232, 93, 58, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-all font-crimson"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all font-crimson"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-cinzel font-semibold transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)' }}
            >
              {loading ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm font-crimson" style={{ color: 'var(--text-secondary)' }}>
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} style={{ color: 'var(--gold-primary)' }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
