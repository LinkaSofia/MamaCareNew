-- Adicionar coluna budget na tabela pregnancies
-- O orçamento será salvo no banco de dados para funcionar no PWA

ALTER TABLE pregnancies
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT 2000.00;

-- Comentário explicativo
COMMENT ON COLUMN pregnancies.budget IS 'Orçamento total da lista de compras para esta gravidez';

