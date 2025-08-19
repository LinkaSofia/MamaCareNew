import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

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
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar o card de instalação após alguns segundos
      setTimeout(() => {
        if (!isInStandaloneMode) {
          setShowInstallCard(true);
        }
      }, 3000);
    };

    const handleAppInstalled = () => {
      console.log('PWA foi instalado');
      setShowInstallCard(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para iOS - mostrar instruções depois de um tempo
    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => {
        setShowInstallCard(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuario aceitou instalar a PWA');
      } else {
        console.log('Usuario rejeitou instalar a PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallCard(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallCard(false);
  };

  // Não mostrar se já está instalado
  if (isStandalone) {
    return null;
  }

  // Não mostrar se não há prompt disponível e não é iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  // Não mostrar o card se foi dismissado
  if (!showInstallCard) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="bg-gradient-to-r from-baby-pink to-baby-blue border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">
                  Instalar App
                </h3>
                <p className="text-white/90 text-xs">
                  {isIOS 
                    ? 'Toque no ícone de compartilhar e "Adicionar à Tela Inicial"'
                    : 'Acesse offline e tenha uma experiência completa'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white"
              data-testid="button-dismiss-install"
            >
              <X size={18} />
            </button>
          </div>
          
          {!isIOS && (
            <div className="mt-3 flex space-x-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 flex-1"
                data-testid="button-install-pwa"
              >
                <Download size={16} className="mr-1" />
                Instalar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}