import { usePregnancy } from "@/hooks/use-pregnancy";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getBabyDataForWeek, babyDevelopmentData } from "@/lib/baby-data";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ThreeDBaby from "@/components/three-d-baby";
import { ArrowLeft, Baby, Ruler, Weight, Apple, Activity } from "lucide-react";

export default function BabyDevelopment() {
  const { pregnancy, weekInfo, isLoading } = usePregnancy();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pregnancy) {
    setLocation("/login");
    return null;
  }

  const currentBabyData = weekInfo ? getBabyDataForWeek(weekInfo.week) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-baby-pink via-cream to-baby-blue pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-charcoal" />
          </Button>
          <h2 className="text-xl font-bold text-charcoal" data-testid="text-page-title">
            Desenvolvimento do Bebê
          </h2>
          <div className="w-10" />
        </div>

        {currentBabyData && weekInfo && (
          <>
            {/* Current Week Display */}
            <Card className="glass-effect shadow-xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-charcoal mb-2" data-testid="text-current-week">
                      Semana {weekInfo.week}
                    </h3>
                    <p className="text-gray-600 mb-4" data-testid="text-baby-description">
                      {currentBabyData.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Ruler className="h-4 w-4 text-baby-pink-dark mr-2" />
                        <div>
                          <div className="text-sm text-gray-600">Tamanho</div>
                          <div className="font-semibold" data-testid="text-baby-size">
                            {currentBabyData.size}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 text-baby-blue-dark mr-2" />
                        <div>
                          <div className="text-sm text-gray-600">Peso</div>
                          <div className="font-semibold" data-testid="text-baby-weight">
                            {currentBabyData.weight}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <Apple className="h-4 w-4 text-coral mr-2" />
                      <span className="text-gray-700" data-testid="text-baby-comparison">
                        Tamanho de {currentBabyData.comparison}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <ThreeDBaby week={weekInfo.week} size={100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development Milestones */}
            <Card className="shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-charcoal">
                  <Activity className="mr-2 h-5 w-5 text-baby-pink-dark" />
                  Marcos de Desenvolvimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentBabyData.developments.map((development, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      data-testid={`text-development-${index}`}
                    >
                      <div className="w-2 h-2 bg-baby-pink-dark rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{development}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Week Timeline */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Baby className="mr-2 h-5 w-5 text-baby-blue-dark" />
              Linha do Tempo do Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {babyDevelopmentData.map((data) => {
                const isCurrentWeek = weekInfo && data.week === weekInfo.week;
                const isPastWeek = weekInfo && data.week < weekInfo.week;
                
                return (
                  <div 
                    key={data.week}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isCurrentWeek 
                        ? 'border-baby-pink-dark bg-baby-pink/20' 
                        : isPastWeek 
                          ? 'border-gray-300 bg-gray-50' 
                          : 'border-gray-200 bg-white'
                      }
                    `}
                    data-testid={`timeline-week-${data.week}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${isCurrentWeek ? 'text-baby-pink-dark' : 'text-charcoal'}`}>
                        Semana {data.week}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{data.size}</span>
                        <span>{data.weight}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{data.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Apple className="h-3 w-3 mr-1" />
                      <span>{data.comparison}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
