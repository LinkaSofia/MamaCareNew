-- ====================================
-- DEBUG: VERIFICAR ANEXOS DO DIÁRIO
-- ====================================
-- RODE ESSES COMANDOS NO SUPABASE SQL EDITOR
-- ====================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- Se retornar vazio, a tabela NÃO FOI CRIADA!
-- Rode o script CRIAR-TABELA-ANEXOS-SUPABASE.sql


-- 2. VERIFICAR QUANTOS ANEXOS EXISTEM
SELECT COUNT(*) as total_anexos
FROM diary_attachments;

-- Se retornar 0, os anexos não estão sendo salvos!


-- 3. VER OS ÚLTIMOS 5 ANEXOS (se existirem)
SELECT 
  id,
  diary_entry_id,
  file_type,
  file_name,
  file_size,
  LENGTH(file_data) as tamanho_dados_base64,
  created_at
FROM diary_attachments
ORDER BY created_at DESC
LIMIT 5;


-- 4. VERIFICAR ENTRADAS DO DIÁRIO
SELECT 
  id,
  title,
  mood,
  week,
  created_at
FROM diary_entries
ORDER BY created_at DESC
LIMIT 5;


-- 5. VERIFICAR SE EXISTEM ENTRADAS SEM ANEXOS
SELECT 
  de.id as entry_id,
  de.title,
  de.created_at as entry_created,
  COUNT(da.id) as num_anexos
FROM diary_entries de
LEFT JOIN diary_attachments da ON da.diary_entry_id = de.id
GROUP BY de.id, de.title, de.created_at
ORDER BY de.created_at DESC
LIMIT 10;

-- Se todas as entradas têm 0 anexos, o problema está no backend!

