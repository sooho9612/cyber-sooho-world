ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS photo_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.memory_entries
  ADD COLUMN IF NOT EXISTS photo_count integer NOT NULL DEFAULT 0;

UPDATE public.entries
SET
  image_url = CASE
    WHEN coalesce(image_url, '') = '' AND gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array' AND jsonb_array_length(gallery) > 0
      THEN gallery->0->>'image'
    ELSE image_url
  END,
  photo_count = CASE
    WHEN gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array'
      THEN coalesce(jsonb_array_length(gallery), 0)
    WHEN coalesce(image_url, '') <> '' THEN 1
    ELSE 0
  END;

UPDATE public.memory_entries
SET
  image_url = CASE
    WHEN coalesce(image_url, '') = '' AND gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array' AND jsonb_array_length(gallery) > 0
      THEN gallery->0->>'image'
    ELSE image_url
  END,
  photo_count = CASE
    WHEN gallery IS NOT NULL AND jsonb_typeof(gallery) = 'array'
      THEN coalesce(jsonb_array_length(gallery), 0)
    WHEN coalesce(image_url, '') <> '' THEN 1
    ELSE 0
  END;
