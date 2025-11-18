import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ExternalLink, RefreshCw, Stethoscope, BookOpen, Heart, Activity, Utensils, Dumbbell, ChevronDown, ChevronRight, ChevronLeft, Play, Pause, X } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useArticlesCategories } from "@/hooks/use-articles-categories";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import BottomNavigation from "@/components/layout/bottom-navigation";
// import ReactMarkdown from "react-markdown"; // Removido temporariamente

interface MedicalArticle {
  id: string;
  week: number;
  title: string;
  summary?: string;
  content?: string;
  source: string | null;
  sourceUrl?: string;
  category?: string;
  importance?: string;
  readingTime?: number;
  tags?: string[];
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  video_url?: string | null;
  description?: string | null;
  image?: string | null;
  type?: string;
  categoria?: string | null;
}

const categoryIcons = {
  nutrition: Utensils,
  exercise: Dumbbell,
  health: Heart,
  preparation: BookOpen,
  symptoms: Activity
};

const categoryColors = {
  nutrition: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  exercise: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", 
  health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  preparation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  symptoms: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
};

const importanceColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

export default function MedicalArticles() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const trackUserAction = useUserTracking();
  const { toast } = useToast();
  const [selectedArticle, setSelectedArticle] = useState<MedicalArticle | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Estados para o carrossel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Estados para o modal de conteúdo
  const [showContentModal, setShowContentModal] = useState(false);
  const [currentContent, setCurrentContent] = useState<{
    type: 'video' | 'pdf';
    url: string;
    title: string;
    source: string;
  } | null>(null);

  // Buscar artigos organizados por categoria
  const { data: categoriesData, isLoading: categoriesLoading } = useArticlesCategories();

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Funções do carrossel
  const goToSlide = (slideIndex: number, articles: any[]) => {
    if (slideIndex >= 0 && slideIndex <= Math.ceil(articles.length / 2) - 1) {
      setCurrentSlide(slideIndex);
    }
  };

  const nextSlide = (articles: any[]) => {
    const maxSlides = Math.ceil(articles.length / 2) - 1;
    setCurrentSlide(prev => prev < maxSlides ? prev + 1 : 0);
  };

  const prevSlide = (articles: any[]) => {
    const maxSlides = Math.ceil(articles.length / 2) - 1;
    setCurrentSlide(prev => prev > 0 ? prev - 1 : maxSlides);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      categoriesData?.categories.forEach(category => {
        if (expandedCategories.has(category.name)) {
          nextSlide(category.articles);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, expandedCategories, categoriesData]);

  // Funções de drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Função para converter URL do YouTube para embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (url.includes('youtube.com/embed/')) {
      return `${url}?autoplay=1&rel=0`;
    }
    return url;
  };

  // Função para detectar se é um vídeo do YouTube
  const isYouTubeVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Funções para o modal de conteúdo
  const openContent = (article: any) => {
    console.log("🎬 Opening content:", article);
    console.log("🎬 Video URL:", article.video_url);
    console.log("🎬 Content:", article.content);
    console.log("🎬 Source URL:", article.sourceUrl);
    
    if (article.video_url) {
      console.log("🎬 Opening video:", article.video_url);
      const embedUrl = isYouTubeVideo(article.video_url) 
        ? getYouTubeEmbedUrl(article.video_url)
        : article.video_url;
      
      setCurrentContent({
        type: 'video',
        url: embedUrl,
        title: article.title,
        source: article.source || 'Fonte não disponível'
      });
      setShowContentModal(true);
    } else if (article.content && article.content.includes('.pdf')) {
      console.log("📄 Opening PDF:", article.content);
      setCurrentContent({
        type: 'pdf',
        url: article.content,
        title: article.title,
        source: article.source || 'Fonte não disponível'
      });
      setShowContentModal(true);
    } else {
      console.log("🔗 Opening external link:", article.sourceUrl || article.video_url);
      // Se não for vídeo nem PDF, abrir em nova aba
      window.open(article.sourceUrl || article.video_url, '_blank');
    }
  };

  const closeContentModal = () => {
    setShowContentModal(false);
    setCurrentContent(null);
  };

  // Mutation para popular artigos médicos (para admin/desenvolvimento)
  const seedArticlesMutation = useMutation({
    mutationFn: () => apiRequest("/api/medical-articles/seed", "POST", {}),
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Artigos médicos populados com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-articles/week"] });
    },
    onError: (error) => {
      console.error("Erro ao popular artigos:", error);
      toast({
        title: "Erro",
        description: "Erro ao popular artigos médicos.",
        variant: "destructive",
      });
    },
  });

  const handleArticleClick = (article: MedicalArticle) => {
    setSelectedArticle(article);
    trackUserAction.trackAction("article_view", `article-${article.id}`);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    trackUserAction.trackAction("article_list_view", "back-button");
  };

  const handleSeedArticles = () => {
    seedArticlesMutation.mutate();
    trackUserAction.trackAction("seed_articles", "seed-button");
  };

  if (selectedArticle) {
    const CategoryIcon = categoryIcons[selectedArticle.category as keyof typeof categoryIcons] || Stethoscope;
    
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="mb-4 p-2 rounded-full hover:bg-gray-100 fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-lg"
          size="sm"
          data-testid="button-back-to-list"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <CategoryIcon className="h-5 w-5" />
              <Badge className={categoryColors[selectedArticle.category as keyof typeof categoryColors]}>
                {selectedArticle.category === 'nutrition' ? 'Nutrição' :
                 selectedArticle.category === 'exercise' ? 'Exercícios' :
                 selectedArticle.category === 'health' ? 'Saúde' :
                 selectedArticle.category === 'preparation' ? 'Preparação' :
                 'Sintomas'}
              </Badge>
              <Badge className={importanceColors[selectedArticle.importance as keyof typeof importanceColors]}>
                {selectedArticle.importance === 'high' ? 'Alta importância' :
                 selectedArticle.importance === 'medium' ? 'Média importância' :
                 'Baixa importância'}
              </Badge>
            </div>
            <CardTitle className="text-2xl text-pink-600 dark:text-pink-400" data-testid="text-article-title">
              {selectedArticle.title}
            </CardTitle>
            <CardDescription className="text-lg" data-testid="text-article-summary">
              {selectedArticle.summary}
            </CardDescription>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{selectedArticle.readingTime} min de leitura</span>
              </div>
              <div>Semana {selectedArticle.week}</div>
              <div>Por {selectedArticle.source}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-pink dark:prose-invert max-w-none whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
            
            {selectedArticle.sourceUrl && (
              <div className="mt-6 pt-4 border-t">
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:underline"
                  data-testid="link-source-url"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver fonte completa
                </a>
              </div>
            )}

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Botão de Voltar */}
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
            size="icon"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center justify-center mb-8 pt-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center" data-testid="text-page-title">
              Guia de Gestação
            </h1>
          </div>

      {categoriesLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : categoriesData?.categories && categoriesData.categories.length > 0 ? (
        <div className="space-y-6">
          {categoriesData.categories.map((category) => (
            <Card key={category.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader 
                className="bg-gradient-to-r from-pink-500 to-purple-600 cursor-pointer"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {category.name}
                      </h2>
                      <p className="text-sm text-white/90">
                        {category.articles.length} artigos disponíveis
                      </p>
                    </div>
                  </div>
                  {expandedCategories.has(category.name) ? (
                    <ChevronDown className="h-6 w-6 text-white" />
                  ) : (
                    <ChevronRight className="h-6 w-6 text-white" />
                  )}
                </div>
              </CardHeader>
              
              {expandedCategories.has(category.name) && (
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Artigos */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-purple-500" />
                        Artigos ({category.articles.length})
                      </h3>
                      {/* Carrossel horizontal com swipe */}
                      <div className="relative -mx-6 px-6">
                        <div 
                          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                          }}
                        >
                          {category.articles.map((article, index) => (
                            <Card 
                              key={article.id} 
                              className="flex-none w-[280px] sm:w-[320px] snap-start hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border-2 border-pink-100 overflow-hidden hover:scale-105 hover:border-pink-300 rounded-2xl group"
                              onClick={(e) => {
                                console.log("🖱️ Card clicked:", article.title);
                                e.preventDefault();
                                openContent(article);
                              }}
                            >
                            <CardContent className="p-0">
                              <div className="relative flex flex-col h-full">
                                {/* Article Image - Full Width */}
                                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden relative">
                                  {article.image ? (
                                    <img 
                                      src={article.image.startsWith('@assets/') 
                                        ? article.image.replace('@assets/', '/src/assets/') 
                                        : article.image.startsWith('/src/assets/')
                                        ? article.image
                                        : `/src/assets/imagem_artigos/${article.image}`
                                      } 
                                      alt={article.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onLoad={() => console.log('✅ Imagem carregada:', article.image)}
                                      onError={(e) => {
                                        console.log('❌ Erro ao carregar imagem:', article.image);
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<div class="flex items-center justify-center h-full bg-gradient-to-br from-pink-200 to-purple-200"><span class="text-6xl">📖</span></div>';
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-200 to-purple-200">
                                      <span className="text-6xl">
                                        {article.type === 'pdf' || article.video_url?.includes('.pdf') ? '📄' : '🎥'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Type Badge */}
                                  <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                                    <span>{article.type === 'pdf' || article.video_url?.includes('.pdf') ? '📄' : '🎥'}</span>
                                  </div>
                                </div>
                                
                                {/* Article Info - Clean Bottom */}
                                <div className="p-5 bg-white flex-1 flex flex-col">
                                  <h4 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                                    {article.title}
                                  </h4>
                                  {article.source && (
                                    <div className="mt-auto pt-3 border-t border-gray-100">
                                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <Stethoscope className="h-3.5 w-3.5 text-pink-400" />
                                        {article.source}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          ))}
                        </div>
                        {/* Indicador de scroll */}
                        <div className="flex justify-center gap-1.5 mt-2">
                          {category.articles.map((_, index) => (
                            <div 
                              key={index}
                              className="w-1.5 h-1.5 rounded-full bg-pink-300"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Nenhum conteúdo encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Não há artigos disponíveis no momento.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </div>

      {/* Modal de Conteúdo */}
      {showContentModal && currentContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  {currentContent.type === 'video' ? (
                    <Play className="h-5 w-5 text-white" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                    {currentContent.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentContent.source}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeContentModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {currentContent.type === 'video' ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {isYouTubeVideo(currentContent.url) ? (
                    <iframe
                      src={currentContent.url}
                      title={currentContent.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      <source src={currentContent.url} type="video/mp4" />
                      <source src={currentContent.url} type="video/webm" />
                      <p className="text-white p-4">
                        Seu navegador não suporta a reprodução de vídeo.
                        <a 
                          href={currentContent.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 underline ml-1"
                        >
                          Clique aqui para baixar o vídeo.
                        </a>
                      </p>
                    </video>
                  )}
                </div>
              ) : (
                <div className="w-full h-[600px]">
                  <iframe
                    src={`${currentContent.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0 rounded-lg"
                    title={currentContent.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </AnimatedBackground>
  );
}