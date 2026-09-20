-- ================================================
-- Barber Agenda — 05b: Configurar RLS do bucket "uploads"
-- Bucket "uploads" já existe no seu Supabase. Basta rodar
-- este script no SQL Editor para aplicar as permissões
-- de leitura pública + upload autenticado.
-- ================================================

-- 1. Garante que o bucket "uploads" é público (todo mundo pode ler)
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'uploads';

-- 2. Permite LEITURA pública de qualquer arquivo dentro de "uploads"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'uploads_select_public'
  ) THEN
    CREATE POLICY uploads_select_public ON storage.objects
      FOR SELECT
      USING (bucket_id = 'uploads');
  END IF;
END $$;

-- 3. Permite UPLOAD de arquivos em "uploads" apenas para usuários AUTENTICADOS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'uploads_insert_authenticated'
  ) THEN
    CREATE POLICY uploads_insert_authenticated ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'uploads'
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 4. Permite UPDATE dos próprios arquivos em "uploads" (dono do arquivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'uploads_update_own'
  ) THEN
    CREATE POLICY uploads_update_own ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'uploads'
        AND owner = auth.uid()
      );
  END IF;
END $$;

-- 5. Permite DELETE dos próprios arquivos em "uploads" (dono do arquivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'uploads_delete_own'
  ) THEN
    CREATE POLICY uploads_delete_own ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'uploads'
        AND owner = auth.uid()
      );
  END IF;
END $$;
