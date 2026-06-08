'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { STEPS } from '@/lib/data/steps';
import type { StepProgress } from '@/types';
import { trackColor } from '@/lib/utils';

export default function StepsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('step_progress').select('*').eq('user_id', user.id);
    setStepProgress(data || []);
    setLoading(false);
  }

  async function activateStep(stepNumber: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already exists
    const existing = stepProgress.find(p => p.step_number === stepNumber);
    if (existing) return;

    await supabase.from('step_progress').insert({
      user_id: user.id,
      step_number: stepNumber,
      track: 'spirit',
      status: 'active',
      started_at: new Date().toISOString(),
    });
    loadProgress();
  }

  function getStepStatus(stepNumber: number): 'locked' | 'active' | 'complete' {
    const prog = stepProgress.find(p => p.step_number === stepNumber);
    if (!prog) {
      // First step is always available
      if (stepNumber === 1) return 'active';
      // Previous step must be complete
      const prevComplete = stepProgress.find(p => p.step_number === stepNumber - 1 && p.status === 'complete');
      return prevComplete ? 'active' : 'locked';
    }
    return prog.status as 'locked' | 'active' | 'complete';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>{t('steps.title')}</h1>
        <p className="mt-2 font-crimson" style={{ color: 'var(--text-secondary)' }}>Franz Bardon: Bevezetés a hermetikába</p>
      </div>

      <div className="space-y-4">
        {STEPS.map(step => {
          const status = getStepStatus(step.number);
          const isLocked = status === 'locked';
          const isActive = status === 'active';
          const isComplete = status === 'complete';

          return (
            <div key={step.number}
              className="card-glass p-6 transition-all"
              style={{
                opacity: isLocked ? 0.5 : 1,
                borderColor: isActive ? 'var(--gold-dim)' : isComplete ? 'rgba(126, 184, 122, 0.3)' : 'var(--border)',
              }}>
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-cinzel text-lg"
                  style={{
                    background: isComplete ? 'rgba(126, 184, 122, 0.2)' : isActive ? 'rgba(201, 168, 76, 0.15)' : 'var(--bg-elevated)',
                    border: `2px solid ${isComplete ? 'var(--body-track)' : isActive ? 'var(--gold-primary)' : 'var(--border)'}`,
                    color: isComplete ? 'var(--body-track)' : isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
                  }}>
                  {isComplete ? '✓' : step.number}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-cinzel text-lg" style={{ color: isActive ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
                      {t('steps.step', { number: step.number })}
                    </h2>
                    <span className="text-xs px-2 py-1 rounded font-crimson"
                      style={{
                        background: isComplete ? 'rgba(126, 184, 122, 0.15)' : isActive ? 'rgba(201, 168, 76, 0.1)' : 'var(--bg-elevated)',
                        color: isComplete ? 'var(--body-track)' : isActive ? 'var(--gold-primary)' : 'var(--text-muted)',
                      }}>
                      {isLocked ? t('steps.locked') : isActive ? t('steps.active') : t('steps.complete')}
                    </span>
                  </div>

                  <p className="font-crimson text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {t(`steps_data.s${step.number}.overview`)}
                  </p>

                  {/* Tracks */}
                  <div className="flex gap-2 mb-3">
                    {step.tracks.map(track => (
                      <span key={track.track} className="text-xs px-2 py-1 rounded font-crimson"
                        style={{ background: trackColor(track.track) + '20', color: trackColor(track.track) }}>
                        {t(`steps.tracks.${track.track}`)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>
                      {t('steps.duration')}: {step.duration}
                    </span>
                    {!isLocked && (
                      <Link
                        href={`/${locale}/steps/${step.number}`}
                        className="text-xs px-4 py-2 rounded-lg font-cinzel transition-all"
                        style={{ background: isActive ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))' : 'var(--bg-elevated)', color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)' }}>
                        {t('common.next')}
                      </Link>
                    )}
                    {isLocked && step.number === 1 && (
                      <button
                        onClick={() => activateStep(step.number)}
                        className="text-xs px-4 py-2 rounded-lg font-cinzel"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        Aktiválás
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
