'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ElementMirrorTrait, Element, Polarity } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { elementColor } from '@/lib/utils';

const ELEMENTS: Element[] = ['fire', 'water', 'air', 'earth'];

function AddTraitModal({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  const t = useTranslations('mirror');
  const [element, setElement] = useState<Element>('fire');
  const [polarity, setPolarity] = useState<Polarity>('negative');
  const [traitText, setTraitText] = useState('');
  const [intensity, setIntensity] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!traitText.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('element_mirror_traits').insert({
      user_id: user.id, element, polarity, trait_text: traitText, intensity, is_resolved: false,
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="card-glass p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-lg" style={{ color: 'var(--gold-primary)' }}>{t('modal.title')}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Element */}
        <div>
          <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('modal.element')}</label>
          <div className="grid grid-cols-4 gap-2">
            {ELEMENTS.map(el => (
              <button key={el} onClick={() => setElement(el)}
                className="py-2 rounded-lg font-crimson text-sm transition-all"
                style={{
                  background: element === el ? elementColor(el) + '20' : 'var(--bg-elevated)',
                  border: `1px solid ${element === el ? elementColor(el) : 'var(--border)'}`,
                  color: element === el ? elementColor(el) : 'var(--text-secondary)',
                }}>
                {t(`elements.${el}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Polarity */}
        <div>
          <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('modal.polarity')}</label>
          <div className="grid grid-cols-2 gap-2">
            {(['negative', 'positive'] as Polarity[]).map(p => (
              <button key={p} onClick={() => setPolarity(p)}
                className="py-2 rounded-lg font-crimson text-sm transition-all"
                style={{
                  background: polarity === p ? (p === 'negative' ? 'rgba(232,93,58,0.15)' : 'rgba(126,184,122,0.15)') : 'var(--bg-elevated)',
                  border: `1px solid ${polarity === p ? (p === 'negative' ? 'var(--fire)' : 'var(--body-track)') : 'var(--border)'}`,
                  color: polarity === p ? (p === 'negative' ? 'var(--fire)' : 'var(--body-track)') : 'var(--text-secondary)',
                }}>
                {p === 'negative' ? '◑' : '○'} {t(`polarity.${p}`).split('(')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Trait text */}
        <div>
          <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('modal.trait')}</label>
          <textarea value={traitText} onChange={e => setTraitText(e.target.value)} rows={3}
            className="w-full px-4 py-2 rounded-lg font-crimson outline-none resize-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Intensity */}
        <div>
          <label className="block text-xs font-crimson mb-2" style={{ color: 'var(--text-secondary)' }}>{t('modal.intensityLabel')}</label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map(i => (
              <button key={i} onClick={() => setIntensity(i)}
                className="flex-1 py-2 rounded-lg font-cinzel"
                style={{
                  background: intensity === i ? 'rgba(201,168,76,0.2)' : 'var(--bg-elevated)',
                  border: `1px solid ${intensity === i ? 'var(--gold-primary)' : 'var(--border)'}`,
                  color: intensity === i ? 'var(--gold-primary)' : 'var(--text-secondary)',
                }}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={!traitText.trim() || saving}
          className="w-full py-3 rounded-lg font-cinzel"
          style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)', opacity: traitText.trim() ? 1 : 0.5 }}>
          {saving ? '...' : t('modal.save')}
        </button>
      </div>
    </div>
  );
}

export default function MirrorPage() {
  const t = useTranslations('mirror');
  const [traits, setTraits] = useState<ElementMirrorTrait[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeElement, setActiveElement] = useState<Element | 'all'>('all');
  const [activePolarity, setActivePolarity] = useState<Polarity | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTraits();
  }, []);

  async function loadTraits() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('element_mirror_traits').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTraits(data || []);
    setLoading(false);
  }

  async function toggleResolved(trait: ElementMirrorTrait) {
    const supabase = createClient();
    await supabase.from('element_mirror_traits').update({ is_resolved: !trait.is_resolved }).eq('id', trait.id);
    loadTraits();
  }

  async function deleteTrait(id: string) {
    const supabase = createClient();
    await supabase.from('element_mirror_traits').delete().eq('id', id);
    loadTraits();
  }

  const filtered = traits.filter(tr =>
    (activeElement === 'all' || tr.element === activeElement) &&
    (activePolarity === 'all' || tr.polarity === activePolarity)
  );

  // Dominant element
  const elementCounts = ELEMENTS.map(el => ({ el, count: traits.filter(tr => tr.element === el && !tr.is_resolved).length }));
  const dominant = elementCounts.reduce((a, b) => a.count > b.count ? a : b);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="font-crimson" style={{ color: 'var(--text-secondary)' }}>Betöltés...</div></div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {showModal && (
        <AddTraitModal
          onSave={() => { setShowModal(false); loadTraits(); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-cinzel" style={{ color: 'var(--gold-primary)' }}>{t('title')}</h1>
          <p className="mt-1 font-crimson" style={{ color: 'var(--text-secondary)' }}>{t('subtitle')}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-5 py-2 rounded-lg font-cinzel text-sm"
          style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))', color: 'var(--bg-primary)' }}>
          + {t('addTrait')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ELEMENTS.map(el => (
          <div key={el} className="card-glass p-4 text-center cursor-pointer transition-all"
            style={{ borderColor: activeElement === el ? elementColor(el) : 'var(--border)' }}
            onClick={() => setActiveElement(activeElement === el ? 'all' : el)}>
            <div className="text-2xl font-cinzel" style={{ color: elementColor(el) }}>
              {traits.filter(tr => tr.element === el && !tr.is_resolved).length}
            </div>
            <div className="text-xs font-cinzel mt-1" style={{ color: elementColor(el) }}>{t(`elements.${el}`)}</div>
          </div>
        ))}
      </div>

      {/* Dominant element */}
      {traits.length > 0 && dominant.count > 0 && (
        <div className="card-glass p-4 mb-6 flex items-center gap-3" style={{ borderColor: elementColor(dominant.el) + '40' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: elementColor(dominant.el) + '20' }}>
            <span className="font-cinzel text-sm" style={{ color: elementColor(dominant.el) }}>{dominant.count}</span>
          </div>
          <div>
            <p className="font-cinzel text-sm" style={{ color: elementColor(dominant.el) }}>{t('dominantElement')}</p>
            <p className="font-crimson" style={{ color: 'var(--text-secondary)' }}>{t(`elements.${dominant.el}`)}</p>
          </div>
        </div>
      )}

      {/* Polarity filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'negative', 'positive'] as const).map(p => (
          <button key={p} onClick={() => setActivePolarity(p)}
            className="px-4 py-2 rounded-lg font-crimson text-sm transition-all"
            style={{
              background: activePolarity === p ? 'rgba(201,168,76,0.15)' : 'var(--bg-card)',
              border: `1px solid ${activePolarity === p ? 'var(--gold-primary)' : 'var(--border)'}`,
              color: activePolarity === p ? 'var(--gold-primary)' : 'var(--text-secondary)',
            }}>
            {p === 'all' ? 'Minden' : t(`polarity.${p}`).split('(')[0]}
          </button>
        ))}
      </div>

      {/* Traits */}
      {filtered.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <p className="font-crimson text-lg" style={{ color: 'var(--text-secondary)' }}>{t('noTraits')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(trait => (
            <div key={trait.id} className="card-glass p-5 transition-all"
              style={{ opacity: trait.is_resolved ? 0.6 : 1, borderColor: trait.is_resolved ? 'var(--border)' : elementColor(trait.element) + '30' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-cinzel text-sm"
                    style={{ background: elementColor(trait.element) + '20', color: elementColor(trait.element) }}>
                    {trait.intensity}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-cinzel px-2 py-0.5 rounded" style={{ background: elementColor(trait.element) + '20', color: elementColor(trait.element) }}>
                      {t(`elements.${trait.element}`)}
                    </span>
                    <span className="text-xs font-crimson px-2 py-0.5 rounded"
                      style={{ background: trait.polarity === 'negative' ? 'rgba(232,93,58,0.1)' : 'rgba(126,184,122,0.1)', color: trait.polarity === 'negative' ? 'var(--fire)' : 'var(--body-track)' }}>
                      {trait.polarity === 'negative' ? '◑' : '○'}
                    </span>
                    {trait.is_resolved && (
                      <span className="text-xs font-crimson" style={{ color: 'var(--body-track)' }}>✓ {t('resolved')}</span>
                    )}
                  </div>
                  <p className="font-crimson" style={{ color: trait.is_resolved ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: trait.is_resolved ? 'line-through' : 'none' }}>
                    {trait.trait_text}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => toggleResolved(trait)} title={t('resolved')}
                    className="p-1.5 rounded"
                    style={{ color: trait.is_resolved ? 'var(--body-track)' : 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <button onClick={() => deleteTrait(trait.id)}
                    className="p-1.5 rounded"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
