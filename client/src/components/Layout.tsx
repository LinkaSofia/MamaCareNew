import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [location] = useLocation();
  
  // Páginas que não devem ter layout (login, setup, etc.)
  const noLayoutPages = ['/login', '/reset-password', '/forgot-password', '/setup', '/pregnancy-setup'];
  const shouldHideLayout = noLayoutPages.some(page => location.startsWith(page));

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