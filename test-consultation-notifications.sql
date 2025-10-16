-- Script de Teste para Notificações de Consultas
-- Use este script para testar e verificar o sistema de notificações

-- ==================== VERIFICAR ESTRUTURA ====================

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'consultation_notifications'
ORDER BY ordinal_position;

-- 2. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'consultation_notifications';

-- ==================== DADOS DE TESTE ====================

-- 3. Ver todas as consultas agendadas
SELECT 
  id,
  user_id,
  title,
  date,
  location,
  doctor_name,
  completed,
  EXTRACT(EPOCH FROM (date - NOW())) / 3600 as hours_until_consultation
FROM consultations
WHERE completed = false
ORDER BY date;

-- 4. Ver consultas que estão em ~24 horas
SELECT 
  id,
  user_id,
  title,
  date,
  location,
  doctor_name,
  EXTRACT(EPOCH FROM (date - NOW())) / 3600 as hours_until_consultation
FROM consultations
WHERE completed = false
  AND date >= NOW()
  AND date <= NOW() + INTERVAL '25 hours'
ORDER BY date;

-- ==================== NOTIFICAÇÕES ====================

-- 5. Ver todas as notificações
SELECT 
  cn.id,
  cn.consultation_id,
  cn.user_id,
  cn.notification_type,
  cn.scheduled_for,
  cn.sent_at,
  cn.sent,
  cn.created_at,
  c.title as consultation_title,
  c.date as consultation_date
FROM consultation_notifications cn
LEFT JOIN consultations c ON cn.consultation_id = c.id
ORDER BY cn.created_at DESC;

-- 6. Ver notificações pendentes (não enviadas)
SELECT 
  cn.id,
  cn.consultation_id,
  cn.user_id,
  cn.notification_type,
  cn.scheduled_for,
  c.title as consultation_title,
  c.date as consultation_date,
  EXTRACT(EPOCH FROM (c.date - NOW())) / 3600 as hours_until_consultation
FROM consultation_notifications cn
JOIN consultations c ON cn.consultation_id = c.id
WHERE cn.sent = false
ORDER BY cn.scheduled_for;

-- 7. Ver notificações enviadas hoje
SELECT 
  cn.id,
  cn.consultation_id,
  cn.user_id,
  cn.notification_type,
  cn.sent_at,
  c.title as consultation_title,
  c.date as consultation_date
FROM consultation_notifications cn
JOIN consultations c ON cn.consultation_id = c.id
WHERE cn.sent = true
  AND DATE(cn.sent_at) = CURRENT_DATE
ORDER BY cn.sent_at DESC;

-- ==================== ESTATÍSTICAS ====================

-- 8. Total de notificações enviadas
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN sent = true THEN 1 END) as sent_notifications,
  COUNT(CASE WHEN sent = false THEN 1 END) as pending_notifications
FROM consultation_notifications;

-- 9. Notificações por usuário
SELECT 
  u.email,
  COUNT(cn.id) as total_notifications,
  COUNT(CASE WHEN cn.sent = true THEN 1 END) as sent_notifications
FROM consultation_notifications cn
JOIN users u ON cn.user_id = u.id
GROUP BY u.email
ORDER BY total_notifications DESC;

-- 10. Consultas sem notificação
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.date,
  c.location,
  c.doctor_name,
  EXTRACT(EPOCH FROM (c.date - NOW())) / 3600 as hours_until_consultation
FROM consultations c
WHERE c.completed = false
  AND c.date >= NOW()
  AND c.date <= NOW() + INTERVAL '25 hours'
  AND NOT EXISTS (
    SELECT 1 
    FROM consultation_notifications cn 
    WHERE cn.consultation_id = c.id 
      AND cn.notification_type = '24h_reminder'
      AND cn.sent = true
  )
ORDER BY c.date;

-- ==================== LIMPEZA (CUIDADO!) ====================

-- 11. Limpar notificações de teste (DESCOMENTE APENAS SE NECESSÁRIO)
-- DELETE FROM consultation_notifications WHERE sent = false;

-- 12. Resetar todas as notificações (DESCOMENTE APENAS SE NECESSÁRIO)
-- UPDATE consultation_notifications SET sent = false, sent_at = NULL;

-- ==================== CRIAR DADOS DE TESTE ====================

-- 13. Criar uma consulta de teste para amanhã (ajuste o user_id)
/*
INSERT INTO consultations (
  user_id,
  pregnancy_id,
  title,
  date,
  location,
  doctor_name,
  notes,
  completed
) VALUES (
  'SEU_USER_ID_AQUI',
  'SEU_PREGNANCY_ID_AQUI',
  'Consulta de Teste',
  NOW() + INTERVAL '24 hours',
  'Hospital Central',
  'Dr. Teste',
  'Consulta de teste para notificação',
  false
);
*/

-- 14. Verificar se a consulta de teste foi criada
/*
SELECT 
  id,
  user_id,
  title,
  date,
  EXTRACT(EPOCH FROM (date - NOW())) / 3600 as hours_until_consultation
FROM consultations
WHERE title = 'Consulta de Teste'
ORDER BY created_at DESC
LIMIT 1;
*/

-- ==================== TESTE MANUAL ====================

-- 15. Forçar uma notificação (simular o que o sistema faz)
-- PASSO 1: Criar registro de notificação
/*
INSERT INTO consultation_notifications (
  consultation_id,
  user_id,
  notification_type,
  scheduled_for,
  sent,
  created_at
) VALUES (
  'ID_DA_CONSULTA_AQUI',
  'ID_DO_USUARIO_AQUI',
  '24h_reminder',
  NOW(),
  false,
  NOW()
);
*/

-- PASSO 2: Marcar como enviada
/*
UPDATE consultation_notifications
SET sent = true,
    sent_at = NOW()
WHERE consultation_id = 'ID_DA_CONSULTA_AQUI'
  AND notification_type = '24h_reminder'
  AND sent = false;
*/

-- ==================== MONITORAMENTO ====================

-- 16. Ver última notificação enviada
SELECT 
  cn.*,
  c.title,
  c.date as consultation_date,
  u.email as user_email
FROM consultation_notifications cn
JOIN consultations c ON cn.consultation_id = c.id
JOIN users u ON cn.user_id = u.id
WHERE cn.sent = true
ORDER BY cn.sent_at DESC
LIMIT 5;

-- 17. Ver próximas notificações a serem enviadas
SELECT 
  cn.id,
  cn.scheduled_for,
  c.title,
  c.date as consultation_date,
  EXTRACT(EPOCH FROM (c.date - NOW())) / 3600 as hours_until_consultation
FROM consultation_notifications cn
JOIN consultations c ON cn.consultation_id = c.id
WHERE cn.sent = false
  AND c.completed = false
ORDER BY cn.scheduled_for
LIMIT 10;

-- ==================== DIAGNÓSTICO ====================

-- 18. Verificar integridade dos dados
SELECT 
  'Consultas sem gravidez' as issue,
  COUNT(*) as count
FROM consultations c
WHERE NOT EXISTS (
  SELECT 1 FROM pregnancies p WHERE p.id = c.pregnancy_id
)
UNION ALL
SELECT 
  'Consultas sem usuário' as issue,
  COUNT(*) as count
FROM consultations c
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = c.user_id
)
UNION ALL
SELECT 
  'Notificações sem consulta' as issue,
  COUNT(*) as count
FROM consultation_notifications cn
WHERE NOT EXISTS (
  SELECT 1 FROM consultations c WHERE c.id = cn.consultation_id
)
UNION ALL
SELECT 
  'Notificações sem usuário' as issue,
  COUNT(*) as count
FROM consultation_notifications cn
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = cn.user_id
);

-- ==================== FIM ====================

