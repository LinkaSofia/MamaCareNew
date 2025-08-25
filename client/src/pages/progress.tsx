import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ProgressCircle from '@/components/progress-circle';
import WeightChart from '@/components/weight-chart';
import Baby3D from '@/components/Baby3D';
import { usePregnancy } from '@/hooks/use-pregnancy';
import { useBabyDevelopmentLocal, useBabyDevelopmentRange, useBabySizeComparisons } from '@/hooks/use-baby-development';
import { 
  TrendingUp, 
  Baby, 
  Scale, 
  Ruler,
  Heart,
  Calendar,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function Progress() {
  const [selectedWeek, setSelectedWeek] = useState<number>(20);
  const { pregnancy, weekInfo } = usePregnancy();
  const currentWeek = weekInfo?.week || 20;
  
  const { data: currentBabyData, isLoading: currentBabyLoading } = useBabyDevelopmentLocal(currentWeek);
  const { data: weekRangeData, isLoading: rangeLoading } = useBabyDevelopmentRange(1, 40);
  const { data: sizeComparisons, isLoading: comparisonsLoading } = useBabySizeComparisons();

  // Mock data para gráfico de peso (em uma implementação real, viria da API)
  const { data: weightData } = useQuery({
    queryKey: ['weight-records'],
    queryFn: () => {
      const mockWeightData = Array.from({ length: currentWeek }, (_, i) => {
        const week = i + 1;
        const baseWeight = 65; // peso inicial
        const weightGain = Math.min(12, (week / 40) * 12 + Math.random() * 2 - 1); // ganho gradual com variação
        return {
          id: `week-${week}`,
          weight: (baseWeight + weightGain).toFixed(1),
          date: new Date(Date.now() - (40 - week) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: `Semana ${week}`
        };
      });
      return mockWeightData;
    }
  });

  // Dados para gráfico de crescimento do bebê
  const babyGrowthData = weekRangeData?.map(data => ({
    week: data.week,
    length_cm: data.length_cm || 0,
    weight_grams: (data.weight_grams || 0) / 1000, // converter para kg para melhor visualização
    comparison: data.fruit_comparison,
  })) || [];

  // Dados do progresso por trimestre
  const trimesterData = [
    {
      name: '1º Trimestre',
      weeks: 12,
      completed: Math.min(currentWeek, 12),
      color: '#EC4899',
      milestones: ['Formação de órgãos', 'Primeiro batimento', 'Reflexos básicos']
    },
    {
      name: '2º Trimestre', 
      weeks: 15,
      completed: Math.max(0, Math.min(currentWeek - 12, 15)),
      color: '#3B82F6',
      milestones: ['Movimentos', 'Audição', 'Sexo definido']
    },
    {
      name: '3º Trimestre',
      weeks: 13, 
      completed: Math.max(0, Math.min(currentWeek - 27, 13)),
      color: '#8B5CF6',
      milestones: ['Preparação nascimento', 'Pulmões maduros', 'Ganho de peso']
    }
  ];

  if (currentBabyLoading || rangeLoading || comparisonsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const progressPercentage = Math.round((currentWeek / 40) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 mr-3 text-pink-500" />
            Progresso da Gestação
          </h1>
          <p className="text-gray-600 text-lg">
            Acompanhe o desenvolvimento do seu bebê e sua jornada
          </p>
          
          {currentBabyData && (
            <Badge variant="secondary" className="mt-3 bg-gradient-to-r from-pink-100 to-blue-100 text-gray-700 px-4 py-2 text-base">
              <Baby className="w-4 h-4 mr-2" />
              Semana {currentWeek} • {currentBabyData.fruit_comparison}
            </Badge>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center border-pink-200/30 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="relative mb-4">
                <ProgressCircle percentage={progressPercentage} size={80} strokeWidth={6} />
              </div>
              <h3 className="font-semibold text-gray-800">Progresso Total</h3>
              <p className="text-sm text-gray-600">{currentWeek} de 40 semanas</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200/30 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ruler className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Tamanho do Bebê</h3>
              <p className="text-lg font-bold text-blue-600">{currentBabyData?.length_cm || 0}cm</p>
              <p className="text-sm text-gray-600">Comprimento</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200/30 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Peso do Bebê</h3>
              <p className="text-lg font-bold text-purple-600">{currentBabyData?.weight_grams || 0}g</p>
              <p className="text-sm text-gray-600">Peso estimado</p>
            </CardContent>
          </Card>

          <Card className="border-green-200/30 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Trimestre</h3>
              <p className="text-lg font-bold text-green-600">
                {currentWeek <= 12 ? '1º' : currentWeek <= 27 ? '2º' : '3º'}
              </p>
              <p className="text-sm text-gray-600">
                {currentWeek <= 12 ? 'Formação' : currentWeek <= 27 ? 'Crescimento' : 'Preparação'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Gráficos */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="timeline" className="flex items-center py-3">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center py-3">
              <TrendingUp className="w-4 h-4 mr-2" />
              Crescimento
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex items-center py-3">
              <Scale className="w-4 h-4 mr-2" />
              Peso
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center py-3">
              <Target className="w-4 h-4 mr-2" />
              Comparações
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                  Timeline da Gravidez
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline visual */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {trimesterData.map((trimester, index) => (
                      <Card key={index} className="relative overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="text-center mb-4">
                            <h3 className="font-semibold text-lg" style={{ color: trimester.color }}>
                              {trimester.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {trimester.completed} de {trimester.weeks} semanas
                            </p>
                          </div>
                          
                          <ProgressCircle 
                            percentage={Math.round((trimester.completed / trimester.weeks) * 100)} 
                            size={100}
                            className="mx-auto mb-4"
                          />
                          
                          <div className="space-y-2">
                            {trimester.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <Sparkles className="w-3 h-3 mr-2" style={{ color: trimester.color }} />
                                {milestone}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Baby 3D Viewer */}
                  <Card className="mt-6">
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2">Seu Bebê na Semana {selectedWeek}</h3>
                        <div className="flex items-center justify-center space-x-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                            disabled={selectedWeek <= 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="min-w-20 text-center font-medium">
                            Semana {selectedWeek}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedWeek(Math.min(40, selectedWeek + 1))}
                            disabled={selectedWeek >= 40}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Baby3D 
                          week={selectedWeek} 
                          size="large" 
                          interactive={true}
                          animate={true}
                          showInfo={true}
                          className="max-w-md"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Crescimento do Bebê
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Comprimento */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Ruler className="w-4 h-4 mr-2" />
                        Comprimento (cm)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={babyGrowthData.slice(0, currentWeek)}>
                            <defs>
                              <linearGradient id="lengthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="week" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip 
                              formatter={(value: number) => [`${value}cm`, 'Comprimento']}
                              labelFormatter={(week) => `Semana ${week}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="length_cm" 
                              stroke="#3B82F6" 
                              fillOpacity={1} 
                              fill="url(#lengthGradient)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Peso */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Scale className="w-4 h-4 mr-2" />
                        Peso (kg)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={babyGrowthData.slice(0, currentWeek)}>
                            <defs>
                              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="week" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip 
                              formatter={(value: number) => [`${(value * 1000).toFixed(0)}g`, 'Peso']}
                              labelFormatter={(week) => `Semana ${week}`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="weight_grams" 
                              stroke="#8B5CF6" 
                              fillOpacity={1} 
                              fill="url(#weightGradient)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-green-500" />
                  Acompanhamento de Peso Materno
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightData && <WeightChart records={weightData} />}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="text-center">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-center mb-2">
                        <ArrowUp className="w-5 h-5 text-green-500 mr-1" />
                        <span className="text-lg font-semibold">+8.5kg</span>
                      </div>
                      <p className="text-sm text-gray-600">Ganho total</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="w-5 h-5 text-blue-500 mr-1" />
                        <span className="text-lg font-semibold">73.5kg</span>
                      </div>
                      <p className="text-sm text-gray-600">Peso atual</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="w-5 h-5 text-orange-500 mr-1" />
                        <span className="text-lg font-semibold">11-16kg</span>
                      </div>
                      <p className="text-sm text-gray-600">Meta recomendada</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  Comparações de Tamanho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sizeComparisons?.map((comparison, index) => (
                    <Card key={index} className={`text-center transition-all hover:shadow-md ${
                      comparison.weeks.includes(currentWeek) ? 'ring-2 ring-pink-300 bg-pink-50' : ''
                    }`}>
                      <CardContent className="pt-4">
                        <div className="text-4xl mb-2">{comparison.object}</div>
                        <h3 className="font-semibold">{comparison.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{comparison.size}</p>
                        <Badge variant="secondary" className="text-xs">
                          Semana {comparison.weeks.join(' - ')}
                        </Badge>
                        {comparison.weeks.includes(currentWeek) && (
                          <Badge variant="default" className="ml-2 bg-pink-500 text-xs">
                            Atual
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}