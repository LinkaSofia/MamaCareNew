-- SCRIPT PARA CONFIGURAR SUPABASE STORAGE
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar bucket diary-attachments se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diary-attachments',
  'diary-attachments',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

-- 2. Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'diary-attachments';

-- 3. Criar política para upload público
CREATE POLICY IF NOT EXISTS "Allow public uploads to diary attachments" 
ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'diary-attachments');

-- 4. Criar política para leitura pública
CREATE POLICY IF NOT EXISTS "Allow public read access to diary attachments" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'diary-attachments');

-- 5. Criar política para delete (para cleanup)
CREATE POLICY IF NOT EXISTS "Allow public delete from diary attachments" 
ON storage.objects
FOR DELETE 
USING (bucket_id = 'diary-attachments');

-- 6. Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 7. Testar se as políticas estão funcionando
-- (Este comando deve retornar as políticas criadas)
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%diary%';
