-- ============================================
-- DIAGNÓSTICO: Verificar Audit Logs de Peso
-- ============================================

-- 1. Verificar se existe QUALQUER audit log para weight_records
SELECT 
  COUNT(*) AS total_logs_peso,
  COUNT(DISTINCT user_id) AS usuarios_com_logs,
  MIN(timestamp) AS primeiro_log,
  MAX(timestamp) AS ultimo_log
FROM audit_logs
WHERE table_name = 'weight_records';

-- 2. Ver os últimos audit logs de peso (qualquer usuário)
SELECT 
  timestamp,
  user_id,
  action,
  record_id,
  old_values,
  new_values,
  changed_fields
FROM audit_logs
WHERE table_name = 'weight_records'
ORDER BY timestamp DESC
LIMIT 20;

-- 3. Ver audit logs do seu usuário específico
SELECT 
  timestamp,
  action,
  record_id,
  old_values->>'weight' AS peso_antes,
  new_values->>'weight' AS peso_depois,
  changed_fields
FROM audit_logs
WHERE table_name = 'weight_records'
  AND user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY timestamp DESC;

-- 4. Verificar se há registros na tabela weight_records
SELECT 
  COUNT(*) AS total_registros,
  MIN(date) AS primeira_data,
  MAX(date) AS ultima_data
FROM weight_records
WHERE pregnancy_id IN (
  SELECT id FROM pregnancies WHERE user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
);

-- 5. Ver os últimos registros de peso inseridos/atualizados
SELECT 
  wr.id,
  wr.weight,
  wr.date,
  wr.created_at
FROM weight_records wr
INNER JOIN pregnancies p ON p.id = wr.pregnancy_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY wr.created_at DESC
LIMIT 10;

-- 6. Comparar: weight_records vs audit_logs
SELECT 
  'weight_records (tabela)' AS fonte,
  COUNT(*) AS total_registros,
  MIN(date) AS primeira_data,
  MAX(date) AS ultima_data
FROM weight_records wr
INNER JOIN pregnancies p ON p.id = wr.pregnancy_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'

UNION ALL

SELECT 
  'audit_logs (logs)' AS fonte,
  COUNT(*) AS total_registros,
  MIN(timestamp) AS primeira_data,
  MAX(timestamp) AS ultima_data
FROM audit_logs
WHERE table_name = 'weight_records'
  AND user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa';

