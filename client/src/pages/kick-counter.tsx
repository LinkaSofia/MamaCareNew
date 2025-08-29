import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  HandMetal, 
  Activity, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Heart,
  Target,
  Timer,
  Calendar,
  Award,
  Baby
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface KickRecord {
  id: string;
  time: string;
  type: 'kick' | 'punch' | 'roll' | 'hiccup';
  intensity: 'light' | 'medium' | 'strong';
  date: string;
}

interface KickData {
  count: number;
  records: KickRecord[];
}

export default function KickCounter() {
  const [kicks, setKicks] = useState<KickRecord[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastKickTime, setLastKickTime] = useState<Date | null>(null);
  const [timeSinceLastKick, setTimeSinceLastKick] = useState<string>('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionKicks, setSessionKicks] = useState(0);
  const [selectedType, setSelectedType] = useState<'kick' | 'punch' | 'roll' | 'hiccup'>('kick');
  const [selectedIntensity, setSelectedIntensity] = useState<'light' | 'medium' | 'strong'>('medium');
  
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: kickData, isLoading } = useQuery<KickData>({
    queryKey: ["/api/kick-counts", pregnancy?.id],
    enabled: !!pregnancy,
    queryFn: () => {
      // Mock data for now - replace with actual API call
      const mockData: KickData = {
        count: Math.floor(Math.random() * 20) + 5,
        records: Array.from({ length: 10 }, (_, i) => ({
          id: `kick-${i}`,
          time: new Date(Date.now() - i * 60000 * Math.random() * 60).toISOString(),
          type: ['kick', 'punch', 'roll', 'hiccup'][Math.floor(Math.random() * 4)] as any,
          intensity: ['light', 'medium', 'strong'][Math.floor(Math.random() * 3)] as any,
          date: new Date().toISOString().split('T')[0]
        }))
      };
      return Promise.resolve(mockData);
    },
  });

  // Timer effect for tracking time since last kick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (lastKickTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - lastKickTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffMinutes < 60) {
          setTimeSinceLastKick(`${diffMinutes} min atrás`);
        } else {
          const diffHours = Math.floor(diffMinutes / 60);
          const remainingMinutes = diffMinutes % 60;
          setTimeSinceLastKick(`${diffHours}h ${remainingMinutes}m atrás`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lastKickTime]);

  const recordKickMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const response = await apiRequest("POST", "/api/kick-counts", {
        pregnancyId: pregnancy!.id,
        date: now.toISOString(),
        type: selectedType,
        intensity: selectedIntensity,
        count: 1,
        times: [now.toTimeString().slice(0, 5)],
      });
      return response.json();
    },
    onSuccess: () => {
      const now = new Date();
      const newKick: KickRecord = {
        id: `local-${Date.now()}`,
        time: now.toTimeString().slice(0, 5),
        type: selectedType,
        intensity: selectedIntensity,
        date: now.toISOString().split('T')[0]
      };
      
      setKicks(prev => [newKick, ...prev.slice(0, 9)]);
      setLastKickTime(now);
      setSessionKicks(prev => prev + 1);
      
      if (!sessionStarted) {
        setSessionStarted(true);
      }

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      queryClient.invalidateQueries({ queryKey: ["/api/kick-counts", pregnancy?.id] });
      
      const typeEmoji = {
        kick: '👶',
        punch: '👊', 
        roll: '🔄',
        hiccup: '🤭'
      };
      
      toast({
        title: `${typeEmoji[selectedType]} Movimento registrado!`,
        description: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} ${selectedIntensity} às ${now.toTimeString().slice(0, 5)}`,
      });
    },
  });

  if (!user || !pregnancy) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const todayCount = (kickData?.count || 0) + kicks.length;
  const recentKicks = kicks.slice(0, 5);
  
  // Generate mock weekly data for chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
    kicks: Math.floor(Math.random() * 25) + 5,
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  // Movement type data
  const movementTypes = [
    { type: 'kick', label: 'Chutes', icon: '🦶', color: '#EC4899' },
    { type: 'punch', label: 'Socos', icon: '👊', color: '#3B82F6' },
    { type: 'roll', label: 'Viradas', icon: '🔄', color: '#8B5CF6' },
    { type: 'hiccup', label: 'Soluços', icon: '🤭', color: '#10B981' },
  ];

  const intensityOptions = [
    { level: 'light', label: 'Leve', color: '#FEF3C7' },
    { level: 'medium', label: 'Médio', color: '#FCD34D' },
    { level: 'strong', label: 'Forte', color: '#F59E0B' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
      <div className="p-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-white shadow-lg"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Contador de Movimentos</h1>
          <div className="w-10" />
        </div>

        <Tabs defaultValue="counter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="counter" className="flex items-center">
              <Baby className="w-4 h-4 mr-2" />
              Contador
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Counter Tab */}
          <TabsContent value="counter" className="space-y-6">
            {/* Main Counter Circle */}
            <div className="text-center">
              <div className={`
                w-48 h-48 mx-auto bg-gradient-to-br from-white to-pink-50 
                rounded-full shadow-2xl flex items-center justify-center mb-6
                transition-all duration-500 border-4
                ${isAnimating ? 'scale-110 border-pink-300 shadow-pink-200/50' : 'scale-100 border-gray-200/50'}
              `}>
                <div className="text-center">
                  <div className={`
                    text-5xl font-bold transition-all duration-300
                    ${todayCount > 10 ? 'text-green-500' : todayCount > 5 ? 'text-blue-500' : 'text-pink-500'}
                  `} data-testid="text-kick-count">
                    {todayCount}
                  </div>
                  <div className="text-sm text-gray-600">movimentos hoje</div>
                  {lastKickTime && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                      <Timer className="w-3 h-3 mr-1" />
                      {timeSinceLastKick}
                    </div>
                  )}
                </div>
              </div>

              {/* Session Info */}
              {sessionStarted && (
                <Card className="mb-4 bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-blue-500" />
                        <span className="font-medium">Sessão ativa</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1 text-green-500" />
                        <span>{sessionKicks} movimentos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Movement Type Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Tipo de Movimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {movementTypes.map((movement) => (
                    <Button
                      key={movement.type}
                      variant={selectedType === movement.type ? "default" : "outline"}
                      className={`
                        p-4 h-auto flex flex-col items-center space-y-2 transition-all
                        ${selectedType === movement.type ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white' : ''}
                      `}
                      onClick={() => setSelectedType(movement.type as any)}
                    >
                      <span className="text-2xl">{movement.icon}</span>
                      <span className="text-sm font-medium">{movement.label}</span>
                    </Button>
                  ))}
                </div>

                {/* Intensity Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Intensidade</label>
                  <div className="flex space-x-2">
                    {intensityOptions.map((intensity) => (
                      <Button
                        key={intensity.level}
                        variant={selectedIntensity === intensity.level ? "default" : "outline"}
                        size="sm"
                        className={`
                          flex-1 transition-all
                          ${selectedIntensity === intensity.level ? 'bg-orange-500 text-white' : ''}
                        `}
                        onClick={() => setSelectedIntensity(intensity.level as any)}
                      >
                        {intensity.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Record Button */}
            <div className="px-2">
              <Button 
                className={`
                  w-full py-6 text-lg font-bold rounded-2xl shadow-xl 
                  transform transition-all duration-200 text-white
                  bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                  hover:scale-105 active:scale-95 disabled:opacity-50
                  ${isAnimating ? 'animate-pulse scale-105' : ''}
                `}
                onClick={() => recordKickMutation.mutate()}
                disabled={recordKickMutation.isPending}
                data-testid="button-record-kick"
              >
                {recordKickMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-2xl mr-2">
                      {movementTypes.find(m => m.type === selectedType)?.icon}
                    </span>
                    Registrar {movementTypes.find(m => m.type === selectedType)?.label}
                  </div>
                )}
              </Button>
            </div>

            {/* Recent Kicks */}
            {recentKicks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Últimos Movimentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentKicks.map((kick, index) => (
                      <div key={kick.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {movementTypes.find(m => m.type === kick.type)?.icon}
                          </span>
                          <div>
                            <div className="text-sm font-medium">{kick.time}</div>
                            <div className="text-xs text-gray-500">
                              {movementTypes.find(m => m.type === kick.type)?.label} • {
                                intensityOptions.find(i => i.level === kick.intensity)?.label
                              }
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={`
                            ${kick.intensity === 'strong' ? 'bg-orange-100 text-orange-700' :
                              kick.intensity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}
                          `}
                        >
                          {intensityOptions.find(i => i.level === kick.intensity)?.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
                  <div className="text-xs text-gray-600">Hoje</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(Math.random() * 50) + 100}
                  </div>
                  <div className="text-xs text-gray-600">Esta Semana</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {sessionKicks}
                  </div>
                  <div className="text-xs text-gray-600">Sessão Atual</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.floor(todayCount / 24 * 10) / 10}
                  </div>
                  <div className="text-xs text-gray-600">Média/Hora</div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="kickGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip 
                        formatter={(value: number) => [`${value} movimentos`, 'Total']}
                        labelFormatter={(day) => `${day}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="kicks" 
                        stroke="#EC4899" 
                        fillOpacity={1} 
                        fill="url(#kickGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Histórico Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kicks.concat(kickData?.records || []).slice(0, 20).map((kick, index) => (
                    <div key={`${kick.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">
                          {movementTypes.find(m => m.type === kick.type)?.icon}
                        </span>
                        <div>
                          <div className="font-medium">
                            {movementTypes.find(m => m.type === kick.type)?.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(kick.time).toLocaleString('pt-BR')} • {
                              intensityOptions.find(i => i.level === kick.intensity)?.label
                            }
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
