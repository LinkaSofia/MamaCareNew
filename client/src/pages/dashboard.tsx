import { useState } from "react";
import { ArrowLeft, ArrowRight, Ruler, Weight, Calendar, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import Baby3D from "../components/Baby3D";
import { useBabyDevelopment } from "../hooks/use-baby-development";
import { useArticles } from "../hooks/use-articles";
import { usePregnancy } from "../hooks/use-pregnancy";
import { useAuth } from "../hooks/useAuth";
import NextConsultationCard from "../components/NextConsultationCard";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import ProgressCircle from "../components/progress-circle";
import { VideoSection } from "../components/VideoSection";

interface UserData {
  name: string;
  dueDate?: string;
  currentWeek?: number;
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { pregnancy, weekInfo, progress, isLoading } = usePregnancy();
  
  const [viewingWeek, setViewingWeek] = useState<number | null>(null);
  const currentWeek = viewingWeek || weekInfo?.week || 1;
  
  const [activeTab, setActiveTab] = useState<"mom" | "baby">("baby");
  
  const { data: development, isLoading: isLoadingDevelopment } = useBabyDevelopment(currentWeek);
  const { data: articlesData, isLoading: isArticlesLoading, error: articlesError } = useArticles(currentWeek);

  const navigateToWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? Math.max(1, currentWeek - 1) : Math.min(40, currentWeek + 1);
    setViewingWeek(newWeek);
    setLocation(`/?week=${newWeek}`);
  };

  const backToCurrentWeek = () => {
    setViewingWeek(null);
    setLocation('/');
  };

  const getFruitEmoji = (fruit: string | null) => {
    if (!fruit) return "🤔";
    const fruitMap: Record<string, string> = {
      "grão de areia": "🟡",
      "cabeça de alfinete": "📍", 
      "semente de chia": "⚪",
      "semente de papoula": "⚫",
      "framboesa": "🫐",
      "lima": "🟢",
      "limão": "🍋",
      "banana": "🍌",
      "milho": "🌽",
      "berinjela": "🍆"
    };
    return fruitMap[fruit.toLowerCase()] || "🍎";
  };

  // Wait for pregnancy data to load before redirecting
  if (isLoading) {
    return (
      <div className="maternal-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 maternal-font">Carregando informações da gravidez...</p>
        </div>
      </div>
    );
  }

  // Only redirect after loading is complete and no pregnancy found
  if (!pregnancy && !weekInfo) {
    setLocation("/pregnancy-setup");
    return null;
  }

  return (
    <div className="maternal-bg min-h-screen pb-20 relative">
      {/* Gentle floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-pink-200 rounded-full animate-float-gentle opacity-60"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-blue-200 rounded-full animate-breathe opacity-50"></div>
        <div className="absolute bottom-32 left-1/4 w-2.5 h-2.5 bg-purple-200 rounded-full animate-float-gentle opacity-40"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-green-200 rounded-full animate-breathe opacity-50"></div>
      </div>
      
      {/* Header */}
      <div className="glass-soft border-b border-pink-200/30 sticky top-0 z-40 relative">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent maternal-font animate-gentle-gradient">Mama Care</h1>
            <p className="text-sm text-gray-600 maternal-font">Olá, {user?.name?.split(' ')[0] || 'Mamãe'}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-pink-600 maternal-font font-medium">Semana {weekInfo?.week || 1}</p>
              <p className="text-xs text-gray-500 maternal-font">{weekInfo?.weeksRemaining || 0} semanas restantes</p>
            </div>
            {/* Logout Button */}
            <button
              onClick={() => {
                // Clear session and redirect to login
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => {
                    setLocation('/login');
                  })
                  .catch((error) => {
                    console.error('Logout error:', error);
                    // Force redirect even if API fails
                    setLocation('/login');
                  });
              }}
              className="p-2 rounded-full glass-soft border border-pink-300/50 hover:border-pink-400 transition-all duration-200 warm-glow"
              title="Sair da conta"
              data-testid="button-logout"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingDevelopment && (
        <div className="flex items-center justify-center py-20 relative">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600 maternal-font">Carregando informações...</span>
        </div>
      )}

      {/* Development Info */}
      {!isLoadingDevelopment && development && (
        <div className="p-4 relative">
          {/* Hero Section com navegação nas bordas */}
          <div className="mb-8 relative">
            <div className="flex items-center justify-center mb-6 px-4 relative">
              {/* Botão semana anterior */}
              <button
                onClick={() => navigateToWeek('prev')}
                disabled={currentWeek <= 1}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full transition-all glass-soft border border-pink-300/30 warm-glow ${
                  currentWeek <= 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:border-pink-400 hover:shadow-lg active:scale-95 animate-breathe'
                }`}
                data-testid="button-previous-week"
              >
                <ChevronLeft className="w-6 h-6 text-pink-600" />
              </button>

              {/* Botão próxima semana */}
              <button
                onClick={() => navigateToWeek('next')}
                disabled={currentWeek >= 40}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full transition-all glass-soft border border-blue-300/30 warm-glow ${
                  currentWeek >= 40 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:border-blue-400 hover:shadow-lg active:scale-95 animate-breathe'
                }`}
                data-testid="button-next-week"
              >
                <ChevronRight className="w-6 h-6 text-blue-600" />
              </button>

              {/* Baby 3D Component */}
              <div className="w-48 h-48 mx-4 rounded-full overflow-hidden border-4 border-white/60 shadow-xl warm-glow animate-breathe" style={{background: 'var(--gradient-peach-sky)'}}>
                <Baby3D week={currentWeek} className="w-full h-full rounded-full" />
              </div>
              
              {/* Progress Ring ao lado da imagem */}
              {weekInfo && (
                <div className="relative ml-8">
                  <ProgressCircle 
                    percentage={Math.round((currentWeek / 40) * 100)} 
                    size={128}
                  />
                </div>
              )}
            </div>
            
            {/* Informações da gestação */}
            {weekInfo && (
              <div className="glass-effect rounded-2xl p-6 mx-4 backdrop-blur-md bg-white/80 mb-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Semana atual */}
                  <div className="text-center">
                    <p className="text-gray-700 text-lg mb-2 flex items-center justify-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {viewingWeek && viewingWeek !== weekInfo.week ? 'Visualizando a' : 'Você está na'}
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mb-2">
                      {currentWeek}ª semana
                    </p>
                    <p className="text-gray-600 text-sm">
                      {viewingWeek && viewingWeek !== weekInfo.week ? (
                        <div className="flex flex-col items-center gap-2">
                          <span>de desenvolvimento</span>
                          <button 
                            onClick={backToCurrentWeek}
                            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            data-testid="button-back-to-current-week"
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Voltar para semana {weekInfo.week}</span>
                          </button>
                        </div>
                      ) : 'da sua gestação'}
                    </p>
                  </div>
                  
                  {/* Semanas restantes */}
                  <div className="text-center">
                    <p className="text-gray-700 text-lg mb-2 flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Faltam aproximadamente
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mb-2">
                      {40 - currentWeek} semanas
                    </p>
                    <p className="text-gray-600 text-sm">
                      para conhecer seu bebê!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informações do bebê - horizontal */}
          {development?.developmentData && (
            <div className="glass-effect rounded-2xl p-4 mx-4 backdrop-blur-md bg-white/80">
              <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 flex items-center justify-around">
                <div className="text-center">
                  <Ruler className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-500 mb-1">Tamanho</p>
                  <p className="font-semibold text-gray-800">
                    {development.developmentData?.length_cm ? `${development.developmentData.length_cm} cm` : development.developmentData?.size || "Calculando..."}
                  </p>
                </div>
                <div className="text-center">
                  <Weight className="h-6 w-6 mx-auto mb-1 text-pink-600" />
                  <p className="text-xs text-gray-500 mb-1">Peso</p>
                  <p className="font-semibold text-gray-800">
                    {development.developmentData?.weight_grams && Number(development.developmentData.weight_grams) > 0 
                      ? `${development.developmentData.weight_grams}g` 
                      : development.developmentData?.weight || "< 1g"}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">{getFruitEmoji(development.developmentData?.fruit_comparison)}</div>
                  <p className="text-xs text-gray-500 mb-1">Como</p>
                  <p className="font-semibold text-gray-800 text-sm">{development.developmentData?.fruit_comparison || "Calculando..."}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expert Content Section */}
      <div className="glass-effect rounded-2xl p-5 mx-4 mt-6 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">👩‍⚕️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Conteúdos para Você - Semana {currentWeek}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {isArticlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Carregando conteúdos...</span>
            </div>
          ) : articlesData?.articles && articlesData.articles.length > 0 ? (
            articlesData.articles.map((article, index) => (
              <div 
                key={article.id}
                className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50"
                data-testid={`article-content-${index + 1}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">
                      {article.video_url ? '🎥' : '📖'}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">
                      {article.title}
                    </h4>
                    
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
                            />
                          ) : (
                            <video 
                              controls 
                              className="w-full h-full"
                            >
                              <source src={article.video_url} type="video/mp4" />
                              Seu navegador não suporta vídeos.
                            </video>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {article.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {article.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : currentWeek === 1 ? (
            <>
              <div className="p-4 rounded-xl border-l-4 border-green-400 bg-green-50" data-testid="expert-content-1">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">📖</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Primeira Consulta Pré-natal</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Agende sua primeira consulta com o obstetra. É importante iniciar o acompanhamento médico o quanto antes para garantir uma gravidez saudável.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-l-4 border-blue-400 bg-blue-50" data-testid="expert-content-2">
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
          ) : null}
        </div>
      </div>
      
      {/* Next Consultation Card */}
      <div className="mx-4 mt-4">
        <NextConsultationCard />
      </div>

      {/* Video Section */}
      <VideoSection 
        videos={articlesData?.articles || []} 
        isLoading={isArticlesLoading}
        currentWeek={currentWeek}
      />

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

      {/* Feature Grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Weight Tracking */}
          <div 
            className="bg-gradient-to-br from-pink-400 to-pink-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/weight-tracking")}
            data-testid="card-weight-tracking"
          >
            <Weight className="h-8 w-8 mb-2" />
            <h3 className="font-semibold text-sm">Controle de Peso</h3>
            <p className="text-xs opacity-90 mt-1">Acompanhe sua evolução</p>
          </div>

          {/* Kick Counter */}
          <div 
            className="bg-gradient-to-br from-purple-400 to-purple-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/kick-counter")}
            data-testid="card-kick-counter"
          >
            <div className="text-2xl mb-2">👶</div>
            <h3 className="font-semibold text-sm">Contador de Chutes</h3>
            <p className="text-xs opacity-90 mt-1">Monitore os movimentos</p>
          </div>

          {/* Birth Plan */}
          <div 
            className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/birth-plan")}
            data-testid="card-birth-plan"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-sm">Plano de Parto</h3>
            <p className="text-xs opacity-90 mt-1">Planeje seu parto</p>
          </div>

          {/* Consultations */}
          <div 
            className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/consultations")}
            data-testid="card-consultations"
          >
            <Calendar className="h-8 w-8 mb-2" />
            <h3 className="font-semibold text-sm">Consultas</h3>
            <p className="text-xs opacity-90 mt-1">Agende e gerencie</p>
          </div>

          {/* Shopping List */}
          <div 
            className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/shopping-list")}
            data-testid="card-shopping-list"
          >
            <div className="text-2xl mb-2">🛒</div>
            <h3 className="font-semibold text-sm">Lista de Compras</h3>
            <p className="text-xs opacity-90 mt-1">Organize suas compras</p>
          </div>

          {/* Photo Album */}
          <div 
            className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/photo-album")}
            data-testid="card-photo-album"
          >
            <div className="text-2xl mb-2">📸</div>
            <h3 className="font-semibold text-sm">Álbum de Fotos</h3>
            <p className="text-xs opacity-90 mt-1">Guarde suas memórias</p>
          </div>

          {/* Diary */}
          <div 
            className="bg-gradient-to-br from-teal-400 to-teal-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/diary")}
            data-testid="card-diary"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-sm">Diário</h3>
            <p className="text-xs opacity-90 mt-1">Registre seus sentimentos</p>
          </div>

          {/* Medical Articles */}
          <div 
            className="bg-gradient-to-br from-red-400 to-red-500 p-4 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setLocation("/medical-articles")}
            data-testid="card-medical-articles"
          >
            <div className="text-2xl mb-2">🏥</div>
            <h3 className="font-semibold text-sm">Artigos Médicos</h3>
            <p className="text-xs opacity-90 mt-1">Informações confiáveis</p>
          </div>
        </div>
      </div>
    </div>
  );
}