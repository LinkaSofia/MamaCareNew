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
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Pill, Calendar, User, AlertTriangle, Trash2, Clock } from "lucide-react";

export default function Medications() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    prescribedBy: "",
    startDate: "",
    endDate: "",
    notes: "",
    isActive: true,
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: medicationsData, isLoading } = useQuery({
    queryKey: ["/api/medications", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (medication: any) => {
      const response = await apiRequest("POST", "/api/medications", medication);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "",
        prescribedBy: "",
        startDate: "",
        endDate: "",
        notes: "",
        isActive: true,
      });
      toast({
        title: "Medicação adicionada!",
        description: "Medicação foi registrada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar medicação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/medications/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", pregnancy?.id] });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/medications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", pregnancy?.id] });
      toast({
        title: "Medicação removida",
        description: "Medicação foi removida do registro.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da medicação é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const medicationData = {
      pregnancyId: pregnancy!.id,
      name: formData.name.trim(),
      dosage: formData.dosage.trim() || null,
      frequency: formData.frequency.trim() || null,
      prescribedBy: formData.prescribedBy.trim() || null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      notes: formData.notes.trim() || null,
      isActive: formData.isActive,
    };

    addMedicationMutation.mutate(medicationData);
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateMedicationMutation.mutate({ id, updates: { isActive } });
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

  const medications = medicationsData?.medications || [];
  const activeMedications = medications.filter((med: any) => med.isActive);
  const inactiveMedications = medications.filter((med: any) => !med.isActive);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            Medicações
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-medication"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Safety Warning */}
        <Card className="shadow-lg mb-6 border-l-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-700 mb-1">Importante</h4>
                <p className="text-sm text-red-600">
                  Sempre consulte seu médico antes de iniciar, alterar ou interromper qualquer medicação durante a gravidez.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Medications */}
        {activeMedications.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Pill className="mr-2 h-5 w-5 text-baby-pink-dark" />
                Medicações Ativas ({activeMedications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMedications.map((medication: any) => (
                  <div 
                    key={medication.id} 
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                    data-testid={`active-medication-${medication.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-charcoal mb-1">{medication.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {medication.dosage && (
                            <div className="flex items-center">
                              <Pill className="h-3 w-3 mr-1" />
                              {medication.dosage}
                            </div>
                          )}
                          {medication.frequency && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {medication.frequency}
                            </div>
                          )}
                          {medication.prescribedBy && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              Prescrito por: {medication.prescribedBy}
                            </div>
                          )}
                          {medication.startDate && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Início: {formatDate(medication.startDate)}
                              {medication.endDate && ` - Fim: ${formatDate(medication.endDate)}`}
                            </div>
                          )}
                        </div>
                        {medication.notes && (
                          <p className="text-sm text-gray-700 mt-2 italic">
                            {medication.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={medication.isActive}
                          onCheckedChange={(checked) => toggleActive(medication.id, checked)}
                          data-testid={`switch-active-${medication.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMedicationMutation.mutate(medication.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-delete-${medication.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inactive Medications */}
        {inactiveMedications.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Pill className="mr-2 h-5 w-5 text-gray-500" />
                Medicações Inativas ({inactiveMedications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inactiveMedications.map((medication: any) => (
                  <div 
                    key={medication.id} 
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    data-testid={`inactive-medication-${medication.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-600 mb-1">{medication.name}</h4>
                        <div className="space-y-1 text-sm text-gray-500">
                          {medication.dosage && (
                            <div className="flex items-center">
                              <Pill className="h-3 w-3 mr-1" />
                              {medication.dosage}
                            </div>
                          )}
                          {medication.startDate && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(medication.startDate)}
                              {medication.endDate && ` - ${formatDate(medication.endDate)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={medication.isActive}
                          onCheckedChange={(checked) => toggleActive(medication.id, checked)}
                          data-testid={`switch-inactive-${medication.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMedicationMutation.mutate(medication.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-delete-inactive-${medication.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {medications.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Pill className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Nenhuma medicação registrada</h3>
              <p className="text-gray-600 mb-4">Mantenha um registro das suas medicações</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-add-first-medication"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar primeira medicação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add medication modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-charcoal">Nova Medicação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-medication">
                <div>
                  <Label htmlFor="name" className="text-charcoal font-medium">
                    Nome da medicação *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Ácido fólico"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dosage" className="text-charcoal font-medium">
                      Dosagem
                    </Label>
                    <Input
                      id="dosage"
                      placeholder="Ex: 5mg"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-dosage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency" className="text-charcoal font-medium">
                      Frequência
                    </Label>
                    <Input
                      id="frequency"
                      placeholder="Ex: 1x ao dia"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-frequency"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="prescribedBy" className="text-charcoal font-medium">
                    Prescrito por
                  </Label>
                  <Input
                    id="prescribedBy"
                    placeholder="Ex: Dr. João Silva"
                    value={formData.prescribedBy}
                    onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-prescribed-by"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate" className="text-charcoal font-medium">
                      Data de início
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-start-date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endDate" className="text-charcoal font-medium">
                      Data de fim
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-charcoal font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Tomar com o estômago vazio"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="textarea-notes"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    data-testid="switch-is-active"
                  />
                  <Label htmlFor="isActive" className="text-charcoal font-medium">
                    Medicação ativa
                  </Label>
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
                    disabled={addMedicationMutation.isPending}
                    data-testid="button-save"
                  >
                    {addMedicationMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Pill className="mr-2 h-4 w-4" />
                    )}
                    Adicionar
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
