import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { ArrowLeft, Calendar, Plus, Clock, MapPin, User, CheckCircle, AlertCircle } from "lucide-react";

export default function Consultations() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    doctorName: "",
    notes: "",
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: consultationsData, isLoading } = useQuery({
    queryKey: ["/api/consultations", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addConsultationMutation = useMutation({
    mutationFn: async (consultation: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
      setShowAddForm(false);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        doctorName: "",
        notes: "",
      });
      toast({
        title: "Consulta agendada!",
        description: "Sua consulta foi adicionada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao agendar consulta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const toggleCompletedMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const response = await apiRequest("PUT", `/api/consultations/${id}`, { completed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations", pregnancy?.id] });
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
    
    addConsultationMutation.mutate({
      pregnancyId: pregnancy!.id,
      title: formData.title,
      date: dateTime.toISOString(),
      location: formData.location || null,
      doctorName: formData.doctorName || null,
      notes: formData.notes || null,
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

  const consultations = consultationsData?.consultations || [];
  const upcoming = consultationsData?.upcoming || [];

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
            Consultas
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-consultation"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Upcoming consultations */}
        {upcoming.length > 0 && (
          <Card className="shadow-lg mb-6 border-l-4 border-baby-pink-dark">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <AlertCircle className="mr-2 h-5 w-5 text-baby-pink-dark" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcoming.map((consultation) => (
                  <div 
                    key={consultation.id} 
                    className="p-4 bg-baby-pink/10 rounded-lg border border-baby-pink"
                    data-testid={`upcoming-consultation-${consultation.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-charcoal mb-1">
                          {consultation.title}
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(consultation.date).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(consultation.date).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All consultations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-charcoal">
              <Calendar className="mr-2 h-5 w-5 text-baby-blue-dark" />
              Todas as Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddForm(true)}
                  data-testid="button-add-first-consultation"
                >
                  Agendar primeira consulta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div 
                    key={consultation.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      consultation.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                    data-testid={`consultation-${consultation.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold ${
                            consultation.completed ? 'text-green-700 line-through' : 'text-charcoal'
                          }`}>
                            {consultation.title}
                          </h4>
                          {consultation.completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(consultation.date).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(consultation.date).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
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
                        
                        {consultation.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {consultation.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCompletedMutation.mutate({
                          id: consultation.id,
                          completed: !consultation.completed
                        })}
                        className="text-baby-pink-dark hover:text-baby-pink-dark"
                        data-testid={`button-toggle-completed-${consultation.id}`}
                      >
                        {consultation.completed ? 'Reabrir' : 'Concluir'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add consultation modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-charcoal">Nova Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-consultation">
                <div>
                  <Label htmlFor="title" className="text-charcoal font-medium">
                    Título da consulta *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Consulta pré-natal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date" className="text-charcoal font-medium">
                      Data *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-date"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time" className="text-charcoal font-medium">
                      Horário *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                      data-testid="input-time"
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
                    placeholder="Ex: Dr. João Silva"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-doctor-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-charcoal font-medium">
                    Local
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Hospital São João"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes" className="text-charcoal font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Levar exames anteriores"
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
                    disabled={addConsultationMutation.isPending}
                    data-testid="button-save"
                  >
                    {addConsultationMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Calendar className="mr-2 h-4 w-4" />
                    )}
                    Agendar
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
