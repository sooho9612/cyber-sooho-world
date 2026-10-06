/*
  Public read for Image bucket + anon upsert into Image/user/*
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read Image bucket'
  ) THEN
    CREATE POLICY "Public read Image bucket"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'Image');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public insert Image user folder'
  ) THEN
    CREATE POLICY "Public insert Image user folder"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (
        bucket_id = 'Image'
        AND (storage.foldername(name))[1] = 'user'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public update Image user folder'
  ) THEN
    CREATE POLICY "Public update Image user folder"
      ON storage.objects FOR UPDATE
      TO anon, authenticated
      USING (
        bucket_id = 'Image'
        AND (storage.foldername(name))[1] = 'user'
      )
      WITH CHECK (
        bucket_id = 'Image'
        AND (storage.foldername(name))[1] = 'user'
      );
  END IF;
END $$;
