import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateDueDateFromLMP } from "@/lib/pregnancy-calculator";
import { Calendar, Baby, Heart } from "lucide-react";

export default function PregnancySetup() {
  const [setupType, setSetupType] = useState<"dueDate" | "lmp" | null>(null);
  const [date, setDate] = useState("");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createPregnancyMutation = useMutation({
    mutationFn: async (pregnancyData: any) => {
      const response = await apiRequest("POST", "/api/pregnancies", pregnancyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pregnancies/active"] });
      toast({
        title: "Sucesso!",
        description: "Sua gestação foi configurada com sucesso!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao configurar gestação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      });
      return;
    }

    let dueDate: string;
    let lmpDate: string | null = null;

    if (setupType === "dueDate") {
      dueDate = new Date(date).toISOString();
    } else {
      lmpDate = new Date(date).toISOString();
      dueDate = calculateDueDateFromLMP(date);
    }

    createPregnancyMutation.mutate({
      dueDate,
      lastMenstrualPeriod: lmpDate,
      isActive: true,
    });
  };

  if (!setupType) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Baby className="w-10 h-10 text-baby-pink-dark" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2" data-testid="text-setup-title">Configurar Gestação</h1>
          <p className="text-gray-600" data-testid="text-setup-subtitle">Como você gostaria de calcular sua gestação?</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Card 
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 glass-effect shadow-lg"
            onClick={() => setSetupType("dueDate")}
            data-testid="card-due-date"
          >
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-baby-pink-dark mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Data Prevista do Parto</h3>
              <p className="text-sm text-gray-600">Eu já sei a data prevista do meu bebê</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 glass-effect shadow-lg"
            onClick={() => setSetupType("lmp")}
            data-testid="card-lmp"
          >
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-baby-blue-dark mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Última Menstruação</h3>
              <p className="text-sm text-gray-600">Vou calcular baseado na DUM</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const maxDate = setupType === "dueDate" ? 
    new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
    today;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md glass-effect shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-charcoal flex items-center justify-center">
            <Baby className="mr-2 h-6 w-6 text-baby-pink-dark" />
            {setupType === "dueDate" ? "Data Prevista" : "Última Menstruação"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {setupType === "dueDate" 
              ? "Quando seu bebê deve nascer?" 
              : "Qual foi o primeiro dia da sua última menstruação?"
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-pregnancy-setup">
            <div>
              <Label className="text-charcoal font-medium mb-2 block">
                {setupType === "dueDate" ? "Data prevista do parto" : "Data da última menstruação"}
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={maxDate}
                min={setupType === "lmp" ? 
                  new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
                  today
                }
                className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                data-testid="input-date"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setSetupType(null)}
                className="flex-1"
                data-testid="button-back"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                disabled={createPregnancyMutation.isPending}
                data-testid="button-continue"
              >
                {createPregnancyMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
