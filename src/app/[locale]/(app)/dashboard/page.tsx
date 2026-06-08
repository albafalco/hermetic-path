'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { STEPS } from '@/lib/data/steps';
import type { StepProgress, DailyLog } from '@/types';
import { trackColor } from '@/lib/utils';

export default function DashboardPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserName(user.email?.split('@')[0] || 'Tanuló');

    const today = new Date().toISOString().split('T')[0];

    const [progressRes, logsRes] = await Promise.all([
      supabase.from('step_progress').select('*').eq('user_id', user.id),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today),
    ]);

    setStepProgress(progressRes.data || []);
    setTodayLogs(logsRes.data || []);

    // Calculate streak
    const { data: allLogs } = await supabase
      .from('daily_logs')
      .select('log_date')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('log_date', { ascending: false });

    if (allLogs && allLogs.length > 0) {
      const uniqueDates = [...new Set(allLogs.map((l: { log_date: string }) => l.log_date))].sort().reverse();
      let s = 0;
      const now = new Date();
      for (let i = 0; i < uniqueDates.length; i++) {
        const d = new Date(uniqueDates[i]);
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === i) s++;
        else break;
      }
      setStreak(s);
    }

    setLoading(false);
  }

  const activeStep = stepProgress.find(p => p.status === 'active');
  const currentStepNumber = activeStep?.step_number || 1;
  const currentStep = STEPS.find(s => s.number === currentStepNumber);

  const allPractices = currentStep?.tracks.flatMap(track => track.practices) || [];
  const completedToday = todayLogs.filter(l => l.completed).length;
  const totalPractices = allPractices.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="font-crimson text-lg" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.greeting')},</p>
        <h1 className="text-3xl font-cinzel mt-1" style={{ color: 'var(--gold-primary)' }}>{userName}</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>{currentStepNumber}</div>
          <div className="text-xs font-crimson mt-1" style={{ color: 'var(--text-muted)' }}>{t('steps.step', { number: '' }).replace('  ', '')}</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-cinzel" style={{ color: 'var(--spirit)' }}>{streak}</div>
          <div className="text-xs font-crimson mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.streak', { count: '' }).replace('  ', '').trim()}</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-cinzel" style={{ color: 'var(--soul)' }}>{completedToday}</div>
          <div className="text-xs font-crimson mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.completed', { done: '', total: '' }).replace(/\//g, '').trim()}</div>
        </div>
        <div className="card-glass p-4 text-center">
          <div className="text-2xl font-cinzel" style={{ color: 'var(--body-track)' }}>{totalPractices}</div>
          <div className="text-xs font-crimson mt-1" style={{ color: 'var(--text-muted)' }}>{t('steps.practices')}</div>
        </div>
      </div>

      {/* Today's practice */}
      <div className="card-glass p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel text-lg" style={{ color: 'var(--text-primary)' }}>{t('dashboard.todayTitle')}</h2>
          <span className="text-sm font-crimson" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.completed', { done: completedToday, total: totalPractices })}
          </span>
        </div>

        {currentStep ? (
          <div className="space-y-3">
            {currentStep.tracks.map(track => (
              <div key={track.track}>
                <div className="text-xs font-cinzel mb-2" style={{ color: trackColor(track.track) }}>
                  {t(`steps.tracks.${track.track}`)}
                </div>
                <div className="space-y-2">
                  {track.practices.map(practice => {
                    const done = todayLogs.some(l => l.practice_key === practice.key && l.completed);
                    return (
                      <div key={practice.key}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: 'var(--bg-elevated)', border: `1px solid ${done ? trackColor(track.track) + '40' : 'var(--border)'}` }}>
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: done ? trackColor(track.track) : 'var(--border)', background: done ? trackColor(track.track) + '20' : 'transparent' }}>
                          {done && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" style={{ color: trackColor(track.track) }}><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <span className="font-crimson text-sm" style={{ color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                          {t(`practices.${practice.key}.title`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.noActivePractice')}</p>
            <Link href={`/${locale}/steps`} className="inline-block mt-4 px-6 py-2 rounded-lg font-cinzel text-sm"
              style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)' }}>
              {t('dashboard.startPractice')}
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href={`/${locale}/practice`} className="card-glass p-5 flex flex-col items-center gap-3 text-center transition-all gold-border-hover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: 'var(--gold-primary)' }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{t('nav.practice')}</span>
        </Link>

        <Link href={`/${locale}/journal`} className="card-glass p-5 flex flex-col items-center gap-3 text-center transition-all gold-border-hover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: 'var(--spirit)' }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{t('dashboard.writeJournal')}</span>
        </Link>

        <Link href={`/${locale}/mirror`} className="card-glass p-5 flex flex-col items-center gap-3 text-center transition-all gold-border-hover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: 'var(--soul)' }}>
            <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
          </svg>
          <span className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{t('dashboard.openMirror')}</span>
        </Link>

        <Link href={`/${locale}/progress`} className="card-glass p-5 flex flex-col items-center gap-3 text-center transition-all gold-border-hover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: 'var(--body-track)' }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{t('dashboard.viewProgress')}</span>
        </Link>

        <Link href={`/${locale}/steps`} className="card-glass p-5 flex flex-col items-center gap-3 text-center transition-all gold-border-hover col-span-2 md:col-span-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8" style={{ color: 'var(--gold-dim)' }}>
            <circle cx="12" cy="12" r="9"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="font-cinzel text-sm" style={{ color: 'var(--text-primary)' }}>{t('nav.steps')}</span>
        </Link>
      </div>
    </div>
  );
}
