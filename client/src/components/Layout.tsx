import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { authManager } from '@/lib/auth';
import BottomNavigation from '@/components/layout/bottom-navigation';
import { SplashScreen } from '@/components/SplashScreen';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [hasShownSplash, setHasShownSplash] = useState(false);
  
  console.log("🔍 Layout render:", { location, user: !!user, isLoading });
  
  // Páginas que não devem ter layout (login, setup, etc.)
  const noLayoutPages = ['/login', '/reset-password', '/forgot-password', '/setup'];
  const shouldHideLayout = noLayoutPages.some(page => location.startsWith(page));
  
  console.log("🔍 Layout check:", { shouldHideLayout, noLayoutPages, location });
  
  // Mostrar splash screen apenas quando usuário logado acessa o dashboard pela primeira vez na sessão
  useEffect(() => {
    // Verificar se já mostrou o splash nesta sessão
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (user && !isLoading && !shouldHideLayout && !splashShown && location === '/') {
      console.log("🎨 Showing splash screen for logged user");
      setShowSplash(true);
      setHasShownSplash(true);
      // Marcar que já mostrou o splash nesta sessão
      sessionStorage.setItem('splashShown', 'true');
    }
  }, [user, isLoading, shouldHideLayout, hasShownSplash, location]);
  
  // Se está carregando, mostrar loading
  if (isLoading) {
    console.log("🔍 Layout: Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não está logado e não está em página pública, redirecionar para login
  if (!user && !shouldHideLayout && !isLoading) {
    console.log("🔄 Redirecting to login - user not authenticated");
    // Redirecionamento imediato
    window.location.href = '/login';
    return null;
  }

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Mostrar splash screen se necessário
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

export default Layout;