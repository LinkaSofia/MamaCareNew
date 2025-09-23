-- Script para adicionar campos faltantes na tabela photos
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna favorite se não existir
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;

-- Adicionar coluna milestone se não existir
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS milestone TEXT;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'photos' 
ORDER BY ordinal_position;
