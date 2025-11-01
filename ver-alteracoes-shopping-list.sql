-- SQL para ver todas as alterações feitas na lista de compras (shopping-list)
-- ⚠️ USER_ID CORRETO: e1e2288f-e96c-40ac-bc3a-5fab0e35b91c

-- 1. Ver TODAS as alterações na lista de compras com detalhes completos
SELECT
  al.timestamp,
  al.action,                    -- 'create', 'update', 'delete'
  al.table_name,
  al.record_id,
  al.old_values,               -- Valores ANTES da alteração
  al.new_values,               -- Valores DEPOIS da alteração
  al.changed_fields            -- Campos que foram alterados (array)
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
ORDER BY al.timestamp DESC;

-- 2. Ver apenas as criações de itens (quando adicionou um novo item)
SELECT
  al.timestamp,
  al.new_values->>'name' AS nome_item,
  al.new_values->>'category' AS categoria,
  al.new_values->>'price' AS preco,
  al.new_values->>'priority' AS prioridade,
  (al.new_values->>'essential')::boolean AS essencial
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
  AND al.action = 'create'
ORDER BY al.timestamp DESC;

-- 3. Ver apenas as atualizações (quando modificou um item existente)
SELECT
  al.timestamp,
  al.record_id,
  al.old_values->>'name' AS nome_anterior,
  al.new_values->>'name' AS nome_atual,
  al.old_values->>'purchased' AS comprado_antes,
  al.new_values->>'purchased' AS comprado_agora,
  al.changed_fields
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
  AND al.action = 'update'
ORDER BY al.timestamp DESC;

-- 4. Ver apenas as deleções (quando removeu um item)
SELECT
  al.timestamp,
  al.record_id,
  al.old_values->>'name' AS item_removido,
  al.old_values->>'category' AS categoria,
  al.old_values->>'price' AS preco
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
  AND al.action = 'delete'
ORDER BY al.timestamp DESC;

-- 5. Combinar ações do usuário (user_analytics) com alterações reais (audit_logs)
-- ⚠️ IMPORTANTE: Use o user_id CORRETO: e1e2288f-e96c-40ac-bc3a-5fab0e35b91c
SELECT
  ua.timestamp AS quando_clicou,
  ua.action AS tipo_acao,
  ua.page AS pagina,
  ua.element AS elemento_clicado,
  al.timestamp AS quando_alterou,
  al.action AS tipo_alteracao,
  al.table_name AS tabela,
  al.changed_fields AS campos_alterados,
  CASE
    WHEN al.action = 'create' THEN al.new_values->>'name'
    WHEN al.action = 'update' THEN al.new_values->>'name'
    WHEN al.action = 'delete' THEN al.old_values->>'name'
  END AS item_afetado
FROM user_analytics ua
LEFT JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '10 seconds' AND ua.timestamp + INTERVAL '10 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND ua.page LIKE '%shopping%'
  AND ua.action <> 'page_view'
ORDER BY ua.timestamp DESC
LIMIT 100;

-- 5B. QUERY SIMPLIFICADA: Ver APENAS os audit logs (mais direto)
-- Esta é a forma mais simples de ver as alterações
SELECT
  al.timestamp,
  al.action,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou: ' || (al.new_values->>'name')
    WHEN al.action = 'update' THEN '✏️ Atualizou: ' || COALESCE(al.new_values->>'name', 'N/A')
    WHEN al.action = 'delete' THEN '🗑️ Removeu: ' || COALESCE(al.old_values->>'name', 'N/A')
  END AS resumo,
  al.old_values,
  al.new_values,
  al.changed_fields,
  al.record_id
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
ORDER BY al.timestamp DESC;

-- 6. Resumo de alterações por dia na lista de compras
SELECT
  DATE(al.timestamp) AS dia,
  al.action,
  COUNT(*) AS total_acoes,
  STRING_AGG(DISTINCT al.new_values->>'name', ', ') AS itens_criados_atualizados,
  STRING_AGG(DISTINCT al.old_values->>'name', ', ') AS itens_deletados
FROM audit_logs al
WHERE al.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'  -- ⚠️ USER_ID CORRETO
  AND al.table_name = 'shopping_items'
GROUP BY DATE(al.timestamp), al.action
ORDER BY dia DESC, al.action;

