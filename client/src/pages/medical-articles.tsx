import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ExternalLink, RefreshCw, Stethoscope, BookOpen, Heart, Activity, Utensils, Dumbbell } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useUserTracking } from "@/hooks/useUserTracking";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const [currentWeek, setCurrentWeek] = useState<number>(20); // Semana padrão

  // Calcular semana gestacional se houver gravidez ativa
  const { data: pregnancyData } = useQuery({
    queryKey: ["/api/pregnancies", user?.id],
    enabled: !!user?.id,
  }) as { data?: { pregnancy?: { currentWeek: number } } };

  const pregnancyWeek = pregnancyData?.pregnancy?.currentWeek || currentWeek;

  // Buscar artigos médicos por semana
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["/api/medical-articles/week", pregnancyWeek],
    enabled: !!pregnancyWeek,
  }) as { data?: { articles?: MedicalArticle[] }, isLoading: boolean };

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
    trackUserAction("article_view", "medical-articles", `article-${article.id}`, {
      articleTitle: article.title,
      week: article.week,
      category: article.category
    });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    trackUserAction("article_list_view", "medical-articles", "back-button");
  };

  const handleSeedArticles = () => {
    seedArticlesMutation.mutate();
    trackUserAction("seed_articles", "medical-articles", "seed-button");
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2" data-testid="text-page-title">
            Artigos Médicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Informações médicas especializadas para a sua semana gestacional
          </p>
        </div>
        <Button
          onClick={handleSeedArticles}
          disabled={seedArticlesMutation.isPending}
          variant="outline"
          size="sm"
          data-testid="button-seed-articles"
        >
          {seedArticlesMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Popular Artigos
        </Button>
      </div>

      <div className="mb-6">
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-pink-200 dark:border-pink-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              <div>
                <h2 className="font-semibold text-pink-700 dark:text-pink-300">
                  Você está na {pregnancyWeek}ª semana de gestação
                </h2>
                <p className="text-sm text-pink-600 dark:text-pink-400">
                  Veja artigos médicos especializados para esta fase da sua gravidez
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {articlesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articlesData?.articles?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articlesData.articles.map((article: MedicalArticle) => {
            const CategoryIcon = categoryIcons[article.category as keyof typeof categoryIcons] || Stethoscope;
            
            return (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-pink-300 dark:border-l-pink-600"
                onClick={() => handleArticleClick(article)}
                data-testid={`card-article-${article.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4" />
                      <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                        {article.category === 'nutrition' ? 'Nutrição' :
                         article.category === 'exercise' ? 'Exercícios' :
                         article.category === 'health' ? 'Saúde' :
                         article.category === 'preparation' ? 'Preparação' :
                         'Sintomas'}
                      </Badge>
                    </div>
                    <Badge className={importanceColors[article.importance as keyof typeof importanceColors]}>
                      {article.importance === 'high' ? 'Alta' :
                       article.importance === 'medium' ? 'Média' :
                       'Baixa'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-pink-600 dark:text-pink-400 line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readingTime} min</span>
                    </div>
                    <div>{article.source}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Nenhum artigo disponível
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              Não há artigos médicos disponíveis para a semana {pregnancyWeek} ainda.
            </p>
            <Button
              onClick={handleSeedArticles}
              disabled={seedArticlesMutation.isPending}
              data-testid="button-seed-articles-empty"
            >
              {seedArticlesMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Popular Artigos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}