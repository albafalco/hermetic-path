export type Track = 'spirit' | 'soul' | 'body';
export type Element = 'fire' | 'water' | 'air' | 'earth' | 'undefined';
export type Polarity = 'positive' | 'negative';
export type StepStatus = 'locked' | 'active' | 'complete';
export type Mood = 'excellent' | 'good' | 'neutral' | 'difficult' | 'dark';
export type Locale = 'hu' | 'en' | 'de' | 'es' | 'it';

export interface StepProgress {
  id: string;
  user_id: string;
  step_number: number;
  track: Track;
  status: StepStatus;
  started_at: string | null;
  completed_at: string | null;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  step_number: number;
  track: Track;
  practice_key: string;
  completed: boolean;
  duration_sec: number;
  notes: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  step_number: number | null;
  track: Track | 'general' | null;
  title: string | null;
  content: string;
  mood: Mood | null;
  created_at: string;
  updated_at: string;
}

export interface ElementMirrorTrait {
  id: string;
  user_id: string;
  element: Element;
  polarity: Polarity;
  trait_text: string;
  intensity: 1 | 2 | 3;
  is_resolved: boolean;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  practice_key: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  step_number: number | null;
  track: Track | null;
}

export interface Practice {
  key: string;
  titleKey: string;
  descriptionKey: string;
  durationMin: number;
  durationMax: number;
  frequency: 'morning' | 'evening' | 'both' | 'daily' | 'anytime';
  timerRequired: boolean;
  sequentialGroup?: string;  // azonos csoportban lévők egymás után jönnek
  sequentialOrder?: number;  // sorrend a csoporton belül
}

export interface PracticeUnlock {
  id: string;
  user_id: string;
  practice_key: string;
  unlocked_at: string;
}

export interface StepTrack {
  track: Track;
  titleKey: string;
  summaryKey: string;
  practices: Practice[];
  masteryNoteKey: string;
}

export interface Step {
  number: number;
  titleKey: string;
  overviewKey: string;
  duration: string;
  tracks: StepTrack[];
}
