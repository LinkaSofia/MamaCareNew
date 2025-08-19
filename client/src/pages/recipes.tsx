import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Clock, Users, ChefHat, Leaf, Apple, Coffee, Utensils } from "lucide-react";

const recipes = [
  {
    id: 1,
    title: "Smoothie de Frutas Vermelhas",
    category: "Bebidas",
    prepTime: "5 min",
    servings: 2,
    trimester: "Todos",
    nutrients: ["Ácido Fólico", "Vitamina C", "Ferro"],
    ingredients: [
      "1 xícara de morangos",
      "1/2 xícara de mirtilios",
      "1 banana",
      "1 xícara de leite",
      "1 colher de mel"
    ],
    instructions: [
      "Lave bem as frutas vermelhas",
      "Descasque e corte a banana",
      "Coloque todos os ingredientes no liquidificador",
      "Bata até ficar homogêneo",
      "Sirva imediatamente"
    ],
    benefits: "Rico em antioxidantes e ácido fólico, essencial para o desenvolvimento do bebê"
  },
  {
    id: 2,
    title: "Salmão Grelhado com Quinoa",
    category: "Pratos Principais",
    prepTime: "25 min",
    servings: 2,
    trimester: "2º e 3º",
    nutrients: ["Ômega-3", "Proteínas", "DHA"],
    ingredients: [
      "2 filés de salmão",
      "1 xícara de quinoa",
      "Brócolis",
      "Azeite de oliva",
      "Limão",
      "Ervas finas"
    ],
    instructions: [
      "Cozinhe a quinoa conforme instruções da embalagem",
      "Tempere o salmão com limão e ervas",
      "Grelhe o salmão por 4-5 minutos de cada lado",
      "Refogue o brócolis no vapor",
      "Sirva tudo junto"
    ],
    benefits: "Excelente fonte de ômega-3 para desenvolvimento cerebral do bebê"
  },
  {
    id: 3,
    title: "Aveia com Frutas e Nozes",
    category: "Café da Manhã",
    prepTime: "10 min",
    servings: 1,
    trimester: "Todos",
    nutrients: ["Fibras", "Proteínas", "Vitaminas"],
    ingredients: [
      "1/2 xícara de aveia",
      "1 xícara de leite",
      "1 banana fatiada",
      "2 colheres de nozes",
      "1 colher de mel",
      "Canela"
    ],
    instructions: [
      "Cozinhe a aveia com o leite em fogo baixo",
      "Adicione a canela",
      "Sirva com banana e nozes por cima",
      "Regue com mel"
    ],
    benefits: "Rica em fibras, ajuda no funcionamento intestinal durante a gravidez"
  },
  {
    id: 4,
    title: "Salada de Espinafre com Morango",
    category: "Saladas",
    prepTime: "15 min",
    servings: 2,
    trimester: "Todos",
    nutrients: ["Ferro", "Ácido Fólico", "Vitamina K"],
    ingredients: [
      "2 xícaras de espinafre baby",
      "1 xícara de morangos",
      "1/4 de xícara de queijo de cabra",
      "Nozes picadas",
      "Vinagrete balsâmico"
    ],
    instructions: [
      "Lave bem o espinafre e os morangos",
      "Corte os morangos em fatias",
      "Monte a salada intercalando ingredientes",
      "Finalize com vinagrete"
    ],
    benefits: "Alto teor de ferro e ácido fólico, prevenindo anemia gestacional"
  },
  {
    id: 5,
    title: "Chá de Gengibre com Limão",
    category: "Bebidas",
    prepTime: "8 min",
    servings: 1,
    trimester: "1º",
    nutrients: ["Vitamina C", "Antioxidantes"],
    ingredients: [
      "1 pedaço pequeno de gengibre",
      "Suco de 1/2 limão",
      "1 xícara de água quente",
      "Mel a gosto"
    ],
    instructions: [
      "Descasque e fatie o gengibre",
      "Ferva a água com o gengibre por 5 minutos",
      "Adicione o suco de limão",
      "Adoce com mel se desejar"
    ],
    benefits: "Ajuda a combater náuseas matinais no primeiro trimestre"
  },
  {
    id: 6,
    title: "Wrap de Frango com Abacate",
    category: "Lanches",
    prepTime: "15 min",
    servings: 2,
    trimester: "Todos",
    nutrients: ["Proteínas", "Gorduras Boas", "Fibras"],
    ingredients: [
      "2 tortilhas integrais",
      "200g de peito de frango grelhado",
      "1 abacate maduro",
      "Folhas de alface",
      "Tomate cereja",
      "Cream cheese light"
    ],
    instructions: [
      "Amasse o abacate com um garfo",
      "Espalhe cream cheese na tortilha",
      "Adicione frango, abacate e vegetais",
      "Enrole bem apertado",
      "Corte ao meio para servir"
    ],
    benefits: "Lanche nutritivo e prático, rico em proteínas e gorduras saudáveis"
  }
];

const categories = [
  { name: "Todos", icon: Utensils, color: "text-charcoal" },
  { name: "Café da Manhã", icon: Coffee, color: "text-baby-pink-dark" },
  { name: "Pratos Principais", icon: ChefHat, color: "text-baby-blue-dark" },
  { name: "Lanches", icon: Apple, color: "text-coral" },
  { name: "Bebidas", icon: Leaf, color: "text-green-600" },
  { name: "Saladas", icon: Leaf, color: "text-green-500" },
];

export default function Recipes() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");

  const filteredRecipes = selectedCategory === "Todos" 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Café da Manhã": return "bg-baby-pink text-baby-pink-dark";
      case "Pratos Principais": return "bg-baby-blue text-baby-blue-dark";
      case "Lanches": return "bg-coral/20 text-coral";
      case "Bebidas": return "bg-green-100 text-green-600";
      case "Saladas": return "bg-green-50 text-green-500";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-baby-pink via-cream to-baby-blue pb-20">
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
            Receitas Saudáveis
          </h2>
          <div className="w-10" />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  className={`flex-shrink-0 ${
                    selectedCategory === category.name
                      ? "bg-baby-pink-dark text-white"
                      : "text-charcoal"
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                  data-testid={`button-category-${category.name.toLowerCase().replace(' ', '-')}`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Recipes */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="shadow-lg" data-testid={`recipe-${recipe.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-charcoal mb-2">
                      {recipe.title}
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-sm mb-3">
                      <Badge className={getCategoryColor(recipe.category)}>
                        {recipe.category}
                      </Badge>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {recipe.prepTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-3 w-3 mr-1" />
                        {recipe.servings} porções
                      </div>
                      <span className="text-baby-pink-dark font-medium">
                        {recipe.trimester} trimestre(s)
                      </span>
                    </div>
                    
                    {/* Nutrients */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.nutrients.map((nutrient, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          data-testid={`nutrient-${recipe.id}-${index}`}
                        >
                          {nutrient}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div className="bg-baby-pink/10 p-3 rounded-lg">
                  <h4 className="font-semibold text-baby-pink-dark mb-1 text-sm">
                    Benefícios na Gravidez
                  </h4>
                  <p className="text-sm text-gray-700" data-testid={`benefits-${recipe.id}`}>
                    {recipe.benefits}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-2 text-sm">Ingredientes</h4>
                  <div className="space-y-1">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2"
                        data-testid={`ingredient-${recipe.id}-${index}`}
                      >
                        <div className="w-1.5 h-1.5 bg-baby-pink-dark rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-2 text-sm">Modo de Preparo</h4>
                  <div className="space-y-2">
                    {recipe.instructions.map((instruction, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2"
                        data-testid={`instruction-${recipe.id}-${index}`}
                      >
                        <span className="text-baby-blue-dark font-bold text-sm mt-0.5 flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Nenhuma receita encontrada
              </h3>
              <p className="text-gray-600">
                Não há receitas disponíveis para esta categoria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
