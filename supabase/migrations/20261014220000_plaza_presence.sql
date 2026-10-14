-- Residual plaza: one presence row per user (stand + optional bubble)

CREATE TABLE IF NOT EXISTS public.plaza_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  x real NOT NULL CHECK (x >= 0 AND x <= 1),
  y real NOT NULL CHECK (y >= 0 AND y <= 1),
  bubble_text text NULL CHECK (bubble_text IS NULL OR char_length(bubble_text) <= 15),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plaza_presence_updated_at_idx
  ON public.plaza_presence (updated_at DESC);

ALTER TABLE public.plaza_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plaza_presence_select_all ON public.plaza_presence;
CREATE POLICY plaza_presence_select_all
  ON public.plaza_presence
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS plaza_presence_insert_own ON public.plaza_presence;
CREATE POLICY plaza_presence_insert_own
  ON public.plaza_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS plaza_presence_update_own ON public.plaza_presence;
CREATE POLICY plaza_presence_update_own
  ON public.plaza_presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS plaza_presence_delete_own_or_owner ON public.plaza_presence;
CREATE POLICY plaza_presence_delete_own_or_owner
  ON public.plaza_presence
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_owner());

ALTER PUBLICATION supabase_realtime ADD TABLE public.plaza_presence;
