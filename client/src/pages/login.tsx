import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/4_1755308511005.png";
import { Heart, Mail, Lock, User } from "lucide-react";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          toast({
            title: "Erro",
            description: "Nome é obrigatório",
            variant: "destructive",
          });
          return;
        }
        await register(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || (isLoginMode ? "Erro ao fazer login" : "Erro ao criar conta"),
        variant: "destructive",
      });
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal mb-2">Esqueci minha senha</h2>
              <p className="text-gray-600 text-sm">Digite seu email para recuperar a senha</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <Label className="text-charcoal font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-send-recovery"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar link de recuperação
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowForgotPassword(false)}
                className="text-baby-pink-dark hover:text-baby-pink-dark"
                data-testid="button-back-to-login"
              >
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      <div className="animate-float mb-8">
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white">
          <img 
            src={logoImage} 
            alt="MamãeCare Logo" 
            className="w-full h-full object-cover"
            data-testid="img-logo"
          />
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2" data-testid="text-app-title">MamãeCare</h1>
        <p className="text-gray-600 text-sm" data-testid="text-app-subtitle">Sua jornada da maternidade</p>
      </div>
      
      <Card className="w-full max-w-sm glass-effect shadow-xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-charcoal">
              {isLoginMode ? "Entrar" : "Criar Conta"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-auth">
            {!isLoginMode && (
              <div>
                <Label className="text-charcoal font-medium">Nome completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-name"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label className="text-charcoal font-medium">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-email"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-charcoal font-medium">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-password"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 transform hover:scale-105 transition-all duration-200"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Heart className="mr-2 h-4 w-4" />
              )}
              {isLoginMode ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            {isLoginMode && (
              <Button 
                variant="ghost" 
                onClick={() => setShowForgotPassword(true)}
                className="text-baby-pink-dark hover:text-baby-pink-dark"
                data-testid="button-forgot-password"
              >
                Esqueci minha senha
              </Button>
            )}
            
            <div className="text-gray-500 text-sm">ou</div>
            
            <Button 
              variant="ghost" 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-baby-blue-dark hover:text-baby-blue-dark font-medium"
              data-testid="button-toggle-mode"
            >
              {isLoginMode ? "Cadastrar novo usuário" : "Já tenho conta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
