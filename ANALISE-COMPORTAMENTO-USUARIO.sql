-- ========================================
-- ANÁLISE COMPLETA DE COMPORTAMENTO DO USUÁRIO
-- ========================================
-- Execute este SQL no Supabase SQL Editor

-- 🔍 SUBSTITUA ESTE ID PELO ID DO USUÁRIO QUE VOCÊ QUER ANALISAR
-- Para encontrar IDs de usuários, execute: SELECT id, email, name FROM users;
SET @user_id = '5154abdc-375d-4aeb-b7d5-4479070701fa';

-- ========================================
-- 1. RESUMO GERAL DO USUÁRIO
-- ========================================
SELECT 
  'RESUMO GERAL' as categoria,
  u.email,
  u.name,
  u.created_at as user_created_at,
  COUNT(DISTINCT de.id) as total_diary_entries,
  COUNT(DISTINCT da.id) as total_attachments,
  COUNT(DISTINCT av.id) as total_page_visits,
  MIN(de.created_at) as first_diary_entry,
  MAX(de.created_at) as last_diary_entry,
  AVG(de.mood) as average_mood,
  COUNT(DISTINCT DATE(de.created_at)) as active_days
FROM users u
LEFT JOIN pregnancies p ON u.id = p.user_id
LEFT JOIN diary_entries de ON p.id = de.pregnancy_id
LEFT JOIN diary_attachments da ON de.id = da.diary_entry_id
LEFT JOIN analytics_page_visits av ON u.id = av.user_id
WHERE u.id = @user_id
GROUP BY u.id, u.email, u.name, u.created_at;

-- ========================================
-- 2. ATIVIDADE POR DIA (ÚLTIMOS 30 DIAS)
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
WHERE p.user_id = @user_id 
  AND de.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(de.created_at)
ORDER BY data DESC;

-- ========================================
-- 3. NAVEGAÇÃO E PÁGINAS VISITADAS
-- ========================================
SELECT 
  'NAVEGAÇÃO' as categoria,
  av.page as pagina,
  COUNT(*) as total_visitas,
  MIN(av.timestamp) as primeira_visita,
  MAX(av.timestamp) as ultima_visita,
  AVG(EXTRACT(EPOCH FROM (
    LEAD(av.timestamp) OVER (PARTITION BY av.user_id ORDER BY av.timestamp) - av.timestamp
  ))/60) as tempo_medio_minutos
FROM analytics_page_visits av
WHERE av.user_id = @user_id
GROUP BY av.page
ORDER BY total_visitas DESC;

-- ========================================
-- 4. ANÁLISE DE HUMOR E EMOÇÕES
-- ========================================
SELECT 
  'ANÁLISE DE HUMOR' as categoria,
  de.mood,
  COUNT(*) as frequencia,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentagem,
  STRING_AGG(DISTINCT de.emotions, ', ') as emocoes_comuns,
  AVG(EXTRACT(EPOCH FROM (de.created_at - LAG(de.created_at) OVER (ORDER BY de.created_at)))/3600) as intervalo_horas_medio
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = @user_id 
  AND de.mood IS NOT NULL
GROUP BY de.mood
ORDER BY de.mood DESC;

-- ========================================
-- 5. ANEXOS E ARQUIVOS
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
WHERE p.user_id = @user_id
ORDER BY de.created_at DESC, da.created_at DESC;

-- ========================================
-- 6. EVOLUÇÃO SEMANAL DA GRAVIDEZ
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
WHERE p.user_id = @user_id 
  AND de.week IS NOT NULL
GROUP BY de.week
ORDER BY de.week;

-- ========================================
-- 7. PADRÕES DE USO (HORÁRIOS)
-- ========================================
SELECT 
  'PADRÕES DE USO' as categoria,
  EXTRACT(HOUR FROM de.created_at) as hora_do_dia,
  COUNT(*) as entradas_por_hora,
  AVG(de.mood) as humor_medio_por_hora,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as porcentagem_uso
FROM diary_entries de
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = @user_id
GROUP BY EXTRACT(HOUR FROM de.created_at)
ORDER BY hora_do_dia;

-- ========================================
-- 8. CONTENT ANALYSIS
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
WHERE p.user_id = @user_id 
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
-- 9. ÚLTIMAS ATIVIDADES (ÚLTIMAS 24H)
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
WHERE p.user_id = @user_id 
  AND de.created_at >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'ÚLTIMAS ATIVIDADES' as categoria,
  'Page Visit' as tipo_atividade,
  av.page as titulo,
  av.timestamp,
  NULL as mood,
  NULL as week
FROM analytics_page_visits av
WHERE av.user_id = @user_id 
  AND av.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- ========================================
-- 10. ESTATÍSTICAS DE PERFORMANCE
-- ========================================
SELECT 
  'PERFORMANCE' as categoria,
  'Total Storage Used' as metrica,
  ROUND(SUM(da.file_size) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = @user_id
UNION ALL
SELECT 
  'PERFORMANCE' as categoria,
  'Base64 Storage' as metrica,
  ROUND(SUM(CASE WHEN da.file_url LIKE 'data:%' THEN da.file_size ELSE 0 END) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = @user_id
UNION ALL
SELECT 
  'PERFORMANCE' as categoria,
  'Supabase Storage' as metrica,
  ROUND(SUM(CASE WHEN da.file_url LIKE 'https://%' THEN da.file_size ELSE 0 END) / 1024.0 / 1024.0, 2) as valor_mb,
  'MB' as unidade
FROM diary_attachments da
JOIN diary_entries de ON da.diary_entry_id = de.id
JOIN pregnancies p ON de.pregnancy_id = p.id
WHERE p.user_id = @user_id;

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Substitua @user_id pelo ID do usuário que você quer analisar
-- 2. Execute cada seção separadamente ou todas juntas
-- 3. Para ver todos os usuários, remova a condição WHERE u.id = @user_id
-- 4. Para análise em tempo real, execute as consultas 9 e 10 regularmente
