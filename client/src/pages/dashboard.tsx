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
// import ThreeDBaby from "@/components/three-d-baby";
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
  ChevronDown
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
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 pb-20">
      {/* Header Section */}
      <div className="px-4 pt-12 pb-8">
        <div className="flex items-center justify-end mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 text-right hover:bg-white/10 rounded-lg p-2 transition-colors">
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-white" data-testid="text-greeting">
                    Olá, Mamãe!
                  </h1>
                  <p className="text-white/80 text-lg" data-testid="text-pregnancy-week">
                    Semana {weekInfo.week} de gestação
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  {user.profilePhotoUrl ? (
                    <img 
                      src={user.profilePhotoUrl} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-white/80" />
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

        {/* Progress Circle */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-40 h-40 rounded-full border-8 border-white/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">
                  {Math.round(((40 - weekInfo.weeksRemaining) / 40) * 100)}%
                </div>
                <div className="text-white/80 text-sm">
                  Concluído
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/80 text-lg mb-2">
            Faltam aproximadamente
          </p>
          <p className="text-3xl font-bold text-white">
            {weekInfo.weeksRemaining} semanas
          </p>
        </div>
      </div>

      {/* Mom/Baby Toggle */}
      <div className="px-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex">
          <button
            onClick={() => setActiveTab("mom")}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              activeTab === "mom"
                ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg"
                : "text-white/70"
            }`}
            data-testid="tab-mom"
          >
            Mom
          </button>
          <button
            onClick={() => setActiveTab("baby")}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              activeTab === "baby"
                ? "bg-white text-purple-600 shadow-lg"
                : "text-white/70"
            }`}
            data-testid="tab-baby"
          >
            Baby
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4">

        {activeTab === "baby" && development && (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Size</p>
                  <p className="text-gray-800 font-semibold" data-testid="text-baby-size">
                    {development.fruit_comparison || development.size || "N/A"}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                  <Baby className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm">Weight</p>
                  <p className="text-gray-800 font-semibold" data-testid="text-baby-weight">
                    {development.weight || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-6xl mb-2">🍎</div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {development.size || "12 cm"}
                    </p>
                  </div>
                  <span className="text-gray-400 text-lg">vs</span>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {development.weight || "150g"}
                    </p>
                  </div>
                </div>
              </div>

              {development.baby_description && (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <p className="text-gray-700 text-sm">{development.baby_description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "mom" && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm font-medium text-gray-800">
                  Contador de Chutes
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Weight className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium text-gray-800">
                  Controle de Peso
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                <p className="text-sm font-medium text-gray-800">
                  Sintomas
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4 text-center">
                <Book className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium text-gray-800">
                  Diário
                </p>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/20">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-4">
            <div className="relative">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-800 font-medium mt-1">Início</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4">
            <Baby className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">Bebê</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4">
            <Book className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">Diário</span>
          </button>
          
          <button className="flex flex-col items-center py-2 px-4">
            <Heart className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">Dicas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
