import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateBirthPlanPDF } from "@/lib/pdf-generator";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Building, 
  Heart, 
  Users, 
  Music, 
  Camera,
  Baby,
  Sparkles,
  Save,
  Eye,
  Home,
  Shield,
  Volume2,
  Moon,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Edit,
  Trash2,
  Calendar
} from "lucide-react";
import BottomNavigation from "@/components/layout/bottom-navigation";

interface BirthPlan {
  id: string;
  pregnancyId?: string;
  location?: string;
  painRelief?: string[] | any;
  companions?: string[] | string;
  specialRequests?: string;
  preferences?: any;
  createdAt?: string;
  updatedAt?: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function BirthPlan() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlan, setSelectedPlan] = useState<BirthPlan | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Informações Básicas
    location: "",
    birthType: "",
    hospital: "",
    doctor: "",
    doula: "",
    
    // Alívio da Dor
    painRelief: {
      natural: false,
      epidural: false,
      nitrous: false,
      massage: false,
      hydrotherapy: false,
      other: "",
    },
    
    // Ambiente
    environment: {
      lighting: "",
      music: false,
      photography: false,
      visitors: "",
      privacy: "",
    },
    
    // Acompanhantes
    companions: "",
    supportTeam: "",
    
    // Nascimento
    birthPreferences: {
      position: "",
      cutting: "",
      delayed: false,
      skinToSkin: false,
      breastfeeding: false,
    },
    
    // Pós-parto
    postBirth: {
      rooming: false,
      feeding: "",
      circumcision: false,
      vitamins: false,
    },
    
    specialRequests: "",
    emergencyPreferences: "",
  });

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar planos de parto existentes
  // Define interface para dados da API
  interface BirthPlanApiResponse {
    birthPlan?: {
      id: string;
      location?: string;
      painRelief?: {
        natural?: boolean;
        epidural?: boolean;
        other?: string;
      };
      companions?: string;
      specialRequests?: string;
      preferences?: any;
    };
  }

  const { data: birthPlansData, isLoading: isLoadingPlans } = useQuery<BirthPlanApiResponse>({
    queryKey: ["/api/birth-plans", pregnancy?.id],
    enabled: !!pregnancy?.id,
  });

  // Mutation para criar plano de parto
  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return apiRequest("POST", "/api/birth-plans", { ...planData, pregnancyId: pregnancy?.id });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Plano de parto criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birth-plans"] });
      setViewMode('list');
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar plano de parto.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar plano de parto
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/birth-plans/${id}`, { ...data, pregnancyId: pregnancy?.id });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Plano de parto atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birth-plans"] });
      setViewMode('list');
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano de parto.",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir plano de parto
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/birth-plans/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Plano de parto excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/birth-plans"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir plano de parto.",
        variant: "destructive",
      });
    },
  });

  // Resetar formulário
  const resetForm = () => {
    setActiveStep(0); // Resetar para o primeiro passo
    setFormData({
      location: "",
      birthType: "",
      hospital: "",
      doctor: "",
      doula: "",
      painRelief: {
        natural: false,
        epidural: false,
        nitrous: false,
        massage: false,
        hydrotherapy: false,
        other: "",
      },
      environment: {
        lighting: "",
        music: false,
        photography: false,
        visitors: "",
        privacy: "",
      },
      companions: "",
      supportTeam: "",
      birthPreferences: {
        position: "",
        cutting: "",
        delayed: false,
        skinToSkin: false,
        breastfeeding: false,
      },
      postBirth: {
        rooming: false,
        feeding: "",
        circumcision: false,
        vitamins: false,
      },
      specialRequests: "",
      emergencyPreferences: "",
    });
    setActiveStep(0);
    setSelectedPlan(null);
  };

  // Carregar dados do plano selecionado
  const loadPlanData = (plan: BirthPlan) => {
    if (plan.preferences) {
      setFormData({
        location: plan.location || "",
        birthType: plan.preferences.birthType || "",
        hospital: plan.preferences.hospital || "",
        doctor: plan.preferences.doctor || "",
        doula: plan.preferences.doula || "",
        painRelief: plan.preferences.painRelief || {
          natural: false,
          epidural: false,
          nitrous: false,
          massage: false,
          hydrotherapy: false,
          other: "",
        },
        environment: plan.preferences.environment || {
          lighting: "",
          music: false,
          photography: false,
          visitors: "",
          privacy: "",
        },
        companions: Array.isArray(plan.companions) ? plan.companions.join(", ") : (plan.companions || ""),
        supportTeam: plan.preferences.supportTeam || "",
        birthPreferences: plan.preferences.birthPreferences || {
          position: "",
          cutting: "",
          delayed: false,
          skinToSkin: false,
          breastfeeding: false,
        },
        postBirth: plan.preferences.postBirth || {
          rooming: false,
          feeding: "",
          circumcision: false,
          vitamins: false,
        },
        specialRequests: plan.specialRequests || "",
        emergencyPreferences: plan.preferences.emergencyPreferences || "",
      });
    }
    setSelectedPlan(plan);
  };

  // Passos do formulário
  const steps = [
    {
      title: "Informações Básicas",
      icon: Building,
      fields: ["location", "birthType", "hospital", "doctor"]
    },
    {
      title: "Alívio da Dor",
      icon: Heart,
      fields: ["painRelief"]
    },
    {
      title: "Ambiente",
      icon: Home,
      fields: ["environment"]
    },
    {
      title: "Acompanhantes",
      icon: Users,
      fields: ["companions", "supportTeam"]
    },
    {
      title: "Nascimento",
      icon: Baby,
      fields: ["birthPreferences"]
    },
    {
      title: "Pós-parto",
      icon: Shield,
      fields: ["postBirth", "specialRequests", "emergencyPreferences"]
    }
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as object),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    const planData = {
      location: formData.location,
      painRelief: Object.keys(formData.painRelief).filter(key => 
        formData.painRelief[key as keyof typeof formData.painRelief] === true
      ),
      companions: formData.companions,
      specialRequests: formData.specialRequests,
      preferences: {
        birthType: formData.birthType,
        hospital: formData.hospital,
        doctor: formData.doctor,
        doula: formData.doula,
        painRelief: formData.painRelief,
        environment: formData.environment,
        supportTeam: formData.supportTeam,
        birthPreferences: formData.birthPreferences,
        postBirth: formData.postBirth,
        emergencyPreferences: formData.emergencyPreferences,
      }
    };

    if (viewMode === 'edit' && selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan.id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleGeneratePDF = async (plan: BirthPlan) => {
    try {
      // Buscar dados da usuária
      const userResponse = await fetch('/api/auth/me');
      const userData = userResponse.ok ? await userResponse.json() : null;
      const motherName = userData?.name || "Futura Mamãe";
      
      // Adaptar os dados do plano para o formato esperado pelo PDF
      const pdfData = {
        motherName: motherName,
        dueDate: "2026-05-30", // Data padrão da gravidez
        location: plan.location || "Não especificado",
        birthType: plan.preferences?.birthType || "Normal",
        hospital: plan.preferences?.hospital || "Não especificado",
        doctor: plan.preferences?.doctor || "Não especificado",
        doula: plan.preferences?.doula || "Não especificado",
        painRelief: plan.preferences?.painRelief || {
          natural: true,
          epidural: false,
          nitrous: false,
          massage: false,
          hydrotherapy: false,
          other: ""
        },
        environment: plan.preferences?.environment || {
          lighting: "Natural",
          music: false,
          aromatherapy: false,
          personalItems: "",
          photography: false,
          videography: false
        },
        companions: Array.isArray(plan.companions) ? plan.companions.join(", ") : (plan.companions || "Não especificado"),
        supportTeam: plan.preferences?.supportTeam || {
          partner: true,
          mother: false,
          doula: false,
          other: ""
        },
        birthPreferences: plan.preferences?.birthPreferences || {
          position: "Natural",
          skinToSkin: true,
          cordClamping: "Após parar de pulsar",
          placentaDelivery: "Natural"
        },
        postBirth: plan.preferences?.postBirth || {
          breastfeeding: true,
          rooming: true,
          eyeOintment: false,
          vitaminK: true
        },
        specialRequests: plan.specialRequests || "",
        emergencyPreferences: plan.preferences?.emergencyPreferences || "",
        preferences: plan.preferences || {}
      };
      
      await generateBirthPlanPDF(pdfData);
      toast({
        title: "PDF Gerado!",
        description: "Seu plano de parto foi baixado em PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do plano de parto.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Lista de planos de parto
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planos de Parto</h1>
                <p className="text-gray-600">Gerencie seus planos de parto</p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setActiveStep(0); // Começar do primeiro passo
                setViewMode('create');
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              data-testid="button-create-plan"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </div>

          {/* Lista de planos */}
          <div className="space-y-4">
            {birthPlansData?.birthPlan ? (
              <Card className="border-pink-200/30 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-pink-600 mr-2" />
                      <div>
                        <CardTitle className="text-lg text-pink-700">
                          Plano de Parto Principal
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Local: {birthPlansData?.birthPlan?.location || "Não especificado"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {birthPlansData?.birthPlan?.painRelief && typeof birthPlansData.birthPlan.painRelief === 'object' && (
                        <>
                          {(birthPlansData.birthPlan.painRelief as any).natural && (
                            <Badge variant="outline" className="text-xs">
                              Natural
                            </Badge>
                          )}
                          {(birthPlansData.birthPlan.painRelief as any).epidural && (
                            <Badge variant="outline" className="text-xs">
                              Epidural
                            </Badge>
                          )}
                          {(birthPlansData.birthPlan.painRelief as any).other && (
                            <Badge variant="outline" className="text-xs">
                              {(birthPlansData.birthPlan.painRelief as any).other}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (birthPlansData?.birthPlan) {
                            loadPlanData(birthPlansData.birthPlan as BirthPlan);
                            setViewMode('view');
                          }
                        }}
                        data-testid="button-view-plan"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (birthPlansData?.birthPlan) {
                            loadPlanData(birthPlansData.birthPlan as BirthPlan);
                            setActiveStep(0); // Sempre começar do primeiro passo
                            setViewMode('edit');
                          }
                        }}
                        data-testid="button-edit-plan"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => birthPlansData?.birthPlan && handleGeneratePDF(birthPlansData.birthPlan as BirthPlan)}
                        data-testid="button-download-plan"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            data-testid="button-delete-plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Plano de Parto</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este plano de parto? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => birthPlansData?.birthPlan?.id && deletePlanMutation.mutate(birthPlansData.birthPlan.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-pink-200 bg-pink-50/30">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-pink-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhum plano de parto encontrado
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Crie seu primeiro plano de parto para se preparar para o nascimento do seu bebê.
                  </p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setActiveStep(0); // Começar do primeiro passo
                      setViewMode('create');
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Visualização do plano
  if (viewMode === 'view' && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className="mr-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plano de Parto</h1>
                <p className="text-gray-600">Visualizar detalhes</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('edit')}
                data-testid="button-edit"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                onClick={() => handleGeneratePDF(selectedPlan)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Conteúdo do plano */}
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Building className="w-5 h-5 mr-2" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Local do Parto</Label>
                    <p className="text-gray-900">{selectedPlan.location || "Não especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tipo de Parto</Label>
                    <p className="text-gray-900">{selectedPlan.preferences?.birthType || "Não especificado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Heart className="w-5 h-5 mr-2" />
                  Alívio da Dor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.painRelief && Array.isArray(selectedPlan.painRelief) && selectedPlan.painRelief.length > 0 && (
                    selectedPlan.painRelief.map((relief: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-pink-100 text-pink-700">
                        {relief}
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Users className="w-5 h-5 mr-2" />
                  Acompanhantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.companions && (
                    <Badge variant="outline">
                      {selectedPlan.companions}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedPlan.specialRequests && (
              <Card className="border-pink-200/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-pink-700">
                    <Shield className="w-5 h-5 mr-2" />
                    Solicitações Especiais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900">{selectedPlan.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Formulário de criação/edição
  const renderStepContent = () => {
    const currentStep = steps[activeStep];
    
    switch (activeStep) {
      case 0: // Informações Básicas
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Building className="w-5 h-5 mr-2" />
                  Onde seu bebê vai nascer?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Local do Parto
                  </Label>
                  <Select value={formData.location} onValueChange={(value) => updateFormData("location", value)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="casa">Casa de Parto</SelectItem>
                      <SelectItem value="domicilio">Domicílio</SelectItem>
                      <SelectItem value="centro">Centro de Parto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birthType" className="text-sm font-medium text-gray-700">
                    Tipo de Parto Preferido
                  </Label>
                  <RadioGroup 
                    value={formData.birthType} 
                    onValueChange={(value) => updateFormData("birthType", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal">Parto Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cesariana" id="cesariana" />
                      <Label htmlFor="cesariana">Cesariana</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="forceps" id="forceps" />
                      <Label htmlFor="forceps">Fórceps</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="hospital" className="text-sm font-medium text-gray-700">
                    Hospital/Clínica
                  </Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => updateFormData("hospital", e.target.value)}
                    placeholder="Nome do hospital ou clínica"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="doctor" className="text-sm font-medium text-gray-700">
                    Médico(a) Obstetra
                  </Label>
                  <Input
                    id="doctor"
                    value={formData.doctor}
                    onChange={(e) => updateFormData("doctor", e.target.value)}
                    placeholder="Nome do médico obstetra"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1: // Alívio da Dor
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Heart className="w-5 h-5 mr-2" />
                  Métodos de Alívio da Dor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="natural"
                      checked={formData.painRelief.natural}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "natural", checked)
                      }
                    />
                    <Label htmlFor="natural">Métodos Naturais</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="epidural"
                      checked={formData.painRelief.epidural}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "epidural", checked)
                      }
                    />
                    <Label htmlFor="epidural">Anestesia Epidural</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nitrous"
                      checked={formData.painRelief.nitrous}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "nitrous", checked)
                      }
                    />
                    <Label htmlFor="nitrous">Óxido Nitroso</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="massage"
                      checked={formData.painRelief.massage}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "massage", checked)
                      }
                    />
                    <Label htmlFor="massage">Massagem</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hydrotherapy"
                      checked={formData.painRelief.hydrotherapy}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "hydrotherapy", checked)
                      }
                    />
                    <Label htmlFor="hydrotherapy">Hidroterapia</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="painOther" className="text-sm font-medium text-gray-700">
                    Outros Métodos
                  </Label>
                  <Textarea
                    id="painOther"
                    value={formData.painRelief.other}
                    onChange={(e) => updateNestedFormData("painRelief", "other", e.target.value)}
                    placeholder="Descreva outros métodos de alívio da dor..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Ambiente
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Home className="w-5 h-5 mr-2" />
                  Ambiente de Parto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="lighting" className="text-sm font-medium text-gray-700">
                    Iluminação Preferida
                  </Label>
                  <Select 
                    value={formData.environment.lighting} 
                    onValueChange={(value) => updateNestedFormData("environment", "lighting", value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Selecione a iluminação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dim">Luz Baixa</SelectItem>
                      <SelectItem value="natural">Luz Natural</SelectItem>
                      <SelectItem value="bright">Luz Clara</SelectItem>
                      <SelectItem value="candles">Velas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="music"
                    checked={formData.environment.music}
                    onCheckedChange={(checked) => 
                      updateNestedFormData("environment", "music", checked)
                    }
                  />
                  <Label htmlFor="music">Permitir Música</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="photography"
                    checked={formData.environment.photography}
                    onCheckedChange={(checked) => 
                      updateNestedFormData("environment", "photography", checked)
                    }
                  />
                  <Label htmlFor="photography">Permitir Fotografia</Label>
                </div>

                <div>
                  <Label htmlFor="visitors" className="text-sm font-medium text-gray-700">
                    Política de Visitantes
                  </Label>
                  <Textarea
                    id="visitors"
                    value={formData.environment.visitors}
                    onChange={(e) => updateNestedFormData("environment", "visitors", e.target.value)}
                    placeholder="Descreva suas preferências sobre visitantes..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3: // Acompanhantes
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Users className="w-5 h-5 mr-2" />
                  Quem estará com você?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companions" className="text-sm font-medium text-gray-700">
                    Acompanhantes (separados por vírgula)
                  </Label>
                  <Input
                    id="companions"
                    value={formData.companions}
                    onChange={(e) => updateFormData("companions", e.target.value)}
                    placeholder="Ex: Esposo, Mãe, Doula"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="supportTeam" className="text-sm font-medium text-gray-700">
                    Equipe de Apoio
                  </Label>
                  <Textarea
                    id="supportTeam"
                    value={formData.supportTeam}
                    onChange={(e) => updateFormData("supportTeam", e.target.value)}
                    placeholder="Descreva sua equipe de apoio (doula, fisioterapeuta, etc.)"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4: // Nascimento
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Baby className="w-5 h-5 mr-2" />
                  Momento do Nascimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                    Posição para o Parto
                  </Label>
                  <Select 
                    value={formData.birthPreferences.position} 
                    onValueChange={(value) => updateNestedFormData("birthPreferences", "position", value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="squatting">Cócoras</SelectItem>
                      <SelectItem value="standing">Em pé</SelectItem>
                      <SelectItem value="side">De lado</SelectItem>
                      <SelectItem value="back">Deitada</SelectItem>
                      <SelectItem value="hands-knees">Quatro apoios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="delayed"
                      checked={formData.birthPreferences.delayed}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("birthPreferences", "delayed", checked)
                      }
                    />
                    <Label htmlFor="delayed">Clampeamento Tardio do Cordão</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skinToSkin"
                      checked={formData.birthPreferences.skinToSkin}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("birthPreferences", "skinToSkin", checked)
                      }
                    />
                    <Label htmlFor="skinToSkin">Contato Pele a Pele</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breastfeeding"
                      checked={formData.birthPreferences.breastfeeding}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("birthPreferences", "breastfeeding", checked)
                      }
                    />
                    <Label htmlFor="breastfeeding">Amamentação Imediata</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Pós-parto
        return (
          <div className="space-y-6">
            <Card className="border-pink-200/30">
              <CardHeader>
                <CardTitle className="flex items-center text-pink-700">
                  <Shield className="w-5 h-5 mr-2" />
                  Cuidados Pós-parto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rooming"
                      checked={formData.postBirth.rooming}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "rooming", checked)
                      }
                    />
                    <Label htmlFor="rooming">Alojamento Conjunto</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vitamins"
                      checked={formData.postBirth.vitamins}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "vitamins", checked)
                      }
                    />
                    <Label htmlFor="vitamins">Vitamina K para o Bebê</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="feeding" className="text-sm font-medium text-gray-700">
                    Preferências de Alimentação
                  </Label>
                  <RadioGroup 
                    value={formData.postBirth.feeding} 
                    onValueChange={(value) => updateNestedFormData("postBirth", "feeding", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="breast" id="breast" />
                      <Label htmlFor="breast">Somente Amamentação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="formula" id="formula" />
                      <Label htmlFor="formula">Fórmula</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Misto</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="text-sm font-medium text-gray-700">
                    Solicitações Especiais
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => updateFormData("specialRequests", e.target.value)}
                    placeholder="Descreva qualquer solicitação especial..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPreferences" className="text-sm font-medium text-gray-700">
                    Preferências em Emergência
                  </Label>
                  <Textarea
                    id="emergencyPreferences"
                    value={formData.emergencyPreferences}
                    onChange={(e) => updateFormData("emergencyPreferences", e.target.value)}
                    placeholder="Como você gostaria que as decisões de emergência fossem tomadas..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className="mr-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'edit' ? 'Editar Plano de Parto' : 'Novo Plano de Parto'}
              </h1>
              <p className="text-gray-600">
                {steps[activeStep].title} - Passo {activeStep + 1} de {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((activeStep + 1) / steps.length) * 100} className="w-full" />
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            {steps.map((step, index) => (
              <span key={index} className={index <= activeStep ? "text-pink-600 font-medium" : ""}>
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={activeStep === 0}
            data-testid="button-prev"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              onClick={handleSave}
              disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              data-testid="button-save"
            >
              {createPlanMutation.isPending || updatePlanMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {viewMode === 'edit' ? 'Atualizar Plano' : 'Salvar Plano'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              data-testid="button-next"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}