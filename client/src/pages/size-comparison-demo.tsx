import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import WeeklySizeComparison from "@/components/WeeklySizeComparison";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function SizeComparisonDemo() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen gradient-bg relative p-4">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Comparação de Tamanho por Semana
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Veja como seu bebê cresce comparado a objetos do dia a dia
          </p>
        </div>
      </div>

      {/* Componente de demonstração */}
      <div className="max-w-2xl mx-auto relative z-10">
        <WeeklySizeComparison />
      </div>
    </div>
  );
}









