import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Download, Eye, Heart, MapPin, Users } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import BottomNavigation from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePregnancy } from '@/hooks/use-pregnancy';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

export default function BirthPlan() {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [formData, setFormData] = useState({
    location: '',
    painReliefNatural: false,
    painReliefEpidural: false,
    painReliefOther: '',
    companions: '',
    specialRequests: ''
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar plano de parto existente
  const { data: birthPlanData, isLoading } = useQuery({
    queryKey: ['/api/birth-plans', pregnancy?.id],
    queryFn: async () => {
      if (!pregnancy?.id) return null;
      const response = await apiRequest('GET', `/api/birth-plans/${pregnancy.id}`);
      return response.json();
    },
    enabled: !!pregnancy?.id,
  });

  const birthPlan = birthPlanData?.birthPlan;

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('POST', '/api/birth-plans', planData);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/birth-plans', pregnancy?.id] 
      });
      
      toast({
        title: '✅ Plano de parto criado!',
        description: 'Seu plano de parto foi salvo com sucesso.',
      });
      setViewMode('list');
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro',
        description: error.message || 'Erro ao salvar plano de parto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('PUT', `/api/birth-plans/${birthPlan.id}`, planData);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/birth-plans', pregnancy?.id] 
      });
      
      toast({
        title: '✅ Plano atualizado!',
        description: 'Seu plano de parto foi atualizado com sucesso.',
      });
      setViewMode('list');
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro',
        description: error.message || 'Erro ao atualizar plano de parto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/birth-plans/${id}`);
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ['/api/birth-plans', pregnancy?.id] 
      });
      
      toast({
        title: '🗑️ Plano excluído!',
        description: 'Seu plano de parto foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Erro',
        description: error.message || 'Erro ao excluir plano de parto. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      location: '',
      painReliefNatural: false,
      painReliefEpidural: false,
      painReliefOther: '',
      companions: '',
      specialRequests: ''
    });
  };

  const loadPlanToEdit = () => {
    if (birthPlan) {
      setFormData({
        location: birthPlan.location || '',
        painReliefNatural: birthPlan.painRelief?.natural || false,
        painReliefEpidural: birthPlan.painRelief?.epidural || false,
        painReliefOther: birthPlan.painRelief?.other || '',
        companions: birthPlan.companions || '',
        specialRequests: birthPlan.specialRequests || ''
      });
      setViewMode('edit');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este plano de parto?')) {
      if (birthPlan?.id) {
        deletePlanMutation.mutate(birthPlan.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pregnancy?.id) {
      toast({
        title: '❌ Erro',
        description: 'Informações de gravidez não encontradas.',
        variant: 'destructive',
      });
      return;
    }

    const painRelief: any = {
      natural: formData.painReliefNatural,
      epidural: formData.painReliefEpidural
    };

    if (formData.painReliefOther.trim()) {
      painRelief.other = formData.painReliefOther.trim();
    }

    const planData = {
      pregnancyId: pregnancy.id,
      location: formData.location.trim() || null,
      painRelief,
      companions: formData.companions.trim() || null,
      specialRequests: formData.specialRequests.trim() || null,
    };

    if (viewMode === 'edit') {
      updatePlanMutation.mutate(planData);
    } else {
      createPlanMutation.mutate(planData);
    }
  };

    return (
      <AnimatedBackground>
      <div className="min-h-screen pb-20">
          <div className="container mx-auto px-4 py-4">
            {/* Header com botão voltar, título centralizado e botão ação */}
            <div className="flex items-center justify-between mb-10 relative">
              {/* Botão Voltar - Esquerda */}
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
                onClick={() => viewMode === 'list' ? window.history.back() : setViewMode('list')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {/* Título - Centro */}
              <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Planos de Parto
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">Gerencie seus planos</p>
              </div>
              
              {/* Botão Adicionar - Direita (só aparece se não houver plano) */}
              {viewMode === 'list' && !birthPlan && (
                <Button
                  onClick={() => setViewMode('create')}
                  className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-create-plan"
                >
                  <Plus className="w-5 h-5 text-white" />
                </Button>
              )}
              
              {/* Espaçador quando há plano mas está em modo list */}
              {viewMode === 'list' && birthPlan && <div className="w-10"></div>}
              
              {/* Espaçador quando não há botão direito */}
              {viewMode !== 'list' && <div className="w-10"></div>}
            </div>

          {/* Lista de planos */}
          {viewMode === 'list' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : birthPlan ? (
                <Card className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-pink-500" />
                        Meu Plano de Parto
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-blue-100"
                          onClick={() => window.print()}
                          title="Imprimir/Download PDF"
                        >
                          <Download className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-pink-100"
                          onClick={loadPlanToEdit}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-pink-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-red-100"
                          onClick={handleDelete}
                          disabled={deletePlanMutation.isPending}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {birthPlan.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-pink-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800">Local do Parto</p>
                          <p className="text-gray-600">{birthPlan.location}</p>
                        </div>
                      </div>
                    )}

                    {birthPlan.companions && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800">Acompanhantes</p>
                          <p className="text-gray-600">{birthPlan.companions}</p>
                        </div>
                      </div>
                    )}

                    {birthPlan.painRelief && (
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-pink-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800">Alívio da Dor</p>
                          <ul className="text-gray-600 space-y-1">
                            {birthPlan.painRelief.natural && (
                              <li>✓ Métodos naturais</li>
                            )}
                            {birthPlan.painRelief.epidural && (
                              <li>✓ Anestesia epidural</li>
                            )}
                            {birthPlan.painRelief.other && (
                              <li>✓ {birthPlan.painRelief.other}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {birthPlan.specialRequests && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800">Pedidos Especiais</p>
                          <p className="text-gray-600 whitespace-pre-line">{birthPlan.specialRequests}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-16 h-16 text-pink-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Nenhum plano de parto encontrado
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      Crie seu primeiro plano de parto para se preparar para o nascimento do seu bebê.
                    </p>
                    <Button
                      onClick={() => setViewMode('create')}
                      className="bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 shadow-xl border border-white/20 rounded-full px-6 py-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Plano
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Formulário de criação/edição */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                    {viewMode === 'create' ? 'Criar Plano de Parto' : 'Editar Plano de Parto'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Preencha suas preferências para o parto
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Local do Parto */}
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700 font-medium flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                        Local do Parto
                      </Label>
                      <Input
                        id="location"
                        placeholder="Ex: Hospital Santa Casa, Sala 205"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500">Hospital, maternidade ou casa de parto</p>
                    </div>

                    {/* Acompanhantes */}
                    <div className="space-y-2">
                      <Label htmlFor="companions" className="text-gray-700 font-medium flex items-center">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        Acompanhantes
                      </Label>
                      <Input
                        id="companions"
                        placeholder="Ex: Meu marido João, minha mãe Maria"
                        value={formData.companions}
                        onChange={(e) => setFormData({ ...formData, companions: e.target.value })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500">Quem você deseja que esteja presente</p>
                    </div>

                    {/* Alívio da Dor */}
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-medium flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-pink-500" />
                        Preferências de Alívio da Dor
                      </Label>
                      
                      <div className="space-y-3 pl-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="natural"
                            checked={formData.painReliefNatural}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, painReliefNatural: checked as boolean })
                            }
                          />
                          <label
                            htmlFor="natural"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Métodos naturais (respiração, massagem, água, etc.)
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="epidural"
                            checked={formData.painReliefEpidural}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, painReliefEpidural: checked as boolean })
                            }
                          />
                          <label
                            htmlFor="epidural"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Anestesia epidural
                          </label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="painReliefOther" className="text-sm text-gray-600">
                            Outros métodos (opcional)
                          </Label>
                          <Input
                            id="painReliefOther"
                            placeholder="Ex: Acupuntura, TENS, etc."
                            value={formData.painReliefOther}
                            onChange={(e) => setFormData({ ...formData, painReliefOther: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pedidos Especiais */}
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests" className="text-gray-700 font-medium flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Pedidos Especiais
                      </Label>
                      <Textarea
                        id="specialRequests"
                        placeholder="Ex: Gostaria de ter música ambiente durante o parto, evitar episiotomia se possível, contato pele a pele imediato com o bebê..."
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        className="min-h-[120px]"
                      />
                      <p className="text-xs text-gray-500">Descreva suas preferências e desejos para o parto</p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setViewMode('list');
                          resetForm();
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
                      >
                        {(createPlanMutation.isPending || updatePlanMutation.isPending) 
                          ? 'Salvando...' 
                          : viewMode === 'edit' ? 'Atualizar Plano' : 'Salvar Plano'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <BottomNavigation />
      </div>
    </AnimatedBackground>
  );
}
