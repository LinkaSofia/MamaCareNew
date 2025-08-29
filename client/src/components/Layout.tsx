import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { authManager } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Páginas que não devem ter layout (login, setup, etc.)
  const noLayoutPages = ['/login', '/reset-password', '/forgot-password', '/setup', '/pregnancy-setup'];
  const shouldHideLayout = noLayoutPages.some(page => location.startsWith(page));
  
  // Se está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não está logado e não está em página pública, redirecionar para login
  if (!user && !shouldHideLayout) {
    console.log("🔄 Redirecting to login - user not authenticated");
    // Forçar redirecionamento imediato sem cache
    window.location.replace('/login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-blue-50/50">
      {/* Conteúdo principal - sem sidebar lateral */}
      <div className="min-h-screen">
        <main className={cn(
          'min-h-screen', 
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;