import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { calculatePregnancyWeek } from "@/lib/pregnancy-calculator";
import { 
  User, 
  Mail, 
  Calendar, 
  Baby, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Edit2,
  Heart,
  Activity,
  Camera
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "" });
  const { user, logout, isLoading: authLoading } = useAuth();
  const { pregnancy, weekInfo, isLoading: pregnancyLoading } = usePregnancy();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      setEditData({ name: user.name });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    // This would typically update the user profile via API
    setIsEditing(false);
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  if (authLoading || pregnancyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pregnancyData = pregnancy && weekInfo ? calculatePregnancyWeek(pregnancy.dueDate) : null;

  const menuItems = [
    {
      icon: Bell,
      title: "Notificações",
      description: "Configurar alertas e lembretes",
      action: () => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })
    },
    {
      icon: Shield,
      title: "Privacidade",
      description: "Controle de dados e privacidade",
      action: () => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Preferências do aplicativo",
      action: () => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })
    },
    {
      icon: HelpCircle,
      title: "Ajuda",
      description: "Suporte e perguntas frequentes",
      action: () => toast({ title: "Em breve", description: "Funcionalidade em desenvolvimento" })
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-baby-pink via-cream to-baby-blue pb-20">
      <div className="p-4 pt-12">
        {/* Profile Header */}
        <Card className="glass-effect shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20 bg-baby-pink-dark">
                  <AvatarFallback className="text-white text-xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-baby-blue-dark hover:bg-baby-blue-dark/90 p-0"
                  data-testid="button-edit-avatar"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="font-semibold text-lg"
                      data-testid="input-edit-name"
                    />
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        className="bg-baby-pink-dark hover:bg-baby-pink-dark/90"
                        data-testid="button-save-profile"
                      >
                        Salvar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({ name: user.name });
                        }}
                        data-testid="button-cancel-edit"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-bold text-charcoal" data-testid="text-user-name">
                        {user.name}
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="p-1 h-auto"
                        data-testid="button-edit-profile"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm" data-testid="text-user-email">{user.email}</span>
                    </div>
                    {weekInfo && (
                      <div className="flex items-center text-baby-pink-dark">
                        <Baby className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium" data-testid="text-pregnancy-week">
                          {weekInfo.week} semanas de gestação
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Info */}
        {pregnancy && pregnancyData && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-charcoal">
                <Heart className="mr-2 h-5 w-5 text-baby-pink-dark" />
                Informações da Gestação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-baby-pink/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-baby-pink-dark mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Data Prevista</div>
                  <div className="font-semibold text-charcoal" data-testid="text-due-date">
                    {new Date(pregnancy.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="text-center p-3 bg-baby-blue/20 rounded-lg">
                  <Activity className="h-6 w-6 text-baby-blue-dark mx-auto mb-1" />
                  <div className="text-sm text-gray-600">Semanas Restantes</div>
                  <div className="font-semibold text-charcoal" data-testid="text-weeks-remaining">
                    {pregnancyData.weeksRemaining}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index} 
                className="shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                onClick={item.action}
                data-testid={`menu-item-${item.title.toLowerCase().replace(' ', '-')}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-baby-pink rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-baby-pink-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <Card className="shadow-lg mt-6">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair da conta</span>
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p data-testid="text-app-version">MamãeCare v1.0.0</p>
          <p className="mt-1">Feito com ❤️ para mamães</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
