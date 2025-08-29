import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  Baby,
  Activity,
  Calendar,
  ShoppingCart,
  Camera,
  BookOpen,
  Dumbbell,
  ChefHat,
  FileText,
  Pill,
  Users,
  TrendingUp,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Apple,
  Weight
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  color: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Dashboard', path: '/', icon: Home, color: 'text-pink-500', description: 'Visão geral da gravidez' },
  { id: 'baby', label: 'Bebê 3D', path: '/baby-development', icon: Baby, color: 'text-blue-500', description: 'Desenvolvimento semana a semana' },
  { id: 'kicks', label: 'Chutinhos', path: '/kick-counter', icon: Activity, color: 'text-green-500', description: 'Contador de movimentos' },
  { id: 'weight', label: 'Peso', path: '/weight-tracking', icon: Weight, color: 'text-purple-500', description: 'Controle de peso' },
  { id: 'progress', label: 'Progresso', path: '/progress', icon: TrendingUp, color: 'text-orange-500', description: 'Gráficos e estatísticas' },
  { id: 'consultations', label: 'Consultas', path: '/consultations', icon: Calendar, color: 'text-teal-500', description: 'Agendamentos médicos' },
  { id: 'shopping', label: 'Compras', path: '/shopping-list', icon: ShoppingCart, color: 'text-indigo-500', description: 'Lista de enxoval' },
  { id: 'photos', label: 'Fotos', path: '/photo-album', icon: Camera, color: 'text-pink-600', description: 'Álbum da barriga' },
  { id: 'diary', label: 'Diário', path: '/diary', icon: BookOpen, color: 'text-violet-500', description: 'Diário da gestação' },
  { id: 'birth-plan', label: 'Plano de Parto', path: '/birth-plan', icon: FileText, color: 'text-rose-500', description: 'Planejamento do parto' },
  { id: 'exercises', label: 'Exercícios', path: '/exercises', icon: Dumbbell, color: 'text-blue-600', description: 'Atividades físicas' },
  { id: 'recipes', label: 'Receitas', path: '/recipes', icon: ChefHat, color: 'text-green-600', description: 'Receitas saudáveis' },
  { id: 'symptoms', label: 'Sintomas', path: '/symptoms', icon: Heart, color: 'text-red-500', description: 'Acompanhamento de sintomas' },
  { id: 'medications', label: 'Medicamentos', path: '/medications', icon: Pill, color: 'text-yellow-600', description: 'Controle de medicações' },
  { id: 'community', label: 'Comunidade', path: '/community', icon: Users, color: 'text-cyan-500', description: 'Rede de mães' }
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={cn(
      'hidden lg:flex lg:flex-col lg:h-screen lg:bg-gradient-to-b lg:from-pink-50/80 lg:to-blue-50/80 lg:border-r lg:border-pink-200/30 lg:backdrop-blur-sm transition-all duration-300',
      isCollapsed ? 'lg:w-20' : 'lg:w-72'
    )}>
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-pink-200/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Mama Care</h2>
                <p className="text-sm text-gray-500">Cuidando de você e seu bebê</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              onClick={() => setLocation(item.path)}
              variant="ghost"
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group',
                active 
                  ? 'bg-white/80 shadow-sm border border-pink-200/30 text-gray-800' 
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-800',
                isCollapsed ? 'justify-center' : 'justify-start'
              )}
              data-testid={`nav-${item.id}`}
            >
              <Icon className={cn('w-5 h-5 shrink-0', active ? item.color : 'text-gray-500 group-hover:text-gray-700')} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">{item.description}</div>
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-pink-200/30 bg-white/30">
        {!isCollapsed && user && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        )}
        
        <div className={cn('flex gap-2', isCollapsed ? 'flex-col' : 'flex-row')}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/profile')}
            className={cn('flex-1 border-pink-200', isCollapsed ? 'px-2' : '')}
            data-testid="nav-profile"
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Perfil</span>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={cn('flex-1 border-pink-200 text-red-600 hover:text-red-700', isCollapsed ? 'px-2' : '')}
            data-testid="nav-logout"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const mainItems = navigationItems.slice(0, 4); // Primeiras 4 funcionalidades principais
  
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-pink-200/30 z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.id}
              onClick={() => setLocation(item.path)}
              variant="ghost"
              className={cn(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200',
                active ? 'bg-pink-50' : 'hover:bg-pink-50/50'
              )}
              data-testid={`mobile-nav-${item.id}`}
            >
              <Icon className={cn('w-5 h-5', active ? item.color : 'text-gray-500')} />
              <span className={cn('text-xs font-medium', active ? 'text-gray-800' : 'text-gray-500')}>
                {item.label}
              </span>
            </Button>
          );
        })}
        
        {/* Menu button for more options */}
        <Button
          onClick={() => setLocation('/menu')}
          variant="ghost"
          className={cn(
            'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200',
            location === '/menu' ? 'bg-pink-50' : 'hover:bg-pink-50/50'
          )}
          data-testid="mobile-nav-menu"
        >
          <Menu className={cn('w-5 h-5', location === '/menu' ? 'text-pink-500' : 'text-gray-500')} />
          <span className={cn('text-xs font-medium', location === '/menu' ? 'text-gray-800' : 'text-gray-500')}>
            Menu
          </span>
        </Button>
      </div>
    </div>
  );
}

export function MobileMenu() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const additionalItems = navigationItems.slice(4); // Itens restantes

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200/30 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mama Care</h1>
            <p className="text-sm text-gray-600">Todas as funcionalidades</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-3 p-3 bg-pink-50/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {additionalItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.id}
                onClick={() => setLocation(item.path)}
                variant="ghost"
                className={cn(
                  'h-24 flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-200',
                  active 
                    ? 'bg-white shadow-sm border border-pink-200/30' 
                    : 'bg-white/50 hover:bg-white/80'
                )}
                data-testid={`menu-${item.id}`}
              >
                <Icon className={cn('w-6 h-6', active ? item.color : 'text-gray-600')} />
                <div className="text-center">
                  <div className="font-medium text-sm text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Button
            onClick={() => setLocation('/profile')}
            variant="outline"
            className="w-full py-3 border-pink-200"
            data-testid="menu-profile"
          >
            <Settings className="w-5 h-5 mr-3" />
            Configurações e Perfil
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full py-3 border-red-200 text-red-600 hover:text-red-700"
            data-testid="menu-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}