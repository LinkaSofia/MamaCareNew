-- Criar tabela de notificações de consultas
CREATE TABLE IF NOT EXISTS consultation_notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id VARCHAR NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR NOT NULL DEFAULT '24h_reminder',
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Adicionar constraint UNIQUE para evitar duplicatas
  UNIQUE(consultation_id, notification_type)
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_user ON consultation_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_consultation ON consultation_notifications(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notifications_sent ON consultation_notifications(sent, scheduled_for);




