import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Play, Clock, Target, AlertTriangle, Heart } from "lucide-react";

const exercises = [
  {
    id: 1,
    title: "Caminhada Leve",
    duration: "20-30 min",
    trimester: "Todos",
    difficulty: "Fácil",
    benefits: ["Melhora circulação", "Fortalece coração", "Reduz inchaço"],
    instructions: [
      "Use calçados confortáveis",
      "Mantenha ritmo moderado",
      "Hidrate-se bem",
      "Pare se sentir desconforto"
    ],
    precautions: "Evite terrenos irregulares e clima muito quente"
  },
  {
    id: 2,
    title: "Exercícios de Respiração",
    duration: "10-15 min",
    trimester: "Todos",
    difficulty: "Fácil",
    benefits: ["Reduz ansiedade", "Melhora oxigenação", "Prepara para o parto"],
    instructions: [
      "Sente-se confortavelmente",
      "Inspire pelo nariz (4 segundos)",
      "Expire pela boca (6 segundos)",
      "Repita 10 vezes"
    ],
    precautions: "Pare se sentir tontura"
  },
  {
    id: 3,
    title: "Alongamento Suave",
    duration: "15-20 min",
    trimester: "Todos",
    difficulty: "Fácil",
    benefits: ["Alivia tensões", "Melhora flexibilidade", "Reduz dores nas costas"],
    instructions: [
      "Movimentos lentos e controlados",
      "Segure cada posição por 30 segundos",
      "Respire profundamente",
      "Não force os movimentos"
    ],
    precautions: "Evite alongamentos excessivos"
  },
  {
    id: 4,
    title: "Exercícios de Kegel",
    duration: "5-10 min",
    trimester: "Todos",
    difficulty: "Fácil",
    benefits: ["Fortalece assoalho pélvico", "Previne incontinência", "Facilita parto"],
    instructions: [
      "Contraia músculos do assoalho pélvico",
      "Mantenha por 5 segundos",
      "Relaxe por 5 segundos",
      "Repita 10-15 vezes"
    ],
    precautions: "Não contraia abdômen ou glúteos"
  },
  {
    id: 5,
    title: "Yoga Pré-natal",
    duration: "30-45 min",
    trimester: "2º e 3º",
    difficulty: "Moderado",
    benefits: ["Reduz estresse", "Melhora postura", "Aumenta flexibilidade"],
    instructions: [
      "Use acessórios de apoio",
      "Evite posições invertidas",
      "Mantenha respiração constante",
      "Ouça seu corpo"
    ],
    precautions: "Procure instrutor especializado em gestantes"
  },
  {
    id: 6,
    title: "Natação",
    duration: "20-30 min",
    trimester: "Todos",
    difficulty: "Moderado",
    benefits: ["Exercício completo", "Reduz peso corporal", "Alivia dores articulares"],
    instructions: [
      "Mantenha ritmo confortável",
      "Evite mergulhos",
      "Use piscina aquecida",
      "Hidrate-se mesmo na água"
    ],
    precautions: "Evite piscinas com muita gente e cloro excessivo"
  }
];

const generalTips = [
  "Sempre consulte seu médico antes de iniciar exercícios",
  "Pare imediatamente se sentir dor, tontura ou falta de ar",
  "Mantenha-se hidratada durante os exercícios",
  "Use roupas confortáveis e calçados adequados",
  "Evite exercícios em posição supina após o 1º trimestre",
  "Ouça sempre os sinais do seu corpo"
];

export default function Exercises() {
  const [, setLocation] = useLocation();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "text-green-600 bg-green-100";
      case "Moderado": return "text-yellow-600 bg-yellow-100";
      case "Difícil": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
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
            Exercícios
          </h2>
          <div className="w-10" />
        </div>

        {/* Safety Tips */}
        <Card className="shadow-lg mb-6 border-l-4 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Dicas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generalTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2" data-testid={`tip-${index}`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="shadow-lg" data-testid={`exercise-${exercise.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-charcoal mb-2">
                      {exercise.title}
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {exercise.duration}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                      <span className="text-baby-pink-dark font-medium">
                        {exercise.trimester} trimestre(s)
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-baby-pink-dark hover:text-baby-pink-dark"
                    data-testid={`button-start-${exercise.id}`}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-baby-pink-dark" />
                    Benefícios
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.benefits.map((benefit, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-baby-pink/20 text-baby-pink-dark text-xs rounded-full"
                        data-testid={`benefit-${exercise.id}-${index}`}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold text-charcoal mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1 text-baby-blue-dark" />
                    Como fazer
                  </h4>
                  <div className="space-y-1">
                    {exercise.instructions.map((instruction, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2"
                        data-testid={`instruction-${exercise.id}-${index}`}
                      >
                        <span className="text-baby-blue-dark font-bold text-sm mt-0.5">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-700">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Precauções
                  </h4>
                  <p className="text-sm text-yellow-700" data-testid={`precaution-${exercise.id}`}>
                    {exercise.precautions}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
