-- ========================================
-- SCRIPT PARA VERIFICAR E CORRIGIR ESTRUTURA DAS TABELAS
-- ========================================
-- Execute este SQL no Supabase SQL Editor

-- 1. VERIFICAR ESTRUTURA DA TABELA diary_entries
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diary_entries'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA DA TABELA users
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA pregnancies
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pregnancies'
ORDER BY ordinal_position;

-- 4. VERIFICAR ESTRUTURA DA TABELA diary_attachments
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 5. VERIFICAR SE EXISTE TABELA analytics_page_visits
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'analytics_page_visits'
ORDER BY ordinal_position;
