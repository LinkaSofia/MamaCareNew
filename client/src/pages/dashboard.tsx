import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Ruler, Weight, Calendar, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import Baby3D from "../components/Baby3D";
import { useBabyDevelopment } from "../hooks/use-baby-development";
import { useArticles } from "../hooks/use-articles";
import type { User } from "@shared/schema";
import { useAuth } from "../hooks/useAuth";
import NextConsultationCard from "../components/NextConsultationCard";
import { LoadingSpinner } from "../components/ui/loading-spinner";

interface UserData {
  name: string;
  dueDate?: string;
  currentWeek?: number;
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [currentWeek, setCurrentWeek] = useState(() => {
    const urlWeek = new URLSearchParams(location.split('?')[1] || '').get('week');
    return urlWeek ? parseInt(urlWeek, 10) : 1;
  });
  
  const [activeTab, setActiveTab] = useState<"mom" | "baby">("baby");
  
  const { data: development, isLoading: isLoadingDevelopment } = useBabyDevelopment(currentWeek);
  const { data: articlesData, isLoading: isArticlesLoading, error: articlesError } = useArticles(currentWeek);

  const navigateToWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? Math.max(1, currentWeek - 1) : Math.min(40, currentWeek + 1);
    setCurrentWeek(newWeek);
    window.history.pushState({}, '', `/?week=${newWeek}`);
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

  useEffect(() => {
    const urlWeek = new URLSearchParams(location.split('?')[1] || '').get('week');
    if (urlWeek) {
      const weekNumber = parseInt(urlWeek, 10);
      if (weekNumber !== currentWeek && weekNumber >= 1 && weekNumber <= 40) {
        setCurrentWeek(weekNumber);
      }
    }
  }, [location, currentWeek]);

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mama Care</h1>
            <p className="text-sm text-gray-600">Olá, {user?.name?.split(' ')[0] || 'Mamãe'}!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Semana {currentWeek}</p>
            <p className="text-xs text-gray-500">{40 - currentWeek} semanas restantes</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingDevelopment && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Carregando informações...</span>
        </div>
      )}

      {/* Development Info */}
      {!isLoadingDevelopment && development && (
        <div className="p-4">
          {/* Navigation */}
          <div className="flex justify-center items-center mb-6 relative">
            <button
              onClick={() => navigateToWeek('prev')}
              disabled={currentWeek <= 1}
              className={`absolute left-6 p-3 rounded-full transition-all z-10 ${
                currentWeek <= 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:shadow-xl"
              }`}
              data-testid="prev-week"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex justify-center">
              <Baby3D week={currentWeek} />
            </div>

            <button
              onClick={() => navigateToWeek('next')}
              disabled={currentWeek >= 40}
              className={`absolute right-6 p-3 rounded-full transition-all z-10 ${
                currentWeek >= 40 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white shadow-lg text-gray-700 hover:bg-gray-50 hover:shadow-xl"
              }`}
              data-testid="next-week"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Baby Development Stats */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mx-4 mb-6 border border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Ruler className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-gray-500 mb-1">Tamanho</p>
                <p className="font-semibold text-gray-800">
                  {development.length_cm ? `${development.length_cm} cm` : development.size || "Calculando..."}
                </p>
              </div>
              <div className="text-center">
                <Weight className="h-6 w-6 mx-auto mb-1 text-pink-600" />
                <p className="text-xs text-gray-500 mb-1">Peso</p>
                <p className="font-semibold text-gray-800">
                  {development.weight_grams && Number(development.weight_grams) > 0 
                    ? `${development.weight_grams}g` 
                    : development.weight || "< 1g"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{getFruitEmoji(development.fruit_comparison)}</div>
                <p className="text-xs text-gray-500 mb-1">Como</p>
                <p className="font-semibold text-gray-800 text-sm">{development.fruit_comparison || "Calculando..."}</p>
              </div>
            </div>
          </div>
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