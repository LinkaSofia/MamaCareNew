import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useBabyDevelopment } from "@/hooks/use-baby-development";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ThreeDBaby from "@/components/three-d-baby";
import { 
  ArrowLeft, 
  Baby, 
  Heart, 
  Ruler, 
  Weight, 
  Apple,
  Activity,
  User,
  Calendar,
  Info
} from "lucide-react";

interface PregnancyTrackerProps {
  onBack: () => void;
}

export default function PregnancyTracker({ onBack }: PregnancyTrackerProps) {
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
          <Button onClick={onBack} variant="outline">
            Voltar
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-pink-100 shadow-sm">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg hover:bg-gray-50"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Semana {weekInfo.week}
            </h1>
            <p className="text-sm text-gray-600">
              {weekInfo.weeksRemaining} semanas restantes
            </p>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        {/* Main Week Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 h-2"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-pink-500 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Semana {weekInfo.week}
                  </h2>
                </div>
                
                {development ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 text-pink-500 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Tamanho</div>
                        <div className="font-semibold text-gray-800" data-testid="text-baby-size">
                          {development.size}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Weight className="h-4 w-4 text-purple-500 mr-2" />
                      <div>
                        <div className="text-sm text-gray-600">Peso</div>
                        <div className="font-semibold text-gray-800" data-testid="text-baby-weight">
                          {development.weight}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Info className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-500">
                      Dados de desenvolvimento não disponíveis para esta semana
                    </p>
                  </div>
                )}
                
                {development?.fruit_comparison && (
                  <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-4 rounded-xl border border-pink-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                          {development.fruit_image_url ? (
                            <img 
                              src={development.fruit_image_url.replace('@assets/', '/attached_assets/')} 
                              alt={`Tamanho de ${development.fruit_comparison}`}
                              className="h-12 w-12 object-contain"
                              data-testid="img-fruit-comparison"
                            />
                          ) : (
                            <Apple className="h-12 w-12 text-pink-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600 mb-1">
                            Comparação de tamanho
                          </div>
                          <div className="font-semibold text-gray-800" data-testid="text-baby-comparison">
                            Tamanho de {development.fruit_comparison}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Semana {weekInfo.week}</div>
                        <div className="text-sm font-medium text-purple-600">
                          {development.size}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-6">
                <ThreeDBaby week={weekInfo.week} size={100} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mom & Baby Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-pink-100 shadow-lg">
            <TabsTrigger 
              value="baby" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white transition-all duration-300"
              data-testid="tab-baby"
            >
              <Baby className="h-4 w-4 mr-2" />
              Bebê
            </TabsTrigger>
            <TabsTrigger 
              value="mom" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 data-[state=active]:text-white transition-all duration-300"
              data-testid="tab-mom"
            >
              <Heart className="h-4 w-4 mr-2" />
              Mamãe
            </TabsTrigger>
          </TabsList>

          {/* Baby Tab Content */}
          <TabsContent value="baby" className="mt-4">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center text-gray-800">
                  <Activity className="mr-2 h-5 w-5 text-pink-500" />
                  Desenvolvimento do Bebê
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Size Comparison Card at top of Baby tab */}
                {development?.fruit_comparison && (
                  <div className="mb-6 bg-gradient-to-r from-pink-50 via-white to-purple-50 p-5 rounded-2xl border border-pink-100 shadow-lg">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">
                        Seu bebê está do tamanho de
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-6 rounded-full shadow-lg mb-4">
                          {development.fruit_image_url ? (
                            <img 
                              src={development.fruit_image_url.replace('@assets/', '/attached_assets/')} 
                              alt={`Tamanho de ${development.fruit_comparison}`}
                              className="h-20 w-20 object-contain"
                              data-testid="img-fruit-comparison-large"
                            />
                          ) : (
                            <Apple className="h-20 w-20 text-pink-400" />
                          )}
                        </div>
                        <div className="text-xl font-bold text-purple-700 mb-2">
                          {development.fruit_comparison}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span><strong>Tamanho:</strong> {development.size}</span>
                          <span><strong>Peso:</strong> {development.weight}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {development?.baby_description && (
                  <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                    <p className="text-gray-700">{development.baby_description}</p>
                  </div>
                )}
                
                {babyMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {babyMilestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100"
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
            <Card className="bg-white/80 backdrop-blur-sm border-pink-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center text-gray-800">
                  <User className="mr-2 h-5 w-5 text-pink-500" />
                  Mudanças na Mamãe
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {development?.mom_description && (
                  <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                    <p className="text-gray-700">{development.mom_description}</p>
                  </div>
                )}
                
                {momMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {momMilestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100"
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
      </div>
    </div>
  );
}