-- ============================================
-- CRIAR TABELA diary_attachments NO SUPABASE
-- ============================================
-- RODE ISSO NO SUPABASE SQL EDITOR AGORA!
-- ============================================

-- ATENÇÃO: diary_entries.id é VARCHAR, não UUID!
CREATE TABLE IF NOT EXISTS diary_attachments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  diary_entry_id VARCHAR NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  file_data TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para buscar anexos por entrada
CREATE INDEX IF NOT EXISTS idx_diary_attachments_entry 
ON diary_attachments(diary_entry_id);

-- Verificar se foi criada
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'diary_attachments'
ORDER BY ordinal_position;

