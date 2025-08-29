import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Activity, Clock, MousePointer, Eye } from "lucide-react";
import { useLocation } from "wouter";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";

interface AnalyticsData {
  id: string;
  action: string;
  page: string;
  element?: string;
  duration?: number;
  timestamp: string;
}

export default function Analytics() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery<{ analytics: AnalyticsData[] }>({
    queryKey: ["/api/analytics/user"],
    enabled: !!user,
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  if (!user) {
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

  const analytics = analyticsData?.analytics || [];
  
  // Estatísticas do usuário
  const pageViews = analytics.filter(item => item.action === 'page_view').length;
  const clicks = analytics.filter(item => item.action.includes('click')).length;
  const totalDuration = analytics
    .filter(item => item.duration)
    .reduce((sum, item) => sum + (item.duration || 0), 0);

  // Páginas mais visitadas
  const pageVisits = analytics
    .filter(item => item.action === 'page_view')
    .reduce((acc, item) => {
      acc[item.page] = (acc[item.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topPages = Object.entries(pageVisits)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Atividades recentes (últimas 20)
  const recentActivity = analytics
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const formatPageName = (path: string) => {
    const pathMap: Record<string, string> = {
      '/': 'Dashboard',
      '/kick-counter': 'Contador de Chutes',
      '/weight-tracking': 'Controle de Peso',
      '/diary': 'Diário',
      '/photo-album': 'Álbum de Fotos',
      '/baby-development': 'Desenvolvimento do Bebê',
      '/birth-plan': 'Plano de Parto',
      '/community': 'Comunidade',
      '/profile': 'Perfil'
    };
    return pathMap[path] || path;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
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
            Analytics do Usuário
          </h2>
          <div className="w-10" />
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{pageViews}</p>
                  <p className="text-xs text-gray-600">Visualizações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <MousePointer className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{clicks}</p>
                  <p className="text-xs text-gray-600">Cliques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal">{formatDuration(totalDuration)}</p>
                  <p className="text-xs text-gray-600">Tempo total navegando</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Páginas mais visitadas */}
        <Card className="bg-white shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Páginas Mais Visitadas</CardTitle>
            <CardDescription>Suas páginas favoritas do app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.map(([page, count]) => (
                <div key={page} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatPageName(page)}</span>
                  <span className="bg-baby-pink-light text-baby-pink-dark px-2 py-1 rounded-full text-xs">
                    {count} visitas
                  </span>
                </div>
              ))}
              {topPages.length === 0 && (
                <p className="text-gray-500 text-center">Nenhuma página visitada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividade recente */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
            <CardDescription>Suas últimas interações no app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.action === 'page_view' ? (
                      <Eye className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MousePointer className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.action === 'page_view' ? 'Visitou' : 'Clicou em'} {formatPageName(activity.page)}
                    </p>
                    {activity.element && (
                      <p className="text-xs text-gray-600">Elemento: {activity.element}</p>
                    )}
                    {activity.duration && activity.duration > 0 && (
                      <p className="text-xs text-gray-600">Duração: {formatDuration(activity.duration)}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-gray-500 text-center">Nenhuma atividade registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}