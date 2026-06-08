'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { STEPS } from '@/lib/data/steps';
import { trackColor } from '@/lib/utils';
import type { Track } from '@/types';

export default function StepDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const stepNumber = parseInt(params.step as string);
  const [activeTrack, setActiveTrack] = useState<Track>('spirit');

  const step = STEPS.find(s => s.number === stepNumber);
  if (!step) return <div className="p-8 font-crimson" style={{ color: 'var(--text-secondary)' }}>Step not found</div>;

  const currentTrack = step.tracks.find(t => t.track === activeTrack) || step.tracks[0];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link href={`/${locale}/steps`} className="flex items-center gap-2 mb-6 font-crimson text-sm"
        style={{ color: 'var(--text-secondary)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {t('steps.backToSteps')}
      </Link>

      {/* Header */}
      <div className="card-glass p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-cinzel text-2xl"
            style={{ background: 'rgba(201, 168, 76, 0.15)', border: '2px solid var(--gold-primary)', color: 'var(--gold-primary)' }}>
            {stepNumber}
          </div>
          <div>
            <h1 className="font-cinzel text-2xl" style={{ color: 'var(--gold-primary)' }}>
              {t('steps.step', { number: stepNumber })}
            </h1>
            <p className="font-crimson text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('steps.duration')}: {step.duration}
            </p>
          </div>
        </div>
        <p className="font-crimson" style={{ color: 'var(--text-primary)' }}>
          {t(`steps_data.s${stepNumber}.overview`)}
        </p>
      </div>

      {/* Track tabs */}
      <div className="flex gap-2 mb-6">
        {step.tracks.map(track => (
          <button
            key={track.track}
            onClick={() => setActiveTrack(track.track)}
            className="flex-1 py-3 rounded-lg font-cinzel text-sm transition-all"
            style={{
              background: activeTrack === track.track ? trackColor(track.track) + '20' : 'var(--bg-card)',
              border: `1px solid ${activeTrack === track.track ? trackColor(track.track) : 'var(--border)'}`,
              color: activeTrack === track.track ? trackColor(track.track) : 'var(--text-secondary)',
            }}>
            {t(`steps.tracks.${track.track}`)}
          </button>
        ))}
      </div>

      {/* Track content */}
      {currentTrack && (
        <div className="space-y-6">
          <div className="card-glass p-6">
            <h2 className="font-cinzel text-xl mb-2" style={{ color: trackColor(currentTrack.track) }}>
              {t(`steps_data.s${stepNumber}.${currentTrack.track}_title`)}
            </h2>
            <p className="font-crimson mb-4" style={{ color: 'var(--text-primary)' }}>
              {t(`steps_data.s${stepNumber}.${currentTrack.track}_summary`)}
            </p>

            {/* Mastery note */}
            <div className="p-4 rounded-lg mt-4" style={{ background: 'rgba(201, 168, 76, 0.07)', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
              <p className="font-cinzel text-xs mb-1" style={{ color: 'var(--gold-dim)' }}>{t('steps.masteryNote')}</p>
              <p className="font-crimson text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t(`steps_data.s${stepNumber}.${currentTrack.track}_mastery`)}
              </p>
            </div>
          </div>

          {/* Practices */}
          <div>
            <h3 className="font-cinzel text-lg mb-4" style={{ color: 'var(--text-primary)' }}>{t('steps.practices')}</h3>
            <div className="space-y-4">
              {currentTrack.practices.map(practice => (
                <div key={practice.key} className="card-glass p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-cinzel" style={{ color: 'var(--text-primary)' }}>
                      {t(`practices.${practice.key}.title`)}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {practice.timerRequired && (
                        <span className="text-xs px-2 py-1 rounded font-crimson"
                          style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--gold-dim)' }}>
                          ⏱
                        </span>
                      )}
                      <span className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>
                        {practice.durationMin > 0 ? `${practice.durationMin}-${practice.durationMax} perc` : '—'}
                      </span>
                    </div>
                  </div>
                  <p className="font-crimson text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t(`practices.${practice.key}.description`)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-crimson px-2 py-1 rounded"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {t(`practice.frequency.${practice.frequency}`)}
                    </span>
                    <Link href={`/${locale}/practice`}
                      className="text-xs px-3 py-1.5 rounded font-cinzel transition-all"
                      style={{ background: trackColor(currentTrack.track) + '20', color: trackColor(currentTrack.track), border: `1px solid ${trackColor(currentTrack.track)}40` }}>
                      {t('practice.start')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
