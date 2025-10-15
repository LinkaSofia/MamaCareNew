// Componente de Configurações de Notificação
import { useState, useEffect } from 'react';
import { Bell, BellOff, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { NotificationManager } from '@/lib/notifications';
import { API_CONFIG } from '@/lib/api';

export function NotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    // Verificar status atual das notificações
    const checkNotificationStatus = () => {
      const enabled = NotificationManager.isEnabled();
      setIsEnabled(enabled);
    };

    checkNotificationStatus();
  }, []);

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    
    try {
      if (!isEnabled) {
        // Solicitar permissão
        const granted = await NotificationManager.requestPermission();
        if (granted) {
          setIsEnabled(true);
          
          // Notificar o backend sobre a permissão
          await fetch(`${API_CONFIG.BASE_URL}/api/notifications/request-permission`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }
      } else {
        // Desabilitar notificações (não é possível via API, mas podemos atualizar o estado local)
        setIsEnabled(false);
      }
    } catch (error) {
      console.error('❌ Error toggling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    setTestSent(false);
    
    try {
      // Enviar notificação de teste via backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Também mostrar notificação local
        NotificationManager.showTestNotification();
        setTestSent(true);
        
        // Resetar após 3 segundos
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-500" />
          Notificações
        </CardTitle>
        <CardDescription>
          Receba lembretes fofos sobre sua gravidez
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle de Notificações */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Notificações Push</p>
            <p className="text-xs text-gray-500">
              Receba lembretes diários sobre seu bebê
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleNotifications}
            disabled={isLoading}
          />
        </div>

        {/* Status das Notificações */}
        <div className="flex items-center gap-2 text-sm">
          {isEnabled ? (
            <>
              <Bell className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Notificações ativadas</span>
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Notificações desativadas</span>
            </>
          )}
        </div>

        {/* Botão de Teste */}
        {isEnabled && (
          <div className="pt-2">
            <Button
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testSent ? 'Notificação Enviada!' : 'Testar Notificação'}
            </Button>
          </div>
        )}

        {/* Informações sobre Notificações */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Receba lembretes diários às 10h e 18h</p>
          <p>• Mensagens personalizadas baseadas na semana da gravidez</p>
          <p>• Apenas se você não acessou o app no dia</p>
        </div>
      </CardContent>
    </Card>
  );
}
