import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useBabyDevelopment } from "@/hooks/use-baby-development";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Baby3D from "@/components/Baby3D";
import { 
  Bell, 
  Baby, 
  Heart, 
  Ruler, 
  Weight, 
  Apple,
  Activity,
  User,
  Calendar,
  Info,
  Book,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { pregnancy, weekInfo, isLoading: pregnancyLoading } = usePregnancy();
  const { data: developmentData, isLoading: developmentLoading } = useBabyDevelopment(weekInfo?.week || 0);
  const [activeTab, setActiveTab] = useState("baby");
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const isLoading = authLoading || pregnancyLoading || developmentLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Usar setTimeout para evitar problemas de re-render
    setTimeout(() => setLocation("/login"), 0);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (pregnancyLoading || developmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pregnancy) {
    setLocation("/setup");
    return null;
  }

  if (!weekInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center p-6">
          <Baby className="mx-auto h-12 w-12 text-pink-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao calcular semana
          </h2>
          <p className="text-gray-600 mb-4">
            Verifique os dados da sua gravidez
          </p>
          <Button onClick={() => setLocation("/setup")} variant="outline">
            Configurar
          </Button>
        </div>
      </div>
    );
  }

  const development = developmentData?.developmentData;

  // Parse development milestones - if they're strings, split them; if they're arrays, use them
  const parseMilestones = (milestones: string | string[]): string[] => {
    if (Array.isArray(milestones)) {
      return milestones;
    }
    if (typeof milestones === 'string') {
      // Try to parse as JSON array first, then split by common delimiters
      try {
        const parsed = JSON.parse(milestones);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, split by common separators
        return milestones.split(/[;,\n]/).map(item => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const babyMilestones = development ? parseMilestones(development.development_milestones_baby) : [];
  const momMilestones = development ? parseMilestones(development.development_milestones_mom) : [];

  return (
    <div className="min-h-screen gradient-bg pb-20 relative overflow-hidden">
      {/* Background decorative elements - same as login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Corações flutuantes */}
        {[...Array(8)].map((_, i) => (
          <Heart
            key={`heart-${i}`}
            className={`absolute text-pink-300/30 animate-float-${i % 4 + 1}`}
            size={20 + (i % 3) * 10}
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
        
        {/* Bolinhas flutuantes */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className={`absolute rounded-full bg-gradient-to-r from-pink-200/20 to-blue-200/20 animate-bounce`}
            style={{
              width: `${8 + (i % 4) * 6}px`,
              height: `${8 + (i % 4) * 6}px`,
              left: `${5 + (i * 8) % 90}%`,
              top: `${10 + (i * 8) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 3)}s`
            }}
          />
        ))}
        
        {/* Estrelas piscantes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`absolute w-2 h-2 bg-yellow-300/40 animate-pulse`}
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${i * 1.2}s`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        ))}
      </div>
      
      {/* Header Section */}
      <div className="relative z-10 px-4 pt-12 pb-8">
        <div className="flex items-center justify-end mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 text-right hover:bg-white/10 rounded-lg p-2 transition-colors">
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-gray-800" data-testid="text-greeting">
                    Olá, Mamãe!
                  </h1>
                  <p className="text-gray-600 text-lg" data-testid="text-pregnancy-week">
                    Semana {weekInfo.week} de gestação
                  </p>
                </div>
                <div className="w-16 h-16 bg-pink-200/50 rounded-full flex items-center justify-center">
                  {user.profilePhotoUrl ? (
                    <img 
                      src={user.profilePhotoUrl} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLocation("/profile")} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hero Section - Compacto */}
        <div className="mb-6">
          <div className="flex items-center justify-between mx-4">
            {/* Baby 3D Component - Menor */}
            <div className="w-32 h-32">
              <Baby3D week={weekInfo.week} className="w-full h-full animate-glow" />
            </div>
            
            {/* Progress e Informações do Lado */}
            <div className="flex-1 ml-6">
              <div className="flex items-center justify-between mb-4">
                {/* Progress Ring - Menor */}
                <div className="relative">
                  <svg className="w-20 h-20" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(156, 163, 175, 0.3)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.round(((40 - weekInfo.weeksRemaining) / 40) * 314)} 314`}
                      className="progress-ring animate-pulse"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {Math.round(((40 - weekInfo.weeksRemaining) / 40) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informações Importantes */}
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-1">
                    Faltam
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {weekInfo.weeksRemaining} semanas
                  </p>
                  <p className="text-gray-500 text-xs">
                    para conhecer seu bebê!
                  </p>
                </div>
              </div>
              
              {/* Informações do Bebê - Linha */}
              {development && (
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Tamanho</p>
                    <p className="font-semibold text-gray-800 text-sm">{development.size || "N/A"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Peso</p>
                    <p className="font-semibold text-gray-800 text-sm">{development.weight || "N/A"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Como</p>
                    <p className="font-semibold text-gray-800 text-sm">{development.fruit_comparison || "N/A"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mom/Baby Toggle */}
      <div className="px-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-full p-1 flex border border-gray-200">
          <button
            onClick={() => setActiveTab("mom")}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              activeTab === "mom"
                ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-lg"
                : "text-gray-600"
            }`}
            data-testid="tab-mom"
          >
            Mamãe
          </button>
          <button
            onClick={() => setActiveTab("baby")}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              activeTab === "baby"
                ? "bg-white text-blue-600 shadow-lg"
                : "text-gray-600"
            }`}
            data-testid="tab-baby"
          >
            Bebê
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-4">

        {activeTab === "baby" && (
          <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
            <CardContent className="p-6">
              {/* Baby Development Milestones */}
              {babyMilestones.length > 0 ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                  <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                    <Baby className="h-4 w-4 text-blue-600" />
                    Desenvolvimento do Bebê
                  </h3>
                  <div className="space-y-2">
                    {babyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <Baby className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-gray-800 font-semibold mb-2">
                    Desenvolvimento do Bebê
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nenhuma informação específica disponível para esta semana.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "mom" && (
          <div className="space-y-4">
            {/* Mom Development Milestones */}
            {momMilestones.length > 0 ? (
              <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
                <CardContent className="p-6">
                  <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Mudanças na Mamãe
                  </h3>
                  <div className="space-y-3">
                    {momMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-3 bg-pink-50 rounded-xl p-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                  <h3 className="text-gray-800 font-semibold mb-2">
                    Informações da Mamãe
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nenhuma informação específica disponível para esta semana.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center py-2 px-4 group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs text-gray-800 font-medium mt-1">Início</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 group hover:scale-110 transition-transform">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Baby className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 mt-1">Bebê</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 group hover:scale-110 transition-transform">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Book className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 mt-1">Diário</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4 group hover:scale-110 transition-transform">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-600 mt-1">Dicas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
