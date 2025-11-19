import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Download, Eye, Heart, MapPin, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import BottomNavigation from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePregnancy } from '@/hooks/use-pregnancy';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import logoImage from "@assets/4_1755308511005.png";

interface BirthPlanFormData {
  // Etapa 1: Informações Básicas
  location: string;
  companions: string;
  doctorPreference: string;
  
  // Etapa 2: Ambiente
  lighting: string;
  music: boolean;
  movement: boolean;
  
  // Etapa 3: Alívio da Dor
  painReliefNatural: boolean;
  painReliefEpidural: boolean;
  painReliefOther: string;
  
  // Etapa 4: Durante o Trabalho de Parto
  laborPosition: string;
  monitoring: string;
  hydrationFood: boolean;
  
  // Etapa 5: Durante o Parto
  deliveryType: string;
  episiotomy: string;
  umbilicalCord: string;
  skinToSkin: boolean;
  
  // Etapa 6: Pós-Parto
  breastfeeding: string;
  babyBath: string;
  companionPresence: boolean;
  
  // Etapa 7: Solicitações Especiais
  photos: boolean;
  religiousCultural: string;
  specialRequests: string;
}

export default function BirthPlan() {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  
  // REF para rastrear se está na etapa 7 e bloquear mudanças de viewMode
  const isStep7Ref = useRef(false);
  // REF para permitir fechar quando usar o botão "Concluir"
  const allowCloseRef = useRef(false);
  
  // Atualizar ref quando currentStep mudar
  useEffect(() => {
    const isStep7 = currentStep === 7;
    isStep7Ref.current = isStep7;
    console.log("📋 currentStep mudou para:", currentStep, "isStep7Ref:", isStep7Ref.current);
    
    // PROTEÇÃO: Quando chegar na etapa 7, garantir que allowCloseRef está false
    if (isStep7) {
      console.log("📋 Chegou na etapa 7 - resetando allowCloseRef para false");
      allowCloseRef.current = false;
    }
  }, [currentStep]);
  
  // Função protegida para setViewMode - não permite mudar se estiver na etapa 7 (exceto se allowCloseRef for true)
  const protectedSetViewMode = (newMode: 'list' | 'create' | 'edit' | 'view', reason?: string) => {
    console.log("📋 protectedSetViewMode chamado:", {
      newMode,
      reason,
      currentViewMode: viewMode,
      isStep7: isStep7Ref.current,
      allowClose: allowCloseRef.current
    });
    
    if (isStep7Ref.current && (viewMode === 'create' || viewMode === 'edit') && !allowCloseRef.current) {
      console.error("🚫 BLOQUEADO: Tentativa de mudar viewMode na etapa 7!");
      console.error("🚫 Tentativa de mudar de", viewMode, "para", newMode);
      console.error("🚫 Razão:", reason || "não especificada");
      console.trace("🚫 Stack trace:");
      return; // Bloquear completamente
    }
    console.log("✅ Mudando viewMode de", viewMode, "para", newMode, "Razão:", reason || "não especificada");
    setViewMode(newMode);
    // Resetar allowCloseRef após mudar o viewMode (mas só se realmente mudou)
    if (newMode === 'list') {
      allowCloseRef.current = false;
      console.log("📋 allowCloseRef resetado após mudar para 'list'");
    }
  };
  
  
  const [formData, setFormData] = useState<BirthPlanFormData>({
    // Etapa 1
    location: '',
    companions: '',
    doctorPreference: '',
    // Etapa 2
    lighting: 'dimmed',
    music: false,
    movement: true,
    // Etapa 3
    painReliefNatural: true,
    painReliefEpidural: false,
    painReliefOther: '',
    // Etapa 4
    laborPosition: 'free',
    monitoring: 'intermittent',
    hydrationFood: true,
    // Etapa 5
    deliveryType: 'natural',
    episiotomy: 'if-necessary',
    umbilicalCord: 'delayed',
    skinToSkin: true,
    // Etapa 6
    breastfeeding: 'immediate',
    babyBath: 'delayed',
    companionPresence: true,
    // Etapa 7
    photos: true,
    religiousCultural: '',
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
    refetchOnWindowFocus: false, // Não refetch quando a janela ganha foco (evita re-render durante edição)
    staleTime: 5 * 60 * 1000, // Considerar dados válidos por 5 minutos
  });

  const birthPlan = birthPlanData?.birthPlan;

  // REF para controlar se já carregou os dados uma vez
  const hasLoadedDataRef = useRef(false);
  
  // Carregar dados automaticamente quando birthPlan mudar e estiver em modo de edição
  // IMPORTANTE: Só carregar quando entrar em modo de edição, não durante a edição
  useEffect(() => {
    // PROTEÇÃO CRÍTICA: Não fazer nada se estiver na etapa 7
    if (currentStep === 7) {
      console.log("📋 useEffect - BLOQUEADO na etapa 7 - não fazer nada");
      return;
    }
    
    // Só carregar se:
    // 1. Estiver em modo de edição
    // 2. Estiver na primeira etapa (não durante edição)
    // 3. Ainda não carregou os dados (evitar re-carregar)
    // 4. birthPlan existe
    if (birthPlan && viewMode === 'edit' && currentStep === 1 && !hasLoadedDataRef.current) {
      console.log("📋 useEffect - Carregando dados do plano:", birthPlan);
      setFormData({
        location: birthPlan.location || '',
        companions: birthPlan.companions || '',
        doctorPreference: birthPlan.doctorPreference || '',
        lighting: birthPlan.lighting || 'dimmed',
        music: birthPlan.music ?? false,
        movement: birthPlan.movement ?? true,
        painReliefNatural: birthPlan.painReliefNatural ?? false,
        painReliefEpidural: birthPlan.painReliefEpidural ?? false,
        painReliefOther: birthPlan.painReliefOther || '',
        laborPosition: birthPlan.laborPosition || 'free',
        monitoring: birthPlan.monitoring || 'intermittent',
        hydrationFood: birthPlan.hydrationFood ?? true,
        deliveryType: birthPlan.deliveryType || 'natural',
        episiotomy: birthPlan.episiotomy || 'if-necessary',
        umbilicalCord: birthPlan.umbilicalCord || 'delayed',
        skinToSkin: birthPlan.skinToSkin ?? true,
        breastfeeding: birthPlan.breastfeeding || 'immediate',
        babyBath: birthPlan.babyBath || 'delayed',
        companionPresence: birthPlan.companionPresence ?? true,
        photos: birthPlan.photos ?? true,
        religiousCultural: birthPlan.religiousCultural || '',
        specialRequests: birthPlan.specialRequests || ''
      });
      hasLoadedDataRef.current = true; // Marcar como carregado
    }
    
    // Resetar o flag quando sair do modo de edição (mas não se estiver na etapa 7)
    if (viewMode !== 'edit' && currentStep !== 7) {
      hasLoadedDataRef.current = false;
    }
  }, [birthPlan?.id, viewMode, currentStep]); // Incluir currentStep nas dependências

  // Função para limpar formulário ao criar novo plano
  const resetForm = () => {
    setFormData({
      location: '',
      companions: '',
      doctorPreference: '',
      lighting: 'dimmed',
      music: false,
      movement: true,
      painReliefNatural: true,
      painReliefEpidural: false,
      painReliefOther: '',
      laborPosition: 'free',
      monitoring: 'intermittent',
      hydrationFood: true,
      deliveryType: 'natural',
      episiotomy: 'if-necessary',
      umbilicalCord: 'delayed',
      skinToSkin: true,
      breastfeeding: 'immediate',
      babyBath: 'delayed',
      companionPresence: true,
      photos: true,
      religiousCultural: '',
      specialRequests: ''
    });
    setCurrentStep(1);
  };

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('POST', '/api/birth-plans', planData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("📋 Birth plan created successfully, updating UI...");
      console.log("📋 Dados retornados:", JSON.stringify(data, null, 2));
      
      // Mostrar toast primeiro
      toast({
        title: "✅ Plano de Parto Salvo!",
        description: "Seu plano de parto foi criado com sucesso.",
      });
      
      // Atualizar o cache primeiro
      try {
        queryClient.setQueryData(['/api/birth-plans', pregnancy?.id], () => ({
          birthPlan: data.birthPlan
        }));
        console.log("📋 Cache updated immediately with new birth plan");
      } catch (error) {
        console.error("📋 Error updating cache:", error);
      }
      
      // Aguardar um pouco antes de fechar para garantir que o toast seja visto
      setTimeout(() => {
        console.log("📋 Verificando se deve fechar - isStep7:", isStep7Ref.current, "allowClose:", allowCloseRef.current);
        
        // PROTEÇÃO CRÍTICA: Não fechar se estiver na etapa 7 (a menos que allowCloseRef esteja ativo)
        if (isStep7Ref.current && !allowCloseRef.current) {
          console.warn("⚠️⚠️⚠️ TENTATIVA DE FECHAR BLOQUEADA - está na etapa 7!");
          console.warn("⚠️ allowCloseRef.current:", allowCloseRef.current);
          return;
        }
        
        console.log("✅ Fechando tela após salvar");
        
        // Resetar formulário e voltar para lista
        resetForm();
        protectedSetViewMode('list', 'createPlanMutation onSuccess');
        setCurrentStep(1);
        
        // Invalidar queries DEPOIS de fechar a tela para evitar re-render durante edição
        queryClient.invalidateQueries({ 
          queryKey: ['/api/birth-plans'],
          exact: false 
        });
      }, 500);
    },
    onError: (error: any) => {
      console.error("❌ Error creating birth plan:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o plano de parto.",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      if (!birthPlan?.id) throw new Error('Birth plan ID not found');
      const response = await apiRequest('PUT', `/api/birth-plans/${birthPlan.id}`, planData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("📋 Birth plan updated successfully, updating UI...");
      console.log("📋 Dados retornados:", JSON.stringify(data, null, 2));
      
      // Atualizar cache primeiro
      queryClient.setQueryData(['/api/birth-plans', pregnancy?.id], () => ({
        birthPlan: data.birthPlan
      }));
      
      // Mostrar toast primeiro
      toast({
        title: "✅ Plano Atualizado!",
        description: "Seu plano de parto foi atualizado com sucesso.",
      });
      
      // Aguardar um pouco antes de fechar para garantir que o toast seja visto
      setTimeout(() => {
        console.log("📋 Verificando se deve fechar - isStep7:", isStep7Ref.current, "allowClose:", allowCloseRef.current);
        
        // PROTEÇÃO CRÍTICA: Não fechar se estiver na etapa 7 (a menos que allowCloseRef esteja ativo)
        if (isStep7Ref.current && !allowCloseRef.current) {
          console.warn("⚠️⚠️⚠️ TENTATIVA DE FECHAR BLOQUEADA - está na etapa 7!");
          console.warn("⚠️ allowCloseRef.current:", allowCloseRef.current);
          return;
        }
        
        console.log("✅ Fechando tela após atualizar");
        
        // Resetar formulário e voltar para lista
        resetForm();
        protectedSetViewMode('list', 'updatePlanMutation onSuccess');
        setCurrentStep(1);
        
        // Invalidar queries DEPOIS de fechar a tela para evitar re-render durante edição
        queryClient.invalidateQueries({ queryKey: ['/api/birth-plans'] });
      }, 500);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/birth-plans/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/birth-plans', pregnancy?.id], () => ({ birthPlan: null }));
      queryClient.invalidateQueries({ queryKey: ['/api/birth-plans'] });
      toast({
        title: "✅ Plano Excluído!",
        description: "Seu plano de parto foi excluído.",
      });
    },
  });

  const handleInputChange = (field: keyof BirthPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    if (birthPlan) {
      console.log("📋 Carregando dados do plano para edição:", birthPlan);
      // Resetar o flag para permitir carregamento
      hasLoadedDataRef.current = false;
      
      // Preencher formulário com dados existentes - Drizzle retorna em camelCase
      setFormData({
        location: birthPlan.location || '',
        companions: birthPlan.companions || '',
        doctorPreference: birthPlan.doctorPreference || '', // ✅ camelCase
        lighting: birthPlan.lighting || 'dimmed',
        music: birthPlan.music ?? false, // ✅ usar ?? para tratar null
        movement: birthPlan.movement ?? true,
        painReliefNatural: birthPlan.painReliefNatural ?? false, // ✅ camelCase
        painReliefEpidural: birthPlan.painReliefEpidural ?? false, // ✅ camelCase
        painReliefOther: birthPlan.painReliefOther || '', // ✅ camelCase
        laborPosition: birthPlan.laborPosition || 'free', // ✅ camelCase
        monitoring: birthPlan.monitoring || 'intermittent',
        hydrationFood: birthPlan.hydrationFood ?? true, // ✅ camelCase
        deliveryType: birthPlan.deliveryType || 'natural', // ✅ camelCase
        episiotomy: birthPlan.episiotomy || 'if-necessary',
        umbilicalCord: birthPlan.umbilicalCord || 'delayed', // ✅ camelCase
        skinToSkin: birthPlan.skinToSkin ?? true, // ✅ camelCase
        breastfeeding: birthPlan.breastfeeding || 'immediate',
        babyBath: birthPlan.babyBath || 'delayed', // ✅ camelCase
        companionPresence: birthPlan.companionPresence ?? true, // ✅ camelCase
        photos: birthPlan.photos ?? true,
        religiousCultural: birthPlan.religiousCultural || '', // ✅ camelCase
        specialRequests: birthPlan.specialRequests || '' // ✅ camelCase
      });
      console.log("📋 FormData preenchido:", formData);
      protectedSetViewMode('edit', 'handleEdit');
      setCurrentStep(1); // Voltar para a primeira etapa ao editar
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (birthPlan?.id) {
      deletePlanMutation.mutate(birthPlan.id);
      setShowDeleteDialog(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      console.log("📋 handleNext - mudando de etapa", currentStep, "para", nextStep);
      setCurrentStep(nextStep);
      
      // PROTEÇÃO: Se estiver indo para a etapa 7, garantir que não salve automaticamente
      if (nextStep === 7) {
        console.log("📋 Chegando na etapa 7 - garantindo que allowCloseRef está false");
        allowCloseRef.current = false;
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Função para salvar o plano (usada tanto pelo handleSubmit quanto pelo handleConclude)
  const savePlan = (allowStep7Close: boolean = false) => {
    if (!pregnancy?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma gravidez ativa encontrada.",
        variant: "destructive",
      });
      return;
    }

    // CORRIGIDO: enviar em camelCase, como o backend espera - garantir que valores vazios virem null
    const planData = {
      pregnancyId: pregnancy.id,
      location: formData.location || null,
      companions: formData.companions || null,
      doctorPreference: formData.doctorPreference || null,
      lighting: formData.lighting || null,
      music: formData.music ?? null,
      movement: formData.movement ?? null,
      painReliefNatural: formData.painReliefNatural ?? null,
      painReliefEpidural: formData.painReliefEpidural ?? null,
      painReliefOther: formData.painReliefOther || null,
      laborPosition: formData.laborPosition || null,
      monitoring: formData.monitoring || null,
      hydrationFood: formData.hydrationFood ?? null,
      deliveryType: formData.deliveryType || null,
      episiotomy: formData.episiotomy || null,
      umbilicalCord: formData.umbilicalCord || null,
      skinToSkin: formData.skinToSkin ?? null,
      breastfeeding: formData.breastfeeding || null,
      babyBath: formData.babyBath || null,
      companionPresence: formData.companionPresence ?? null,
      photos: formData.photos ?? null,
      religiousCultural: formData.religiousCultural?.trim() || null,
      specialRequests: formData.specialRequests?.trim() || null
    };

    console.log("📋 Dados que serão enviados:", JSON.stringify(planData, null, 2));
    console.log("📋 religiousCultural:", formData.religiousCultural, "->", planData.religiousCultural);
    console.log("📋 specialRequests:", formData.specialRequests, "->", planData.specialRequests);
    console.log("📋 allowStep7Close:", allowStep7Close);

    // Se permitir fechar na etapa 7, ativar a flag
    if (allowStep7Close) {
      allowCloseRef.current = true;
      console.log("📋 allowCloseRef ativado - permitindo fechar na etapa 7");
    }
    
    if (viewMode === 'edit' && birthPlan) {
      console.log("📋 Atualizando plano existente:", birthPlan.id);
      updatePlanMutation.mutate(planData);
    } else {
      console.log("📋 Criando novo plano");
      createPlanMutation.mutate(planData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("📋 handleSubmit chamado - viewMode:", viewMode, "currentStep:", currentStep);
    console.log("📋 formData completo:", JSON.stringify(formData, null, 2));
    console.trace("📋 Stack trace do handleSubmit:");
    
    // PROTEÇÃO CRÍTICA: Na etapa 7, só permitir submit se foi clicado explicitamente no botão
    if (currentStep === 7) {
      const submitter = (e.nativeEvent as SubmitEvent).submitter;
      console.log("📋 Etapa 7 - Verificando submitter:", submitter);
      
      // Verificar se foi clicado no botão de submit
      if (!submitter || submitter.getAttribute('data-explicit-submit') !== 'true') {
        console.warn("⚠️⚠️⚠️ SUBMIT BLOQUEADO na etapa 7 - não foi clicado no botão!");
        console.warn("⚠️ submitter:", submitter);
        console.warn("⚠️ submitter?.getAttribute('data-explicit-submit'):", submitter?.getAttribute('data-explicit-submit'));
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: "⚠️ Atenção",
          description: "Clique no botão 'Salvar Plano' para salvar.",
          variant: "default",
        });
        return;
      }
      console.log("✅ Submit permitido na etapa 7 - botão clicado corretamente");
      // Na etapa 7, quando clicar em "Salvar Plano", permitir fechar após salvar
      allowCloseRef.current = true;
      console.log("📋 allowCloseRef ativado na etapa 7 para permitir fechar após salvar");
    }
    
    // Se estiver na etapa 7 e foi clicado no botão, permitir fechar. Caso contrário, não permitir.
    savePlan(currentStep === 7 && allowCloseRef.current);
  };

  // Função para concluir e salvar em qualquer etapa
  const handleConclude = () => {
    console.log("📋 handleConclude chamado - salvando plano na etapa:", currentStep);
    console.log("📋 Ativando allowCloseRef antes de salvar");
    // Ativar allowCloseRef ANTES de chamar savePlan para garantir que persista até o onSuccess
    allowCloseRef.current = true;
    // Salvar permitindo fechar mesmo na etapa 7
    savePlan(true);
  };

  // Função específica para mobile/PWA
  const downloadPDFMobile = async () => {
    if (!birthPlan) return;

    try {
      console.log('📱 Gerando PDF para mobile...');
      console.log('📋 Dados do birthPlan para PDF:', JSON.stringify(birthPlan, null, 2));
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Plano de Parto - MamaCare</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background: #ffffff;
              font-size: 16px;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              padding-bottom: 20px;
              margin-bottom: 30px;
              border-bottom: 2px solid #ec4899;
            }
            
            .logo-text {
              font-size: 32px;
              font-weight: 700;
              color: #ec4899;
              margin-bottom: 10px;
            }
            
            .header h1 {
              color: #1f2937;
              font-size: 28px;
              margin: 10px 0;
              font-weight: 700;
            }
            
            .section {
              margin-bottom: 25px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 10px;
              border-left: 4px solid #ec4899;
            }
            
            .section h3 {
              color: #ec4899;
              font-size: 18px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            
            .section p {
              margin-bottom: 8px;
              color: #555;
            }
            
            .section strong {
              color: #333;
              font-weight: 600;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            
            @media print {
              body { font-size: 12px; }
              .section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-text">MamaCare</div>
            <h1>Plano de Parto</h1>
            <p class="header-subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <div class="section">
            <h3>📍 Informações Básicas</h3>
            <p><strong>Local:</strong> ${birthPlan.location || 'Não informado'}</p>
            <p><strong>Acompanhantes:</strong> ${birthPlan.companions || 'Não informado'}</p>
            <p><strong>Médico de Preferência:</strong> ${birthPlan.doctorPreference || 'Não informado'}</p>
          </div>
          
          <div class="section">
            <h3>🏠 Ambiente Desejado</h3>
            <p><strong>Iluminação:</strong> ${birthPlan.lighting ? (birthPlan.lighting === 'dimmed' ? 'Ambiente com luz baixa' : birthPlan.lighting === 'natural' ? 'Luz natural' : birthPlan.lighting === 'normal' ? 'Luz normal' : birthPlan.lighting) : 'Não informado'}</p>
            <p><strong>Música:</strong> ${birthPlan.music ? 'Sim' : birthPlan.music === false ? 'Não' : 'Não informado'}</p>
            <p><strong>Movimento livre:</strong> ${birthPlan.movement ? 'Sim' : birthPlan.movement === false ? 'Não' : 'Não informado'}</p>
          </div>
          
          <div class="section">
            <h3>💊 Alívio da Dor</h3>
            ${birthPlan.painReliefNatural ? '<p>✓ Métodos naturais</p>' : ''}
            ${birthPlan.painReliefEpidural ? '<p>✓ Anestesia epidural</p>' : ''}
            ${birthPlan.painReliefOther ? `<p>✓ ${birthPlan.painReliefOther}</p>` : ''}
            ${!birthPlan.painReliefNatural && !birthPlan.painReliefEpidural && !birthPlan.painReliefOther ? '<p>Não informado</p>' : ''}
          </div>
          
          <div class="section">
            <h3>🤰 Durante o Trabalho de Parto</h3>
            <p><strong>Posição:</strong> ${birthPlan.laborPosition ? (birthPlan.laborPosition === 'free' ? 'Liberdade para escolher' : birthPlan.laborPosition === 'standing' ? 'De pé/caminhando' : birthPlan.laborPosition === 'lying' ? 'Deitada' : birthPlan.laborPosition === 'squatting' ? 'Agachada' : birthPlan.laborPosition === 'side' ? 'De lado' : birthPlan.laborPosition) : 'Não informado'}</p>
            <p><strong>Monitoramento:</strong> ${birthPlan.monitoring ? (birthPlan.monitoring === 'intermittent' ? 'Intermitente' : birthPlan.monitoring === 'continuous' ? 'Contínuo' : birthPlan.monitoring) : 'Não informado'}</p>
            <p><strong>Hidratação/Alimentação:</strong> ${birthPlan.hydrationFood ? 'Sim' : birthPlan.hydrationFood === false ? 'Não' : 'Não informado'}</p>
          </div>
          
          <div class="section">
            <h3>👶 Durante o Parto</h3>
            <p><strong>Tipo de parto:</strong> ${birthPlan.deliveryType ? (birthPlan.deliveryType === 'natural' ? 'Parto natural' : birthPlan.deliveryType === 'cesarean' ? 'Cesárea' : birthPlan.deliveryType) : 'Não informado'}</p>
            <p><strong>Episiotomia:</strong> ${birthPlan.episiotomy ? (birthPlan.episiotomy === 'if-necessary' ? 'Se necessário' : birthPlan.episiotomy === 'avoid' ? 'Evitar' : birthPlan.episiotomy) : 'Não informado'}</p>
            <p><strong>Cordão umbilical:</strong> ${birthPlan.umbilicalCord ? (birthPlan.umbilicalCord === 'delayed' ? 'Clampeamento tardio' : birthPlan.umbilicalCord === 'immediate' ? 'Imediato' : birthPlan.umbilicalCord) : 'Não informado'}</p>
            <p><strong>Contato pele a pele:</strong> ${birthPlan.skinToSkin ? 'Sim' : birthPlan.skinToSkin === false ? 'Não' : 'Não informado'}</p>
          </div>
          
          <div class="section">
            <h3>🍼 Pós-Parto</h3>
            <p><strong>Amamentação:</strong> ${birthPlan.breastfeeding ? (birthPlan.breastfeeding === 'immediate' ? 'Imediatamente após o parto' : birthPlan.breastfeeding === 'when-ready' ? 'Quando estiver pronta' : birthPlan.breastfeeding === 'guidance' ? 'Conforme orientação' : birthPlan.breastfeeding) : 'Não informado'}</p>
            <p><strong>Banho do bebê:</strong> ${birthPlan.babyBath ? (birthPlan.babyBath === 'delayed' ? 'Adiar por algumas horas' : birthPlan.babyBath === 'immediate' ? 'Imediatamente' : birthPlan.babyBath === 'routine' ? 'Conforme rotina do hospital' : birthPlan.babyBath) : 'Não informado'}</p>
            <p><strong>Presença de acompanhante:</strong> ${birthPlan.companionPresence ? 'Sim' : birthPlan.companionPresence === false ? 'Não' : 'Não informado'}</p>
          </div>
          
          <div class="section">
            <h3>✨ Solicitações Especiais</h3>
            <p><strong>Fotografias/Vídeos:</strong> ${birthPlan.photos ? 'Permitidos' : birthPlan.photos === false ? 'Não permitidos' : 'Não informado'}</p>
            ${birthPlan.religiousCultural ? `<p><strong>Crenças Religiosas/Culturais:</strong> ${birthPlan.religiousCultural}</p>` : ''}
            ${birthPlan.specialRequests ? `<p><strong>Outras Solicitações:</strong> ${birthPlan.specialRequests}</p>` : ''}
            ${!birthPlan.photos && !birthPlan.religiousCultural && !birthPlan.specialRequests ? '<p>Não informado</p>' : ''}
          </div>
          
          <div class="footer">
            <p>Este plano de parto foi criado com o MamaCare</p>
            <p>Para mais informações, consulte seu médico</p>
          </div>
        </body>
        </html>
      `;
      
      // Método 1: Em mobile, sempre usar visualização na tela com opção de compartilhar
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobileDevice) {
        // Mobile: Criar blob e abrir em nova aba
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
        URL.revokeObjectURL(url);
        
        return;
      }
      
      // Método 2: Desktop - tentar abrir em nova janela para impressão
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aguardar carregamento e imprimir
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Fechar janela após impressão
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
        
        toast({
          title: "📄 Abrindo para Impressão",
          description: "Seu plano de parto foi aberto em uma nova janela para impressão.",
        });
        
        return;
      }
      
      // Método 3: Fallback - mostrar conteúdo na tela
      throw new Error('Não foi possível abrir nova janela');
      
    } catch (error) {
      console.error('❌ Erro no método mobile:', error);
      
      // Método 3: Fallback final - mostrar em modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
        position: relative;
      `;
      
      content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="color: #ec4899; margin: 0;">Plano de Parto</h2>
          <button onclick="this.closest('.modal').remove()" style="background: #ec4899; color: white; border: none; border-radius: 5px; padding: 8px 12px; cursor: pointer;">Fechar</button>
        </div>
        ${htmlContent.split('<body>')[1].split('</body>')[0]}
      `;
      
      modal.className = 'modal';
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      toast({
        title: "📱 Plano de Parto",
        description: "Seu plano de parto foi exibido na tela. Use o botão de compartilhar do seu navegador para salvar.",
      });
    }
  };

  const downloadPDF = async () => {
    if (!birthPlan) return;

    try {
      console.log('🔄 Iniciando download do PDF...');
      
      // USAR SEMPRE O MÉTODO DE IMPRESSÃO (mais confiável)
      console.log('🖨️ Usando método de impressão nativa...');
      await downloadPDFMobile();
      return;
      
      /* CÓDIGO ANTIGO DO HTML2PDF - COMENTADO POIS ESTAVA GERANDO PDF EM BRANCO
      // Detectar se é mobile/PWA
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      
      console.log('📱 Dispositivo:', { isMobile, isPWA });
      
      // Para mobile/PWA, usar método mais simples
      if (isMobile || isPWA) {
        console.log('📱 Usando método mobile para PDF...');
        await downloadPDFMobile();
        return;
      }
      
      // Para desktop, usar html2pdf
      console.log('💻 Usando html2pdf para desktop...');
      const html2pdf = (await import('html2pdf.js')).default;
    
    console.log('📄 Preparando conteúdo do PDF...');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plano de Parto - MamaCare</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { 
            margin: 15mm; 
            size: A4;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #ffffff;
            font-size: 14px;
          }
          
          .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: #ffffff;
          }
          
          .header {
            text-align: center;
            padding-bottom: 20px;
            margin-bottom: 30px;
            border-bottom: 2px solid #ec4899;
          }
          
          .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: #ec4899;
            margin-bottom: 10px;
          }
          
          .header h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 10px 0;
            font-weight: 700;
          }
          
          .header-subtitle {
            color: #666;
            font-size: 12px;
            font-style: italic;
          }
          
          .user-info {
            background: #fef3f8;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
            border-left: 4px solid #ec4899;
          }
          
          .user-info p {
            margin: 8px 0;
            font-size: 15px;
          }
          
          .user-info strong {
            color: #6b21a8;
            font-weight: 600;
          }
          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: #ec4899;
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .section-title::before {
            content: '✦';
            font-size: 20px;
          }
          
          .field {
            margin-bottom: 18px;
            padding-left: 20px;
          }
          
          .field-label {
            font-weight: 600;
            color: #4b5563;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .field-value {
            color: #1f2937;
            padding: 12px 15px;
            background: #fef3f8;
            border-radius: 8px;
            border-left: 4px solid #ec4899;
            font-size: 15px;
            border: 1px solid #f3d1e0;
          }
          
          .checkbox-group {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            padding-left: 20px;
          }
          
          .checkbox-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #f3f4f6;
          }
          
          .checkbox-item.checked {
            border-color: #ec4899;
            background: #fef3f8;
          }
          
          .checkbox-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ec4899;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
          
          .checkbox-icon.unchecked {
            background: #e5e7eb;
          }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            border-top: 2px solid #f3f4f6;
            padding-top: 25px;
            font-style: italic;
          }
          
          .footer-hearts {
            margin: 15px 0;
            font-size: 20px;
            color: #ec4899;
          }
          
          @media print {
            body {
              background: white;
            }
            .container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-text">💕 MamaCare</div>
            <h1>Meu Plano de Parto</h1>
            <p class="header-subtitle">Planejando um parto com amor e cuidado</p>
          </div>
          
          <div class="user-info">
            <p><strong>Nome:</strong> ${user?.name || 'Não informado'}</p>
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>

          <div class="section">
          <div class="section-title">📍 Informações Básicas</div>
          <div class="field">
            <span class="field-label">Local do Parto:</span>
            <div class="field-value">${birthPlan.location || 'Não especificado'}</div>
          </div>
          <div class="field">
            <span class="field-label">Acompanhantes:</span>
            <div class="field-value">${birthPlan.companions || 'Não especificado'}</div>
          </div>
          <div class="field">
            <span class="field-label">Médico de Preferência:</span>
            <div class="field-value">${birthPlan.doctor_preference || 'Não especificado'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🌟 Ambiente</div>
          <div class="field">
            <span class="field-label">Iluminação:</span>
            <div class="field-value">${birthPlan.lighting === 'dimmed' ? 'Ambiente com luz baixa' : birthPlan.lighting === 'natural' ? 'Luz natural' : 'Luz normal'}</div>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.music ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.music ? '' : 'unchecked'}">${birthPlan.music ? '✓' : '○'}</span>
              Música ambiente
            </div>
            <div class="checkbox-item ${birthPlan.movement ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.movement ? '' : 'unchecked'}">${birthPlan.movement ? '✓' : '○'}</span>
              Liberdade de movimentação
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">💊 Alívio da Dor</div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.pain_relief_natural ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.pain_relief_natural ? '' : 'unchecked'}">${birthPlan.pain_relief_natural ? '✓' : '○'}</span>
              Métodos naturais (respiração, massagem, água)
            </div>
            <div class="checkbox-item ${birthPlan.pain_relief_epidural ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.pain_relief_epidural ? '' : 'unchecked'}">${birthPlan.pain_relief_epidural ? '✓' : '○'}</span>
              Anestesia epidural
            </div>
          </div>
          ${birthPlan.pain_relief_other ? `
          <div class="field">
            <span class="field-label">Outros métodos:</span>
            <div class="field-value">${birthPlan.pain_relief_other}</div>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">🤰 Durante o Trabalho de Parto</div>
          <div class="field">
            <span class="field-label">Posição:</span>
            <div class="field-value">${birthPlan.labor_position === 'free' ? 'Liberdade para escolher' : birthPlan.labor_position === 'standing' ? 'De pé/caminhando' : 'Deitada'}</div>
          </div>
          <div class="field">
            <span class="field-label">Monitoramento:</span>
            <div class="field-value">${birthPlan.monitoring === 'intermittent' ? 'Intermitente' : 'Contínuo'}</div>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.hydration_food ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.hydration_food ? '' : 'unchecked'}">${birthPlan.hydration_food ? '✓' : '○'}</span>
              Hidratação e alimentação leve
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">👶 Durante o Parto</div>
          <div class="field">
            <span class="field-label">Tipo de parto:</span>
            <div class="field-value">${birthPlan.delivery_type === 'natural' ? 'Parto normal' : birthPlan.delivery_type === 'cesarean' ? 'Cesariana' : 'A decidir'}</div>
          </div>
          <div class="field">
            <span class="field-label">Episiotomia:</span>
            <div class="field-value">${birthPlan.episiotomy === 'if-necessary' ? 'Somente se necessário' : birthPlan.episiotomy === 'avoid' ? 'Evitar' : 'Conforme orientação médica'}</div>
          </div>
          <div class="field">
            <span class="field-label">Cordão umbilical:</span>
            <div class="field-value">${birthPlan.umbilical_cord === 'delayed' ? 'Clampeamento tardio' : birthPlan.umbilical_cord === 'immediate' ? 'Clampeamento imediato' : 'Conforme orientação médica'}</div>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.skin_to_skin ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.skin_to_skin ? '' : 'unchecked'}">${birthPlan.skin_to_skin ? '✓' : '○'}</span>
              Contato pele a pele imediato
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🍼 Pós-Parto</div>
          <div class="field">
            <span class="field-label">Amamentação:</span>
            <div class="field-value">${birthPlan.breastfeeding === 'immediate' ? 'Imediatamente após o parto' : birthPlan.breastfeeding === 'when-ready' ? 'Quando estiver pronta' : 'Conforme orientação'}</div>
          </div>
          <div class="field">
            <span class="field-label">Banho do bebê:</span>
            <div class="field-value">${birthPlan.baby_bath === 'delayed' ? 'Adiar por algumas horas' : birthPlan.baby_bath === 'immediate' ? 'Imediatamente' : 'Conforme rotina'}</div>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.companion_presence ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.companion_presence ? '' : 'unchecked'}">${birthPlan.companion_presence ? '✓' : '○'}</span>
              Presença de acompanhante
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">✨ Solicitações Especiais</div>
          <div class="checkbox-group">
            <div class="checkbox-item ${birthPlan.photos ? 'checked' : ''}">
              <span class="checkbox-icon ${birthPlan.photos ? '' : 'unchecked'}">${birthPlan.photos ? '✓' : '○'}</span>
              Fotografias/vídeos permitidos
            </div>
          </div>
          ${birthPlan.religious_cultural ? `
          <div class="field">
            <span class="field-label">Crenças religiosas/culturais:</span>
            <div class="field-value">${birthPlan.religious_cultural}</div>
          </div>
          ` : ''}
          ${birthPlan.special_requests ? `
          <div class="field">
            <span class="field-label">Outras solicitações:</span>
            <div class="field-value">${birthPlan.special_requests}</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="footer-hearts">💕 ✨ 💕</div>
          <p><strong>Plano de Parto gerado pelo aplicativo MamaCare</strong></p>
          <p style="margin-top: 10px;">Este documento serve como orientação e pode ser ajustado conforme necessário durante o trabalho de parto.</p>
          <p style="margin-top: 10px; font-size: 11px; color: #bbb;">Com amor e cuidado para você e seu bebê ❤️</p>
        </div>
        </div>
      </body>
      </html>
    `;
    
    // Criar elemento temporário para o PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    // Mostrar toast imediatamente
    toast({
      title: "⏳ Gerando PDF...",
      description: "Aguarde, seu plano de parto está sendo preparado.",
    });

    // Configurações do PDF
    const options = {
      margin: 0,
      filename: `Plano-de-Parto-${user?.name || 'MamaCare'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 800
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: 'avoid-all' }
    };
    
      // Gerar e baixar o PDF
      // IMPORTANTE: O elemento precisa estar visível na viewport para html2canvas funcionar
      console.log('🎨 Adicionando elemento ao DOM...');
      
      // Adicionar elemento ao DOM de forma VISÍVEL mas fora da tela visível
      element.style.position = 'absolute';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '210mm'; // A4 width
      element.style.height = 'auto';
      element.style.zIndex = '9999'; // Na frente para garantir renderização
      element.style.background = 'white'; // Fundo branco
      element.style.overflow = 'visible';
      
      // Criar um overlay escuro para cobrir a tela enquanto gera
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0, 0, 0, 0.8)';
      overlay.style.zIndex = '9998';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.color = 'white';
      overlay.style.fontSize = '20px';
      overlay.innerHTML = '<div style="text-align: center;"><div style="font-size: 40px; margin-bottom: 20px;">📄</div>Gerando PDF...</div>';
      
      document.body.appendChild(overlay);
      document.body.appendChild(element);
      
      console.log('⏳ Aguardando renderização...');
      // Aguardar mais tempo para garantir renderização completa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Gerando PDF...');
      // Gerar PDF e forçar download direto
      await html2pdf().set(options).from(element).save();
      
      console.log('✅ PDF gerado!');
      
      // Aguardar um pouco antes de remover para garantir que o PDF foi processado
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remover elementos temporários
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      
      toast({
        title: "✅ PDF Baixado!",
        description: "Seu plano de parto foi salvo com sucesso.",
      });
      */
      // FIM DO CÓDIGO COMENTADO
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AnimatedBackground>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">📍 Informações Básicas</h3>
            
            <div>
              <Label htmlFor="location">Local do Parto *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: Hospital Santa Casa"
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                required
              />
            </div>

            <div>
              <Label htmlFor="companions">Acompanhantes Desejados</Label>
              <Input
                id="companions"
                value={formData.companions}
                onChange={(e) => handleInputChange('companions', e.target.value)}
                placeholder="Ex: Esposo, Mãe"
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
              />
            </div>

            <div>
              <Label htmlFor="doctorPreference">Médico de Preferência</Label>
              <Input
                id="doctorPreference"
                value={formData.doctorPreference}
                onChange={(e) => handleInputChange('doctorPreference', e.target.value)}
                placeholder="Nome do médico obstetra"
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🌟 Ambiente</h3>
            
            <div>
              <Label>Iluminação Preferida</Label>
              <RadioGroup value={formData.lighting} onValueChange={(value) => handleInputChange('lighting', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dimmed" id="dimmed" />
                  <Label htmlFor="dimmed">Ambiente com luz baixa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="natural" id="natural" />
                  <Label htmlFor="natural">Luz natural</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Luz normal</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="music"
                checked={formData.music}
                onCheckedChange={(checked) => handleInputChange('music', checked)}
              />
              <Label htmlFor="music">Música ambiente</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="movement"
                checked={formData.movement}
                onCheckedChange={(checked) => handleInputChange('movement', checked)}
              />
              <Label htmlFor="movement">Liberdade de movimentação</Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">💊 Alívio da Dor</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="painReliefNatural"
                checked={formData.painReliefNatural}
                onCheckedChange={(checked) => handleInputChange('painReliefNatural', checked)}
              />
              <Label htmlFor="painReliefNatural">Métodos naturais (respiração, massagem, água)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="painReliefEpidural"
                checked={formData.painReliefEpidural}
                onCheckedChange={(checked) => handleInputChange('painReliefEpidural', checked)}
              />
              <Label htmlFor="painReliefEpidural">Anestesia epidural</Label>
            </div>

            <div>
              <Label htmlFor="painReliefOther">Outros métodos de alívio da dor</Label>
              <Textarea
                id="painReliefOther"
                value={formData.painReliefOther}
                onChange={(e) => handleInputChange('painReliefOther', e.target.value)}
                placeholder="Descreva outros métodos que deseja usar..."
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🤰 Durante o Trabalho de Parto</h3>
            
            <div>
              <Label>Posição Preferida</Label>
              <RadioGroup value={formData.laborPosition} onValueChange={(value) => handleInputChange('laborPosition', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free">Liberdade para escolher</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standing" id="standing" />
                  <Label htmlFor="standing">De pé/caminhando</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lying" id="lying" />
                  <Label htmlFor="lying">Deitada</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Monitoramento Fetal</Label>
              <RadioGroup value={formData.monitoring} onValueChange={(value) => handleInputChange('monitoring', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermittent" id="intermittent" />
                  <Label htmlFor="intermittent">Intermitente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="continuous" id="continuous" />
                  <Label htmlFor="continuous">Contínuo</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hydrationFood"
                checked={formData.hydrationFood}
                onCheckedChange={(checked) => handleInputChange('hydrationFood', checked)}
              />
              <Label htmlFor="hydrationFood">Hidratação e alimentação leve</Label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">👶 Durante o Parto</h3>
            
            <div>
              <Label>Tipo de Parto</Label>
              <RadioGroup value={formData.deliveryType} onValueChange={(value) => handleInputChange('deliveryType', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="natural" id="natural-birth" />
                  <Label htmlFor="natural-birth">Parto normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cesarean" id="cesarean" />
                  <Label htmlFor="cesarean">Cesariana programada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">A decidir conforme evolução</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Episiotomia</Label>
              <RadioGroup value={formData.episiotomy} onValueChange={(value) => handleInputChange('episiotomy', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="if-necessary" id="if-necessary" />
                  <Label htmlFor="if-necessary">Somente se necessário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avoid" id="avoid" />
                  <Label htmlFor="avoid">Evitar ao máximo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medical" id="medical" />
                  <Label htmlFor="medical">Conforme orientação médica</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Cordão Umbilical</Label>
              <RadioGroup value={formData.umbilicalCord} onValueChange={(value) => handleInputChange('umbilicalCord', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delayed" id="delayed" />
                  <Label htmlFor="delayed">Clampeamento tardio (aguardar parar de pulsar)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate">Clampeamento imediato</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="skinToSkin"
                checked={formData.skinToSkin}
                onCheckedChange={(checked) => handleInputChange('skinToSkin', checked)}
              />
              <Label htmlFor="skinToSkin">Contato pele a pele imediato com o bebê</Label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🍼 Pós-Parto</h3>
            
            <div>
              <Label>Amamentação</Label>
              <RadioGroup value={formData.breastfeeding} onValueChange={(value) => handleInputChange('breastfeeding', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate-bf" />
                  <Label htmlFor="immediate-bf">Imediatamente após o parto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="when-ready" id="when-ready" />
                  <Label htmlFor="when-ready">Quando estiver pronta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guidance" id="guidance" />
                  <Label htmlFor="guidance">Conforme orientação</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Banho do Bebê</Label>
              <RadioGroup value={formData.babyBath} onValueChange={(value) => handleInputChange('babyBath', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delayed" id="delayed-bath" />
                  <Label htmlFor="delayed-bath">Adiar por algumas horas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate-bath" />
                  <Label htmlFor="immediate-bath">Imediatamente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="routine" id="routine" />
                  <Label htmlFor="routine">Conforme rotina do hospital</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="companionPresence"
                checked={formData.companionPresence}
                onCheckedChange={(checked) => handleInputChange('companionPresence', checked)}
              />
              <Label htmlFor="companionPresence">Presença de acompanhante no pós-parto</Label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">✨ Solicitações Especiais</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="photos"
                checked={formData.photos}
                onCheckedChange={(checked) => handleInputChange('photos', checked)}
              />
              <Label htmlFor="photos">Fotografias/vídeos permitidos</Label>
            </div>

            <div>
              <Label htmlFor="religiousCultural">Crenças Religiosas/Culturais</Label>
              <Textarea
                id="religiousCultural"
                value={formData.religiousCultural}
                onChange={(e) => {
                  e.stopPropagation();
                  handleInputChange('religiousCultural', e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  // Prevenir submit acidental ao pressionar Enter
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onFocus={(e) => {
                  e.stopPropagation();
                  console.log("📝 Textarea religiousCultural focado");
                }}
                onBlur={(e) => {
                  e.stopPropagation();
                  console.log("📝 Textarea religiousCultural perdeu foco");
                  // IMPORTANTE: Não fazer nada no onBlur que possa disparar submit
                }}
                placeholder="Descreva práticas religiosas ou culturais que deseja incluir..."
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                rows={3}
                autoFocus={false}
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Outras Solicitações</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => {
                  e.stopPropagation();
                  handleInputChange('specialRequests', e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  // Prevenir submit acidental ao pressionar Enter
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onFocus={(e) => {
                  e.stopPropagation();
                  console.log("📝 Textarea specialRequests focado");
                }}
                onBlur={(e) => {
                  e.stopPropagation();
                  console.log("📝 Textarea specialRequests perdeu foco");
                  // IMPORTANTE: Não fazer nada no onBlur que possa disparar submit
                }}
                placeholder="Qualquer outra informação importante para sua equipe médica..."
                className="border-pink-200 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                rows={4}
                autoFocus={false}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-24 sm:pb-20">
        <div className="container mx-auto px-4 py-4">
          {/* Header com botão voltar e título centralizado */}
          <div className="flex items-center justify-center mb-10 relative">
            {/* Botão voltar - posição absoluta à esquerda */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
              onClick={() => {
                if (viewMode === 'list') {
                  window.history.back();
                } else {
                  protectedSetViewMode('list', 'botão voltar');
                  setCurrentStep(1);
                }
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Título centralizado */}
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Plano de Parto
              </h1>
              <p className="text-sm text-gray-600">
                {viewMode === 'list' ? 'Gerencie seu plano' : viewMode === 'create' ? 'Criar novo plano' : 'Editar plano'}
              </p>
            </div>
            
          </div>

          {/* Conditional rendering based on viewMode */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {birthPlan ? (
                <Card className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-pink-500" />
                      <CardTitle className="text-xl font-bold text-gray-800">Meu Plano de Parto</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={downloadPDF}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEdit}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        Local do Parto
                      </h3>
                      <p className="text-gray-600 pl-6">{birthPlan.location}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        Acompanhantes
                      </h3>
                      <p className="text-gray-600 pl-6">{birthPlan.companions || 'Não especificado'}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Alívio da Dor
                      </h3>
                      <div className="pl-6 space-y-1">
                        {birthPlan.painReliefNatural && (
                          <p className="text-gray-600">✓ Métodos naturais</p>
                        )}
                        {birthPlan.painReliefEpidural && (
                          <p className="text-gray-600">✓ Anestesia epidural</p>
                        )}
                        {birthPlan.painReliefOther && (
                          <p className="text-gray-600">✓ {birthPlan.painReliefOther}</p>
                        )}
                      </div>
                    </div>

                    {birthPlan.specialRequests && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700">Solicitações Especiais</h3>
                        <p className="text-gray-600 pl-6">{birthPlan.specialRequests}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 pt-4 border-t">
                      Criado em: {birthPlan.createdAt 
                        ? new Date(birthPlan.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : 'Data não disponível'}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                    <FileText className="w-16 h-16 text-gray-300" />
                    <p className="text-gray-500 text-center">
                      Você ainda não criou seu plano de parto.
                    </p>
                    <Button
                      onClick={() => {
                        resetForm();
                        setViewMode('create');
                      }}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Plano de Parto
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {(viewMode === 'create' || viewMode === 'edit') && (
            <div 
              className="space-y-6"
              onClick={(e) => {
                // Prevenir qualquer clique que possa fechar o formulário
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                // Prevenir ESC na etapa 7 para evitar fechamento acidental
                if (e.key === 'Escape' && currentStep === 7) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("⚠️ ESC bloqueado na etapa 7 para evitar fechamento acidental");
                }
              }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardHeader className="relative">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                    {viewMode === 'create' ? 'Criar Plano de Parto' : 'Editar Plano de Parto'}
                  </CardTitle>
                  {/* Botão Concluir como ícone no canto superior direito */}
                  {currentStep < totalSteps && (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("✅ Botão Concluir clicado explicitamente");
                        handleConclude();
                      }}
                      disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                      className="absolute top-4 right-4 h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg flex items-center justify-center p-0"
                      title="Concluir"
                    >
                      {(createPlanMutation.isPending || updatePlanMutation.isPending) ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Check className="w-5 h-5 text-white" />
                      )}
                    </Button>
                  )}
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-600">
                      Etapa {currentStep} de {totalSteps}
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 w-8 rounded-full ${
                            index + 1 <= currentStep
                              ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={(e) => {
                      console.log("📋 Form onSubmit disparado - currentStep:", currentStep, "isStep7Ref:", isStep7Ref.current);
                      console.trace("📋 Stack trace do onSubmit:");
                      
                      // PROTEÇÃO CRÍTICA: Bloquear qualquer submit que não seja explícito
                      const submitter = (e.nativeEvent as SubmitEvent).submitter;
                      console.log("📋 Form onSubmit - currentStep:", currentStep);
                      console.log("📋 Submitter:", submitter);
                      console.log("📋 Submitter type:", submitter?.getAttribute('type'));
                      console.log("📋 Submitter data-explicit-submit:", submitter?.getAttribute('data-explicit-submit'));
                      console.log("📋 Submitter tagName:", submitter?.tagName);
                      console.log("📋 Submitter textContent:", submitter?.textContent);
                      
                      // BLOQUEAR TODOS os submits que não sejam da etapa 7 com botão "Salvar Plano"
                      // O botão "Concluir" não deve submeter o form, ele chama handleConclude diretamente
                      if (currentStep !== 7) {
                        console.error("🚫🚫🚫 SUBMIT BLOQUEADO - não está na etapa 7!");
                        console.error("🚫 currentStep:", currentStep);
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      
                      // PROTEÇÃO CRÍTICA: Na etapa 7, só permitir submit se foi clicado explicitamente no botão "Salvar Plano"
                      // Verificar se o submitter é o botão correto com data-explicit-submit="true"
                      const isExplicitSubmit = submitter && submitter.getAttribute('data-explicit-submit') === 'true';
                      
                      if (!isExplicitSubmit) {
                        console.error("🚫🚫🚫 SUBMIT DO FORM BLOQUEADO na etapa 7 - não foi clicado no botão 'Salvar Plano'!");
                        console.error("🚫 submitter:", submitter);
                        console.error("🚫 isExplicitSubmit:", isExplicitSubmit);
                        e.preventDefault();
                        e.stopPropagation();
                        toast({
                          title: "⚠️ Atenção",
                          description: "Clique no botão 'Salvar Plano' para salvar.",
                          variant: "default",
                        });
                        return;
                      }
                      
                      console.log("✅ Submit do form permitido na etapa 7 - botão 'Salvar Plano' clicado corretamente");
                      handleSubmit(e);
                    }}
                    onKeyDown={(e) => {
                      // Prevenir submit acidental ao pressionar Enter em qualquer lugar do form
                      if (e.key === 'Enter' && e.target instanceof HTMLTextAreaElement) {
                        // Permitir Enter em textareas (Shift+Enter para nova linha)
                        return;
                      }
                      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("⚠️ Enter bloqueado - não é botão");
                      }
                    }}
                    onClick={(e) => {
                      // Prevenir qualquer ação que possa fechar o formulário
                      e.stopPropagation();
                    }}
                    className="space-y-6"
                  >
                    {renderStep()}

                    <div className="flex gap-3 pt-6 border-t">
                      {currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          className="flex-1"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Anterior
                        </Button>
                      )}

                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                          Próximo
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : null}

                      {currentStep === totalSteps && (
                        <Button
                          type="submit"
                          disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                          data-explicit-submit="true"
                          onClick={(e) => { 
                            console.log("✅ Botão Salvar clicado na etapa 7");
                            // Ativar allowCloseRef para permitir fechar após salvar
                            allowCloseRef.current = true;
                            e.stopPropagation(); 
                          }}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
                        >
                          {(createPlanMutation.isPending || updatePlanMutation.isPending) 
                            ? 'Salvando...' 
                            : viewMode === 'edit' ? 'Atualizar Plano' : 'Salvar Plano'}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <BottomNavigation />
      </div>

      {/* Dialog de confirmação de exclusão */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                Confirmar Exclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 text-center">
                Tem certeza que deseja excluir este plano de parto?
              </p>
              <p className="text-sm text-gray-500 text-center">
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1"
                  disabled={deletePlanMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deletePlanMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                >
                  {deletePlanMutation.isPending ? 'Excluindo...' : 'Sim, Excluir'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AnimatedBackground>
  );
}
