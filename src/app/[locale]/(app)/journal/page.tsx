'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { JournalEntry, Mood, Track } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

const MOODS: Mood[] = ['excellent', 'good', 'neutral', 'difficult', 'dark'];
const MOOD_ICONS: Record<Mood, string> = { excellent: '✨', good: '🌟', neutral: '○', difficult: '☁', dark: '🌑' };
const MOOD_COLORS: Record<Mood, string> = {
  excellent: 'var(--gold-primary)',
  good: 'var(--body-track)',
  neutral: 'var(--text-secondary)',
  difficult: 'var(--water)',
  dark: 'var(--text-muted)',
};

function JournalEditor({ entry, onSave, onCancel }: {
  entry?: JournalEntry | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('journal');
  const tSteps = useTranslations('steps');

  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<Mood | null>(entry?.mood || null);
  const [stepNumber, setStepNumber] = useState<number | null>(entry?.step_number || null);
  const [track, setTrack] = useState<Track | 'general' | null>(entry?.track || 'general');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    if (entry) {
      await supabase.from('journal_entries').update({
        title: title || null,
        content,
        mood,
        step_number: stepNumber,
        track,
        updated_at: new Date().toISOString(),
      }).eq('id', entry.id);
    } else {
      await supabase.from('journal_entries').insert({
        user_id: user.id,
        entry_date: today,
        title: title || null,
        content,
        mood,
        step_number: stepNumber,
        track,
      });
    }
    setSaving(false);
    onSave();
  }

  return (
    <div className="card-glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-cinzel text-lg" style={{ color: 'var(--gold-primary)' }}>
          {entry ? t('fields.content') : t('newEntry')}
        </h2>
        <button onClick={onCancel} style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder={t('fields.title')}
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-4 py-2 rounded-lg font-crimson outline-none"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />

      {/* Content */}
      <textarea
        placeholder={t('fields.content')}
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 rounded-lg font-crimson outline-none resize-none"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />

      {/* Mood */}
      <div>
        <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('fields.mood')}</label>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button key={m} onClick={() => setMood(m === mood ? null : m)}
              className="flex-1 py-2 rounded-lg text-center transition-all"
              style={{
                background: mood === m ? MOOD_COLORS[m] + '20' : 'var(--bg-elevated)',
                border: `1px solid ${mood === m ? MOOD_COLORS[m] : 'var(--border)'}`,
                color: mood === m ? MOOD_COLORS[m] : 'var(--text-muted)',
              }}>
              <div className="text-lg">{MOOD_ICONS[m]}</div>
              <div className="text-xs font-crimson mt-1">{t(`mood.${m}`)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Track */}
      <div>
        <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('fields.track')}</label>
        <div className="flex gap-2">
          {(['general', 'spirit', 'soul', 'body'] as const).map(tr => (
            <button key={tr} onClick={() => setTrack(tr)}
              className="px-3 py-1.5 rounded font-crimson text-sm transition-all"
              style={{
                background: track === tr ? 'rgba(201,168,76,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${track === tr ? 'var(--gold-primary)' : 'var(--border)'}`,
                color: track === tr ? 'var(--gold-primary)' : 'var(--text-secondary)',
              }}>
              {tr === 'general' ? t('fields.trackGeneral') : tSteps(`tracks.${tr}`)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={!content.trim() || saving}
        className="w-full py-3 rounded-lg font-cinzel"
        style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)', opacity: content.trim() ? 1 : 0.5 }}>
        {saving ? '...' : t('save')}
      </button>
    </div>
  );
}

export default function JournalPage() {
  const t = useTranslations('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  async function deleteEntry(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    const supabase = createClient();
    await supabase.from('journal_entries').delete().eq('id', id);
    loadEntries();
  }

  const filtered = entries.filter(e =>
    !search || e.content.toLowerCase().includes(search.toLowerCase()) ||
    (e.title && e.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>Betöltés...</div></div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>{t('title')}</h1>
        <button onClick={() => { setShowEditor(true); setEditEntry(null); }}
          className="px-5 py-2 rounded-lg font-cinzel text-sm"
          style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)' }}>
          + {t('newEntry')}
        </button>
      </div>

      {(showEditor || editEntry) && (
        <div className="mb-6">
          <JournalEditor
            entry={editEntry}
            onSave={() => { setShowEditor(false); setEditEntry(null); loadEntries(); }}
            onCancel={() => { setShowEditor(false); setEditEntry(null); }}
          />
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg font-crimson outline-none"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <p className="font-crimson text-lg" style={{ color: 'var(--text-secondary)' }}>{t('noEntries')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => (
            <div key={entry.id} className="card-glass p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {entry.title && (
                    <h3 className="font-cinzel mb-1" style={{ color: 'var(--text-primary)' }}>{entry.title}</h3>
                  )}
                  <p className="text-xs font-crimson" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(entry.entry_date)}
                    {entry.mood && ` · ${MOOD_ICONS[entry.mood]}`}
                    {entry.track && entry.track !== 'general' && ` · ${entry.track}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditEntry(entry)} style={{ color: 'var(--text-muted)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => deleteEntry(entry.id)} style={{ color: 'var(--fire)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              </div>
              <p className="font-crimson text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {entry.content.length > 300 ? entry.content.slice(0, 300) + '...' : entry.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
