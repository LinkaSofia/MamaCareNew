import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ExternalLink, RefreshCw, Stethoscope, BookOpen, Heart, Activity, Utensils, Dumbbell, ChevronDown, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useArticlesCategories } from "@/hooks/use-articles-categories";
// import ReactMarkdown from "react-markdown"; // Removido temporariamente

interface MedicalArticle {
  id: string;
  week: number;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl?: string;
  category: string;
  importance: string;
  readingTime: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [viewingContent, setViewingContent] = useState<{type: 'video' | 'pdf', url: string, title: string} | null>(null);
  const [categorySlides, setCategorySlides] = useState<{[key: string]: number}>({});

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
  const nextSlide = () => {
    if (categoriesData?.categories) {
      const totalSlides = Math.ceil(categoriesData.categories.length / 3);
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  };

  const prevSlide = () => {
    if (categoriesData?.categories) {
      const totalSlides = Math.ceil(categoriesData.categories.length / 3);
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  // Funções de swipe para mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };


  const handleArticleClick = (article: MedicalArticle) => {
    setSelectedArticle(article);
    trackUserAction.trackAction("article_view", `article-${article.id}`);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    trackUserAction.trackAction("article_list_view", "back-button");
  };

  const handleOpenContent = (article: any) => {
    if (article.video_url) {
      setViewingContent({
        type: 'video',
        url: article.video_url,
        title: article.title
      });
    } else if (article.type === 'pdf') {
      setViewingContent({
        type: 'pdf',
        url: article.video_url || article.url || '',
        title: article.title
      });
    }
    trackUserAction.trackAction("content_view", `content-${article.id}`);
  };

  const handleCloseContent = () => {
    setViewingContent(null);
  };

  // Funções de navegação para cada categoria
  const nextCategorySlide = (categoryName: string, totalArticles: number) => {
    const totalSlides = Math.ceil(totalArticles / 2);
    setCategorySlides(prev => ({
      ...prev,
      [categoryName]: Math.min((prev[categoryName] || 0) + 1, totalSlides - 1)
    }));
  };

  const prevCategorySlide = (categoryName: string) => {
    setCategorySlides(prev => ({
      ...prev,
      [categoryName]: Math.max((prev[categoryName] || 0) - 1, 0)
    }));
  };

  const getCurrentSlide = (categoryName: string) => {
    return categorySlides[categoryName] || 0;
  };


  // Modal de visualização de conteúdo
  if (viewingContent) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {viewingContent.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseContent}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-4">
            {viewingContent.type === 'video' ? (
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={viewingContent.url}
                  className="w-full h-full"
                  allowFullScreen
                  title={viewingContent.title}
                />
              </div>
            ) : (
              <div className="h-[70vh]">
                <iframe
                  src={viewingContent.url}
                  className="w-full h-full rounded-lg"
                  title={viewingContent.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedArticle) {
    const CategoryIcon = categoryIcons[selectedArticle.category as keyof typeof categoryIcons] || Stethoscope;
    
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="mb-4"
          data-testid="button-back-to-list"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos artigos
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
    <div className="container mx-auto px-4 py-6">
      {/* Botão de Voltar */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2" data-testid="text-page-title">
          Guia da Gestação
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Informações médicas especializadas para a sua semana gestacional
        </p>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-pink-200 dark:border-pink-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              <div>
                <h2 className="font-semibold text-pink-700 dark:text-pink-300">
                  Guia Completo da Gestação
                </h2>
                <p className="text-sm text-pink-600 dark:text-pink-400">
                  Informações organizadas por categoria para todas as fases da sua gravidez
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {categoriesLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
            <Card key={category.name} className="overflow-hidden">
              {/* Cabeçalho da Categoria */}
              <CardHeader 
                className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 cursor-pointer hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900 dark:hover:to-purple-900 transition-colors"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {category.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.articles.length} artigos disponíveis
                      </p>
                    </div>
                  </div>
                  {expandedCategories.has(category.name) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              {/* Conteúdo Expansível */}
              {expandedCategories.has(category.name) && (
                <CardContent className="p-0">
                  <div className="border-t">
                    {/* Carrossel de Artigos */}
                    <div className="p-4">
                      <div className="relative">
                        <div className="overflow-hidden">
                          <div 
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ 
                              transform: `translateX(-${getCurrentSlide(category.name) * 100}%)` 
                            }}
                          >
                            {Array.from({ 
                              length: Math.ceil(category.articles.length / 2) 
                            }).map((_, slideIndex) => (
                              <div key={slideIndex} className="w-full flex-shrink-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {category.articles
                                    .slice(slideIndex * 2, slideIndex * 2 + 2)
                                    .map((article) => (
                                      <Card 
                                        key={article.id} 
                                        className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-pink-200"
                                        onClick={() => handleOpenContent(article)}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                              <span className="text-lg">
                                                {article.type === 'pdf' || article.video_url?.includes('.pdf') ? '📄' : '🎥'}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">
                                                {article.title}
                                              </h4>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Semana {article.week} • {article.source}
                                              </p>
                                              {article.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                                                  {article.description}
                                                </p>
                                              )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                              <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                              <span className="text-xs font-medium text-purple-600">
                                                {article.type === 'pdf' || article.video_url?.includes('.pdf') ? 'Ver PDF →' : 'Assistir →'}
                                              </span>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botões de Navegação para esta categoria */}
                        {category.articles.length > 2 && (
                          <div className="flex justify-center gap-4 mt-4">
                            <Button
                              onClick={() => prevCategorySlide(category.name)}
                              variant="outline"
                              size="sm"
                              disabled={getCurrentSlide(category.name) === 0}
                              className="flex items-center gap-2"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Anterior
                            </Button>
                            
                            {/* Indicadores de slide */}
                            <div className="flex gap-2">
                              {Array.from({ 
                                length: Math.ceil(category.articles.length / 2) 
                              }).map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCategorySlides(prev => ({
                                    ...prev,
                                    [category.name]: index
                                  }))}
                                  className={`w-3 h-3 rounded-full transition-colors ${
                                    index === getCurrentSlide(category.name)
                                      ? 'bg-pink-500' 
                                      : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                />
                              ))}
                            </div>

                            <Button
                              onClick={() => nextCategorySlide(category.name, category.articles.length)}
                              variant="outline"
                              size="sm"
                              disabled={getCurrentSlide(category.name) >= Math.ceil(category.articles.length / 2) - 1}
                              className="flex items-center gap-2"
                            >
                              Próximo
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
  );
}