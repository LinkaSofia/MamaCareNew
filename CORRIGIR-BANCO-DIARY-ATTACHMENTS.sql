-- SCRIPT SQL PARA CORRIGIR TABELA DIARY_ATTACHMENTS
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 2. Verificar se a coluna file_url existe
SELECT COUNT(*) as file_url_exists
FROM information_schema.columns 
WHERE table_name = 'diary_attachments' 
AND column_name = 'file_url';

-- 3. Se file_url NÃO existir, criar a coluna
ALTER TABLE diary_attachments 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 4. Se file_data existir, migrar dados e remover coluna
-- Primeiro, migrar dados existentes
UPDATE diary_attachments 
SET file_url = file_data 
WHERE file_url IS NULL AND file_data IS NOT NULL;

-- 5. Remover coluna file_data se existir
ALTER TABLE diary_attachments 
DROP COLUMN IF EXISTS file_data;

-- 6. Tornar file_url obrigatório (após migração)
ALTER TABLE diary_attachments 
ALTER COLUMN file_url SET NOT NULL;

-- 7. Verificar estrutura final da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 8. Verificar dados na tabela
SELECT COUNT(*) as total_attachments FROM diary_attachments;

-- 9. Verificar alguns registros de exemplo
SELECT 
  id,
  diary_entry_id,
  file_url,
  file_type,
  file_name,
  file_size,
  created_at
FROM diary_attachments 
LIMIT 5;

-- 10. Verificar se há dados em base64 (começam com 'data:')
SELECT 
  COUNT(*) as base64_count,
  COUNT(CASE WHEN file_url LIKE 'data:%' THEN 1 END) as base64_files,
  COUNT(CASE WHEN file_url NOT LIKE 'data:%' THEN 1 END) as url_files
FROM diary_attachments;
