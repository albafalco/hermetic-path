'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { STEPS } from '@/lib/data/steps';
import type { StepProgress, DailyLog, Practice, PracticeUnlock } from '@/types';
import { trackColor, getEffectivePractices, type EffectivePractice } from '@/lib/utils';

function hasNextInGroup(practice: Practice): boolean {
  if (!practice.sequentialGroup) return false;
  for (const step of STEPS) {
    for (const track of step.tracks) {
      const group = track.practices.filter(p => p.sequentialGroup === practice.sequentialGroup);
      const sorted = [...group].sort((a, b) => (a.sequentialOrder ?? 0) - (b.sequentialOrder ?? 0));
      const idx = sorted.findIndex(p => p.key === practice.key);
      if (idx !== -1 && idx < sorted.length - 1) return true;
    }
  }
  return false;
}

function MeditationTimer({ practice, onComplete }: { practice: EffectivePractice; onComplete: (durationSec: number) => void }) {
  const t = useTranslations('practice');
  const [totalSeconds, setTotalSeconds] = useState(practice.durationMin > 0 ? practice.durationMin * 60 : 600);
  const [remaining, setRemaining] = useState(practice.durationMin > 0 ? practice.durationMin * 60 : 600);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const durations = [5, 10, 15, 20, 30].filter(d =>
    d >= practice.durationMin && (practice.durationMax === 0 || d <= practice.durationMax)
  );
  if (durations.length === 0) durations.push(practice.durationMin || 10);

  function unlockAudio() {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    } catch {}
  }

  function playBell() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2.5);
      osc2.frequency.setValueAtTime(792, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(396, ctx.currentTime + 2);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 4);
      osc2.stop(ctx.currentTime + 4);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {}
  }

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current + elapsedRef.current;
    const rem = Math.max(0, totalSeconds - Math.floor(elapsed / 1000));
    setRemaining(rem);
    if (rem === 0) {
      setRunning(false);
      setFinished(true);
      playBell();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(tick, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        elapsedRef.current += Date.now() - startTimeRef.current;
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  function handleStart() {
    unlockAudio();
    setRunning(true);
  }

  function handlePause() { setRunning(false); }

  function handleReset() {
    setRunning(false);
    setFinished(false);
    elapsedRef.current = 0;
    setRemaining(totalSeconds);
  }

  function handleDurationChange(mins: number) {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    elapsedRef.current = 0;
    setRunning(false);
    setFinished(false);
  }

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="8"/>
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={finished ? 'var(--body-track)' : 'var(--gold-primary)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.25s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-cinzel text-4xl" style={{ color: finished ? 'var(--body-track)' : 'var(--text-primary)' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          {finished && (
            <span className="font-crimson text-sm mt-1" style={{ color: 'var(--body-track)' }}>
              {t('completed')}
            </span>
          )}
        </div>
      </div>

      {!running && !finished && (
        <div className="flex gap-2 flex-wrap justify-center">
          {durations.map(d => (
            <button key={d} onClick={() => handleDurationChange(d)}
              className="px-3 py-1.5 rounded font-crimson text-sm transition-all"
              style={{
                background: totalSeconds === d * 60 ? 'rgba(201,168,76,0.2)' : 'var(--bg-elevated)',
                border: `1px solid ${totalSeconds === d * 60 ? 'var(--gold-primary)' : 'var(--border)'}`,
                color: totalSeconds === d * 60 ? 'var(--gold-primary)' : 'var(--text-secondary)',
              }}>
              {t('minutes', { count: d })}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {!finished ? (
          <>
            {!running ? (
              <button onClick={handleStart}
                className="px-8 py-3 rounded-lg font-cinzel transition-all"
                style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)' }}>
                {t('start')}
              </button>
            ) : (
              <button onClick={handlePause}
                className="px-8 py-3 rounded-lg font-cinzel transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                {t('pause')}
              </button>
            )}
            <button onClick={handleReset}
              className="px-4 py-3 rounded-lg font-crimson transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              {t('reset')}
            </button>
          </>
        ) : (
          <button onClick={() => onComplete(totalSeconds)}
            className="px-8 py-3 rounded-lg font-cinzel transition-all"
            style={{ background: 'linear-gradient(135deg, var(--body-track), #5a9c56)', color: 'white' }}>
            {t('markDone')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  void locale;

  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [practiceUnlocks, setPracticeUnlocks] = useState<PracticeUnlock[]>([]);
  const [selectedPractice, setSelectedPractice] = useState<EffectivePractice | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const [progressRes, logsRes, unlocksRes] = await Promise.all([
      supabase.from('step_progress').select('*').eq('user_id', user.id),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today),
      supabase.from('practice_unlocks').select('*').eq('user_id', user.id),
    ]);
    setStepProgress(progressRes.data || []);
    setTodayLogs(logsRes.data || []);
    setPracticeUnlocks(unlocksRes.data || []);
    setLoading(false);
  }

  async function markComplete(practice: EffectivePractice, durationSec: number) {
    if (saving) return;
    setSaving(true);
    setSaveError('');

    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setSaveError('Nincs bejelentkezve. Kérjük, lépj be újra.');
        setSaving(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const activeStep = stepProgress.find(p => p.status === 'active');
      const stepNumber = activeStep?.step_number ?? 1;
      const currentStep = STEPS.find(s => s.number === stepNumber);
      const trackObj = currentStep?.tracks.find(tr => tr.practices.some(p => p.key === practice.key));
      const track = trackObj?.track ?? 'spirit';

      const { error } = await supabase.from('daily_logs').upsert(
        {
          user_id: user.id,
          log_date: today,
          step_number: stepNumber,
          track,
          practice_key: practice.logKey,
          completed: true,
          duration_sec: durationSec,
        },
        { onConflict: 'user_id,log_date,practice_key' }
      );

      if (error) {
        setSaveError(`Mentési hiba: ${error.message}`);
        setSaving(false);
        return;
      }

      setSaved(practice.logKey);
      setSelectedPractice(null);
      setTimeout(() => setSaved(''), 3000);
      await loadData();
    } catch (err) {
      setSaveError(`Váratlan hiba: ${err}`);
    } finally {
      setSaving(false);
    }
  }

  async function unlockNextPractice(practice: EffectivePractice) {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setSaveError('Nincs bejelentkezve.');
        setSaving(false);
        return;
      }
      const { error } = await supabase.from('practice_unlocks').upsert(
        { user_id: user.id, practice_key: practice.key },
        { onConflict: 'user_id,practice_key' }
      );
      if (error) {
        setSaveError(`Hiba: ${error.message}`);
        setSaving(false);
        return;
      }
      setSelectedPractice(null);
      await loadData();
    } catch (err) {
      setSaveError(`Váratlan hiba: ${err}`);
    } finally {
      setSaving(false);
    }
  }

  const activeStep = stepProgress.find(p => p.status === 'active');
  const currentStep = STEPS.find(s => s.number === (activeStep?.step_number ?? 1));
  const unlockedKeys = new Set(practiceUnlocks.map(u => u.practice_key));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (selectedPractice) {
    const showNextBtn = hasNextInGroup(selectedPractice);
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <button onClick={() => setSelectedPractice(null)}
          className="flex items-center gap-2 mb-6 font-crimson text-sm"
          style={{ color: 'var(--text-secondary)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t('common.back')}
        </button>

        {saveError && (
          <div className="mb-4 p-3 rounded-lg font-crimson text-sm"
            style={{ background: 'rgba(232,93,58,0.1)', color: 'var(--fire)', border: '1px solid rgba(232,93,58,0.3)' }}>
            {saveError}
          </div>
        )}

        <div className="card-glass p-6 mb-6">
          <h2 className="font-cinzel text-xl mb-1" style={{ color: 'var(--gold-primary)' }}>
            {t(`practices.${selectedPractice.key}.title`)}
          </h2>
          {selectedPractice.session && (
            <p className="font-crimson text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              {selectedPractice.session === 'morning' ? '☀ Reggeli alkalom' : '☽ Esti alkalom'}
            </p>
          )}
          <p className="font-crimson leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t(`practices.${selectedPractice.key}.description`)}
          </p>
        </div>

        {selectedPractice.timerRequired ? (
          <div className="card-glass p-8 flex justify-center">
            <MeditationTimer
              practice={selectedPractice}
              onComplete={(secs) => markComplete(selectedPractice, secs)}
            />
          </div>
        ) : (
          <div className="card-glass p-6 text-center">
            <p className="font-crimson mb-6" style={{ color: 'var(--text-secondary)' }}>
              Elvégezted ezt a gyakorlatot?
            </p>
            <button
              onClick={() => markComplete(selectedPractice, 0)}
              disabled={saving}
              className="px-8 py-3 rounded-lg font-cinzel"
              style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Mentés...' : t('practice.markDone')}
            </button>
          </div>
        )}

        {showNextBtn && (
          <div className="mt-6 card-glass p-5 text-center" style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
            <p className="font-crimson text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Ha ez a gyakorlat már stabilan megy a napi munkában, léphetsz tovább a következő szintre.
            </p>
            <button
              onClick={() => unlockNextPractice(selectedPractice)}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-cinzel text-sm transition-all"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', opacity: saving ? 0.6 : 1 }}>
              Továbblépek a következő szakaszhoz →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>{t('practice.title')}</h1>
        {currentStep && (
          <p className="mt-2 font-crimson" style={{ color: 'var(--text-secondary)' }}>
            {t('steps.step', { number: activeStep?.step_number ?? 1 })}
          </p>
        )}
      </div>

      {saved && (
        <div className="mb-4 p-3 rounded-lg font-crimson text-sm"
          style={{ background: 'rgba(126,184,122,0.1)', color: 'var(--body-track)', border: '1px solid rgba(126,184,122,0.3)' }}>
          ✓ {t('practice.sessionSaved')}
        </div>
      )}

      {currentStep ? (
        <div className="space-y-8">
          {currentStep.tracks.map(trackObj => {
            const effective = getEffectivePractices(trackObj.practices, unlockedKeys);
            return (
              <div key={trackObj.track}>
                <h2 className="font-cinzel text-lg mb-4" style={{ color: trackColor(trackObj.track) }}>
                  {t(`steps.tracks.${trackObj.track}`)}
                </h2>
                <div className="space-y-3">
                  {effective.map(practice => {
                    const done = todayLogs.some(l => l.practice_key === practice.logKey && l.completed);
                    return (
                      <div key={practice.logKey}
                        className="card-glass p-5 transition-all"
                        style={{
                          borderColor: done ? trackColor(trackObj.track) + '40' : 'var(--border)',
                          opacity: done ? 0.7 : 1,
                          cursor: done ? 'default' : 'pointer',
                        }}
                        onClick={() => !done && setSelectedPractice(practice)}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                borderColor: done ? trackColor(trackObj.track) : 'var(--border)',
                                background: done ? trackColor(trackObj.track) + '20' : 'transparent',
                              }}>
                              {done && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"
                                  style={{ color: trackColor(trackObj.track) }}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="font-cinzel text-sm" style={{ color: done ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                                {t(`practices.${practice.key}.title`)}
                                {practice.session === 'morning' && <span className="ml-2 font-crimson text-xs" style={{ color: 'var(--text-muted)' }}>☀ reggel</span>}
                                {practice.session === 'evening' && <span className="ml-2 font-crimson text-xs" style={{ color: 'var(--text-muted)' }}>☽ este</span>}
                              </h3>
                              <p className="font-crimson text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                {practice.durationMin > 0 && `${practice.durationMin}${practice.durationMax > practice.durationMin ? `–${practice.durationMax}` : ''} perc`}
                                {practice.timerRequired && ' · ⏱'}
                              </p>
                            </div>
                          </div>
                          {!done && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0"
                              style={{ color: 'var(--text-muted)' }}>
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-glass p-12 text-center">
          <p className="font-crimson text-lg" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.noActivePractice')}
          </p>
        </div>
      )}
    </div>
  );
}
