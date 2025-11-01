-- ============================================
-- QUERIES: VER EM QUAL PÁGINA E O QUE FOI ALTERADO
-- ============================================

-- ⚠️ USER_ID: e1e2288f-e96c-40ac-bc3a-5fab0e35b91c

-- ============================================
-- QUERY 1: VISÃO COMPLETA - Página + Alteração + Detalhes
-- ============================================
-- Mostra: Página onde estava, ação do usuário, o que foi alterado, valores antigos/novos
SELECT
  ua.timestamp AS quando_clicou,
  ua.page AS pagina,
  ua.action AS acao_usuario,
  ua.element AS elemento_clicado,
  al.timestamp AS quando_alterou,
  al.table_name AS tabela_alterada,
  al.action AS tipo_alteracao,  -- 'create', 'update', 'delete'
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou: ' || COALESCE(al.new_values->>'name', 'item')
    WHEN al.action = 'update' THEN '✏️ Atualizou: ' || COALESCE(al.new_values->>'name', al.old_values->>'name', 'item')
    WHEN al.action = 'delete' THEN '🗑️ Removeu: ' || COALESCE(al.old_values->>'name', 'item')
  END AS resumo_alteracao,
  al.changed_fields AS campos_alterados,
  al.old_values AS valores_antes,
  al.new_values AS valores_depois,
  al.record_id AS id_registro
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND ua.action <> 'page_view'  -- Apenas ações (cliques, etc), não visualizações
ORDER BY ua.timestamp DESC
LIMIT 200;

-- ============================================
-- QUERY 2: RESUMO POR PÁGINA - O que foi feito em cada página
-- ============================================
-- Mostra quantas alterações foram feitas em cada página
SELECT
  ua.page AS pagina,
  COUNT(DISTINCT al.id) AS total_alteracoes,
  COUNT(DISTINCT CASE WHEN al.action = 'create' THEN al.id END) AS criacoes,
  COUNT(DISTINCT CASE WHEN al.action = 'update' THEN al.id END) AS atualizacoes,
  COUNT(DISTINCT CASE WHEN al.action = 'delete' THEN al.id END) AS delecoes,
  STRING_AGG(
    DISTINCT 
    CASE 
      WHEN al.action = 'create' THEN '✅ ' || COALESCE(al.new_values->>'name', 'item')
      WHEN al.action = 'update' THEN '✏️ ' || COALESCE(al.new_values->>'name', al.old_values->>'name', 'item')
      WHEN al.action = 'delete' THEN '🗑️ ' || COALESCE(al.old_values->>'name', 'item')
    END,
    ', '
    ORDER BY al.timestamp DESC
  ) AS itens_afetados
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND ua.action <> 'page_view'
GROUP BY ua.page
ORDER BY total_alteracoes DESC;

-- ============================================
-- QUERY 3: SIMPLIFICADA - Apenas página e resumo da alteração (SEM DUPLICATAS)
-- ============================================
-- Mais fácil de ler, mostra apenas o essencial
-- Agora evita duplicatas usando subquery para encontrar a página mais próxima

SELECT
  TO_CHAR(al.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
  COALESCE(
    (SELECT page 
     FROM user_analytics 
     WHERE user_id = al.user_id 
       AND action <> 'page_view'
       AND timestamp BETWEEN al.timestamp - INTERVAL '15 seconds' AND al.timestamp + INTERVAL '15 seconds'
     ORDER BY ABS(EXTRACT(EPOCH FROM (timestamp - al.timestamp)))
     LIMIT 1),
    '/weight-tracking'
  ) AS pagina,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou'
    WHEN al.action = 'update' THEN '✏️ Atualizou'
    WHEN al.action = 'delete' THEN '🗑️ Removeu'
  END AS o_que_fez,
  CASE
    WHEN al.table_name = 'shopping_items' THEN COALESCE(al.new_values->>'name', al.old_values->>'name', 'item')
    WHEN al.table_name = 'consultations' THEN COALESCE(al.new_values->>'title', al.old_values->>'title', 'consulta')
    WHEN al.table_name = 'birth_plans' THEN 'Plano de Parto'
    WHEN al.table_name = 'diary_entries' THEN 'Entrada no Diário'
    WHEN al.table_name = 'weight_records' THEN 'Peso: ' || COALESCE(al.new_values->>'weight', al.old_values->>'weight', 'N/A') || ' kg'
    WHEN al.table_name = 'weight_entries' THEN 'Peso: ' || COALESCE(al.new_values->>'weight', al.old_values->>'weight', 'N/A') || ' kg'
    WHEN al.table_name = 'pregnancies' THEN 'Orçamento: R$ ' || COALESCE(al.new_values->>'budget', al.old_values->>'budget', 'N/A')
    ELSE al.table_name || ' (ID: ' || LEFT(al.record_id, 8) || '...)'
  END AS item_afetado,
  al.changed_fields AS campos_alterados
FROM audit_logs al
WHERE al.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY al.timestamp DESC
LIMIT 100;

-- ============================================
-- QUERY 4: FILTRADA POR PÁGINA ESPECÍFICA
-- ============================================
-- Ver apenas alterações feitas na página de shopping-list
SELECT
  ua.timestamp AS quando_clicou,
  ua.page AS pagina,
  ua.element AS elemento_clicado,
  al.action AS tipo_alteracao,
  CASE
    WHEN al.action = 'create' THEN '✅ Adicionou: ' || (al.new_values->>'name')
    WHEN al.action = 'update' THEN '✏️ Atualizou: ' || COALESCE(al.new_values->>'name', al.old_values->>'name')
    WHEN al.action = 'delete' THEN '🗑️ Removeu: ' || (al.old_values->>'name')
  END AS item,
  al.changed_fields AS o_que_mudou,
  al.old_values AS antes,
  al.new_values AS depois
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND ua.page LIKE '%shopping%'
  AND ua.action <> 'page_view'
  AND al.table_name = 'shopping_items'
ORDER BY ua.timestamp DESC;

-- ============================================
-- QUERY 5: POR DIA - Resumo diário de alterações por página
-- ============================================
-- Ver o que foi feito em cada página por dia
SELECT
  DATE(ua.timestamp) AS dia,
  ua.page AS pagina,
  COUNT(DISTINCT al.id) AS total_alteracoes,
  STRING_AGG(
    DISTINCT
    CASE
      WHEN al.action = 'create' THEN '✅ ' || COALESCE(al.new_values->>'name', 'novo item')
      WHEN al.action = 'update' THEN '✏️ ' || COALESCE(al.new_values->>'name', al.old_values->>'name', 'item')
      WHEN al.action = 'delete' THEN '🗑️ ' || COALESCE(al.old_values->>'name', 'item')
    END,
    ' | '
  ) AS resumo
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND ua.action <> 'page_view'
GROUP BY DATE(ua.timestamp), ua.page
ORDER BY dia DESC, total_alteracoes DESC;

-- ============================================
-- QUERY 6: DETALHADA COM TODAS AS INFORMAÇÕES
-- ============================================
-- Para análise completa - mostra TUDO
SELECT
  -- Informações do clique/ação
  ua.id AS analytics_id,
  ua.timestamp AS timestamp_clique,
  ua.page AS pagina,
  ua.action AS tipo_acao_analytics,  -- 'button_click', 'click', etc
  ua.element AS elemento_clicado,
  ua.session_id AS sessao,
  
  -- Informações da alteração
  al.id AS audit_log_id,
  al.timestamp AS timestamp_alteracao,
  al.table_name AS tabela,
  al.action AS tipo_alteracao,  -- 'create', 'update', 'delete'
  al.record_id AS id_registro_alterado,
  al.changed_fields AS campos_alterados,
  
  -- Valores antes e depois
  al.old_values AS valores_antes,
  al.new_values AS valores_depois,
  
  -- Diferença de tempo entre clique e alteração
  EXTRACT(EPOCH FROM (al.timestamp - ua.timestamp)) AS segundos_entre_clique_e_alteracao
  
FROM user_analytics ua
INNER JOIN audit_logs al
  ON al.user_id = ua.user_id
  AND al.timestamp BETWEEN ua.timestamp - INTERVAL '15 seconds' AND ua.timestamp + INTERVAL '15 seconds'
WHERE ua.user_id = 'e1e2288f-e96c-40ac-bc3a-5fab0e35b91c'
  AND ua.action <> 'page_view'
ORDER BY ua.timestamp DESC
LIMIT 100;

