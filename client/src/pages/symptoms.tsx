import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Activity, Calendar, AlertCircle, Trash2, TrendingUp } from "lucide-react";

const commonSymptoms = [
  "Náusea",
  "Vômito", 
  "Azia",
  "Dor nas costas",
  "Dor de cabeça",
  "Fadiga",
  "Inchaço",
  "Constipação",
  "Tontura",
  "Insônia",
  "Dor pélvica",
  "Cãibras",
  "Falta de ar",
  "Emoções intensas",
  "Outros"
];

const severityLevels = [
  { value: 1, label: "Muito Leve", color: "text-green-600", bg: "bg-green-100" },
  { value: 2, label: "Leve", color: "text-green-500", bg: "bg-green-50" },
  { value: 3, label: "Moderado", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: 4, label: "Forte", color: "text-orange-600", bg: "bg-orange-100" },
  { value: 5, label: "Muito Forte", color: "text-red-600", bg: "bg-red-100" },
];

export default function Symptoms() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    severity: "",
    notes: "",
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: symptomsData, isLoading } = useQuery({
    queryKey: ["/api/symptoms", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addSymptomMutation = useMutation({
    mutationFn: async (symptom: any) => {
      const response = await apiRequest("POST", "/api/symptoms", symptom);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({ name: "", severity: "", notes: "" });
      toast({
        title: "Sintoma registrado!",
        description: "Seu sintoma foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar sintoma. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteSymptomMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/symptoms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms", pregnancy?.id] });
      toast({
        title: "Sintoma removido",
        description: "Sintoma foi removido do registro.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.severity) {
      toast({
        title: "Erro",
        description: "Nome do sintoma e intensidade são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    addSymptomMutation.mutate({
      pregnancyId: pregnancy!.id,
      name: formData.name.trim(),
      severity: parseInt(formData.severity),
      notes: formData.notes.trim() || null,
      date: new Date().toISOString(),
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

  const symptoms = symptomsData?.symptoms || [];
  const recentSymptoms = symptoms.slice(0, 10);

  // Group symptoms by name for frequency analysis
  const symptomFrequency = symptoms.reduce((acc: any, symptom: any) => {
    if (!acc[symptom.name]) {
      acc[symptom.name] = [];
    }
    acc[symptom.name].push(symptom);
    return acc;
  }, {});

  const mostFrequentSymptoms = Object.entries(symptomFrequency)
    .map(([name, occurrences]: [string, any]) => ({
      name,
      count: occurrences.length,
      avgSeverity: occurrences.reduce((sum: number, s: any) => sum + s.severity, 0) / occurrences.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const getSeverityInfo = (severity: number) => {
    return severityLevels.find(level => level.value === severity) || severityLevels[0];
  };

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
            Sintomas
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-symptom"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Most Frequent Symptoms */}
        {mostFrequentSymptoms.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <TrendingUp className="mr-2 h-5 w-5 text-baby-pink-dark" />
                Sintomas Mais Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostFrequentSymptoms.map((symptom, index) => {
                  const severityInfo = getSeverityInfo(Math.round(symptom.avgSeverity));
                  return (
                    <div 
                      key={symptom.name} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      data-testid={`frequent-symptom-${index}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-charcoal">{symptom.name}</div>
                        <div className="text-sm text-gray-600">
                          {symptom.count} ocorrências
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${severityInfo.bg} ${severityInfo.color}`}>
                        Média: {severityInfo.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Symptoms */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Activity className="mr-2 h-5 w-5 text-baby-blue-dark" />
              Registro de Sintomas ({symptoms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {symptoms.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">Nenhum sintoma registrado</h3>
                <p className="text-gray-600 mb-4">Comece a acompanhar seus sintomas</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                  data-testid="button-add-first-symptom"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar primeiro sintoma
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSymptoms.map((symptom: any) => {
                  const severityInfo = getSeverityInfo(symptom.severity);
                  return (
                    <div 
                      key={symptom.id} 
                      className="flex items-start justify-between p-4 bg-white rounded-lg border"
                      data-testid={`symptom-${symptom.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-charcoal">{symptom.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${severityInfo.bg} ${severityInfo.color}`}>
                            {severityInfo.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(symptom.date).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(symptom.date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        
                        {symptom.notes && (
                          <p className="text-sm text-gray-700 italic" data-testid={`symptom-notes-${symptom.id}`}>
                            {symptom.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSymptomMutation.mutate(symptom.id)}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${symptom.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add symptom modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-charcoal">Registrar Sintoma</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-symptom">
                <div>
                  <Label htmlFor="name" className="text-charcoal font-medium">
                    Sintoma *
                  </Label>
                  <Select 
                    value={formData.name} 
                    onValueChange={(value) => setFormData({ ...formData, name: value })}
                  >
                    <SelectTrigger data-testid="select-symptom">
                      <SelectValue placeholder="Selecione um sintoma" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonSymptoms.map((symptom) => (
                        <SelectItem key={symptom} value={symptom}>
                          {symptom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.name === "Outros" && (
                    <Input
                      placeholder="Digite o sintoma"
                      className="mt-2"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-custom-symptom"
                    />
                  )}
                </div>
                
                <div>
                  <Label htmlFor="severity" className="text-charcoal font-medium">
                    Intensidade *
                  </Label>
                  <Select 
                    value={formData.severity} 
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger data-testid="select-severity">
                      <SelectValue placeholder="Qual a intensidade?" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${level.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} />
                            {level.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-charcoal font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Piorou após o almoço"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="textarea-notes"
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
                    disabled={addSymptomMutation.isPending}
                    data-testid="button-save"
                  >
                    {addSymptomMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Activity className="mr-2 h-4 w-4" />
                    )}
                    Registrar
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
