/*
  Site-wide plaza stage settings (background catalog id, etc.)
*/

ALTER TABLE homepage_settings
  ADD COLUMN IF NOT EXISTS plaza jsonb NOT NULL DEFAULT '{"bgId": "halloween"}'::jsonb;

UPDATE homepage_settings
SET plaza = '{"bgId": "halloween"}'::jsonb
WHERE id = 1
  AND (plaza IS NULL OR plaza::text = '{}' OR plaza->>'bgId' IS NULL);
