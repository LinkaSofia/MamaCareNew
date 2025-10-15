// Serviço de Notificações Push no Frontend
export class NotificationManager {
  private static permission: NotificationPermission = 'default';

  // Solicitar permissão de notificação
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('❌ This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied');
      this.permission = 'denied';
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        this.showWelcomeNotification();
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  // Mostrar notificação de boas-vindas
  static showWelcomeNotification(): void {
    if (this.permission !== 'granted') return;

    new Notification('👋 Bem-vinda ao MamaCare!', {
      body: 'Você receberá lembretes fofos sobre sua gravidez!',
      icon: '/icons/baby-192.png',
      badge: '/icons/badge-72.png',
      tag: 'welcome',
      requireInteraction: false
    });
  }

  // Mostrar notificação personalizada
  static showNotification(title: string, body: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') return;

    new Notification(title, {
      body,
      icon: '/icons/baby-192.png',
      badge: '/icons/badge-72.png',
      requireInteraction: false,
      ...options
    });
  }

  // Verificar se notificações estão habilitadas
  static isEnabled(): boolean {
    return this.permission === 'granted';
  }

  // Obter status da permissão
  static getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Configurar notificações no Service Worker
  static async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      // Service Worker DESABILITADO para evitar atualizações constantes
      console.log('⚠️ Service Worker registration DESABILITADO');
      /*
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Configurar push notifications
        if ('PushManager' in window) {
          console.log('✅ Push Manager available');
        }
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
      */
    }
  }

  // Mostrar notificação de teste
  static showTestNotification(): void {
    this.showNotification(
      '🧪 Teste de Notificação',
      'Se você está vendo isso, as notificações estão funcionando!',
      {
        tag: 'test',
        requireInteraction: true
      }
    );
  }
}
