import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SizeComparison from './SizeComparison';

interface WeeklySizeComparisonProps {
  className?: string;
}

// Dados de exemplo para todas as semanas (baseado em dados reais de desenvolvimento fetal)
const WEEKLY_DATA = [
  { week: 1, size: 0.1, weight: 0.001, comparison: "Semente de romã" },
  { week: 2, size: 0.2, weight: 0.002, comparison: "Grão de feijão" },
  { week: 3, size: 0.3, weight: 0.02, comparison: "Semente de gergelim" },
  { week: 4, size: 0.4, weight: 0.04, comparison: "Grão de arroz" },
  { week: 5, size: 0.5, weight: 0.1, comparison: "Semente de maçã" },
  { week: 6, size: 0.6, weight: 0.2, comparison: "Grão de milho" },
  { week: 7, size: 0.7, weight: 0.3, comparison: "Ervilha" },
  { week: 8, size: 1.0, weight: 0.5, comparison: "Blueberry" },
  { week: 9, size: 1.5, weight: 1.0, comparison: "Uva" },
  { week: 10, size: 2.0, weight: 2.0, comparison: "Morango" },
  { week: 11, size: 2.5, weight: 3.0, comparison: "Cereja" },
  { week: 12, size: 3.0, weight: 4.0, comparison: "Tomate cereja" },
  { week: 13, size: 4.0, weight: 7.0, comparison: "Limão" },
  { week: 14, size: 5.0, weight: 10.0, comparison: "Laranja" },
  { week: 15, size: 6.0, weight: 15.0, comparison: "Pêssego" },
  { week: 16, size: 7.0, weight: 20.0, comparison: "Maçã pequena" },
  { week: 17, size: 8.0, weight: 30.0, comparison: "Banana" },
  { week: 18, size: 9.0, weight: 40.0, comparison: "Pera" },
  { week: 19, size: 10.0, weight: 50.0, comparison: "Manga" },
  { week: 20, size: 11.0, weight: 60.0, comparison: "Abacate" },
  { week: 21, size: 12.0, weight: 80.0, comparison: "Melancia pequena" },
  { week: 22, size: 13.0, weight: 100.0, comparison: "Abacaxi" },
  { week: 23, size: 14.0, weight: 120.0, comparison: "Coco" },
  { week: 24, size: 15.0, weight: 140.0, comparison: "Melão" },
  { week: 25, size: 16.0, weight: 160.0, comparison: "Couve-flor" },
  { week: 26, size: 17.0, weight: 180.0, comparison: "Berinjela" },
  { week: 27, size: 18.0, weight: 200.0, comparison: "Abobrinha" },
  { week: 28, size: 19.0, weight: 220.0, comparison: "Cenoura" },
  { week: 29, size: 20.0, weight: 250.0, comparison: "Repolho" },
  { week: 30, size: 21.0, weight: 280.0, comparison: "Cabeça de alface" },
  { week: 31, size: 22.0, weight: 310.0, comparison: "Couve" },
  { week: 32, size: 23.0, weight: 340.0, comparison: "Espinafre" },
  { week: 33, size: 24.0, weight: 380.0, comparison: "Abacaxi grande" },
  { week: 34, size: 25.0, weight: 420.0, comparison: "Melancia" },
  { week: 35, size: 26.0, weight: 460.0, comparison: "Abóbora" },
  { week: 36, size: 27.0, weight: 500.0, comparison: "Melão grande" },
  { week: 37, size: 28.0, weight: 540.0, comparison: "Cabeça de alface grande" },
  { week: 38, size: 29.0, weight: 580.0, comparison: "Couve-flor grande" },
  { week: 39, size: 30.0, weight: 620.0, comparison: "Repolho grande" },
  { week: 40, size: 31.0, weight: 660.0, comparison: "Abóbora grande" }
];

export default function WeeklySizeComparison({ className = "" }: WeeklySizeComparisonProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const currentData = WEEKLY_DATA.find(data => data.week === currentWeek) || WEEKLY_DATA[0];

  const goToPreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek < 40) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com navegação */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-xl border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-xl font-bold text-gray-800 dark:text-gray-200">
            Desenvolvimento Semanal do Bebê
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousWeek}
              disabled={currentWeek <= 1}
              className="bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Semana {currentWeek}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentWeek <= 12 ? "Primeiro Trimestre" : 
                 currentWeek <= 24 ? "Segundo Trimestre" : 
                 "Terceiro Trimestre"}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              disabled={currentWeek >= 40}
              className="bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50"
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparação de tamanho atual */}
      <SizeComparison
        week={currentWeek}
        sizeCm={currentData.size}
        weightGrams={currentData.weight}
        fruitComparison={currentData.comparison}
      />

      {/* Barra de progresso */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-xl border-0">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Semana 1</span>
              <span>Semana {currentWeek}</span>
              <span>Semana 40</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentWeek / 40) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








