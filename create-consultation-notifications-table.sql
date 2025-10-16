-- Criar tabela para rastrear notificações de consultas enviadas
-- Esta tabela evita que notificações sejam enviadas múltiplas vezes

CREATE TABLE IF NOT EXISTS consultation_notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id VARCHAR NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR NOT NULL DEFAULT '24h_reminder',
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(consultation_id, notification_type, scheduled_for)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_user_id ON consultation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_consultation_id ON consultation_notifications(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_sent ON consultation_notifications(sent);
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_scheduled_for ON consultation_notifications(scheduled_for);

-- Comentários
COMMENT ON TABLE consultation_notifications IS 'Rastreia notificações enviadas para consultas agendadas';
COMMENT ON COLUMN consultation_notifications.notification_type IS 'Tipo de notificação: 24h_reminder, 1h_reminder, etc';
COMMENT ON COLUMN consultation_notifications.scheduled_for IS 'Data/hora para a qual a notificação foi agendada';
COMMENT ON COLUMN consultation_notifications.sent IS 'Se a notificação já foi enviada';

