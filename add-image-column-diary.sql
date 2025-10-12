-- Script para adicionar coluna de imagem nas entradas do diário
-- Executar no Supabase SQL Editor

ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Comentário explicando a coluna
COMMENT ON COLUMN diary_entries.image IS 'Imagem da entrada do diário em formato base64';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_entries' 
  AND column_name = 'image';

