/*
  Add site-wide marquee (현수막) settings to homepage_settings
*/

ALTER TABLE homepage_settings
  ADD COLUMN IF NOT EXISTS marquee jsonb NOT NULL DEFAULT '{"text": "가을을 만끽해요~~", "speed": 5, "backgroundColor": "#000080", "textColor": "#ffff00"}'::jsonb;

UPDATE homepage_settings
SET marquee = '{"text": "가을을 만끽해요~~", "speed": 5, "backgroundColor": "#000080", "textColor": "#ffff00"}'::jsonb
WHERE id = 1
  AND (marquee IS NULL OR marquee::text = '{}');
