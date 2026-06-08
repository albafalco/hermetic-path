'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { DailyLog, StepProgress } from '@/types';
import { trackColor } from '@/lib/utils';

function ProgressRing({ value, max, color, label, size = 80 }: { value: number; max: number; color: string; label: string; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const strokeDash = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: color, fontSize: size * 0.22, fontFamily: 'Cinzel, serif' }}>
          {value}
        </text>
      </svg>
      <span className="font-crimson text-xs text-center" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

function HeatmapCalendar({ logs }: { logs: DailyLog[] }) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = logs.filter(l => l.log_date === dateStr && l.completed).length;
    days.push({ date: dateStr, count });
  }

  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <div className="flex flex-wrap gap-1">
      {days.map(d => {
        const intensity = d.count > 0 ? Math.ceil((d.count / maxCount) * 4) : 0;
        const alpha = intensity === 0 ? 0.08 : intensity * 0.25;
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} gyakorlat`}
            className="w-3 h-3 rounded-sm"
            style={{ background: d.count > 0 ? `rgba(201, 168, 76, ${alpha})` : 'rgba(255,255,255,0.04)' }}
          />
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const t = useTranslations('progress');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [logsRes, progressRes] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('completed', true).order('log_date', { ascending: false }),
      supabase.from('step_progress').select('*').eq('user_id', user.id),
    ]);

    const allLogs = logsRes.data || [];
    setLogs(allLogs);
    setStepProgress(progressRes.data || []);

    // Calculate streaks
    const uniqueDates = [...new Set(allLogs.map((l: DailyLog) => l.log_date))].sort().reverse() as string[];
    let cur = 0;
    let longest = 0;
    const now = new Date();

    for (let i = 0; i < uniqueDates.length; i++) {
      const d = new Date(uniqueDates[i]);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === i) cur++;
      else break;
    }
    setStreak(cur);

    // Longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      let len = 1;
      while (i + len < uniqueDates.length) {
        const a = new Date(uniqueDates[i + len - 1]);
        const b = new Date(uniqueDates[i + len]);
        const diff = Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) len++;
        else break;
      }
      if (len > longest) longest = len;
      i += len - 1;
    }
    setLongestStreak(longest);
    setLoading(false);
  }

  const totalSessions = logs.length;
  const totalMinutes = Math.floor(logs.reduce((sum, l) => sum + (l.duration_sec || 0), 0) / 60);
  const completedSteps = stepProgress.filter(p => p.status === 'complete').length;
  const activeStep = stepProgress.find(p => p.status === 'active');

  const spiritLogs = logs.filter(l => l.track === 'spirit');
  const soulLogs = logs.filter(l => l.track === 'soul');
  const bodyLogs = logs.filter(l => l.track === 'body');

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>Betöltés...</div></div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-cinzel mb-8" style={{ color: 'var(--gold-primary)' }}>{t('title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glass p-5 text-center">
          <div className="text-3xl font-cinzel mb-1" style={{ color: 'var(--gold-primary)' }}>{completedSteps}</div>
          <div className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>/ 10 {t('overallProgress')}</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="text-3xl font-cinzel mb-1" style={{ color: 'var(--spirit)' }}>{longestStreak}</div>
          <div className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>{t('longestStreak')}</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="text-3xl font-cinzel mb-1" style={{ color: 'var(--soul)' }}>{totalSessions}</div>
          <div className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>{t('totalSessions')}</div>
        </div>
        <div className="card-glass p-5 text-center">
          <div className="text-3xl font-cinzel mb-1" style={{ color: 'var(--body-track)' }}>{totalMinutes}</div>
          <div className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>{t('totalMinutes')}</div>
        </div>
      </div>

      {/* Track progress rings */}
      <div className="card-glass p-6 mb-6">
        <h2 className="font-cinzel text-lg mb-6" style={{ color: 'var(--text-primary)' }}>{t('overallProgress')}</h2>
        <div className="flex justify-around">
          <ProgressRing value={spiritLogs.length} max={Math.max(spiritLogs.length, 100)} color="var(--spirit)" label={t('spiritTrack')} size={100} />
          <ProgressRing value={soulLogs.length} max={Math.max(soulLogs.length, 100)} color="var(--soul)" label={t('soulTrack')} size={100} />
          <ProgressRing value={bodyLogs.length} max={Math.max(bodyLogs.length, 100)} color="var(--body-track)" label={t('bodyTrack')} size={100} />
        </div>
      </div>

      {/* Current streak */}
      {streak > 0 && (
        <div className="card-glass p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-cinzel text-xl"
            style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid var(--gold-primary)', color: 'var(--gold-primary)' }}>
            {streak}
          </div>
          <div>
            <p className="font-cinzel" style={{ color: 'var(--gold-primary)' }}>{streak} {t('days', { count: '' }).replace('  ', '')}</p>
            <p className="font-crimson text-sm" style={{ color: 'var(--text-secondary)' }}>Aktív sorozat</p>
          </div>
        </div>
      )}

      {/* Step progress */}
      <div className="card-glass p-6 mb-6">
        <h2 className="font-cinzel text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Fokozatok</h2>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
            const prog = stepProgress.find(p => p.step_number === n);
            const status = prog?.status || 'locked';
            return (
              <div key={n} className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel text-sm"
                style={{
                  background: status === 'complete' ? 'rgba(126,184,122,0.2)' : status === 'active' ? 'rgba(201,168,76,0.15)' : 'var(--bg-elevated)',
                  border: `2px solid ${status === 'complete' ? 'var(--body-track)' : status === 'active' ? 'var(--gold-primary)' : 'var(--border)'}`,
                  color: status === 'complete' ? 'var(--body-track)' : status === 'active' ? 'var(--gold-primary)' : 'var(--text-muted)',
                }}>
                {status === 'complete' ? '✓' : n}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="card-glass p-6">
        <h2 className="font-cinzel text-lg mb-4" style={{ color: 'var(--text-primary)' }}>{t('activityTitle')}</h2>
        <HeatmapCalendar logs={logs} />
        <p className="text-xs font-crimson mt-3" style={{ color: 'var(--text-muted)' }}>Az elmúlt 90 nap</p>
      </div>
    </div>
  );
}
