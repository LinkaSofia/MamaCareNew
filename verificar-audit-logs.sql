-- ============================================
-- VERIFICAÇÃO DE AUDIT LOGS
-- ============================================

-- 1. Verificar se existe ALGUM audit log para shopping_items (todos os usuários)
SELECT 
  COUNT(*) AS total_logs_shopping,
  COUNT(DISTINCT user_id) AS usuarios_com_logs
FROM audit_logs
WHERE table_name = 'shopping_items';

-- 2. Verificar os últimos audit logs criados (qualquer tabela)
SELECT 
  timestamp,
  user_id,
  table_name,
  action,
  record_id
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 20;

-- 3. Verificar se há audit logs para o usuário CORRETO (e1e2288f-e96c-40ac-bc3a-5fab0e35b91c)
SELECT 
  COUNT(*) AS total_logs_usuario,
  table_name,
  action,
  COUNT(*) AS quantidade
FROM audit_logs
WHERE user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
GROUP BY table_name, action
ORDER BY table_name, action;

-- 4. Ver TODOS os audit logs do usuário correto para shopping_items
SELECT 
  timestamp,
  action,
  record_id,
  old_values,
  new_values,
  changed_fields
FROM audit_logs
WHERE user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND table_name = 'shopping_items'
ORDER BY timestamp DESC;

-- 5. Verificar qual user_id está sendo usado nas user_analytics para shopping-list
SELECT DISTINCT
  user_id,
  COUNT(*) AS total_acoes,
  MIN(timestamp) AS primeira_acao,
  MAX(timestamp) AS ultima_acao
FROM user_analytics
WHERE page LIKE '%shopping%'
GROUP BY user_id;

-- 6. Comparar: user_analytics vs audit_logs para shopping-list
SELECT 
  'user_analytics' AS fonte,
  COUNT(*) AS total_registros,
  MIN(timestamp) AS primeiro_registro,
  MAX(timestamp) AS ultimo_registro
FROM user_analytics
WHERE page LIKE '%shopping%'
  AND action <> 'page_view'

UNION ALL

SELECT 
  'audit_logs' AS fonte,
  COUNT(*) AS total_registros,
  MIN(timestamp) AS primeiro_registro,
  MAX(timestamp) AS ultimo_registro
FROM audit_logs
WHERE table_name = 'shopping_items';

