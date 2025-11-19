-- Script para adicionar coluna de imagem na tabela feedbacks
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna image_url se não existir
ALTER TABLE feedbacks 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'feedbacks' 
ORDER BY ordinal_position;



