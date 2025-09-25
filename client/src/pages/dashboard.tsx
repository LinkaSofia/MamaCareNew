import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useBabyDevelopment } from "@/hooks/use-baby-development";
import { useArticles } from "@/hooks/use-articles";
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
import { NextConsultationCard } from "@/components/NextConsultationCard";
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
  TrendingUp,
  Stethoscope,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { pregnancy, weekInfo, isLoading: pregnancyLoading } = usePregnancy();
  const [viewingWeek, setViewingWeek] = useState<number | null>(null); // Semana que está sendo visualizada
  const currentWeek = viewingWeek || weekInfo?.week || 0;
  const { data: developmentData, isLoading: developmentLoading } = useBabyDevelopment(currentWeek);
  const { data: articlesData, isLoading: isArticlesLoading, error: articlesError } = useArticles(currentWeek);
  const [activeTab, setActiveTab] = useState("baby");
  const [, setLocation] = useLocation();

  // Extrair dados do desenvolvimento para usar no dashboard
  const development = developmentData?.developmentData;

  // Funções de navegação entre semanas
  const goToPreviousWeek = () => {
    const targetWeek = currentWeek - 1;
    if (targetWeek >= 1) {
      setViewingWeek(targetWeek);
    }
  };

  const goToNextWeek = () => {
    const targetWeek = currentWeek + 1;
    if (targetWeek <= 42) {
      setViewingWeek(targetWeek);
    }
  };

  const backToCurrentWeek = () => {
    setViewingWeek(null);
  };

  // Estados para touch/swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Funções de touch/swipe para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Swipe para esquerda = próxima semana
    const isRightSwipe = distance < -50; // Swipe para direita = semana anterior

    if (isLeftSwipe && currentWeek < 40) {
      goToNextWeek();
    }
    if (isRightSwipe && currentWeek > 1) {
      goToPreviousWeek();
    }
  };

  // Função para mapear fruit_comparison para emojis (fallback)
  const getFruitEmoji = (fruitComparison: string) => {
    const fruitMap: Record<string, string> = {
      'Semente de papoula': '🌺',
      'Semente': '🌱',
      'Grão de arroz': '🌾',
      'Lentilha': '🌿',
      'Ervilha': '🟢',
      'Mirtilo': '🫐',
      'Framboesa': '🫐',
      'Morango': '🍓',
      'Lima': '🟢',
      'Limão': '🍋',
      'Ameixa': '🟣',
      'Abacate': '🥑',
      'Cebola': '🧅',
      'Banana': '🍌',
      'Espiga de milho': '🌽',
      'Cenoura': '🥕',
      'Berinjela': '🍆',
      'Abobrinha': '🥒',
      'Coco': '🥥',
      'Repolho': '🥬',
      'Melancia': '🍉',
      'Abóbora': '🎃'
    };
    return fruitMap[fruitComparison] || '🍎';
  };

  // Função para converter URL do banco para URL válida do navegador
  const convertDatabaseUrlToValidUrl = (url: string): string => {
    if (url && url.startsWith('/client/src/assets/')) {
      return url.replace('/client/src/assets/', '/src/assets/');
    }
    return url;
  };

  // Função para verificar se é uma URL de imagem válida
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    return !!(url && (url.startsWith('/src/assets/') || url.startsWith('/client/src/assets/') || url.startsWith('http')));
  };

  // Função para renderizar imagem de comparação
  const renderComparisonImage = (fruitComparison: string, fruitImageUrl?: string | null, size: 'small' | 'large' = 'large') => {
    if (fruitImageUrl && isValidImageUrl(fruitImageUrl)) {
      const imageSize = size === 'small' ? 'w-12 h-12' : 'w-56 h-56';
      return (
        <img 
          src={convertDatabaseUrlToValidUrl(fruitImageUrl)} 
          alt={fruitComparison}
          className={`${imageSize} object-contain`}
        />
      );
    }
    const emojiSize = size === 'small' ? 'text-2xl' : 'text-8xl';
    return <span className={emojiSize}>{getFruitEmoji(fruitComparison)}</span>;
  };

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
    return null; // Layout já faz o redirecionamento
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

  // Processar informações como texto corrido
  const getBabyText = (text: string | string[]): string => {
    if (Array.isArray(text)) {
      return text.join(' ');
    }
    return typeof text === 'string' ? text : '';
  };

  const getMomText = (text: string | string[]): string => {
    if (Array.isArray(text)) {
      return text.join(' ');
    }
    return typeof text === 'string' ? text : '';
  };

  const babyText = development ? getBabyText(development.development_milestones_baby) : '';
  const momText = development ? getMomText(development.development_milestones_mom) : '';

  return (
    <div className="min-h-screen bg-maternal-gradient relative overflow-hidden">
      {/* Background decorative elements sofisticados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Elementos flutuantes sofisticados */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`float-${i}`}
            className={`absolute animate-float opacity-20`}
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
        
        {/* Bolinhas flutuantes */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className={`absolute rounded-full bg-gradient-to-r from-pink-200/20 to-blue-200/20 animate-bounce`}
            style={{
              width: `${8 + (i % 4) * 6}px`,
              height: `${8 + (i % 4) * 6}px`,
              left: `${5 + (i * 8) % 90}%`,
              top: `${10 + (i * 8) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 3)}s`
            }}
          />
        ))}
        
        {/* Estrelas piscantes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`absolute w-2 h-2 bg-yellow-300/40 animate-pulse`}
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${i * 1.2}s`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
                      ))}
                    </div>
      
      {/* Header Mobile Sofisticado */}
      <div className="relative z-10 px-4 pt-safe pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg animate-glow">
              <Baby className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white text-soft-shadow" data-testid="text-greeting">
                Olá, {user?.name || 'Mamãe'}!
              </h1>
              <p className="text-white/90 text-lg" data-testid="text-pregnancy-week">
                Semana {weekInfo.week} de gestação
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="card-glass w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 transition-all duration-300">
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

        {/* Hero Section reorganizada com navegação nas extremidades */}
        <div className="mb-8 relative">
          {/* Layout Principal: Imagem + Círculo de % lado a lado */}
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 relative px-4 md:px-16">
            {/* Botão anterior - EXTREMIDADE ESQUERDA */}
                    <button
              onClick={goToPreviousWeek}
                      disabled={currentWeek <= 1}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-4 rounded-full transition-all duration-300 shadow-lg ${
                        currentWeek <= 1 
                          ? 'opacity-30 cursor-not-allowed bg-gray-200' 
                          : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white hover:scale-110 shadow-xl'
                      }`}
                      data-testid="button-previous-week"
                    >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

            {/* Imagem do Bebê */}
                  <div className="relative group">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
                      <Baby3D 
                        week={currentWeek} 
                        className="w-full h-full rounded-full" 
                  babyImageUrl={development?.baby_image_url ?? undefined}
                      />
                    </div>
                    
                    {/* Indicadores flutuantes */}
                    <div className="absolute -top-4 -left-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {currentWeek}ª Semana
                    </div>
                  </div>

            {/* Círculo de Progresso (mesmo tamanho da imagem) */}
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#E5E7EB" strokeWidth="8"/>
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  fill="none" 
                  stroke="url(#gradient)" 
                  strokeWidth="8" 
                  strokeDasharray="351.86" 
                  strokeDashoffset={351.86 - (Math.round((currentWeek / 40) * 100) / 100) * 351.86}
                  strokeLinecap="round" 
                  className="progress-ring transition-all duration-500"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:"#E91E63"}}/>
                    <stop offset="100%" style={{stopColor:"#2196F3"}}/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl md:text-3xl font-bold text-gray-800">
                    {Math.round((currentWeek / 40) * 100)}%
                  </span>
                  <div className="text-xs md:text-sm text-gray-600">completo</div>
                  <div className="text-xs text-gray-500 mt-1 hidden md:block">
                    {40 - currentWeek} semanas restantes
                  </div>
                </div>
              </div>
            </div>

            {/* Botão próximo - EXTREMIDADE DIREITA */}
            <button
              onClick={goToNextWeek}
              disabled={currentWeek >= 40}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-4 rounded-full transition-all duration-300 shadow-lg ${
                currentWeek >= 40 
                  ? 'opacity-30 cursor-not-allowed bg-gray-200' 
                  : 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white hover:scale-110 shadow-xl'
              }`}
              data-testid="button-next-week"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Área de swipe para mobile - invisível mas funcional */}
          <div 
            className="absolute inset-0 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
          />

          {/* Indicador de swipe para mobile */}
          <div className="flex justify-center gap-1 mt-4 md:hidden">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-xs text-gray-500">Deslize para navegar</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>

          {/* Informações do Bebê - Agora embaixo da imagem */}
          {development && (
            <div className="glass-effect rounded-2xl p-6 mx-4 backdrop-blur-md bg-white/80 mb-4">
              <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Seu bebê está crescendo! 🌱
                      </h3>
                      <p className="text-gray-600">
                        {currentWeek <= 12 ? '1º Trimestre - Formação inicial' : 
                         currentWeek <= 28 ? '2º Trimestre - Desenvolvimento acelerado' : 
                         '3º Trimestre - Preparação para o nascimento'}
                      </p>
                    </div>

                    {/* Cards de Medidas - Tamanho e Peso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="card-sophisticated p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 gradient-pink rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl">📏</span>
                          </div>
                          <span className="font-bold text-gray-800 text-lg">Tamanho</span>
                        </div>
                        <p className="text-3xl font-bold text-gradient">
                          {development.length_cm ? `${development.length_cm} cm` : (development.size ?? "Calculando...")}
                        </p>
                      </div>

                      <div className="card-sophisticated p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 gradient-purple rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl">⚖️</span>
                          </div>
                          <span className="font-bold text-gray-800 text-lg">Peso</span>
                        </div>
                        <p className="text-3xl font-bold text-gradient">
                          {development.weight_grams && Number(development.weight_grams) > 0 
                            ? `${development.weight_grams}g` 
                            : development.weight || "< 1g"}
                        </p>
                      </div>
                    </div>

                    {/* Cards de Informações da Gestação - Semana Atual e Faltam */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Card - Semana atual */}
                      <div className="card-sophisticated p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 gradient-success rounded-2xl flex items-center justify-center shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-bold text-gray-800 text-lg">
                            {viewingWeek && viewingWeek !== weekInfo.week ? 'Visualizando' : 'Semana Atual'}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-gradient mb-2">
                          {currentWeek}ª semana
                        </p>
                        <p className="text-sm text-gray-600">
                          {viewingWeek && viewingWeek !== weekInfo.week ? (
                            <div className="flex flex-col gap-2">
                              <span>de desenvolvimento</span>
                              <button 
                                onClick={backToCurrentWeek}
                                className="btn-soft text-xs px-3 py-1"
                                data-testid="button-back-to-current-week"
                              >
                                Voltar para semana atual ({weekInfo.week})
                              </button>
                            </div>
                          ) : 'da sua gestação'}
                        </p>
                      </div>
                      
                      {/* Card - Semanas restantes */}
                      <div className="card-sophisticated p-6 hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 gradient-warning rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <span className="font-bold text-gray-800 text-lg">Faltam</span>
                        </div>
                        <p className="text-3xl font-bold text-gradient mb-2">
                          {40 - currentWeek} semanas
                        </p>
                        <p className="text-sm text-gray-600">
                          para conhecer seu bebê!
                        </p>
                      </div>
                    </div>
                  </div>
          )}

          </div>


        {/* Seção de Conteúdos de Especialistas */}
      <div className="glass-effect rounded-2xl p-5 mx-4 mt-6 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👩‍⚕️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Conteúdos para Você - Semana {currentWeek}
          </h3>
        </div>
        
          {/* Loading state */}
          {isArticlesLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Carregando conteúdos...</span>
            </div>
          )}

          {/* Error state */}
          {articlesError && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum conteúdo encontrado para esta semana.</p>
            </div>
          )}

          {/* Articles */}
          {articlesData && articlesData.articles && articlesData.articles.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {articlesData.articles.map((article, index) => (
              <div 
                key={article.id}
                  className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50"
                data-testid={`article-content-${index + 1}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Article Image or Icon */}
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {article.image ? (
                        <img 
                          src={article.image.startsWith('@assets/') 
                            ? article.image.replace('@assets/', '/src/assets/') 
                            : article.image
                    } 
                    alt={article.title}
                          className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                              parent.innerHTML = '<span class="text-2xl">📖</span>';
                      }
                    }}
                  />
                      ) : (
                        <span className="text-2xl">
                          {article.video_url ? '🎥' : '📖'}
                    </span>
                      )}
                </div>
                
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">
                    {article.title}
                  </h4>
                  
                      {/* Video Player */}
                      {article.video_url && (
                        <div className="mb-3">
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            {article.video_url.includes('youtube.com') || article.video_url.includes('youtu.be') ? (
                              <iframe
                                src={article.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={article.title}
                              ></iframe>
                            ) : (
                              <video 
                                controls 
                                className="w-full h-full"
                                poster={article.image || undefined}
                              >
                                <source src={article.video_url} type="video/mp4" />
                                Seu navegador não suporta vídeos.
                              </video>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Description */}
                      {article.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {article.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}

          {/* Fallback to static content if no articles found */}
          {articlesData && (!articlesData.articles || articlesData.articles.length === 0) && !isArticlesLoading && (
            <div className="grid grid-cols-1 gap-4">
              {currentWeek === 1 && (
            <>
              <div className="p-4 rounded-xl border-l-4 border-green-400 bg-green-50" data-testid="expert-content-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">💊</span>
                  </div>
                  <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Ácido Fólico é Essencial</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Inicie a suplementação com ácido fólico (400-800mcg/dia) para prevenir defeitos do tubo neural. Continue mesmo antes da confirmação da gravidez.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Tome sempre no mesmo horário para criar rotina</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border-l-4 border-red-400 bg-red-50" data-testid="expert-content-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🚭</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Evite Álcool e Cigarros</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Não existe quantidade segura de álcool durante a gravidez. O tabaco prejudica o desenvolvimento do bebê e aumenta riscos de complicações.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Busque ajuda profissional se precisar parar de fumar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-l-4 border-orange-400 bg-orange-50" data-testid="expert-content-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🥗</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Alimentação Balanceada</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Consuma alimentos ricos em folato (vegetais verde-escuros, leguminosas, frutas cítricas). Evite carnes cruas, peixes ricos em mercúrio.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Lave bem frutas e verduras antes do consumo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentWeek === 2 && (
              <>
                <div className="p-4 rounded-xl border-l-4 border-yellow-400 bg-yellow-50" data-testid="expert-content-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🤢</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Primeiros Sintomas são Normais</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Náuseas, cansaço e sensibilidade nos seios são comuns. Estes sintomas indicam que os hormônios estão funcionando adequadamente.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Coma pequenas refeições frequentes para minimizar náuseas</p>
                      </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50" data-testid="expert-content-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">💧</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Hidratação é Fundamental</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Beba pelo menos 8-10 copos de água por dia. A desidratação pode piorar náuseas e causar constipação.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Mantenha uma garrafa d'água sempre por perto</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-l-4 border-purple-400 bg-purple-50" data-testid="expert-content-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">👩‍⚕️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Agende sua Primeira Consulta</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Procure um obstetra para confirmar a gravidez e iniciar o pré-natal. Exames de rotina serão solicitados.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Leve uma lista de dúvidas para a consulta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentWeek === 3 && (
              <>
                <div className="p-4 rounded-xl border-l-4 border-indigo-400 bg-indigo-50" data-testid="expert-content-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🧠</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Desenvolvimento Neural Crítico</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        O tubo neural está se formando. É crucial manter a suplementação de ácido fólico e evitar medicamentos sem prescrição médica.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Consulte sempre seu médico antes de tomar qualquer medicamento</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-l-4 border-green-400 bg-green-50" data-testid="expert-content-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🚶‍♀️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Exercícios Leves são Benéficos</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Caminhadas, yoga pré-natal e natação são recomendados. Exercícios ajudam com náuseas, humor e preparam o corpo para mudanças.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Comece devagar, 15-20 minutos por dia</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-l-4 border-pink-400 bg-pink-50" data-testid="expert-content-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">😴</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Descanso Adequado</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Seu corpo está trabalhando duro! Durma 7-9 horas por noite e faça pausas durante o dia se possível.
                      </p>
                      <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-300 rounded">
                        <p className="text-yellow-800 text-xs font-medium">💡 <strong>Dica:</strong> Crie uma rotina relaxante antes de dormir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentWeek > 3 && (
              <>
                <div className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50" data-testid="expert-content-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">📋</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-2">Mantenha o Pré-natal em Dia</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Continue as consultas regulares e exames de rotina conforme orientação médica. O acompanhamento é essencial para sua saúde e do bebê.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border-l-4 border-green-400 bg-green-50" data-testid="expert-content-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🍎</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Alimentação Saudável</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Mantenha uma dieta equilibrada rica em frutas, vegetais, proteínas e grãos integrais. Evite alimentos crus ou mal cozidos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-l-4 border-purple-400 bg-purple-50" data-testid="expert-content-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">💆‍♀️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Cuide do seu Bem-estar</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Pratique técnicas de relaxamento, durma adequadamente e mantenha-se hidratada. Seu bem-estar reflete na saúde do bebê.
                    </p>
                  </div>
                </div>
              </div>
            </>
              )}
            </div>
          )}
      </div>
      
        {/* Card da próxima consulta */}
      <div className="mx-4 mt-4">
        <NextConsultationCard />
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

        {activeTab === "baby" && (
          <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
            <CardContent className="p-6">
              {/* Baby Development Information */}
              {babyText ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                    <Baby className="h-5 w-5 text-blue-600" />
                    Desenvolvimento do Bebê
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {babyText}
                  </p>
              </div>
              ) : (
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <Baby className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-gray-800 font-semibold mb-2">
                    Desenvolvimento do Bebê
              </h3>
                  <p className="text-gray-600 text-sm">
                    Consultando informações sobre o desenvolvimento do bebê para esta semana...
                  </p>
            </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "mom" && (
          <Card className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl mb-6">
            <CardContent className="p-6">
              {/* Mom Development Information */}
              {momText ? (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-rose-600" />
                    Mudanças na Mamãe
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {momText}
                  </p>
                </div>
              ) : (
                <div className="bg-pink-50 rounded-2xl p-6 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                  <h3 className="text-gray-800 font-semibold mb-2">
                    Mudanças na Mamãe
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Consultando informações sobre mudanças no corpo da mamãe para esta semana...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Menu de Opções - direto na página */}
        <div className="px-4 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">O que você gostaria de fazer?</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
            onClick={() => setLocation("/weight-tracking")}
              className="h-20 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-weight-tracking"
            >
              <Weight className="h-6 w-6" />
              <span className="text-sm font-medium">Controle de Peso</span>
            </Button>

            <Button
            onClick={() => setLocation("/kick-counter")}
              className="h-20 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-kick-counter"
            >
              <Activity className="h-6 w-6" />
              <span className="text-sm font-medium">Contar Chutes</span>
            </Button>

            <Button
              onClick={() => setLocation("/birth-plan")}
              className="h-20 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-birth-plan"
            >
              <Heart className="h-6 w-6" />
              <span className="text-sm font-medium">Plano de Parto</span>
            </Button>

            <Button
              onClick={() => setLocation("/consultations")}
              className="h-20 bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-consultations"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Consultas</span>
            </Button>

            <Button
            onClick={() => setLocation("/shopping-list")}
              className="h-20 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-shopping"
            >
              <Apple className="h-6 w-6" />
              <span className="text-sm font-medium">Lista de Compras</span>
            </Button>

            <Button
            onClick={() => setLocation("/photo-album")}
              className="h-20 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-photos"
            >
              <Info className="h-6 w-6" />
              <span className="text-sm font-medium">Fotos</span>
            </Button>

            <Button
            onClick={() => setLocation("/diary")}
              className="h-20 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-diary"
            >
              <Book className="h-6 w-6" />
              <span className="text-sm font-medium">Diário</span>
            </Button>


            <Button
            onClick={() => setLocation("/medical-articles")}
              className="h-20 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg flex flex-col items-center justify-center space-y-2"
              data-testid="button-medical-articles"
            >
              <Stethoscope className="h-6 w-6" />
              <span className="text-sm font-medium">Guia da Gestação</span>
            </Button>
            </div>
          </div>

      </div>

      {/* Footer com espaçamento */}
      <footer className="mt-12 pb-24 px-4">
        <div className="bg-gradient-to-r from-pink-50/80 to-blue-50/80 rounded-2xl p-6 text-center backdrop-blur-sm border border-white/50">
          <div className="flex items-center justify-center mb-3">
            <Heart className="h-5 w-5 text-pink-400 mr-2" />
            <h3 className="text-gray-700 font-medium">Mama Care</h3>
            <Heart className="h-5 w-5 text-pink-400 ml-2" />
            </div>
          <p className="text-gray-600 text-sm mb-2">
            Cuidando de você e seu bebê em cada momento
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 Mama Care - Sua jornada da maternidade
          </p>
                      </div>
      </footer>


    </div>
  );
}
