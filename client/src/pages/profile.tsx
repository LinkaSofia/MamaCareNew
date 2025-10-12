import { useState } from "react";
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useRef } from "react";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Save, 
  Calendar,
  Mail,
  Edit2,
  Upload
} from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { pregnancy, isLoading: pregnancyLoading } = usePregnancy();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhotoUrl || "");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
    lastMenstrualPeriod: pregnancy?.lastMenstrualPeriod ? 
      new Date(pregnancy.lastMenstrualPeriod).toISOString().split('T')[0] : ""
  });

  // Atualizar formData e profilePhoto quando user ou pregnancy mudarem
  React.useEffect(() => {
    if (user) {
      console.log("👤 User data changed, updating profilePhoto:", user.profilePhotoUrl?.substring(0, 100));
      setProfilePhoto(user.profilePhotoUrl || "");
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ""
      }));
    }
  }, [user]);

  React.useEffect(() => {
    if (pregnancy?.lastMenstrualPeriod) {
      setFormData(prev => ({
        ...prev,
        lastMenstrualPeriod: new Date(pregnancy.lastMenstrualPeriod!).toISOString().split('T')[0]
      }));
    }
  }, [pregnancy]);

  // Log quando profilePhoto mudar
  React.useEffect(() => {
    console.log("📸 ProfilePhoto state changed:", profilePhoto?.substring(0, 100));
  }, [profilePhoto]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Atualizar dados do usuário
      const userResponse = await apiRequest("PUT", "/api/auth/profile", {
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : null
      });
      
      // Se tem dados de gravidez e DUM foi alterada, atualizar a gravidez
      if (pregnancy && data.lastMenstrualPeriod) {
        await apiRequest("PUT", `/api/pregnancies/${pregnancy.id}`, {
          lastMenstrualPeriod: new Date(data.lastMenstrualPeriod)
        });
      }
      
      return userResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pregnancies/active"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  if (authLoading || pregnancyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
      lastMenstrualPeriod: pregnancy?.lastMenstrualPeriod ? 
        new Date(pregnancy.lastMenstrualPeriod).toISOString().split('T')[0] : ""
    });
  };

  const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar mantendo proporção
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Erro ao criar canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Comprimir para JPEG com qualidade 0.7
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamanho (5MB original)
    if (file.size > 5242880) {
      toast({
        title: "Arquivo muito grande",
        description: "A foto deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPhoto(true);
    console.log("📸 Comprimindo e convertendo foto...");

    try {
      // Comprimir e converter para base64
      const base64Image = await compressImage(file, 400);
      console.log("✅ Foto comprimida:", (base64Image.length / 1024).toFixed(2), "KB");

      // Atualizar preview imediatamente
      console.log("🖼️ Atualizando preview da foto...");
      setProfilePhoto(base64Image);

      // Salvar no banco de dados
      console.log("💾 Salvando foto no perfil...");
      const response = await apiRequest("PATCH", "/api/auth/profile", {
        profilePhotoUrl: base64Image,
      });
      console.log("✅ Foto salva no banco de dados!", response);

      // Recarregar dados do usuário do authManager
      await refreshUser();
      console.log("🔄 Dados do usuário recarregados!");
      console.log("📸 Nova foto do usuário:", user?.profilePhotoUrl?.substring(0, 100));

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPhoto(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <AnimatedBackground>
      <div className="min-h-screen pb-20 relative">
        <div className="p-4 relative z-10">
        {/* Botão de Voltar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="mb-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-full hover:bg-gray-100"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Profile Header */}
        <Card className="glass-effect shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar key={profilePhoto} className="w-24 h-24 bg-gradient-to-br from-pink-300 to-purple-400 ring-4 ring-white shadow-lg">
                  <AvatarImage 
                    src={profilePhoto} 
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-white text-2xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Input de arquivo oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {/* Botão de câmera */}
                <Button
                  type="button"
                  size="icon"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-0 shadow-lg border-2 border-white"
                >
                  {isUploadingPhoto ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                  <Camera className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800" data-testid="text-user-name">
                  {user.name}
                </h2>
                <p className="text-gray-600" data-testid="text-user-email">
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="glass-effect shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <User className="h-5 w-5 mr-2 text-pink-500" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite seu nome completo"
                    className="border-gray-200 focus:border-pink-400"
                    data-testid="input-name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="border-gray-200 bg-gray-50 text-gray-500"
                    data-testid="input-email"
                  />
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-gray-700">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="border-gray-200 focus:border-pink-400"
                    data-testid="input-birth-date"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pregnancy Information */}
            <Card className="glass-effect shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                  Informações da Gravidez
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lastMenstrualPeriod" className="text-gray-700">
                    Data da Última Menstruação (DUM)
                  </Label>
                  <Input
                    id="lastMenstrualPeriod"
                    type="date"
                    value={formData.lastMenstrualPeriod}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      lastMenstrualPeriod: e.target.value 
                    }))}
                    className="border-gray-200 focus:border-purple-400"
                    data-testid="input-last-menstrual-period"
                  />
                  <p className="text-xs text-gray-500">
                    Esta data é usada para calcular a idade gestacional
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex-1 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl"
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Debug: isEditing = {isEditing.toString()} */}
            {/* Information Display */}
            <Card className="glass-effect shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-pink-500" />
                    Informações Pessoais
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-600"
                    data-testid="button-edit-profile"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-sm text-gray-600">Nome</Label>
                    <p className="font-medium" data-testid="display-name">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="font-medium" data-testid="display-email">{user.email}</p>
                  </div>
                </div>
                
                {user.birthDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <Label className="text-sm text-gray-600">Data de Nascimento</Label>
                      <p className="font-medium" data-testid="display-birth-date">
                        {new Date(user.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pregnancy Information */}
            {pregnancy && (
              <Card className="glass-effect shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                    Informações da Gravidez
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Label className="text-sm text-gray-600">Data Prevista do Parto</Label>
                      <p className="font-medium text-purple-700" data-testid="display-due-date">
                        {new Date(pregnancy.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    {pregnancy.lastMenstrualPeriod && (
                      <div className="p-3 bg-pink-50 rounded-lg">
                        <Label className="text-sm text-gray-600">Última Menstruação (DUM)</Label>
                        <p className="font-medium text-pink-700" data-testid="display-last-menstrual-period">
                          {new Date(pregnancy.lastMenstrualPeriod).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Button */}
            <Card className="glass-effect shadow-xl border-2 border-pink-200">
              <CardContent className="p-6">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg text-lg"
                  data-testid="button-start-edit"
                >
                  <Edit2 className="h-6 w-6 mr-3" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>

      <BottomNavigation />
    </AnimatedBackground>
  );
}