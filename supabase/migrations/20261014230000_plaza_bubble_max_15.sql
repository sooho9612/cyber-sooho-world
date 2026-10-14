ALTER TABLE public.plaza_presence DROP CONSTRAINT IF EXISTS plaza_presence_bubble_text_check;
ALTER TABLE public.plaza_presence ADD CONSTRAINT plaza_presence_bubble_text_check
  CHECK (bubble_text IS NULL OR char_length(bubble_text) <= 15);

UPDATE public.plaza_presence
SET bubble_text = left(bubble_text, 15)
WHERE bubble_text IS NOT NULL AND char_length(bubble_text) > 15;
