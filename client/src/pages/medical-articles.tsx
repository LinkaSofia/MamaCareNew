import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ExternalLink, RefreshCw, Stethoscope, BookOpen, Heart, Activity, Utensils, Dumbbell, ChevronDown, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useArticlesCategories } from "@/hooks/use-articles-categories";
import { AnimatedBackground } from "@/components/AnimatedBackground";
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
      <div className="min-h-screen pb-20 bg-gradient-to-br from-pink-50 via-pink-100 to-purple-100">
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
          
          <div className="flex items-center justify-center mb-6 pt-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2" data-testid="text-page-title">
                Guia da Gestação
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Informações médicas especializadas para a sua semana gestacional
              </p>
            </div>
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
            <Card key={category.name} className="overflow-hidden">
              <CardHeader 
                className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 cursor-pointer"
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
              
              {expandedCategories.has(category.name) && (
                <CardContent className="p-0">
                  <div className="border-t">
                    {/* Subcategorias */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Subcategorias:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(category.subcategories).map(([key, name]) => (
                          <div key={key} className="text-sm text-gray-600 dark:text-gray-400">
                            • {name}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Artigos */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Artigos:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.articles.map((article) => (
                          <Card 
                            key={article.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-pink-200"
                            onClick={() => {
                              if (article.video_url) {
                                window.open(article.video_url, '_blank');
                              }
                            }}
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
                                <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
    </AnimatedBackground>
  );
}