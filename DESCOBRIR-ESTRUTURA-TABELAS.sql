-- ========================================
-- SCRIPT PARA DESCOBRIR A ESTRUTURA REAL DAS TABELAS
-- ========================================
-- Execute este SQL no Supabase SQL Editor

-- 1. LISTAR TODAS AS TABELAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA diary_entries
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'diary_entries'
ORDER BY ordinal_position;

-- 3. VER ALGUNS REGISTROS DE EXEMPLO DA TABELA diary_entries
SELECT * FROM diary_entries LIMIT 3;

-- 4. VERIFICAR ESTRUTURA DA TABELA users
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 5. VER ALGUNS REGISTROS DE EXEMPLO DA TABELA users
SELECT id, email, name, created_at FROM users LIMIT 3;

-- 6. VERIFICAR ESTRUTURA DA TABELA pregnancies
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pregnancies'
ORDER BY ordinal_position;

-- 7. VER ALGUNS REGISTROS DE EXEMPLO DA TABELA pregnancies
SELECT * FROM pregnancies LIMIT 3;

-- 8. VERIFICAR ESTRUTURA DA TABELA diary_attachments
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

-- 9. VER ALGUNS REGISTROS DE EXEMPLO DA TABELA diary_attachments
SELECT * FROM diary_attachments LIMIT 3;

-- 10. TESTE SIMPLES - JUNTAR TABELAS
SELECT 
  u.email,
  u.name,
  de.title,
  de.mood,
  de.week
FROM users u
JOIN pregnancies p ON u.id = p.user_id
JOIN diary_entries de ON p.id = de.pregnancy_id
LIMIT 5;
