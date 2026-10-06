/*
  Homepage-wide settings (admin Control Panel). Singleton row id = 1.
  NOTE: table name is homepage_settings — site_settings already exists for other use.
*/

CREATE TABLE IF NOT EXISTS homepage_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  compressor jsonb NOT NULL DEFAULT '{"enabled": true, "maxEdge": 300, "quality": 0.7}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO homepage_settings (id, compressor)
VALUES (1, '{"enabled": true, "maxEdge": 300, "quality": 0.7}'::jsonb)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'homepage_settings' AND policyname = 'Anyone can read homepage_settings'
  ) THEN
    CREATE POLICY "Anyone can read homepage_settings"
      ON homepage_settings FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'homepage_settings' AND policyname = 'Anyone can insert homepage_settings'
  ) THEN
    CREATE POLICY "Anyone can insert homepage_settings"
      ON homepage_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'homepage_settings' AND policyname = 'Anyone can update homepage_settings'
  ) THEN
    CREATE POLICY "Anyone can update homepage_settings"
      ON homepage_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
