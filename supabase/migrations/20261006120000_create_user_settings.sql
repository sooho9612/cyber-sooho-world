/*
  # Create user_settings for per-nickname desktop/window backgrounds

  - nickname: visitor nickname (localStorage-backed identity)
  - desktop_bg / window_bg: jsonb payloads (window reserved for later)
*/

CREATE TABLE IF NOT EXISTS user_settings (
  nickname text PRIMARY KEY,
  desktop_bg jsonb NOT NULL,
  window_bg jsonb NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user_settings"
  ON user_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert user_settings"
  ON user_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update user_settings"
  ON user_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
