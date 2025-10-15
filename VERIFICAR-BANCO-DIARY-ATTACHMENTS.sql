-- Script para verificar e corrigir tabela diary_attachments
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
-- ALTER TABLE diary_attachments 
-- ADD COLUMN file_url TEXT;

-- 4. Se file_data existir, migrar dados e remover coluna
-- UPDATE diary_attachments 
-- SET file_url = file_data 
-- WHERE file_url IS NULL AND file_data IS NOT NULL;

-- ALTER TABLE diary_attachments 
-- DROP COLUMN IF EXISTS file_data;

-- 5. Tornar file_url obrigatório (após migração)
-- ALTER TABLE diary_attachments 
-- ALTER COLUMN file_url SET NOT NULL;

-- 6. Verificar dados na tabela
SELECT COUNT(*) as total_attachments FROM diary_attachments;

-- 7. Verificar alguns registros de exemplo
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
