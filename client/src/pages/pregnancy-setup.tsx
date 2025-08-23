import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateDueDateFromLMP } from "@/lib/pregnancy-calculator";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Calendar, Baby, Heart, Camera, User } from "lucide-react";
import type { UploadResult } from "@uppy/core";

type SetupStep = "profile" | "type" | "date";

export default function PregnancySetup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>("profile");
  const [setupType, setSetupType] = useState<"dueDate" | "lmp" | null>(null);
  const [date, setDate] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { profilePhotoUrl?: string; birthDate: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", profileData);
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setCurrentStep("type");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createPregnancyMutation = useMutation({
    mutationFn: async (pregnancyData: any) => {
      console.log("Sending pregnancy data:", pregnancyData);
      const response = await apiRequest("POST", "/api/pregnancies", pregnancyData);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.details || errorData.error || "Failed to create pregnancy");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pregnancies/active"] });
      toast({
        title: "Sucesso!",
        description: "Sua gestação foi configurada com sucesso!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao configurar gestação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Erro",
        description: "Data de nascimento é obrigatória",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      profilePhotoUrl: profilePhoto || undefined,
      birthDate: birthDate,
    });
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/uploads/profile-photo", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setProfilePhoto(uploadedFile.uploadURL as string);
      toast({
        title: "Sucesso!",
        description: "Foto de perfil carregada com sucesso!",
      });
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      });
      return;
    }

    let dueDate: Date;
    let lmpDate: Date | null = null;

    if (setupType === "dueDate") {
      dueDate = new Date(date);
    } else {
      lmpDate = new Date(date);
      dueDate = new Date(calculateDueDateFromLMP(date));
    }

    createPregnancyMutation.mutate({
      dueDate: dueDate.toISOString(),
      lastMenstrualPeriod: lmpDate?.toISOString() || null,
      isActive: true,
    });
  };

  // Profile Setup Step
  if (currentStep === "profile") {
    const today = new Date().toISOString().split('T')[0];
    const maxBirthDate = new Date(Date.now() - (18 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 18 years ago

    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md glass-effect shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-charcoal flex items-center justify-center">
              <User className="mr-2 h-6 w-6 text-baby-pink-dark" />
              Seus Dados Pessoais
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Vamos começar com algumas informações sobre você
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6" data-testid="form-profile-setup">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profilePhoto || undefined} />
                  <AvatarFallback className="bg-baby-pink text-baby-pink-dark text-2xl">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {profilePhoto ? "Alterar Foto" : "Adicionar Foto de Perfil"}
                </ObjectUploader>
                <p className="text-xs text-gray-500 mt-2">Opcional - você pode adicionar depois</p>
              </div>

              <div>
                <Label className="text-charcoal font-medium mb-2 block">
                  Data de Nascimento *
                </Label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={maxBirthDate}
                  min="1940-01-01"
                  className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-birth-date"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                disabled={updateProfileMutation.isPending}
                data-testid="button-continue-profile"
              >
                {updateProfileMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                Continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Type Selection Step
  if (currentStep === "type") {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-baby-pink rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Baby className="w-10 h-10 text-baby-pink-dark" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2" data-testid="text-setup-title">Configurar Gestação</h1>
          <p className="text-gray-600" data-testid="text-setup-subtitle">Como você gostaria de calcular sua gestação?</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Card 
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 glass-effect shadow-lg"
            onClick={() => {setSetupType("dueDate"); setCurrentStep("date");}}
            data-testid="card-due-date"
          >
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-baby-pink-dark mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Data Prevista do Parto</h3>
              <p className="text-sm text-gray-600">Eu já sei a data prevista do meu bebê</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transform hover:scale-105 transition-all duration-200 glass-effect shadow-lg"
            onClick={() => {setSetupType("lmp"); setCurrentStep("date");}}
            data-testid="card-lmp"
          >
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-baby-blue-dark mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">Última Menstruação</h3>
              <p className="text-sm text-gray-600">Vou calcular baseado na DUM</p>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep("profile")}
            className="w-full mt-4"
            data-testid="button-back-to-profile"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Date Input Step
  const today = new Date().toISOString().split('T')[0];
  const maxDate = setupType === "dueDate" ? 
    new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
    today;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md glass-effect shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-charcoal flex items-center justify-center">
            <Baby className="mr-2 h-6 w-6 text-baby-pink-dark" />
            {setupType === "dueDate" ? "Data Prevista" : "Última Menstruação"}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {setupType === "dueDate" 
              ? "Quando seu bebê deve nascer?" 
              : "Qual foi o primeiro dia da sua última menstruação?"
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleDateSubmit} className="space-y-6" data-testid="form-pregnancy-setup">
            <div>
              <Label className="text-charcoal font-medium mb-2 block">
                {setupType === "dueDate" ? "Data prevista do parto *" : "Data da última menstruação *"}
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={maxDate}
                min={setupType === "lmp" ? 
                  new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
                  today
                }
                className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                data-testid="input-date"
                required
              />
              <p className="text-xs text-gray-500 mt-1">* Campo obrigatório</p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCurrentStep("type")}
                className="flex-1"
                data-testid="button-back"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                disabled={createPregnancyMutation.isPending}
                data-testid="button-continue"
              >
                {createPregnancyMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                Finalizar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
