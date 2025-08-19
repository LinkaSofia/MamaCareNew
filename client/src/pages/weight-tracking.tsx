import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WeightChart from "@/components/weight-chart";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Scale, Plus, TrendingUp } from "lucide-react";

export default function WeightTracking() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: weightData, isLoading } = useQuery({
    queryKey: ["/api/weight-records", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addWeightMutation = useMutation({
    mutationFn: async (weightRecord: any) => {
      const response = await apiRequest("POST", "/api/weight-records", weightRecord);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight-records", pregnancy?.id] });
      setShowAddForm(false);
      setWeight("");
      setNotes("");
      toast({
        title: "Peso registrado!",
        description: "Seu peso foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar peso. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido",
        variant: "destructive",
      });
      return;
    }

    addWeightMutation.mutate({
      pregnancyId: pregnancy!.id,
      weight: parseFloat(weight),
      date: new Date().toISOString(),
      notes: notes.trim() || null,
    });
  };

  if (!user || !pregnancy) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const records = weightData?.records || [];
  const latestWeight = weightData?.latest;
  
  // Calculate weight gain from first record
  const firstWeight = records.length > 0 ? records[records.length - 1].weight : null;
  const weightGain = latestWeight && firstWeight ? 
    parseFloat(latestWeight.weight) - parseFloat(firstWeight.weight) : 0;

  return (
    <div className="min-h-screen bg-cream pb-20">
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
            Controle de Peso
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-weight"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Current weight display */}
        <Card className="glass-effect shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-charcoal mb-2">Peso Atual</h3>
              <div className="text-3xl font-bold text-baby-pink-dark" data-testid="text-current-weight">
                {latestWeight ? `${latestWeight.weight} kg` : "Não registrado"}
              </div>
              {weightGain !== 0 && (
                <div className="text-sm text-gray-600 mt-1" data-testid="text-weight-gain">
                  {weightGain > 0 ? '+' : ''}{weightGain.toFixed(1)} kg desde o início
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weight chart */}
        {records.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <TrendingUp className="mr-2 h-5 w-5" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeightChart records={records} />
            </CardContent>
          </Card>
        )}

        {/* Weight goal */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
              <Scale className="mr-2 h-5 w-5" />
              Meta de Peso
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Meta total: </span>
                <span className="font-semibold" data-testid="text-weight-goal">12-18 kg</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Restante</div>
                <div className="font-semibold text-baby-blue-dark" data-testid="text-weight-remaining">
                  {weightGain < 12 ? `${(12 - weightGain).toFixed(1)}-${(18 - weightGain).toFixed(1)} kg` : 'Meta atingida'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent records */}
        {records.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-charcoal">Registros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium" data-testid={`text-record-weight-${record.id}`}>
                        {record.weight} kg
                      </div>
                      <div className="text-sm text-gray-500" data-testid={`text-record-date-${record.id}`}>
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    {record.notes && (
                      <div className="text-sm text-gray-600 max-w-32 truncate" data-testid={`text-record-notes-${record.id}`}>
                        {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add weight modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-charcoal">Registrar Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-weight">
                <div>
                  <Label htmlFor="weight" className="text-charcoal font-medium">
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 65.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-weight"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-charcoal font-medium">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Após o almoço"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-notes"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={addWeightMutation.isPending}
                    data-testid="button-save"
                  >
                    {addWeightMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Scale className="mr-2 h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
