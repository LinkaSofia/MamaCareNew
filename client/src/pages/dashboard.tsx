import { useAuth } from "@/hooks/use-auth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FloatingActionButton from "@/components/layout/floating-action-button";
import ProgressCircle from "@/components/progress-circle";
import ThreeDBaby from "@/components/three-d-baby";
import { getBabyDataForWeek } from "@/lib/baby-data";
import { Bell, Activity, Weight, Calendar, Book, Heart, Apple } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { pregnancy, weekInfo, progress, isLoading: pregnancyLoading } = usePregnancy();
  const [, setLocation] = useLocation();

  if (authLoading || pregnancyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!pregnancy) {
    setLocation("/setup");
    return null;
  }

  const babyData = weekInfo ? getBabyDataForWeek(weekInfo.week) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark p-4 pt-12">
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-semibold" data-testid="text-greeting">
              Olá, {user.name}!
            </h2>
            <p className="text-sm opacity-90" data-testid="text-pregnancy-week">
              {weekInfo ? `${weekInfo.week} semanas de gestação` : "Calculando..."}
            </p>
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-coral rounded-full text-xs flex items-center justify-center text-white">
              3
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 -mt-6">
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-charcoal mb-2">Progresso da Gestação</h3>
              <div className="flex justify-center items-center">
                {progress && weekInfo && (
                  <ProgressCircle 
                    percentage={progress.percentage} 
                    size={128}
                    strokeWidth={8}
                  />
                )}
              </div>
              <p className="text-gray-600 mt-2" data-testid="text-weeks-remaining">
                {weekInfo ? `${weekInfo.weeksRemaining} semanas restantes` : "Calculando..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baby Development Card */}
      {babyData && weekInfo && (
        <div className="px-4 mb-4">
          <Card className="bg-gradient-to-r from-baby-pink to-baby-blue shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Desenvolvimento do Bebê</h3>
                  <p className="text-sm mb-1" data-testid="text-baby-week">Semana {weekInfo.week}</p>
                  <p className="text-sm mb-1" data-testid="text-baby-size">Tamanho: {babyData.size}</p>
                  <p className="text-sm mb-3" data-testid="text-baby-weight">Peso: {babyData.weight}</p>
                  <div className="flex items-center text-sm">
                    <Apple className="mr-2 h-4 w-4" />
                    <span data-testid="text-baby-comparison">{babyData.comparison}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <ThreeDBaby week={weekInfo.week} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="px-4 mb-20">
        <h3 className="text-lg font-bold text-charcoal mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="ghost"
            className="bg-white rounded-2xl p-4 shadow-lg h-auto transform hover:scale-105 transition-all flex-col"
            onClick={() => setLocation("/kick-counter")}
            data-testid="button-kick-counter"
          >
            <div className="w-12 h-12 bg-baby-pink rounded-full flex items-center justify-center mb-2">
              <Heart className="h-6 w-6 text-baby-pink-dark" />
            </div>
            <span className="text-sm font-medium text-charcoal">Contador de Chutes</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white rounded-2xl p-4 shadow-lg h-auto transform hover:scale-105 transition-all flex-col"
            onClick={() => setLocation("/weight-tracking")}
            data-testid="button-weight-tracking"
          >
            <div className="w-12 h-12 bg-baby-blue rounded-full flex items-center justify-center mb-2">
              <Weight className="h-6 w-6 text-baby-blue-dark" />
            </div>
            <span className="text-sm font-medium text-charcoal">Controle de Peso</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white rounded-2xl p-4 shadow-lg h-auto transform hover:scale-105 transition-all flex-col"
            onClick={() => setLocation("/consultations")}
            data-testid="button-consultations"
          >
            <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-charcoal">Consultas</span>
          </Button>
          
          <Button
            variant="ghost"
            className="bg-white rounded-2xl p-4 shadow-lg h-auto transform hover:scale-105 transition-all flex-col"
            onClick={() => setLocation("/diary")}
            data-testid="button-diary"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark rounded-full flex items-center justify-center mb-2">
              <Book className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-charcoal">Diário</span>
          </Button>
        </div>
      </div>

      <BottomNavigation />
      <FloatingActionButton />
    </div>
  );
}
