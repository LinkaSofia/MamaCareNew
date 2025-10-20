// Serviço de Notificações Push para MamaCare
import { db } from './storage';
import { sql, eq } from 'drizzle-orm';

export interface NotificationMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class NotificationService {
  // Mensagens fofas de notificação
  private static getDailyMessages(): NotificationMessage[] {
    return [
      {
        title: "👶 Seu bebê está crescendo!",
        body: "Venha ver como seu bebê está se desenvolvendo hoje!",
        icon: "/icons/baby-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "💕 Momento especial",
        body: "Que tal registrar como você está se sentindo hoje?",
        icon: "/icons/heart-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "📱 MamaCare te espera",
        body: "Sua jornada maternal continua! Vamos acompanhar juntas?",
        icon: "/icons/app-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "🌟 Dica do dia",
        body: "Descubra uma nova dica para sua gravidez hoje!",
        icon: "/icons/star-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "📖 Diário maternal",
        body: "Que tal escrever sobre seu dia especial?",
        icon: "/icons/diary-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "🎯 Acompanhe seu progresso",
        body: "Veja como você e seu bebê estão evoluindo!",
        icon: "/icons/progress-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "💝 Amor em crescimento",
        body: "Seu bebê está cada dia mais próximo de você!",
        icon: "/icons/love-192.png",
        badge: "/icons/badge-72.png"
      },
      {
        title: "🌈 Jornada única",
        body: "Cada dia da sua gravidez é especial. Vamos celebrar?",
        icon: "/icons/rainbow-192.png",
        badge: "/icons/badge-72.png"
      }
    ];
  }

  // Obter mensagem aleatória do dia
  static getRandomDailyMessage(): NotificationMessage {
    const messages = this.getDailyMessages();
    const today = new Date().getDate();
    const messageIndex = today % messages.length;
    return messages[messageIndex];
  }

  // Obter mensagem baseada na semana da gravidez
  static getWeeklyMessage(week: number): NotificationMessage {
    const weekMessages: { [key: number]: NotificationMessage } = {
      1: {
        title: "🎉 Parabéns!",
        body: "Você está na 1ª semana! Sua jornada começou!",
        icon: "/icons/celebration-192.png"
      },
      8: {
        title: "💓 Primeiro batimento",
        body: "Na 8ª semana, o coraçãozinho do seu bebê já bate!",
        icon: "/icons/heartbeat-192.png"
      },
      12: {
        title: "👶 Primeiro trimestre",
        body: "12 semanas! O primeiro trimestre está chegando ao fim!",
        icon: "/icons/baby-192.png"
      },
      20: {
        title: "🎯 Meio do caminho",
        body: "20 semanas! Você está na metade da sua jornada!",
        icon: "/icons/milestone-192.png"
      },
      28: {
        title: "🌟 Terceiro trimestre",
        body: "28 semanas! O terceiro trimestre começou!",
        icon: "/icons/star-192.png"
      },
      36: {
        title: "🚀 Quase lá!",
        body: "36 semanas! Seu bebê está quase pronto para nascer!",
        icon: "/icons/rocket-192.png"
      }
    };

    return weekMessages[week] || this.getRandomDailyMessage();
  }

  // Verificar se usuário acessou o app hoje
  static async hasUserAccessedToday(userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM analytics_page_visits 
        WHERE user_id = ${userId} 
        AND DATE(timestamp) = ${today}
      `);
      
      return (result[0] as any).count > 0;
    } catch (error) {
      console.error("❌ Error checking user access:", error);
      return false;
    }
  }

  // Obter usuários que não acessaram hoje
  static async getUsersToNotify(): Promise<string[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await db.execute(sql`
        SELECT DISTINCT u.id 
        FROM users u
        LEFT JOIN analytics_page_visits apv ON u.id = apv.user_id 
          AND DATE(apv.timestamp) = ${today}
        WHERE apv.user_id IS NULL
        AND u.id IS NOT NULL
      `);
      
      return result.map((row: any) => row.id);
    } catch (error) {
      console.error("❌ Error getting users to notify:", error);
      return [];
    }
  }

  // Enviar notificação para um usuário
  static async sendNotificationToUser(userId: string, message: NotificationMessage): Promise<boolean> {
    try {
      // Aqui você implementaria o envio real via FCM, OneSignal, etc.
      console.log(`📱 Sending notification to user ${userId}:`, message);
      
      // Por enquanto, apenas log
      // Em produção, você usaria:
      // - Firebase Cloud Messaging (FCM)
      // - OneSignal
      // - Pusher
      // - Web Push API
      
      return true;
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      return false;
    }
  }

  // Enviar notificações diárias
  static async sendDailyNotifications(): Promise<void> {
    try {
      console.log("📱 Starting daily notifications...");
      
      const usersToNotify = await this.getUsersToNotify();
      console.log(`📱 Found ${usersToNotify.length} users to notify`);
      
      for (const userId of usersToNotify) {
        const message = this.getRandomDailyMessage();
        await this.sendNotificationToUser(userId, message);
        
        // Pequena pausa entre notificações
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log("✅ Daily notifications sent successfully");
    } catch (error) {
      console.error("❌ Error sending daily notifications:", error);
    }
  }

  // ==================== NOTIFICAÇÕES DE CONSULTAS ====================
  
  // Obter consultas que precisam de notificação 24h antes
  static async getConsultationsFor24hNotification(): Promise<any[]> {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      console.log(`🔍 Buscando consultas entre ${now.toISOString()} e ${in24Hours.toISOString()}`);
      
      // Buscar consultas que acontecem em ~24 horas e ainda não foram notificadas
      const result = await db.execute(sql`
        SELECT 
          c.id as consultation_id,
          c.user_id,
          c.title,
          c.date,
          c.location,
          c.doctor_name,
          c.pregnancy_id
        FROM consultations c
        WHERE c.date >= ${now.toISOString()}
          AND c.date <= ${in24Hours.toISOString()}
          AND c.completed = false
          AND NOT EXISTS (
            SELECT 1 
            FROM consultation_notifications cn 
            WHERE cn.consultation_id = c.id 
              AND cn.notification_type = '24h_reminder'
              AND cn.sent = true
          )
      `);
      
      console.log(`📊 Encontradas ${result.length} consultas para notificar:`, result);
      
      return result;
    } catch (error) {
      console.error("❌ Error getting consultations for 24h notification:", error);
      return [];
    }
  }

  // Criar registro de notificação agendada
  static async scheduleConsultationNotification(
    consultationId: string,
    userId: string,
    notificationType: string,
    scheduledFor: Date
  ): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO consultation_notifications (
          consultation_id,
          user_id,
          notification_type,
          scheduled_for,
          sent,
          created_at
        ) VALUES (
          ${consultationId},
          ${userId},
          ${notificationType},
          ${scheduledFor.toISOString()},
          false,
          NOW()
        )
        ON CONFLICT (consultation_id, notification_type, scheduled_for) DO NOTHING
      `);
      
      console.log(`✅ Scheduled notification for consultation ${consultationId}`);
    } catch (error) {
      console.error("❌ Error scheduling consultation notification:", error);
    }
  }

  // Marcar notificação como enviada
  static async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE consultation_notifications
        SET sent = true,
            sent_at = NOW()
        WHERE id = ${notificationId}
      `);
      
      console.log(`✅ Marked notification ${notificationId} as sent`);
    } catch (error) {
      console.error("❌ Error marking notification as sent:", error);
    }
  }

  // Obter mensagem de notificação de consulta
  static getConsultationNotificationMessage(consultation: any): NotificationMessage {
    const consultationDate = new Date(consultation.date);
    const timeString = consultationDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const locationText = consultation.location 
      ? ` em ${consultation.location}` 
      : '';
    
    const doctorText = consultation.doctor_name 
      ? ` com ${consultation.doctor_name}` 
      : '';

    return {
      title: "📅 Lembrete de Consulta",
      body: `${consultation.title}${doctorText}${locationText} amanhã às ${timeString}`,
      icon: "/icons/calendar-192.png",
      badge: "/icons/badge-72.png",
      data: {
        type: 'consultation_reminder',
        consultationId: consultation.consultation_id,
        url: '/consultations'
      }
    };
  }

  // Enviar notificações de consultas agendadas
  static async sendConsultationNotifications(): Promise<void> {
    try {
      const now = new Date();
      console.log("=".repeat(80));
      console.log("📅 INICIANDO VERIFICAÇÃO DE NOTIFICAÇÕES DE CONSULTAS");
      console.log(`⏰ Hora atual: ${now.toISOString()} (${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })})`);
      console.log("=".repeat(80));
      
      const consultations = await this.getConsultationsFor24hNotification();
      console.log(`\n📊 RESULTADO DA BUSCA:`);
      console.log(`   Total de consultas encontradas: ${consultations.length}`);
      
      if (consultations.length === 0) {
        console.log(`\n⚠️  NENHUMA CONSULTA PARA NOTIFICAR!`);
        console.log(`   Possíveis razões:`);
        console.log(`   1. Não há consultas nas próximas 24 horas`);
        console.log(`   2. Todas as consultas já foram notificadas`);
        console.log(`   3. Consultas estão marcadas como 'completed = true'`);
        console.log("=".repeat(80));
        return;
      }

      console.log(`\n📋 CONSULTAS A SEREM NOTIFICADAS:`);
      consultations.forEach((c, i) => {
        console.log(`\n   ${i + 1}. Consulta ID: ${c.consultation_id}`);
        console.log(`      Usuário: ${c.user_id}`);
        console.log(`      Título: ${c.title}`);
        console.log(`      Data: ${c.date}`);
        console.log(`      Local: ${c.location || 'Não informado'}`);
      });

      for (const consultation of consultations) {
        try {
          console.log(`\n${"─".repeat(80)}`);
          console.log(`🔔 PROCESSANDO: ${consultation.title} (ID: ${consultation.consultation_id})`);
          
          // Criar registro de notificação
          console.log(`   📝 Criando registro de notificação...`);
          await this.scheduleConsultationNotification(
            consultation.consultation_id,
            consultation.user_id,
            '24h_reminder',
            new Date()
          );

          // Obter mensagem personalizada
          const message = this.getConsultationNotificationMessage(consultation);
          console.log(`   📨 Mensagem preparada:`, message);

          // Enviar notificação
          console.log(`   🚀 Enviando notificação para usuário ${consultation.user_id}...`);
          const sent = await this.sendNotificationToUser(consultation.user_id, message);
          
          if (sent) {
            console.log(`   ✅ Notificação ENVIADA com sucesso!`);
            
            // Buscar o ID da notificação criada e marcar como enviada
            const notificationResult = await db.execute(sql`
              SELECT id FROM consultation_notifications
              WHERE consultation_id = ${consultation.consultation_id}
                AND notification_type = '24h_reminder'
                AND sent = false
              ORDER BY created_at DESC
              LIMIT 1
            `);
            
            if (notificationResult.length > 0) {
              console.log(`   ✅ Marcando notificação como enviada (ID: ${notificationResult[0].id})`);
              await this.markNotificationAsSent(notificationResult[0].id);
            }
          } else {
            console.log(`   ❌ FALHA ao enviar notificação!`);
            console.log(`   Possíveis razões:`);
            console.log(`   - Usuário sem subscription de push`);
            console.log(`   - Permissões de notificação bloqueadas`);
            console.log(`   - Token de push inválido`);
          }

          // Pequena pausa entre notificações
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`   ❌ ERRO ao processar consulta ${consultation.consultation_id}:`, error);
        }
      }

      console.log(`\n${"=".repeat(80)}`);
      console.log("✅ VERIFICAÇÃO DE NOTIFICAÇÕES CONCLUÍDA");
      console.log("=".repeat(80));
    } catch (error) {
      console.error("❌ ERRO CRÍTICO no sistema de notificações:", error);
    }
  }
}
