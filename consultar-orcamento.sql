-- ============================================
-- CONSULTAR ORÇAMENTO DA LISTA DE COMPRAS
-- ============================================

-- 1. Ver orçamento do usuário específico
SELECT 
  u.email AS email_usuario,
  p.id AS id_gravidez,
  p.budget AS orcamento,
  TO_CHAR(p.budget, 'FM999,999.00') AS orcamento_formatado,
  p.due_date AS data_prevista,
  p.created_at AS data_criacao
FROM pregnancies p
INNER JOIN users u ON u.id = p.user_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND p.is_active = true;

-- 2. Ver orçamento por email
SELECT 
  u.email AS email_usuario,
  u.name AS nome_usuario,
  p.id AS id_gravidez,
  p.budget AS orcamento,
  TO_CHAR(p.budget, 'FM999,999.00') AS orcamento_formatado,
  p.due_date AS data_prevista
FROM pregnancies p
INNER JOIN users u ON u.id = p.user_id
WHERE u.email = 'linkasofialunkes@gmail.com'
  AND p.is_active = true;

-- 3. Ver TODOS os orçamentos cadastrados
SELECT 
  u.email AS email,
  u.name AS nome,
  p.budget AS orcamento,
  TO_CHAR(p.budget, 'FM999,999.00') AS orcamento_formatado,
  p.created_at AS quando_criado,
  p.is_active AS gravidez_ativa
FROM pregnancies p
INNER JOIN users u ON u.id = p.user_id
WHERE p.budget IS NOT NULL
ORDER BY p.created_at DESC;

-- 4. Ver histórico de alterações do orçamento (via audit_logs)
SELECT
  TO_CHAR(al.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando_alterou,
  u.email AS usuario,
  al.old_values->>'budget' AS orcamento_antes,
  al.new_values->>'budget' AS orcamento_depois,
  CASE 
    WHEN al.old_values->>'budget' IS NOT NULL 
    THEN TO_CHAR(
      (CAST(al.new_values->>'budget' AS DECIMAL) - CAST(al.old_values->>'budget' AS DECIMAL)), 
      'FM999,999.00'
    )
    ELSE NULL
  END AS diferenca
FROM audit_logs al
INNER JOIN users u ON u.id = al.user_id
WHERE al.table_name = 'pregnancies'
  AND al.changed_fields::text LIKE '%budget%'
  AND al.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY al.timestamp DESC;

-- 5. Ver estrutura da tabela pregnancies (confirmar se a coluna existe)
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pregnancies'
  AND column_name = 'budget';

-- 6. Ver todos os campos da gravidez ativa do usuário
SELECT 
  p.id,
  p.user_id,
  p.budget,
  p.due_date,
  p.last_menstrual_period,
  p.is_active,
  p.created_at,
  u.email,
  u.name
FROM pregnancies p
INNER JOIN users u ON u.id = p.user_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
  AND p.is_active = true;

-- 7. Atualizar orçamento manualmente (se necessário)
-- ⚠️ CUIDADO: Use apenas para testes ou correções!
/*
UPDATE pregnancies
SET budget = 3000.00
WHERE id = 'ID-DA-GRAVIDEZ-AQUI'
  AND user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa';
*/

