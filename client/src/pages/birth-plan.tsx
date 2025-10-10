import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Plus, FileText, Calendar, Edit, Trash2, Download, Eye, Heart, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  });

  const birthPlan = birthPlanData?.birthPlan;

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
      
      // Atualizar o cache IMEDIATAMENTE
      try {
        queryClient.setQueryData(['/api/birth-plans', pregnancy?.id], () => ({
          birthPlan: data.birthPlan
        }));
        console.log("📋 Cache updated immediately with new birth plan");
      } catch (error) {
        console.error("📋 Error updating cache:", error);
      }
      
      // Invalidar queries em background
      queryClient.invalidateQueries({ 
        queryKey: ['/api/birth-plans'],
        exact: false 
      });
      
      setViewMode('list');
      setCurrentStep(1);
      toast({
        title: "✅ Plano de Parto Salvo!",
        description: "Seu plano de parto foi criado com sucesso.",
      });
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
      // Atualizar cache
      queryClient.setQueryData(['/api/birth-plans', pregnancy?.id], () => ({
        birthPlan: data.birthPlan
      }));
      
      queryClient.invalidateQueries({ queryKey: ['/api/birth-plans'] });
      
      setViewMode('list');
      setCurrentStep(1);
      toast({
        title: "✅ Plano Atualizado!",
        description: "Seu plano de parto foi atualizado com sucesso.",
      });
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
      // Preencher formulário com dados existentes
      setFormData({
        location: birthPlan.location || '',
        companions: birthPlan.companions || '',
        doctorPreference: birthPlan.doctor_preference || '',
        lighting: birthPlan.lighting || 'dimmed',
        music: birthPlan.music || false,
        movement: birthPlan.movement || true,
        painReliefNatural: birthPlan.pain_relief_natural || false,
        painReliefEpidural: birthPlan.pain_relief_epidural || false,
        painReliefOther: birthPlan.pain_relief_other || '',
        laborPosition: birthPlan.labor_position || 'free',
        monitoring: birthPlan.monitoring || 'intermittent',
        hydrationFood: birthPlan.hydration_food || true,
        deliveryType: birthPlan.delivery_type || 'natural',
        episiotomy: birthPlan.episiotomy || 'if-necessary',
        umbilicalCord: birthPlan.umbilical_cord || 'delayed',
        skinToSkin: birthPlan.skin_to_skin || true,
        breastfeeding: birthPlan.breastfeeding || 'immediate',
        babyBath: birthPlan.baby_bath || 'delayed',
        companionPresence: birthPlan.companion_presence || true,
        photos: birthPlan.photos || true,
        religiousCultural: birthPlan.religious_cultural || '',
        specialRequests: birthPlan.special_requests || ''
      });
      setViewMode('edit');
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
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pregnancy?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma gravidez ativa encontrada.",
        variant: "destructive",
      });
      return;
    }

    // CORRIGIDO: enviar em camelCase, como o backend espera
    const planData = {
      pregnancyId: pregnancy.id,
      location: formData.location,
      companions: formData.companions,
      doctorPreference: formData.doctorPreference,
      lighting: formData.lighting,
      music: formData.music,
      movement: formData.movement,
      painReliefNatural: formData.painReliefNatural,
      painReliefEpidural: formData.painReliefEpidural,
      painReliefOther: formData.painReliefOther,
      laborPosition: formData.laborPosition,
      monitoring: formData.monitoring,
      hydrationFood: formData.hydrationFood,
      deliveryType: formData.deliveryType,
      episiotomy: formData.episiotomy,
      umbilicalCord: formData.umbilicalCord,
      skinToSkin: formData.skinToSkin,
      breastfeeding: formData.breastfeeding,
      babyBath: formData.babyBath,
      companionPresence: formData.companionPresence,
      photos: formData.photos,
      religiousCultural: formData.religiousCultural,
      specialRequests: formData.specialRequests
    };

    if (viewMode === 'edit' && birthPlan) {
      updatePlanMutation.mutate(planData);
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const downloadPDF = async () => {
    if (!birthPlan) return;
    
    // Importar html2pdf dinamicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plano de Parto - MamaCare</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
        <style>
          @page { 
            margin: 0; 
            size: A4;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.8;
            color: #4a5568;
            background: #ffffff;
            position: relative;
            overflow: hidden;
          }
          
          /* Fundo com corações decorativos - REMOVIDOS PARA PDF LIMPO */
          
          .container {
            position: relative;
            z-index: 1;
            max-width: 750px;
            margin: 0 auto;
            padding: 40px;
            background: #ffffff;
            min-height: 100vh;
          }
          
          .header {
            text-align: center;
            padding-bottom: 30px;
            margin-bottom: 40px;
            border-bottom: 3px solid #ec4899;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .logo-icon {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #ec4899;
          }
          
          .logo-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .logo-text {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: #ec4899;
          }
          
          .header h1 {
            font-family: 'Playfair Display', serif;
            color: #1f2937;
            font-size: 32px;
            margin: 15px 0 10px 0;
            font-weight: 700;
          }
          
          .header-subtitle {
            color: #9ca3af;
            font-size: 14px;
            font-weight: 300;
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
            <div class="logo-container">
              <div class="logo-icon">
                <img src="${logoImage}" alt="MamaCare Logo" />
              </div>
              <div class="logo-text">MamaCare</div>
            </div>
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
    
    // Gerar e baixar o PDF (SEM ABRIR NOVA JANELA)
    try {
      // Adicionar elemento temporariamente ao DOM (necessário para renderização)
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);
      
      // Gerar PDF e forçar download direto
      await html2pdf().set(options).from(element).save();
      
      // Remover elemento temporário
      document.body.removeChild(element);
      
      toast({
        title: "✅ PDF Baixado!",
        description: "Seu plano de parto foi salvo com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Limpar elemento se houver erro
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
      toast({
        title: "Erro",
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
              />
            </div>

            <div>
              <Label htmlFor="doctorPreference">Médico de Preferência</Label>
              <Input
                id="doctorPreference"
                value={formData.doctorPreference}
                onChange={(e) => handleInputChange('doctorPreference', e.target.value)}
                placeholder="Nome do médico obstetra"
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
                onChange={(e) => handleInputChange('religiousCultural', e.target.value)}
                placeholder="Descreva práticas religiosas ou culturais que deseja incluir..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="specialRequests">Outras Solicitações</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Qualquer outra informação importante para sua equipe médica..."
                rows={4}
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
      <div className="min-h-screen pb-20">
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
                  setViewMode('list');
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
            
            {/* Botão adicionar - posição absoluta à direita */}
            {viewMode === 'list' && !birthPlan && (
              <Button
                onClick={() => {
                  resetForm();
                  setViewMode('create');
                }}
                className="absolute right-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg hover:from-purple-600 hover:to-pink-600"
                data-testid="button-create-plan"
              >
                <Plus className="w-5 h-5 text-white" />
              </Button>
            )}
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
                        {birthPlan.pain_relief_natural && (
                          <p className="text-gray-600">✓ Métodos naturais</p>
                        )}
                        {birthPlan.pain_relief_epidural && (
                          <p className="text-gray-600">✓ Anestesia epidural</p>
                        )}
                        {birthPlan.pain_relief_other && (
                          <p className="text-gray-600">✓ {birthPlan.pain_relief_other}</p>
                        )}
                      </div>
                    </div>

                    {birthPlan.special_requests && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700">Solicitações Especiais</h3>
                        <p className="text-gray-600 pl-6">{birthPlan.special_requests}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 pt-4 border-t">
                      Criado em: {new Date(birthPlan.created_at).toLocaleDateString('pt-BR')}
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
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
                    {viewMode === 'create' ? 'Criar Plano de Parto' : 'Editar Plano de Parto'}
                  </CardTitle>
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
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                      ) : (
                        <Button
                          type="submit"
                          disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
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
