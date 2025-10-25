import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, Component, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Auth provider removido - usando auth manager
import { Layout } from "@/components/Layout";
import { FeedbackButton } from "@/components/feedback-button";
import { NotificationManager } from "./lib/notifications";

// Import das páginas essenciais
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
// import PregnancySetup from "@/pages/pregnancy-setup"; // REMOVIDO - dados coletados no registro
import Setup from "@/pages/setup";
import ResetPassword from "@/pages/reset-password";
import Profile from "@/pages/profile";

// Import das páginas principais
import KickCounter from "@/pages/kick-counter";
import WeightTracking from "@/pages/weight-tracking";
import Consultations from "@/pages/consultations";
import ShoppingList from "@/pages/shopping-list";
import PhotoAlbum from "@/pages/photo-album";
import Diary from "@/pages/diary";
import BirthPlan from "@/pages/birth-plan";
import Exercises from "@/pages/exercises";
import Recipes from "@/pages/recipes";

// Import dos componentes que vou criar
import BabyDevelopment from "@/pages/baby-development";
import AuditLogs from "@/pages/audit-logs";
import { Progress } from "@/pages/progress";
import Symptoms from "@/pages/symptoms";
import Medications from "@/pages/medications";
import Community from "@/pages/community";
import MedicalArticles from "@/pages/medical-articles";
// import { MobileMenu } from "@/components/Navigation"; // Removido - não usar menu lateral
import NotFound from "@/pages/not-found";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ServiceWorkerManager } from "@/components/ServiceWorkerManager";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { DebugCacheButton } from "@/components/DebugCacheButton";
import { useUserTracking } from "@/hooks/useUserTracking";

function Router() {
  // Inicializar tracking automático
  const { trackPageVisit, trackAction } = useUserTracking({
    trackPageViews: true,
    trackClicks: true,
    trackTime: true
  });

  return (
    <Layout>
      <Switch>
        {/* Páginas sem layout */}
        <Route path="/login" component={Login} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/forgot-password" component={ResetPassword} />
        {/* <Route path="/pregnancy-setup" component={PregnancySetup} /> */} {/* REMOVIDO - dados coletados no registro */}
        {/* <Route path="/setup" component={Setup} /> */} {/* REMOVIDO - Vai direto para pregnancy-setup */}
        
        {/* Páginas principais com layout */}
        <Route path="/" component={Dashboard} />
        <Route path="/baby-development" component={BabyDevelopment} />
        <Route path="/kick-counter" component={KickCounter} />
        <Route path="/weight-tracking" component={WeightTracking} />
        <Route path="/progress" component={Progress} />
        <Route path="/consultations" component={Consultations} />
        <Route path="/shopping-list" component={ShoppingList} />
        <Route path="/photo-album" component={PhotoAlbum} />
        <Route path="/diary" component={Diary} />
        <Route path="/birth-plan" component={BirthPlan} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/symptoms" component={Symptoms} />
        <Route path="/medications" component={Medications} />
        <Route path="/community" component={Community} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route path="/medical-articles" component={MedicalArticles} />
        <Route path="/profile" component={Profile} />
        {/* <Route path="/menu" component={MobileMenu} /> */}
        
        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Inicializar notificações quando o app carrega
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Configurar Service Worker
        await NotificationManager.setupServiceWorker();
        
        // Solicitar permissão de notificação após 3 segundos
        setTimeout(async () => {
          const hasPermission = await NotificationManager.requestPermission();
          if (hasPermission) {
            console.log('✅ Notifications enabled');
          } else {
            console.log('❌ Notifications disabled');
          }
        }, 3000);
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <AnimatedBackground>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <Toaster />
            <FeedbackButton />
            <PWAInstallPrompt />
            <ServiceWorkerManager 
              onUpdateAvailable={() => console.log('🔄 Atualização disponível')}
              onUpdateInstalled={() => console.log('✅ Atualização instalada')}
            />
            {/* <DebugCacheButton /> */}
            <div className="App">
              <Router />
            </div>
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </AnimatedBackground>
  );
}

export default App;