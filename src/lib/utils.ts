import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
