-- MIGRAÇÃO FINAL PARA SUPABASE STORAGE
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a coluna file_url existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'diary_attachments' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE diary_attachments ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- 2. Remover coluna file_data se existir (base64)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'diary_attachments' 
        AND column_name = 'file_data'
    ) THEN
        ALTER TABLE diary_attachments DROP COLUMN file_data;
    END IF;
END $$;

-- 3. Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 4. Limpar dados antigos (opcional - só se quiser começar do zero)
-- DELETE FROM diary_attachments;

-- 5. Verificar se a tabela está vazia
SELECT COUNT(*) as total_anexos FROM diary_attachments;

-- 6. Criar bucket no Storage (execute manualmente no dashboard)
-- Nome: diary-attachments
-- Público: SIM
-- Limite: 50MB

-- 7. Configurar políticas de acesso (execute após criar o bucket)
-- CREATE POLICY "Allow public uploads to diary attachments" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'diary-attachments');

-- CREATE POLICY "Allow public read access to diary attachments" ON storage.objects
-- FOR SELECT USING (bucket_id = 'diary-attachments');

-- CREATE POLICY "Allow public delete from diary attachments" ON storage.objects
-- FOR DELETE USING (bucket_id = 'diary-attachments');
