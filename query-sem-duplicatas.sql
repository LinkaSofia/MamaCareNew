-- ============================================
-- QUERY SEM DUPLICATAS: Página + O que foi alterado
-- ============================================
-- Esta query começa pelos audit_logs (fonte única) e busca a página mais próxima
-- Evita duplicatas que ocorrem quando múltiplas ações do usuário estão na mesma janela de tempo

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
    CASE 
      WHEN al.table_name = 'weight_records' THEN '/weight-tracking'
      WHEN al.table_name = 'shopping_items' THEN '/shopping-list'
      WHEN al.table_name = 'consultations' THEN '/consultations'
      WHEN al.table_name = 'birth_plans' THEN '/birth-plan'
      WHEN al.table_name = 'diary_entries' THEN '/diary'
      ELSE '/'
    END
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
    ELSE al.table_name
  END AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM audit_logs al
WHERE al.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY al.timestamp DESC
LIMIT 100;

-- ============================================
-- VERSÃO AINDA MAIS SIMPLES (sem buscar página)
-- ============================================
-- Se você só quer ver as alterações sem se preocupar com a página exata:

SELECT
  TO_CHAR(al.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS quando,
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
    WHEN al.table_name = 'pregnancies' THEN 'Orçamento: R$ ' || COALESCE(al.new_values->>'budget', al.old_values->>'budget', 'N/A')
    ELSE al.table_name
  END AS item_afetado,
  al.changed_fields AS o_que_mudou
FROM audit_logs al
WHERE al.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'
ORDER BY al.timestamp DESC
LIMIT 100;

