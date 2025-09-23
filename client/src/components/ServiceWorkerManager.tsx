import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, X } from 'lucide-react';

interface ServiceWorkerManagerProps {
  onUpdateAvailable?: () => void;
  onUpdateInstalled?: () => void;
}

export function ServiceWorkerManager({ 
  onUpdateAvailable, 
  onUpdateInstalled 
}: ServiceWorkerManagerProps) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Verifica se há uma atualização disponível
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg);
          
          // Verifica se há uma nova versão
          reg.addEventListener('updatefound', () => {
            console.log('🔄 Nova versão do Service Worker encontrada');
            setUpdateAvailable(true);
            onUpdateAvailable?.();
          });
        }
      });

      // Escuta mudanças no controller
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller mudou');
        onUpdateInstalled?.();
        setUpdateAvailable(false);
      });
    }
  }, [onUpdateAvailable, onUpdateInstalled]);

  const handleUpdate = async () => {
    if (!registration) return;
    
    setIsUpdating(true);
    
    try {
      // Força atualização do service worker
      await registration.update();
      
      // Se há uma nova versão instalada, ativa ela
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Reload simples sem cache busting
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro ao atualizar Service Worker:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-sm font-semibold text-orange-800">
                Atualização Disponível
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-orange-700 mb-3">
            Uma nova versão do aplicativo está disponível. Atualize para ter acesso às últimas funcionalidades.
          </CardDescription>
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Atualizar Agora
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para gerenciar Service Worker
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Monitora status de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Registra Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ Cache limpo com sucesso');
    }
  };

  const forceUpdate = async () => {
    if (swRegistration) {
      await swRegistration.update();
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  return {
    isOnline,
    swRegistration,
    clearCache,
    forceUpdate
  };
}
