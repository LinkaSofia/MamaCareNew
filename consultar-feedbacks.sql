-- ================================================
-- 📊 CONSULTAS SQL PARA VER FEEDBACKS
-- ================================================

-- 1️⃣ VER TODOS OS FEEDBACKS (mais recentes primeiro)
SELECT 
  f.id,
  u.name as nome_usuario,
  u.email,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as data_envio
FROM feedbacks f
JOIN users u ON f.user_id = u.id
ORDER BY f.created_at DESC;

-- ================================================

-- 2️⃣ VER FEEDBACKS POR TELA (quantos por página)
SELECT 
  f.page as tela,
  COUNT(*) as total_feedbacks,
  ROUND(AVG(f.rating), 2) as nota_media,
  MAX(f.created_at) as ultimo_feedback
FROM feedbacks f
GROUP BY f.page
ORDER BY total_feedbacks DESC;

-- ================================================

-- 3️⃣ VER FEEDBACKS COM NOTA BAIXA (1 ou 2 estrelas)
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE f.rating <= 2
ORDER BY f.created_at DESC;

-- ================================================

-- 4️⃣ VER FEEDBACKS COM NOTA ALTA (4 ou 5 estrelas)
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE f.rating >= 4
ORDER BY f.created_at DESC;

-- ================================================

-- 5️⃣ ESTATÍSTICAS GERAIS
SELECT 
  COUNT(*) as total_feedbacks,
  ROUND(AVG(rating), 2) as nota_media_geral,
  COUNT(DISTINCT user_id) as usuarios_que_avaliaram,
  COUNT(DISTINCT page) as telas_avaliadas,
  MIN(created_at) as primeiro_feedback,
  MAX(created_at) as ultimo_feedback
FROM feedbacks;

-- ================================================

-- 6️⃣ TOP 5 TELAS MAIS AVALIADAS
SELECT 
  f.page as tela,
  COUNT(*) as quantidade,
  ROUND(AVG(f.rating), 2) as nota_media,
  STRING_AGG(DISTINCT '⭐'::text, '') as estrelas_visuais
FROM feedbacks f
GROUP BY f.page
ORDER BY quantidade DESC
LIMIT 5;

-- ================================================

-- 7️⃣ FEEDBACKS DE HOJE
SELECT 
  u.name as usuario,
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  TO_CHAR(f.created_at, 'HH24:MI') as hora
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE DATE(f.created_at) = CURRENT_DATE
ORDER BY f.created_at DESC;

-- ================================================

-- 8️⃣ FEEDBACKS DOS ÚLTIMOS 7 DIAS
SELECT 
  DATE(f.created_at) as dia,
  COUNT(*) as total,
  ROUND(AVG(f.rating), 2) as nota_media
FROM feedbacks f
WHERE f.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(f.created_at)
ORDER BY dia DESC;

-- ================================================

-- 9️⃣ VER FEEDBACKS DE UM USUÁRIO ESPECÍFICO
-- (substitua 'email@exemplo.com' pelo email real)
SELECT 
  f.page as tela,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE u.email = 'linkasofialunkes@gmail.com'
ORDER BY f.created_at DESC;

-- ================================================

-- 🔟 FEEDBACKS POR TELA ESPECÍFICA
-- (substitua '/consultations' pela tela desejada)
SELECT 
  u.name as usuario,
  u.email,
  f.rating as nota,
  f.message as mensagem,
  f.created_at as quando
FROM feedbacks f
JOIN users u ON f.user_id = u.id
WHERE f.page = '/consultations'
ORDER BY f.created_at DESC;

-- ================================================

-- 1️⃣1️⃣ DISTRIBUIÇÃO DE NOTAS (quantos de cada nota)
SELECT 
  f.rating as nota,
  CASE 
    WHEN f.rating = 5 THEN '⭐⭐⭐⭐⭐'
    WHEN f.rating = 4 THEN '⭐⭐⭐⭐'
    WHEN f.rating = 3 THEN '⭐⭐⭐'
    WHEN f.rating = 2 THEN '⭐⭐'
    ELSE '⭐'
  END as estrelas,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) || '%' as porcentagem
FROM feedbacks f
GROUP BY f.rating
ORDER BY f.rating DESC;

-- ================================================

-- 1️⃣2️⃣ RELATÓRIO COMPLETO (todas as informações)
SELECT 
  f.id,
  u.name as usuario,
  u.email,
  f.page as tela,
  f.rating as nota,
  CASE 
    WHEN f.rating = 5 THEN '⭐⭐⭐⭐⭐ Excelente'
    WHEN f.rating = 4 THEN '⭐⭐⭐⭐ Muito Bom'
    WHEN f.rating = 3 THEN '⭐⭐⭐ Bom'
    WHEN f.rating = 2 THEN '⭐⭐ Pode Melhorar'
    ELSE '⭐ Precisa Melhorar'
  END as avaliacao,
  f.message as mensagem,
  TO_CHAR(f.created_at, 'DD/MM/YYYY HH24:MI') as data_hora,
  CASE 
    WHEN f.created_at > NOW() - INTERVAL '1 hour' THEN '🔥 Há menos de 1h'
    WHEN f.created_at > NOW() - INTERVAL '24 hours' THEN '📅 Hoje'
    WHEN f.created_at > NOW() - INTERVAL '7 days' THEN '📆 Esta semana'
    ELSE '📋 Mais antigo'
  END as quando_enviou
FROM feedbacks f
JOIN users u ON f.user_id = u.id
ORDER BY f.created_at DESC;

