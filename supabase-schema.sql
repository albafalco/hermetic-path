-- Hermetic Path - Teljes Supabase séma
-- Futtasd ezt a Supabase SQL editorban (https://supabase.com/dashboard → SQL Editor)
-- Ha korábban már futtattad részben, futtasd le előbb a "TÖRLÉS" blokkot, majd az egészet.

-- ============================================================
-- 1. TÖRLÉS (ha újra kell kezdeni, uncommenteld ezeket)
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS init_user_progress();
-- DROP TABLE IF EXISTS practice_sessions;
-- DROP TABLE IF EXISTS element_mirror_traits;
-- DROP TABLE IF EXISTS journal_entries;
-- DROP TABLE IF EXISTS daily_logs;
-- DROP TABLE IF EXISTS step_progress;

-- ============================================================
-- 2. TÁBLÁK LÉTREHOZÁSA
-- ============================================================

-- Fokozat progresszió
CREATE TABLE IF NOT EXISTS step_progress (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_number  INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 10),
  track        TEXT NOT NULL CHECK (track IN ('spirit', 'soul', 'body')),
  status       TEXT NOT NULL DEFAULT 'locked'
               CHECK (status IN ('locked', 'active', 'complete')),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step_number, track)
);

-- Napi gyakorlás napló
CREATE TABLE IF NOT EXISTS daily_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  step_number  INTEGER NOT NULL,
  track        TEXT NOT NULL CHECK (track IN ('spirit', 'soul', 'body')),
  practice_key TEXT NOT NULL,
  completed    BOOLEAN DEFAULT FALSE,
  duration_sec INTEGER DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date, practice_key)
);

-- Mágikus napló
CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  step_number INTEGER,
  track       TEXT CHECK (track IN ('spirit', 'soul', 'body', 'general')),
  title       TEXT,
  content     TEXT NOT NULL,
  mood        TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'difficult', 'dark')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Elem-tükör
CREATE TABLE IF NOT EXISTS element_mirror_traits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  element     TEXT NOT NULL CHECK (element IN ('fire', 'water', 'air', 'earth', 'undefined')),
  polarity    TEXT NOT NULL CHECK (polarity IN ('positive', 'negative')),
  trait_text  TEXT NOT NULL,
  intensity   INTEGER NOT NULL DEFAULT 2 CHECK (intensity BETWEEN 1 AND 3),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Practice session időzítő napló
CREATE TABLE IF NOT EXISTS practice_sessions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_key TEXT NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  duration_sec INTEGER,
  step_number  INTEGER,
  track        TEXT CHECK (track IN ('spirit', 'soul', 'body'))
);

-- Szekvenciális gyakorlat feloldások
CREATE TABLE IF NOT EXISTS practice_unlocks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_key TEXT NOT NULL,
  unlocked_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_key)
);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE step_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_mirror_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_unlocks  ENABLE ROW LEVEL SECURITY;

-- Töröljük a régi policy-kat, ha lennének (idempotens újrafuttatáshoz)
DROP POLICY IF EXISTS "own_step_progress"        ON step_progress;
DROP POLICY IF EXISTS "own_daily_logs"           ON daily_logs;
DROP POLICY IF EXISTS "own_journal_entries"      ON journal_entries;
DROP POLICY IF EXISTS "own_element_mirror_traits" ON element_mirror_traits;
DROP POLICY IF EXISTS "own_practice_sessions"    ON practice_sessions;
DROP POLICY IF EXISTS "own_practice_unlocks"    ON practice_unlocks;

CREATE POLICY "own_step_progress"
  ON step_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_daily_logs"
  ON daily_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_journal_entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_element_mirror_traits"
  ON element_mirror_traits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_practice_sessions"
  ON practice_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_practice_unlocks"
  ON practice_unlocks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. JOGOSULTSÁGOK (authenticated role)
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.step_progress        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_logs            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.journal_entries       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.element_mirror_traits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.practice_sessions     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.practice_unlocks      TO authenticated;

-- ============================================================
-- 5. INDEXEK
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_step_progress_user
  ON step_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date
  ON daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date
  ON journal_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_element_mirror_user
  ON element_mirror_traits(user_id);

-- ============================================================
-- 5. TRIGGER: Új user regisztrációkor automatikus init
-- ============================================================

-- Töröljük, ha már létezik (idempotens)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.init_user_progress();

CREATE OR REPLACE FUNCTION public.init_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. fokozat aktív mindhárom vonalon
  INSERT INTO public.step_progress (user_id, step_number, track, status, started_at)
  VALUES
    (NEW.id, 1, 'spirit', 'active', NOW()),
    (NEW.id, 1, 'soul',   'active', NOW()),
    (NEW.id, 1, 'body',   'active', NOW());

  -- 2-10. fokozat zárolt
  INSERT INTO public.step_progress (user_id, step_number, track, status)
  SELECT NEW.id, s, t, 'locked'
  FROM generate_series(2, 10) AS s
  CROSS JOIN (VALUES ('spirit'), ('soul'), ('body')) AS tracks(t);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_progress();
