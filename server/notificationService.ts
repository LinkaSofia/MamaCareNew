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
}
