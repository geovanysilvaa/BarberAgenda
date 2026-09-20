-- ================================================
-- Barber Agenda — 05: Configurar Storage para imagens
-- ================================================
-- Este arquivo configura o bucket "media" usado para upload de
-- imagens de barbearias e serviços. Execute no SQL Editor do
-- Supabase do seu projeto e depois:
--   1. No painel Storage → Policies, confirme se as policies abaixo foram aplicadas
--   2. No frontend: preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env
-- ================================================

-- 1. Cria o bucket "media" (público para leitura, upload apenas autenticado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite LEITURA pública de qualquer arquivo dentro de "media"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'media_select_public'
  ) THEN
    CREATE POLICY media_select_public ON storage.objects
      FOR SELECT
      USING (bucket_id = 'media');
  END IF;
END $$;

-- 3. Permite UPLOAD de arquivos em "media" apenas para usuários autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'media_insert_authenticated'
  ) THEN
    CREATE POLICY media_insert_authenticated ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'media'
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 4. Permite UPDATE dos próprios arquivos em "media" (dono do arquivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'media_update_own'
  ) THEN
    CREATE POLICY media_update_own ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'media'
        AND owner = auth.uid()
      );
  END IF;
END $$;

-- 5. Permite DELETE dos próprios arquivos em "media" (dono do arquivo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'media_delete_own'
  ) THEN
    CREATE POLICY media_delete_own ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'media'
        AND owner = auth.uid()
      );
  END IF;
END $$;
