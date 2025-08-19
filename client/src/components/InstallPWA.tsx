import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstallStatus = () => {
      // Verificar se está rodando como PWA (standalone)
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const fullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const minimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      setIsStandalone(standalone || fullscreen || minimalUi);
      
      // Verificar se está no iOS Safari em modo standalone
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      
      setIsInstalled(standalone || fullscreen || minimalUi || isInStandaloneMode);
    };

    checkInstallStatus();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 3 segundos se não estiver instalado
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // Mostrar instruções manuais para iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Para instalar: \n1. Toque no ícone de compartilhar (↗️)\n2. Selecione "Adicionar à Tela de Início"\n3. Toque em "Adicionar"');
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Não mostrar novamente por 7 dias
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou se foi dispensado recentemente
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (isInstalled || isStandalone) return null;
  
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) return null;
  }

  if (!showInstallPrompt && !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-pink-100 p-2">
              <Smartphone className="h-5 w-5 text-pink-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                Instalar Aplicativo
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Adicione à sua tela inicial para acesso rápido e notificações
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                  data-testid="button-install-app"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Instalar
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  data-testid="button-dismiss-install"
                >
                  Agora não
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              data-testid="button-close-install"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}