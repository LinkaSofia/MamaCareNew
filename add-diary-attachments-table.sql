-- Script para criar tabela de anexos do diário
-- Suporta múltiplos arquivos (imagens, PDFs, etc) por entrada

-- Criar tabela de anexos
CREATE TABLE IF NOT EXISTS diary_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  file_data TEXT NOT NULL, -- Arquivo em base64
  file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'image/png', 'application/pdf', etc
  file_name VARCHAR(255), -- Nome original do arquivo (opcional)
  file_size INTEGER, -- Tamanho em bytes
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar anexos por entrada
CREATE INDEX IF NOT EXISTS idx_diary_attachments_entry 
ON diary_attachments(diary_entry_id);

-- Comentários
COMMENT ON TABLE diary_attachments IS 'Anexos (imagens, PDFs) das entradas do diário';
COMMENT ON COLUMN diary_attachments.file_data IS 'Conteúdo do arquivo em base64';
COMMENT ON COLUMN diary_attachments.file_type IS 'MIME type do arquivo';
COMMENT ON COLUMN diary_attachments.file_name IS 'Nome original do arquivo';
COMMENT ON COLUMN diary_attachments.file_size IS 'Tamanho do arquivo em bytes';

-- Verificar criação
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

