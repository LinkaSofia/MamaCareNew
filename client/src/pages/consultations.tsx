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
  const [formData, setFormData] = useState({
    title: "",
    date: "",
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
      date: "",
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

  const addConsultationMutation = useMutation({
    mutationFn: async (consultation: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
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
          title: formData.title,
          date: dateTime.toISOString(),
          location: formData.location || null,
          doctorName: formData.doctorName || null,
          notes: formData.notes || null,
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 pt-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Consultas</h1>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>

        {/* Upcoming Consultations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-500" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.map((consultation) => (
                <div key={consultation.id} className="p-4 bg-gray-50 rounded-lg border">
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
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta consulta?')) {
                            deleteConsultationMutation.mutate(consultation.id);
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhuma consulta agendada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add consultation modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-gray-800">
                {editingId ? 'Editar Consulta' : 'Nova Consulta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-medium">
                    Título da consulta *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Consulta pré-natal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-700 font-medium">
                      Data *
                    </Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-gray-700 font-medium">
                      Horário *
                    </Label>
                    <Input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="doctorName" className="text-gray-700 font-medium">
                    Nome do médico
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Ex: Dr. Silva"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 font-medium">
                    Local da consulta
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Hospital São Paulo"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-700 font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre a consulta..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1"
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

      <BottomNavigation />
    </div>
  );
}