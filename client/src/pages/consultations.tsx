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
import BottomNavigation from "@/components/layout/bottom-navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  User,
  Edit,
  Trash2
} from "lucide-react";
import { format, parseISO } from 'date-fns';

type ConsultationType = 'prenatal' | 'ultrasound' | 'exam' | 'specialist' | 'emergency';

interface Consultation {
  id: string;
  title: string;
  date: string;
  location?: string;
  doctorName?: string;
  notes?: string;
  completed: boolean;
  type: ConsultationType;
  priority: 'low' | 'medium' | 'high';
  reminders: boolean;
  preparation?: string[];
}

interface ConsultationsData {
  consultations: Consultation[];
  upcoming: Consultation[];
}

export default function Consultations() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<Consultation | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0], // Data atual como padrão
    time: "",
    location: "",
    doctorName: "",
    notes: "",
    type: 'prenatal' as ConsultationType,
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminders: true,
    preparation: [] as string[]
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: consultationsData, isLoading } = useQuery<ConsultationsData>({
    queryKey: ["/api/consultations", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const consultations = consultationsData?.consultations || [];
  const upcoming = consultationsData?.upcoming || [];

  const resetForm = () => {
    setFormData({
      title: "",
      date: new Date().toISOString().split('T')[0], // Data atual como padrão
      time: "",
      location: "",
      doctorName: "",
      notes: "",
      type: 'prenatal',
      priority: 'medium',
      reminders: true,
      preparation: []
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDeleteClick = (consultation: Consultation) => {
    setConsultationToDelete(consultation);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (consultationToDelete) {
      deleteConsultationMutation.mutate(consultationToDelete.id);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setConsultationToDelete(null);
  };

  const addConsultationMutation = useMutation({
    mutationFn: async (consultation: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultation);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar e refetch imediatamente
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      queryClient.refetchQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      
      // Também invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      
      resetForm();
      toast({
        title: "✅ Consulta agendada!",
        description: "Sua consulta foi adicionada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao agendar consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateConsultationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await apiRequest("PUT", `/api/consultations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar e refetch imediatamente
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      queryClient.refetchQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      
      // Também invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      
      resetForm();
      toast({
        title: "✅ Consulta atualizada!",
        description: "Suas alterações foram salvas.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteConsultationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/consultations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidar e refetch imediatamente
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      queryClient.refetchQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      
      // Também invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      
      setShowDeleteModal(false);
      setConsultationToDelete(null);
      toast({
        title: "✅ Consulta removida!",
        description: "A consulta foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao excluir consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    
    if (editingId) {
      updateConsultationMutation.mutate({
        id: editingId,
        data: {
          pregnancyId: pregnancy!.id, // ADICIONADO: necessário para validação
          title: formData.title,
          date: dateTime.toISOString(),
          location: formData.location || null,
          doctorName: formData.doctorName || null,
          notes: formData.notes || null,
          type: formData.type,
          priority: formData.priority,
          reminders: formData.reminders,
          preparation: formData.preparation
        }
      });
    } else {
      addConsultationMutation.mutate({
        pregnancyId: pregnancy!.id,
        title: formData.title,
        date: dateTime.toISOString(),
        location: formData.location || null,
        doctorName: formData.doctorName || null,
        notes: formData.notes || null,
        type: formData.type,
        priority: formData.priority,
        reminders: formData.reminders,
        preparation: formData.preparation
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-24 sm:pb-20">
        <div className="container mx-auto px-4 pt-6 pb-24 sm:pb-20">
          {/* Botão de Voltar */}
          {/* Header com Botão de Voltar, Título Centralizado e Botão Add */}
          <div className="flex items-center justify-between mb-10 relative">
            {/* Botão Voltar - Esquerda */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Título - Centro */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Consultas
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">Agende e acompanhe</p>
            </div>
            
            {/* Botão Adicionar - Direita */}
            <Button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-5 w-5 text-white" />
            </Button>
          </div>

        {/* Upcoming Consultations */}
        <Card className="mb-6 bg-white rounded-2xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-gray-800">
              <Calendar className="mr-2 h-5 w-5 text-pink-500" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.map((consultation) => (
                <div key={consultation.id} className="p-4 bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{consultation.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mt-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(parseISO(consultation.date), "dd/MM/yyyy 'às' HH:mm")}
                        </div>
                        {consultation.doctorName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {consultation.doctorName}
                          </div>
                        )}
                        {consultation.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {consultation.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            title: consultation.title,
                            date: format(parseISO(consultation.date), 'yyyy-MM-dd'),
                            time: format(parseISO(consultation.date), 'HH:mm'),
                            location: consultation.location || "",
                            doctorName: consultation.doctorName || "",
                            notes: consultation.notes || "",
                            type: consultation.type,
                            priority: consultation.priority,
                            reminders: consultation.reminders,
                            preparation: consultation.preparation || []
                          });
                          setEditingId(consultation.id);
                          setShowAddForm(true);
                        }}
                        className="h-8 w-8 p-0 text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(consultation)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhuma consulta agendada</p>
                  <p className="text-gray-400 text-sm mt-2">Clique em "Nova" para adicionar uma consulta</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add consultation modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <Card className="w-full sm:max-w-lg h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <CardTitle className="text-2xl font-bold text-center">
                {editingId ? 'Editar Consulta' : 'Nova Consulta'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-charcoal font-medium">
                    Título da consulta *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Consulta pré-natal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-charcoal font-medium">
                      Data *
                    </Label>
                    <DatePicker
                      value={formData.date}
                      onChange={(value) => setFormData({ ...formData, date: value })}
                      placeholder="Selecione a data"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-charcoal font-medium">
                      Horário *
                    </Label>
                    <Input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1 border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="doctorName" className="text-charcoal font-medium">
                    Nome do médico
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Ex: Dr. Silva"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="mt-1 border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-charcoal font-medium">
                    Local da consulta
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Hospital São Paulo"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-charcoal font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a consulta..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
                    disabled={addConsultationMutation.isPending || updateConsultationMutation.isPending}
                  >
                    {(addConsultationMutation.isPending || updateConsultationMutation.isPending) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    {editingId ? 'Salvar' : 'Agendar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Excluir Consulta
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteConsultationMutation.isPending}
                >
                  {deleteConsultationMutation.isPending ? (
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