-- Script para migrar tabela diary_attachments de base64 para URLs
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar nova coluna file_url
ALTER TABLE diary_attachments 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. Remover a coluna file_data (base64)
ALTER TABLE diary_attachments 
DROP COLUMN IF EXISTS file_data;

-- 3. Tornar file_url obrigatório (após migrar dados)
-- ALTER TABLE diary_attachments 
-- ALTER COLUMN file_url SET NOT NULL;

-- 4. Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 5. Limpar dados antigos (opcional - só se quiser começar do zero)
-- DELETE FROM diary_attachments;

-- 6. Verificar se a tabela está vazia
SELECT COUNT(*) as total_anexos FROM diary_attachments;
