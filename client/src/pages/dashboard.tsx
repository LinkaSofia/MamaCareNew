import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useBabyDevelopment } from "@/hooks/use-baby-development";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FloatingActionButton from "@/components/layout/floating-action-button";
import ThreeDBaby from "@/components/three-d-baby";
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
  Book
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { pregnancy, weekInfo, isLoading: pregnancyLoading } = usePregnancy();
  const { data: developmentData, isLoading: developmentLoading } = useBabyDevelopment(weekInfo?.week || 0);
  const [activeTab, setActiveTab] = useState("baby");
  const [, setLocation] = useLocation();

  const isLoading = authLoading || pregnancyLoading || developmentLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 pb-20">
      {/* Header - Modern Mobile Design */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-4 pt-12 shadow-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold" data-testid="text-greeting">
              Olá, {user.name}! 👋
            </h2>
            <p className="text-sm opacity-90" data-testid="text-pregnancy-week">
              Semana {weekInfo.week} de gestação
            </p>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
              !
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Main Week Card - Futuristic Design */}
        <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 h-2"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-pink-500 mr-2" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Semana {weekInfo.week}
                  </h2>
                </div>
                
                {development ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center bg-pink-50 p-3 rounded-xl">
                      <Ruler className="h-4 w-4 text-pink-500 mr-2" />
                      <div>
                        <div className="text-xs text-gray-600">Tamanho</div>
                        <div className="font-bold text-gray-800" data-testid="text-baby-size">
                          {development.size}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-purple-50 p-3 rounded-xl">
                      <Weight className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <div className="text-xs text-gray-600">Peso</div>
                        <div className="font-bold text-gray-800" data-testid="text-baby-weight">
                          {development.weight}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4">
                    <Info className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-500 text-sm">
                      Dados não disponíveis para esta semana
                    </p>
                  </div>
                )}
                
                {development?.fruit_comparison && (
                  <div className="flex items-center bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl border border-pink-200">
                    <Apple className="h-5 w-5 text-pink-500 mr-2" />
                    <span className="text-gray-700 font-medium" data-testid="text-baby-comparison">
                      Tamanho de {development.fruit_comparison}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-xl">
                  <span>Semanas restantes:</span>
                  <span className="font-bold text-blue-600">{weekInfo.weeksRemaining}</span>
                </div>
              </div>
              
              <div className="ml-6">
                <ThreeDBaby week={weekInfo.week} size={120} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mom & Baby Tabs - Modern Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-pink-200 shadow-lg rounded-xl">
            <TabsTrigger 
              value="baby" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              data-testid="tab-baby"
            >
              <Baby className="h-4 w-4 mr-2" />
              Bebê
            </TabsTrigger>
            <TabsTrigger 
              value="mom" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              data-testid="tab-mom"
            >
              <Heart className="h-4 w-4 mr-2" />
              Mamãe
            </TabsTrigger>
          </TabsList>

          {/* Baby Tab Content */}
          <TabsContent value="baby" className="mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center text-gray-800">
                  <Activity className="mr-2 h-5 w-5 text-pink-500" />
                  Desenvolvimento do Bebê
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {development?.baby_description && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <p className="text-gray-700 font-medium">{development.baby_description}</p>
                  </div>
                )}
                
                {babyMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {babyMilestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
                        data-testid={`text-baby-development-${index}`}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{milestone}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Baby className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Marcos de desenvolvimento não disponíveis para esta semana
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mom Tab Content */}
          <TabsContent value="mom" className="mt-4">
            <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center text-gray-800">
                  <User className="mr-2 h-5 w-5 text-pink-500" />
                  Mudanças na Mamãe
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {development?.mom_description && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <p className="text-gray-700 font-medium">{development.mom_description}</p>
                  </div>
                )}
                
                {momMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {momMilestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow"
                        data-testid={`text-mom-development-${index}`}
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{milestone}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Informações sobre mudanças na mamãe não disponíveis para esta semana
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions - Minimal Design */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Book className="h-5 w-5 mr-2 text-pink-500" />
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md h-auto transform hover:scale-105 transition-all flex-col border border-pink-100"
              onClick={() => setLocation("/kick-counter")}
              data-testid="button-kick-counter"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Contador de Chutes</span>
            </Button>
            
            <Button
              variant="ghost"
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md h-auto transform hover:scale-105 transition-all flex-col border border-pink-100"
              onClick={() => setLocation("/weight-tracking")}
              data-testid="button-weight-tracking"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mb-2">
                <Weight className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Controle de Peso</span>
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <FloatingActionButton />
    </div>
  );
}
