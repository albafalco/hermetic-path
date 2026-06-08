import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Practice } from '@/types';

export interface EffectivePractice extends Practice {
  logKey: string;
  session?: 'morning' | 'evening';
}

export function getEffectivePractices(
  practices: Practice[],
  unlockedKeys: Set<string>
): EffectivePractice[] {
  const seqGroups = new Map<string, Practice[]>();
  const nonSeq: Practice[] = [];

  for (const p of practices) {
    if (p.sequentialGroup) {
      const arr = seqGroups.get(p.sequentialGroup) ?? [];
      arr.push(p);
      seqGroups.set(p.sequentialGroup, arr);
    } else {
      nonSeq.push(p);
    }
  }

  const result: EffectivePractice[] = [];

  for (const p of nonSeq) {
    if (p.frequency === 'both') {
      result.push({ ...p, logKey: `${p.key}_morning`, session: 'morning' });
      result.push({ ...p, logKey: `${p.key}_evening`, session: 'evening' });
    } else {
      result.push({ ...p, logKey: p.key });
    }
  }

  for (const [, group] of seqGroups) {
    const sorted = [...group].sort((a, b) => (a.sequentialOrder ?? 0) - (b.sequentialOrder ?? 0));
    const current = sorted.find(p => !unlockedKeys.has(p.key)) ?? sorted[sorted.length - 1];
    if (current.frequency === 'both') {
      result.push({ ...current, logKey: `${current.key}_morning`, session: 'morning' });
      result.push({ ...current, logKey: `${current.key}_evening`, session: 'evening' });
    } else {
      result.push({ ...current, logKey: current.key });
    }
  }

  return result;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function trackColor(track: string): string {
  switch (track) {
    case 'spirit': return 'var(--spirit)';
    case 'soul': return 'var(--soul)';
    case 'body': return 'var(--body-track)';
    default: return 'var(--gold-primary)';
  }
}

export function elementColor(element: string): string {
  switch (element) {
    case 'fire': return 'var(--fire)';
    case 'water': return 'var(--water)';
    case 'air': return 'var(--air)';
    case 'earth': return 'var(--earth)';
    default: return 'var(--text-secondary)';
  }
}
