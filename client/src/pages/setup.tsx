import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ArrowLeft, Camera, User, Heart } from "lucide-react";
import type { UploadResult } from "@uppy/core";

export default function Setup() {
  const [, setLocation] = useLocation();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { profilePhotoUrl?: string }) => {
      const response = await apiRequest("PATCH", "/api/auth/profile", profileData);
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/uploads/profile-photo", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      setProfilePhoto(uploadedFile.uploadURL as string);
      toast({
        title: "Sucesso!",
        description: "Foto de perfil carregada com sucesso!",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      profilePhotoUrl: profilePhoto || undefined,
    });
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gradient-bg">
      <Card className="w-full max-w-md glass-effect shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/pregnancy-setup")}
              className="text-gray-600 hover:text-gray-800"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl font-bold text-charcoal flex-1">
              Seus Dados Pessoais
            </CardTitle>
            <div className="w-10" /> {/* Spacer para centralizar título */}
          </div>
          <p className="text-gray-600 mt-2">
            Vamos começar com algumas informações sobre você
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-profile-setup">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-6">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="bg-baby-pink text-baby-pink-dark text-4xl">
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>
              
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5242880} // 5MB
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full mb-4"
              >
                <Camera className="mr-2 h-4 w-4" />
                {profilePhoto ? "Alterar Foto" : "Adicionar Foto de Perfil"}
              </ObjectUploader>
              <p className="text-xs text-gray-500">Opcional - você pode adicionar depois</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                data-testid="button-skip"
              >
                Pular
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                disabled={updateProfileMutation.isPending}
                data-testid="button-continue"
              >
                <Heart className="mr-2 h-4 w-4" />
                Continuar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}