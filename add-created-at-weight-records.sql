-- Script para adicionar coluna created_at na tabela weight_records
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna created_at se não existir
ALTER TABLE weight_records 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'weight_records' 
ORDER BY ordinal_position;
