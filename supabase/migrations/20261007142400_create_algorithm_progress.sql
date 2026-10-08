/*
# Create algorithm learning progress table (single-tenant, no auth)

1. New Tables
- `algorithm_progress`
  - `id` (uuid, primary key)
  - `algorithm_id` (text, not null) — identifies which algorithm (e.g. "bubble-sort")
  - `status` (text, not null, default 'not-started') — one of: not-started, in-progress, completed
  - `best_score` (integer, nullable) — best quiz score percentage
  - `attempts` (integer, not null, default 0) — number of quiz attempts
  - `last_visited_at` (timestamptz, nullable) — when the user last opened this algorithm
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
2. Security
- Enable RLS on `algorithm_progress`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).
*/

CREATE TABLE IF NOT EXISTS algorithm_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id text NOT NULL,
  status text NOT NULL DEFAULT 'not-started',
  best_score integer,
  attempts integer NOT NULL DEFAULT 0,
  last_visited_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE algorithm_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON algorithm_progress;
CREATE POLICY "anon_select_progress" ON algorithm_progress FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON algorithm_progress;
CREATE POLICY "anon_insert_progress" ON algorithm_progress FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON algorithm_progress;
CREATE POLICY "anon_update_progress" ON algorithm_progress FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON algorithm_progress;
CREATE POLICY "anon_delete_progress" ON algorithm_progress FOR DELETE
TO anon, authenticated USING (true);
