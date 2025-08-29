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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Save, 
  Calendar,
  Mail,
  Edit2
} from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { pregnancy, isLoading: pregnancyLoading } = usePregnancy();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
    lastMenstrualPeriod: pregnancy?.lastMenstrualPeriod ? 
      new Date(pregnancy.lastMenstrualPeriod).toISOString().split('T')[0] : ""
  });

  // Atualizar formData quando user ou pregnancy mudarem
  React.useEffect(() => {
    if (user) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <LoadingSpinner size="lg" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 pb-20">
      <div className="p-4 pt-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mr-4 hover:bg-white/10"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
        </div>

        {/* Profile Header */}
        <Card className="glass-effect shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 bg-pink-300">
                  <AvatarFallback className="text-white text-2xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 p-0"
                  data-testid="button-change-photo"
                >
                  <Camera className="h-4 w-4" />
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
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="p-2"
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
            <Card className="glass-effect shadow-xl">
              <CardContent className="p-6">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                  data-testid="button-start-edit"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}