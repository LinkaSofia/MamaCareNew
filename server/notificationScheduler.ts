// Agendador de Notificações para MamaCare
import { NotificationService } from './notificationService';
import cron from 'node-cron';

export class NotificationScheduler {
  private static isRunning = false;

  // Inicializar o agendador
  static start(): void {
    if (this.isRunning) {
      console.log("⚠️ Notification scheduler already running");
      return;
    }

    console.log("🚀 Starting notification scheduler...");

    // Notificação diária às 10:00
    cron.schedule('0 10 * * *', async () => {
      console.log("⏰ Daily notification time - 10:00 AM");
      await NotificationService.sendDailyNotifications();
    }, {
      timezone: "America/Sao_Paulo"
    });

    // Notificação diária às 18:00 (alternativa)
    cron.schedule('0 18 * * *', async () => {
      console.log("⏰ Evening notification time - 6:00 PM");
      await NotificationService.sendDailyNotifications();
    }, {
      timezone: "America/Sao_Paulo"
    });

    // Verificar consultas a cada hora (para notificações 24h antes)
    cron.schedule('0 * * * *', async () => {
      console.log("📅 Checking for upcoming consultations (hourly)");
      await NotificationService.sendConsultationNotifications();
    }, {
      timezone: "America/Sao_Paulo"
    });

    // Notificação de teste a cada 5 minutos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      cron.schedule('*/5 * * * *', async () => {
        console.log("🧪 Test notification (development only)");
        // await NotificationService.sendDailyNotifications();
        // await NotificationService.sendConsultationNotifications();
      });
    }

    this.isRunning = true;
    console.log("✅ Notification scheduler started successfully");
  }

  // Parar o agendador
  static stop(): void {
    if (!this.isRunning) {
      console.log("⚠️ Notification scheduler not running");
      return;
    }

    cron.destroy();
    this.isRunning = false;
    console.log("🛑 Notification scheduler stopped");
  }

  // Verificar status
  static getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }

  // Enviar notificação de teste
  static async sendTestNotification(): Promise<void> {
    console.log("🧪 Sending test notification...");
    await NotificationService.sendDailyNotifications();
  }

  // Enviar teste de notificação de consulta
  static async sendTestConsultationNotification(): Promise<void> {
    console.log("🧪 Testing consultation notification...");
    await NotificationService.sendConsultationNotifications();
  }
}
