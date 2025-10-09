import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    console.log('🔧 PWA Install Prompt: Iniciando verificações...');
    
    // COMENTADO - NÃO limpar localStorage (estava apagando authToken!)
    // localStorage.removeItem('pwa-prompt-dismissed');
    // console.log('🧹 localStorage limpo para depuração');
    
    // Verificar se foi dispensado recentemente (TEMPORARIAMENTE DESABILITADO)
    // const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    // if (dismissed) {
    //   const dismissedTime = parseInt(dismissed);
    //   const now = Date.now();
    //   const twentyFourHours = 24 * 60 * 60 * 1000;
    //   
    //   if (now - dismissedTime < twentyFourHours) {
    //     console.log('⏰ PWA Prompt dispensado há menos de 24h');
    //     return; // Não mostrar se foi dispensado há menos de 24 horas
    //   }
    // }

    // Verificar se já está instalado como PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode || isIOSStandalone);

    console.log('📱 PWA Status:', {
      isInStandaloneMode,
      isIOSStandalone,
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    });

    // Se já estiver instalado, não mostrar
    if (isInStandaloneMode || isIOSStandalone) {
      console.log('✅ PWA já instalado - não mostrar prompt');
      return;
    }

    // Listener para o evento de instalação (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt capturado!', e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar o prompt após 3 segundos
      setTimeout(() => {
        console.log('📲 Mostrando prompt de instalação...');
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Para dispositivos que suportam PWA nativo
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    console.log('👂 Listener beforeinstallprompt adicionado');

    // Para iOS e outros navegadores, mostrar após 3 segundos
    const timer = setTimeout(() => {
      if (!isInStandaloneMode && !isIOSStandalone) {
        console.log('⏳ Timer ativado - mostrando prompt (sem beforeinstallprompt)');
        setShowInstallPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
      console.log('🧹 PWA listeners removidos');
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🎯 handleInstallClick chamado, deferredPrompt:', deferredPrompt);
    if (!deferredPrompt) {
      console.log('❌ Nenhum deferredPrompt disponível');
      return;
    }

    try {
      console.log('📲 Chamando deferredPrompt.prompt()...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('👤 Escolha do usuário:', outcome);
      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso');
      } else {
        console.log('❌ Usuário recusou instalar PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('💥 Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Não mostrar novamente por 24 horas
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Detectar iOS para instruções especiais
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  console.log('🔍 Render PWAInstallPrompt:', {
    isStandalone,
    showInstallPrompt,
    deferredPrompt: !!deferredPrompt,
    isIOS,
    willShow: !isStandalone && showInstallPrompt
  });

  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <DialogTitle className="text-left">Instalar Mama Care</DialogTitle>
                <DialogDescription className="text-left text-sm">
                  Acesse rapidamente do seu celular
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
              data-testid="button-dismiss-install"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Instale o Mama Care no seu celular para:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Acesso rápido da tela inicial</li>
              <li>Funciona sem internet</li>
              <li>Notificações importantes</li>
              <li>Experiência como app nativo</li>
            </ul>
          </div>

          {/* Instruções para iOS */}
          {isIOS && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Para instalar no iOS:
              </p>
              <ol className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                <li>1. Toque no ícone de compartilhar ↗️</li>
                <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
                <li>3. Toque em "Adicionar"</li>
              </ol>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            {/* TEMPORÁRIO: Sempre mostrar botão instalar para depuração */}
            {!isIOS && (
              <Button 
                onClick={deferredPrompt ? handleInstallClick : () => {
                  console.log('⚠️ Prompt manual - beforeinstallprompt não disponível');
                  console.log('🔧 Possíveis problemas: manifest.json, service worker ou critérios PWA não atendidos');
                  alert('PWA não pode ser instalada automaticamente. Verifique se atende aos critérios PWA.');
                }}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                data-testid="button-install-pwa"
              >
                <Download className="w-4 h-4 mr-2" />
                {deferredPrompt ? 'Instalar App' : 'Debug PWA'}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className={!isIOS ? "flex-1" : "w-full"}
              data-testid="button-maybe-later"
            >
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}