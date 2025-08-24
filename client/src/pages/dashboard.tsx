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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-blue-50 pb-20 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-breathe"></div>
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

        {/* Hero Baby Section */}
        <div className="text-center mb-8">
          <div className="relative">
            {/* Baby 3D Component */}
            <div className="mx-auto w-80 h-80 mb-6">
              <Baby3D week={weekInfo.week} className="w-full h-full animate-glow" />
            </div>
            
            {/* Progress Ring */}
            <div className="relative inline-flex mb-4">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
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
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.round(((40 - weekInfo.weeksRemaining) / 40) * 100)}%
                  </div>
                  <div className="text-gray-600 text-xs">
                    Concluído
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-effect rounded-2xl p-6 mx-4 backdrop-blur-md bg-white/80">
            <p className="text-gray-700 text-lg mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Faltam aproximadamente
            </p>
            <p className="text-4xl font-bold text-gray-800 mb-2">
              {weekInfo.weeksRemaining} semanas
            </p>
            <p className="text-gray-600 text-sm">
              para conhecer seu bebê!
            </p>
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

        {activeTab === "baby" && development && (
          <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
            <CardContent className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center">
                  <Ruler className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600 text-xs mb-1">Tamanho</p>
                  <p className="text-gray-800 font-bold text-lg" data-testid="text-baby-size">
                    {development.size || "12 cm"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center">
                  <Weight className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                  <p className="text-gray-600 text-xs mb-1">Peso</p>
                  <p className="text-gray-800 font-bold text-lg" data-testid="text-baby-weight">
                    {development.weight || "150g"}
                  </p>
                </div>
              </div>
              
              {/* Comparison Card */}
              <div className="bg-gradient-to-r from-rose-50 to-blue-50 rounded-2xl p-6 text-center mb-4">
                <p className="text-gray-700 text-sm mb-2">Tamanho comparativo:</p>
                <div className="text-4xl mb-2">🍎</div>
                <p className="text-gray-800 font-semibold">
                  {development.fruit_comparison || "Como uma maçã"}
                </p>
              </div>

              {/* Baby Development Milestones */}
              {babyMilestones.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                  <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                    <Baby className="h-4 w-4 text-green-600" />
                    Desenvolvimento do Bebê
                  </h3>
                  <div className="space-y-2">
                    {babyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{milestone}</p>
                      </div>
                    ))}
                  </div>
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
