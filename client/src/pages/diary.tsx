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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Book, Edit, Trash2, Calendar, Smile, Meh, Frown } from "lucide-react";

export default function Diary() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "",
    week: "",
  });

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["/api/diary-entries", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: any) => {
      const response = await apiRequest("POST", "/api/diary-entries", entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      handleCloseForm();
      toast({
        title: "Entrada salva!",
        description: "Sua entrada do diário foi salva com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar entrada. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: any }) => {
      const response = await apiRequest("PUT", `/api/diary-entries/${id}`, entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      handleCloseForm();
      toast({
        title: "Entrada atualizada!",
        description: "Sua entrada foi atualizada com sucesso.",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/diary-entries/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries", pregnancy?.id] });
      toast({
        title: "Entrada removida",
        description: "Entrada foi removida do diário.",
      });
    },
  });

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingEntry(null);
    setFormData({ title: "", content: "", mood: "", week: "" });
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || "",
      content: entry.content || "",
      mood: entry.mood || "",
      week: entry.week?.toString() || "",
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da entrada é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      pregnancyId: pregnancy!.id,
      title: formData.title.trim() || null,
      content: formData.content.trim(),
      mood: formData.mood || null,
      week: formData.week ? parseInt(formData.week) : null,
      date: new Date().toISOString(),
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, entry: entryData });
    } else {
      addEntryMutation.mutate(entryData);
    }
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

  const entries = entriesData?.entries || [];
  const moods = [
    { value: "feliz", label: "Feliz", icon: Smile, color: "text-green-600" },
    { value: "neutro", label: "Neutro", icon: Meh, color: "text-yellow-600" },
    { value: "triste", label: "Triste", icon: Frown, color: "text-red-600" },
  ];

  const weekOptions = Array.from({ length: 40 }, (_, i) => i + 1);

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
            Diário da Gestação
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowAddForm(true)}
            data-testid="button-add-entry"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {entries.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <Book className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Diário vazio</h3>
              <p className="text-gray-600 mb-4">Comece a documentar seus sentimentos e experiências</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-add-first-entry"
              >
                <Book className="mr-2 h-4 w-4" />
                Primeira entrada
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry: any) => {
              const mood = moods.find(m => m.value === entry.mood);
              const MoodIcon = mood?.icon;
              
              return (
                <Card key={entry.id} className="shadow-lg" data-testid={`entry-${entry.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-charcoal mb-1">
                          {entry.title || "Entrada do diário"}
                        </CardTitle>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </div>
                          {entry.week && (
                            <span>{entry.week}ª semana</span>
                          )}
                          {mood && MoodIcon && (
                            <div className={`flex items-center ${mood.color}`}>
                              <MoodIcon className="h-3 w-3 mr-1" />
                              {mood.label}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="text-baby-pink-dark hover:text-baby-pink-dark"
                          data-testid={`button-edit-${entry.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntryMutation.mutate(entry.id)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-delete-${entry.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 whitespace-pre-wrap" data-testid={`text-content-${entry.id}`}>
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit entry modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-charcoal">
                {editingEntry ? "Editar Entrada" : "Nova Entrada"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-diary-entry">
                <div>
                  <Label htmlFor="title" className="text-charcoal font-medium">
                    Título (opcional)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Como me sinto hoje"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-charcoal font-medium">
                    Conteúdo *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva seus sentimentos, experiências ou reflexões..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="h-32 resize-none focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="textarea-content"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="mood" className="text-charcoal font-medium">
                      Humor
                    </Label>
                    <Select 
                      value={formData.mood} 
                      onValueChange={(value) => setFormData({ ...formData, mood: value })}
                    >
                      <SelectTrigger data-testid="select-mood">
                        <SelectValue placeholder="Como se sente?" />
                      </SelectTrigger>
                      <SelectContent>
                        {moods.map((mood) => {
                          const Icon = mood.icon;
                          return (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex items-center">
                                <Icon className={`h-4 w-4 mr-2 ${mood.color}`} />
                                {mood.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="week" className="text-charcoal font-medium">
                      Semana
                    </Label>
                    <Select 
                      value={formData.week} 
                      onValueChange={(value) => setFormData({ ...formData, week: value })}
                    >
                      <SelectTrigger data-testid="select-week">
                        <SelectValue placeholder="Semana atual" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekOptions.map((week) => (
                          <SelectItem key={week} value={week.toString()}>
                            {week}ª semana
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCloseForm}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={addEntryMutation.isPending || updateEntryMutation.isPending}
                    data-testid="button-save"
                  >
                    {(addEntryMutation.isPending || updateEntryMutation.isPending) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Book className="mr-2 h-4 w-4" />
                    )}
                    {editingEntry ? "Atualizar" : "Salvar"}
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
