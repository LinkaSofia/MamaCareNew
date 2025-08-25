import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
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
  Check
} from "lucide-react";

export default function BirthPlan() {
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
      aromatherapy: false,
      personalItems: "",
      photography: false,
      videography: false,
    },
    
    // Acompanhantes
    companions: "",
    supportTeam: {
      partner: true,
      mother: false,
      doula: false,
      other: "",
    },
    
    // Nascimento
    birthPreferences: {
      position: "",
      skinToSkin: true,
      cordClamping: "",
      placentaDelivery: "",
    },
    
    // Pós-parto
    postBirth: {
      breastfeeding: true,
      rooming: true,
      eyeOintment: true,
      vitaminK: true,
    },
    
    specialRequests: "",
    emergencyPreferences: "",
  });

  const { user } = useAuth();
  const { pregnancy } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: birthPlanData, isLoading } = useQuery({
    queryKey: ["/api/birth-plans", pregnancy?.id],
    enabled: !!pregnancy,
  });

  const saveBirthPlanMutation = useMutation({
    mutationFn: async (birthPlan: any) => {
      const response = await apiRequest("POST", "/api/birth-plans", {
        ...birthPlan,
        pregnancyId: pregnancy?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/birth-plans", pregnancy?.id] });
      toast({
        title: "✨ Plano de parto salvo!",
        description: "Suas preferências foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar plano de parto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveBirthPlanMutation.mutate(formData);
  };

  const handleGeneratePDF = () => {
    if (!user || !pregnancy) {
      toast({
        title: "Erro",
        description: "É necessário estar logado para gerar o PDF.",
        variant: "destructive",
      });
      return;
    }

    const pdfData = {
      motherName: user.name || "Futura Mamãe",
      partnerName: formData.supportTeam.other,
      dueDate: pregnancy.dueDate || "",
      ...formData,
      preferences: formData,
    };

    generateBirthPlanPDF(pdfData);
    
    toast({
      title: "📄 PDF gerado!",
      description: "Seu plano de parto foi baixado com sucesso.",
    });
  };

  const steps = [
    {
      title: "Informações Básicas",
      icon: Building,
      fields: ["location", "birthType", "hospital", "doctor", "doula"]
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

  // Load existing birth plan data
  useEffect(() => {
    if (birthPlanData?.birthPlan) {
      const plan = birthPlanData.birthPlan;
      setFormData(prev => ({
        ...prev,
        ...plan
      }));
    }
  }, [birthPlanData]);

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
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-blue-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
                  <Label htmlFor="birthType">Tipo de parto preferido</Label>
                  <Select value={formData.birthType} onValueChange={(value) => updateFormData("birthType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de parto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Parto Normal</SelectItem>
                      <SelectItem value="cesariana">Cesariana</SelectItem>
                      <SelectItem value="domiciliar">Parto Domiciliar</SelectItem>
                      <SelectItem value="agua">Parto na Água</SelectItem>
                      <SelectItem value="flexible">Flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hospital">Hospital/Maternidade</Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => updateFormData("hospital", e.target.value)}
                    placeholder="Nome do local onde pretende dar à luz"
                  />
                </div>

                <div>
                  <Label htmlFor="doctor">Médico/Obstetra</Label>
                  <Input
                    id="doctor"
                    value={formData.doctor}
                    onChange={(e) => updateFormData("doctor", e.target.value)}
                    placeholder="Nome do seu médico"
                  />
                </div>

                <div>
                  <Label htmlFor="doula">Doula (opcional)</Label>
                  <Input
                    id="doula"
                    value={formData.doula}
                    onChange={(e) => updateFormData("doula", e.target.value)}
                    placeholder="Nome da sua doula"
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
                  Como você gostaria de gerenciar a dor?
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
                    <Label htmlFor="natural" className="flex items-center">
                      🌿 Métodos naturais
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="epidural"
                      checked={formData.painRelief.epidural}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "epidural", checked)
                      }
                    />
                    <Label htmlFor="epidural" className="flex items-center">
                      💉 Anestesia epidural
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nitrous"
                      checked={formData.painRelief.nitrous}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "nitrous", checked)
                      }
                    />
                    <Label htmlFor="nitrous" className="flex items-center">
                      🫧 Óxido nitroso (gás)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="massage"
                      checked={formData.painRelief.massage}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "massage", checked)
                      }
                    />
                    <Label htmlFor="massage" className="flex items-center">
                      👐 Massagem
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hydrotherapy"
                      checked={formData.painRelief.hydrotherapy}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("painRelief", "hydrotherapy", checked)
                      }
                    />
                    <Label htmlFor="hydrotherapy" className="flex items-center">
                      🛁 Hidroterapia/banho
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="painReliefOther">Outros métodos</Label>
                  <Input
                    id="painReliefOther"
                    value={formData.painRelief.other}
                    onChange={(e) => updateNestedFormData("painRelief", "other", e.target.value)}
                    placeholder="Outros métodos de alívio da dor"
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
                  Como você quer que seja o ambiente?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Iluminação preferida</Label>
                  <RadioGroup
                    value={formData.environment.lighting}
                    onValueChange={(value) => updateNestedFormData("environment", "lighting", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dim" id="dim" />
                      <Label htmlFor="dim">🌙 Luz baixa/ambiente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="natural" id="natural" />
                      <Label htmlFor="natural">☀️ Luz natural</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bright" id="bright" />
                      <Label htmlFor="bright">💡 Luz normal</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="music"
                      checked={formData.environment.music}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("environment", "music", checked)
                      }
                    />
                    <Label htmlFor="music" className="flex items-center">
                      🎵 Música relaxante
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aromatherapy"
                      checked={formData.environment.aromatherapy}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("environment", "aromatherapy", checked)
                      }
                    />
                    <Label htmlFor="aromatherapy" className="flex items-center">
                      🌸 Aromaterapia
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="photography"
                      checked={formData.environment.photography}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("environment", "photography", checked)
                      }
                    />
                    <Label htmlFor="photography" className="flex items-center">
                      📸 Fotografias
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="videography"
                      checked={formData.environment.videography}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("environment", "videography", checked)
                      }
                    />
                    <Label htmlFor="videography" className="flex items-center">
                      🎬 Filmagem
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="personalItems">Itens pessoais importantes</Label>
                  <Textarea
                    id="personalItems"
                    value={formData.environment.personalItems}
                    onChange={(e) => updateNestedFormData("environment", "personalItems", e.target.value)}
                    placeholder="Ex: travesseiro, cobertor, objetos especiais..."
                    rows={3}
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
                  Quem você quer ao seu lado?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="partner"
                      checked={formData.supportTeam.partner}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("supportTeam", "partner", checked)
                      }
                    />
                    <Label htmlFor="partner" className="flex items-center">
                      💕 Parceiro(a)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mother"
                      checked={formData.supportTeam.mother}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("supportTeam", "mother", checked)
                      }
                    />
                    <Label htmlFor="mother" className="flex items-center">
                      👩 Minha mãe
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="doulaSupport"
                      checked={formData.supportTeam.doula}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("supportTeam", "doula", checked)
                      }
                    />
                    <Label htmlFor="doulaSupport" className="flex items-center">
                      🤱 Doula
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherSupport">Outros acompanhantes</Label>
                  <Input
                    id="otherSupport"
                    value={formData.supportTeam.other}
                    onChange={(e) => updateNestedFormData("supportTeam", "other", e.target.value)}
                    placeholder="Ex: irmã, amiga, sogra..."
                  />
                </div>

                <div>
                  <Label htmlFor="companions">Detalhes sobre acompanhantes</Label>
                  <Textarea
                    id="companions"
                    value={formData.companions}
                    onChange={(e) => updateFormData("companions", e.target.value)}
                    placeholder="Descreva como você gostaria que seus acompanhantes participassem..."
                    rows={3}
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
                  Momento do nascimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Posição preferida para dar à luz</Label>
                  <RadioGroup
                    value={formData.birthPreferences.position}
                    onValueChange={(value) => updateNestedFormData("birthPreferences", "position", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="squatting" id="squatting" />
                      <Label htmlFor="squatting">🏃‍♀️ Cócoras</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="side-lying" id="side-lying" />
                      <Label htmlFor="side-lying">🛌 Deitada de lado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standing" id="standing" />
                      <Label htmlFor="standing">🚶‍♀️ Em pé</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="back" id="back" />
                      <Label htmlFor="back">🛏️ Deitada de costas</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Clampeamento do cordão umbilical</Label>
                  <RadioGroup
                    value={formData.birthPreferences.cordClamping}
                    onValueChange={(value) => updateNestedFormData("birthPreferences", "cordClamping", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delayed" id="delayed" />
                      <Label htmlFor="delayed">⏰ Clampeamento tardio (recomendado)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate">⚡ Clampeamento imediato</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Dequitação da placenta</Label>
                  <RadioGroup
                    value={formData.birthPreferences.placentaDelivery}
                    onValueChange={(value) => updateNestedFormData("birthPreferences", "placentaDelivery", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="natural" id="natural-placenta" />
                      <Label htmlFor="natural-placenta">🌿 Dequitação natural</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="managed" id="managed" />
                      <Label htmlFor="managed">💉 Dequitação dirigida</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skinToSkin"
                    checked={formData.birthPreferences.skinToSkin}
                    onCheckedChange={(checked) => 
                      updateNestedFormData("birthPreferences", "skinToSkin", checked)
                    }
                  />
                  <Label htmlFor="skinToSkin" className="flex items-center">
                    🤱 Contato pele a pele imediato
                  </Label>
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
                  Após o nascimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="breastfeeding"
                      checked={formData.postBirth.breastfeeding}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "breastfeeding", checked)
                      }
                    />
                    <Label htmlFor="breastfeeding" className="flex items-center">
                      🤱 Amamentação imediata
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rooming"
                      checked={formData.postBirth.rooming}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "rooming", checked)
                      }
                    />
                    <Label htmlFor="rooming" className="flex items-center">
                      🏨 Alojamento conjunto
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="eyeOintment"
                      checked={formData.postBirth.eyeOintment}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "eyeOintment", checked)
                      }
                    />
                    <Label htmlFor="eyeOintment" className="flex items-center">
                      👁️ Pomada nos olhos
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vitaminK"
                      checked={formData.postBirth.vitaminK}
                      onCheckedChange={(checked) => 
                        updateNestedFormData("postBirth", "vitaminK", checked)
                      }
                    />
                    <Label htmlFor="vitaminK" className="flex items-center">
                      💉 Vitamina K
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Pedidos especiais</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => updateFormData("specialRequests", e.target.value)}
                    placeholder="Qualquer coisa especial que você gostaria que fosse considerada..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPreferences">Em caso de emergência</Label>
                  <Textarea
                    id="emergencyPreferences"
                    value={formData.emergencyPreferences}
                    onChange={(e) => updateFormData("emergencyPreferences", e.target.value)}
                    placeholder="Como você gostaria que emergências fossem tratadas..."
                    rows={3}
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400/20 to-blue-400/20 border-b border-pink-200/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                  <FileText className="w-8 h-8 text-pink-500 mr-3" />
                  Meu Plano de Parto
                </h1>
                <p className="text-gray-600">Planeje cada detalhe do nascimento do seu bebê</p>
              </div>
            </div>

            <Badge variant="secondary" className="bg-pink-100 text-pink-700 px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              Passo {activeStep + 1} de {steps.length}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {steps[activeStep].title}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((activeStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <Progress value={((activeStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${index === activeStep 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : index < activeStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {index < activeStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={activeStep === 0}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saveBirthPlanMutation.isPending}
              className="flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveBirthPlanMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>

            <Button
              variant="outline"
              onClick={handleGeneratePDF}
              className="flex items-center text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>

          <Button
            onClick={activeStep === steps.length - 1 ? handleSave : nextStep}
            disabled={activeStep === steps.length - 1 && saveBirthPlanMutation.isPending}
            className="flex items-center bg-pink-500 hover:bg-pink-600"
          >
            {activeStep === steps.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}