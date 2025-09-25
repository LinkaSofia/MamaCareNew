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
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WeightChart from "@/components/weight-chart";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Scale, Plus, TrendingUp, Edit, Trash2, X } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

// Função utilitária para garantir o formato YYYY-MM-DD
function formatDateToISO(dateStr: string) {
  // Se já estiver no formato correto, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Se vier em formato DD/MM/YYYY, converte
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
  // Tenta converter qualquer outro formato usando Date
  return new Date(dateStr).toISOString().slice(0, 10);
}

export default function WeightTracking() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: weightData, isLoading, refetch } = useQuery({
    queryKey: ["/api/weight-entries"],
    enabled: !!pregnancy,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const addWeightMutation = useMutation({
    mutationFn: async (weightEntry: any) => {
      const response = await apiRequest("POST", "/api/weight-entries", weightEntry);
      return response.json();
    },
    onSuccess: async () => {
      console.log("⚖️ Weight entry saved successfully, updating UI...");
      
      // Fechar o formulário primeiro
      setShowAddForm(false);
      setWeight("");
      setDate(new Date().toISOString().split('T')[0]);
      setNotes("");
      
      // Invalidar e refetch imediatamente
      console.log("⚖️ Invalidating queries and refetching...");
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/weight-entries"],
        exact: false 
      });
      
      // Forçar refetch imediatamente
      try {
        console.log("⚖️ Forcing immediate refetch...");
        const refetchResult = await refetch();
        console.log("⚖️ Refetch completed successfully");
        console.log("⚖️ Refetch result:", refetchResult);
        console.log("⚖️ New weight entries count:", refetchResult.data?.length);
      } catch (error) {
        console.error("⚖️ Error during refetch:", error);
      }
      
      toast({
        title: "⚖️ Peso registrado!",
        description: "Seu peso foi adicionado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao registrar peso:", error);
      toast({
        title: "Erro ao Registrar peso",
        description: `Erro: ${error?.message || "Erro desconhecido"}. Verifique os dados e tente novamente.`,
        variant: "destructive",
      });
    },
  });

  const updateWeightMutation = useMutation({
    mutationFn: async ({ id, weightEntry }: { id: string; weightEntry: any }) => {
      const response = await apiRequest("PUT", `/api/weight-entries/${id}`, weightEntry);
      return response.json();
    },
    onSuccess: async () => {
      console.log("⚖️ Weight entry updated successfully, updating UI...");
      
      // Fechar o formulário de edição
      setShowEditForm(false);
      setEditingRecord(null);
      setWeight("");
      setDate(new Date().toISOString().split('T')[0]);
      setNotes("");
      
      // Invalidar e refetch imediatamente
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/weight-entries"],
        exact: false 
      });
      
      try {
        await refetch();
      } catch (error) {
        console.error("⚖️ Error during refetch:", error);
      }
      
      toast({
        title: "⚖️ Peso atualizado!",
        description: "Seu peso foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar peso:", error);
      toast({
        title: "Erro ao Atualizar peso",
        description: `Erro: ${error?.message || "Erro desconhecido"}. Verifique os dados e tente novamente.`,
        variant: "destructive",
      });
    },
  });

  const deleteWeightMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/weight-entries/${id}`);
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("⚖️ Weight entry deleted successfully, updating UI...");
      
      // Atualizar o cache diretamente primeiro (mudança instantânea)
      try {
        queryClient.setQueryData<any>(["/api/weight-entries"], (oldData) => {
          if (!oldData) return oldData;
          
          const filteredEntries = oldData.entries.filter((entry: any) => entry.id !== data.id);
          
          return {
            ...oldData,
            entries: filteredEntries
          };
        });
      } catch (error) {
        console.error("⚖️ Error updating cache after delete:", error);
      }
      
      // Invalidar e refetch em background para sincronizar
      queryClient.invalidateQueries({ 
        queryKey: ["/api/weight-entries"],
        exact: false 
      });
      
      try {
        await refetch();
      } catch (error) {
        console.error("⚖️ Error in background refetch after delete:", error);
      }
      
      toast({
        title: "🗑️ Peso removido",
        description: "Entrada de peso foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao excluir peso:", error);
      toast({
        title: "Erro ao Excluir peso",
        description: `Erro: ${error?.message || "Erro desconhecido"}. Tente novamente.`,
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
    const formattedDate = formatDateToISO(date);

    addWeightMutation.mutate({
      weight: parseFloat(weight),
      date: formattedDate,
      notes: notes.trim() || undefined,
      user_id: user?.id,
      pregnancy_id: pregnancy?.id,
    });
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setWeight(record.weight.toString());
    setDate(formatDateToISO(record.date));
    setNotes(record.notes || "");
    setShowEditForm(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || parseFloat(weight) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um peso válido",
        variant: "destructive",
      });
      return;
    }
    const formattedDate = formatDateToISO(date);

    updateWeightMutation.mutate({
      id: editingRecord.id,
      weightEntry: {
        weight: parseFloat(weight),
        date: formattedDate,
        notes: notes.trim() || undefined,
      },
    });
  };

  const handleDelete = (record: any) => {
    setEntryToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      deleteWeightMutation.mutate(entryToDelete.id);
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingRecord(null);
    setWeight("");
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
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

  const entries = (weightData as any)?.entries || [];
  const records = entries;
  
  // Ordenar entradas por data para garantir ordem correta
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const latestWeight = entries.length > 0 ? entries[0] : null; // Mais recente (primeiro da lista)
  const firstWeight = sortedEntries.length > 0 ? sortedEntries[0] : null; // Mais antigo (primeiro cronologicamente)
  
  // Debug logs
  console.log("🔍 Weight calculation debug:");
  console.log("📊 Entries:", entries);
  console.log("📊 Sorted entries:", sortedEntries);
  console.log("📊 Latest weight:", latestWeight);
  console.log("📊 First weight:", firstWeight);
  console.log("📊 Latest weight value:", latestWeight?.weight);
  console.log("📊 First weight value:", firstWeight?.weight);
  console.log("📊 Latest weight date:", latestWeight?.date);
  console.log("📊 First weight date:", firstWeight?.date);
  
  // Cálculo melhorado do ganho de peso
  let weightGain = 0;
  if (latestWeight && firstWeight && latestWeight.weight && firstWeight.weight) {
    const latest = parseFloat(String(latestWeight.weight));
    const first = parseFloat(String(firstWeight.weight));
    
    console.log("📊 Parsed latest:", latest);
    console.log("📊 Parsed first:", first);
    
    if (!isNaN(latest) && !isNaN(first)) {
      weightGain = latest - first;
      console.log("📊 Calculated weight gain:", weightGain);
    } else {
      console.log("❌ Invalid weight values - latest:", latest, "first:", first);
    }
  } else {
    console.log("❌ Missing weight data - latest:", !!latestWeight, "first:", !!firstWeight);
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-20">
      <div className="p-4 pt-12">
        {/* Header com Botão de Voltar e Título */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h2 className="text-2xl font-bold text-baby-pink-dark" data-testid="text-page-title">
            Controle de Peso
          </h2>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-weight"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Peso Atual Card */}
        <Card className="glass-effect shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Peso Atual</span>
            </div>
            <div className="text-2xl font-bold text-pink-600" data-testid="text-current-weight">
              {latestWeight ? `${latestWeight.weight} kg` : "Não registrado"}
            </div>
          </CardContent>
        </Card>

        {/* Ganho de Peso e Meta de Peso Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Ganho de Peso Card */}
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Ganho de Peso</span>
              </div>
              <div className="text-2xl font-bold text-green-600" data-testid="text-weight-gain">
                {!isNaN(weightGain) && weightGain !== 0 ? 
                  `${weightGain > 0 ? '+' : ''}${weightGain.toFixed(1)} kg` : 
                  entries.length < 2 ? "N/A" : "0.0 kg"
                }
              </div>
              <div className="text-xs text-green-700 mt-1">
                desde o início
              </div>
            </CardContent>
          </Card>

          {/* Meta de Peso Card */}
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Meta de Peso</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Meta total: </span>
                  <span className="font-semibold text-blue-600">12-18 kg</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Restante</div>
                  <div className="font-semibold text-blue-600">
                    {weightGain < 12 ? 
                      `${(12 - weightGain).toFixed(1)}-${(18 - weightGain).toFixed(1)} kg` : 
                      'Meta atingida'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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


        {/* Recent records */}
        {records.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-charcoal">Registros Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {records.slice(0, 5).map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium" data-testid={`text-record-weight-${record.id}`}>
                        {record.weight} kg
                      </div>
                      <div className="text-sm text-gray-500" data-testid={`text-record-date-${record.id}`}>
                        📅 {new Date(record.date).toLocaleDateString('pt-BR')}
                      </div>
                      {record.createdAt && (
                        <div className="text-xs text-gray-400" data-testid={`text-record-created-${record.id}`}>
                          🕒 Registrado: {new Date(record.createdAt).toLocaleDateString('pt-BR')} às {new Date(record.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {record.notes && (
                        <div className="text-sm text-gray-600 mt-1" data-testid={`text-record-notes-${record.id}`}>
                          {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                        data-testid={`button-edit-${record.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                        data-testid={`button-delete-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                  <Label htmlFor="date" className="text-charcoal font-medium">
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-date"
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

      {/* Edit weight modal */}
      {showEditForm && editingRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-charcoal">Editar Peso</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseForm}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4" data-testid="form-edit-weight">
                <div>
                  <Label htmlFor="edit-weight" className="text-charcoal font-medium">
                    Peso (kg)
                  </Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 65.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-edit-weight"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-date" className="text-charcoal font-medium">
                    Data
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-edit-date"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-notes" className="text-charcoal font-medium">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Ex: Após o almoço"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-edit-notes"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                    className="flex-1"
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={updateWeightMutation.isPending}
                    data-testid="button-update"
                  >
                    {updateWeightMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Edit className="mr-2 h-4 w-4" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && entryToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              {/* Ícone de aviso */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Confirmar Exclusão
              </h3>
              
              {/* Mensagem */}
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir esta entrada de peso?
              </p>
              
              {/* Detalhes da entrada */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-lg font-semibold text-gray-800">
                  {entryToDelete.weight} kg
                </div>
                <div className="text-sm text-gray-600">
                  📅 {new Date(entryToDelete.date).toLocaleDateString('pt-BR')}
                </div>
                {entryToDelete.notes && (
                  <div className="text-sm text-gray-500 mt-1">
                    {entryToDelete.notes}
                  </div>
                )}
              </div>
              
              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1"
                  data-testid="button-cancel-delete"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteWeightMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteWeightMutation.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}
