-- ========================================
-- ANÁLISE COMPLETA DE COMPORTAMENTO DO USUÁRIO (VERSÃO CORRIGIDA)
-- ========================================
-- Execute este SQL no Supabase SQL Editor

-- 🔍 PRIMEIRO: Execute o arquivo CORRIGIR-SQL-ANALYTICS.sql para ver a estrutura real das tabelas
-- Depois substitua as colunas conforme necessário

-- ========================================
-- 1. RESUMO GERAL DO USUÁRIO (CORRIGIDO)
-- ========================================
SELECT 
  'RESUMO GERAL' as categoria,
  u.email,
  u.name,
  u.created_at as user_created_at,
  COUNT(DISTINCT de.id) as total_diary_entries,
  COUNT(DISTINCT da.id) as total_attachments,
  MIN(de.created_at) as first_diary_entry,
  MAX(de.created_at) as last_diary_entry,
  AVG(de.mood) as average_mood,
  COUNT(DISTINCT DATE(de.created_at)) as active_days
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
GROUP BY u.id, u.email, u.name, u.created_at;

-- ========================================
-- 2. ATIVIDADE POR DIA (ÚLTIMOS 30 DIAS) - CORRIGIDO
-- ========================================
SELECT 
  'ATIVIDADE POR DIA' as categoria,
  DATE(de.created_at) as data,
  COUNT(*) as entradas_diario,
  AVG(de.mood) as humor_medio,
  STRING_AGG(DISTINCT de.emotions, ', ') as emocoes,
  COUNT(DISTINCT da.id) as anexos_adicionados
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
  AND de.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(de.created_at)
ORDER BY data DESC;

-- ========================================
-- 3. ANÁLISE DE HUMOR E EMOÇÕES - CORRIGIDO
-- ========================================
SELECT 
  'ANÁLISE DE HUMOR' as categoria,
  de.mood,
  COUNT(*) as frequencia,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentagem,
  STRING_AGG(DISTINCT de.emotions, ', ') as emocoes_comuns
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
  AND de.mood IS NOT NULL
GROUP BY de.mood
ORDER BY de.mood DESC;

-- ========================================
-- 4. ANEXOS E ARQUIVOS - CORRIGIDO
-- ========================================
SELECT 
  'ANEXOS' as categoria,
  de.title as entrada_titulo,
  de.created_at as data_entrada,
  da.file_name,
  da.file_type,
  ROUND(da.file_size / 1024.0, 2) as tamanho_kb,
  CASE 
    WHEN da.file_url LIKE 'data:%' THEN 'Base64 (Banco)'
    WHEN da.file_url LIKE 'https://%' THEN 'Supabase Storage'
    ELSE 'Outro'
  END as tipo_armazenamento,
  da.created_at as anexo_criado
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
ORDER BY de.created_at DESC, da.created_at DESC;

-- ========================================
-- 5. EVOLUÇÃO SEMANAL DA GRAVIDEZ - CORRIGIDO
-- ========================================
SELECT 
  'EVOLUÇÃO SEMANAL' as categoria,
  de.week as semana,
  COUNT(*) as entradas_na_semana,
  AVG(de.mood) as humor_medio,
  STRING_AGG(DISTINCT de.milestone, ', ') as marcos_importantes,
  COUNT(DISTINCT da.id) as anexos_na_semana,
  MIN(de.created_at) as primeira_entrada_semana,
  MAX(de.created_at) as ultima_entrada_semana
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
  AND de.week IS NOT NULL
GROUP BY de.week
ORDER BY de.week;

-- ========================================
-- 6. PADRÕES DE USO (HORÁRIOS) - CORRIGIDO
-- ========================================
SELECT 
  'PADRÕES DE USO' as categoria,
  EXTRACT(HOUR FROM de.created_at) as hora_do_dia,
  COUNT(*) as entradas_por_hora,
  AVG(de.mood) as humor_medio_por_hora,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentagem_uso
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
GROUP BY EXTRACT(HOUR FROM de.created_at)
ORDER BY hora_do_dia;

-- ========================================
-- 7. CONTENT ANALYSIS - CORRIGIDO
-- ========================================
SELECT 
  'ANÁLISE DE CONTEÚDO' as categoria,
  CASE 
    WHEN LENGTH(de.content) < 100 THEN 'Curto (< 100 chars)'
    WHEN LENGTH(de.content) < 500 THEN 'Médio (100-500 chars)'
    WHEN LENGTH(de.content) < 1000 THEN 'Longo (500-1000 chars)'
    ELSE 'Muito Longo (> 1000 chars)'
  END as tamanho_conteudo,
  COUNT(*) as frequencia,
  AVG(de.mood) as humor_medio,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentagem
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
  AND de.content IS NOT NULL
GROUP BY 
  CASE 
    WHEN LENGTH(de.content) < 100 THEN 'Curto (< 100 chars)'
    WHEN LENGTH(de.content) < 500 THEN 'Médio (100-500 chars)'
    WHEN LENGTH(de.content) < 1000 THEN 'Longo (500-1000 chars)'
    ELSE 'Muito Longo (> 1000 chars)'
  END
ORDER BY COUNT(*) DESC;

-- ========================================
-- 8. ÚLTIMAS ATIVIDADES (ÚLTIMAS 24H) - CORRIGIDO
-- ========================================
SELECT 
  'ÚLTIMAS ATIVIDADES' as categoria,
  'Diary Entry' as tipo_atividade,
  de.title as titulo,
  de.created_at as timestamp,
  de.mood,
  de.week
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
  AND de.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY de.created_at DESC;

-- ========================================
-- 9. ESTATÍSTICAS DE PERFORMANCE - CORRIGIDO
-- ========================================
SELECT 
  'PERFORMANCE' as categoria,
  'Total Storage Used' as metrica,
  ROUND(SUM(da.file_size) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
UNION ALL
SELECT 
  'PERFORMANCE' as categoria,
  'Base64 Storage' as metrica,
  ROUND(SUM(CASE WHEN da.file_url LIKE 'data:%' THEN da.file_size ELSE 0 END) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
UNION ALL
SELECT 
  'PERFORMANCE' as categoria,
  'Supabase Storage' as metrica,
  ROUND(SUM(CASE WHEN da.file_url LIKE 'https://%' THEN da.file_size ELSE 0 END) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa';  -- SUBSTITUA PELO ID DO USUÁRIO

-- ========================================
-- 10. CONSULTA SIMPLES PARA TESTE - CORRIGIDO
-- ========================================
SELECT 
  'TESTE SIMPLES' as categoria,
  u.email,
  u.name,
  COUNT(DISTINCT de.id) as total_entradas,
  AVG(de.mood) as humor_medio,
  MIN(de.created_at) as primeira_entrada,
  MAX(de.created_at) as ultima_entrada
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id
WHERE u.id = '5154abdc-375d-4aeb-b7d5-4479070701fa'  -- SUBSTITUA PELO ID DO USUÁRIO
GROUP BY u.id, u.email, u.name;

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. PRIMEIRO: Execute CORRIGIR-SQL-ANALYTICS.sql para ver a estrutura real
-- 2. Se a coluna de data se chama diferente (ex: 'date' ao invés de 'created_at'), 
--    substitua 'de.created_at' por 'de.date' em todas as consultas
-- 3. Substitua '5154abdc-375d-4aeb-b7d5-4479070701fa' pelo ID real do usuário
-- 4. Execute cada consulta separadamente para testar
-- 5. Se houver mais erros, verifique os nomes das colunas na tabela
