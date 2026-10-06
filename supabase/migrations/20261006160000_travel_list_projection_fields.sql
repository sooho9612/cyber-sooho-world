-- Lightweight list fields for travel board (avoid loading full gallery JSON on list)
ALTER TABLE public.travel_entries
  ADD COLUMN IF NOT EXISTS photo_count integer NOT NULL DEFAULT 0;

UPDATE public.travel_entries
SET
  thumbnail_url = CASE
    WHEN coalesce(thumbnail_url, '') = '' AND gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array' AND jsonb_array_length(gallery) > 0
      THEN gallery->0->>'image'
    ELSE thumbnail_url
  END,
  photo_count = CASE
    WHEN gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array'
      THEN coalesce(jsonb_array_length(gallery), 0)
    WHEN coalesce(thumbnail_url, '') <> '' THEN 1
    ELSE 0
  END;
