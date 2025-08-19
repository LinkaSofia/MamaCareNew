import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/4_1755308511005.png";
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

// Componente de animação de fundo
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Corações flutuantes */}
      {[...Array(8)].map((_, i) => (
        <Heart
          key={`heart-${i}`}
          className={`absolute text-pink-300/30 animate-float-${i % 4 + 1}`}
          size={20 + (i % 3) * 10}
          style={{
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 15) % 70}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + (i % 3)}s`
          }}
        />
      ))}
      
      {/* Bolinhas flutuantes */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          className={`absolute rounded-full bg-gradient-to-r from-pink-200/20 to-blue-200/20 animate-bounce`}
          style={{
            width: `${8 + (i % 4) * 6}px`,
            height: `${8 + (i % 4) * 6}px`,
            left: `${5 + (i * 8) % 90}%`,
            top: `${10 + (i * 8) % 80}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + (i % 3)}s`
          }}
        />
      ))}
      
      {/* Estrelas piscantes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          className={`absolute w-2 h-2 bg-yellow-300/40 animate-pulse`}
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${20 + (i * 12) % 60}%`,
            animationDelay: `${i * 1.2}s`,
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string; general?: string} = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!isLoginMode && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setErrors({ general: "Nome é obrigatório" });
          return;
        }
        await register(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      const errorMessage = error.message;
      
      if (errorMessage?.includes("credentials") || errorMessage?.includes("Invalid")) {
        setErrors({ general: "Email ou senha incorretos" });
      } else if (errorMessage?.includes("already exists")) {
        setErrors({ general: "Este email já está em uso" });
      } else {
        setErrors({ 
          general: errorMessage || (isLoginMode ? "Erro ao fazer login" : "Erro ao criar conta") 
        });
      }
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gradient-bg">
        <AnimatedBackground />
        <Card className="w-full max-w-sm glass-effect shadow-xl z-10">
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
                Enviar link de recuperação
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-charcoal hover:bg-gray-100"
                data-testid="button-back-to-login"
              >
                Voltar ao login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gradient-bg">
      {/* Fundo animado */}
      <AnimatedBackground />
      
      {/* Logo and title */}
      <div className="text-center mb-8 z-10">
        <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-6 shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <img 
            src={logoImage} 
            alt="Maternidade Logo" 
            className="w-full h-full object-cover"
            data-testid="img-logo"
          />
        </div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Bem-vinda!</h1>
        <p className="text-gray-600">Acompanhe sua jornada maternal</p>
      </div>

      <Card className="w-full max-w-md glass-effect shadow-2xl z-10">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setErrors({});
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  isLoginMode 
                    ? 'bg-white text-charcoal shadow-sm' 
                    : 'text-gray-600 hover:text-charcoal'
                }`}
                data-testid="button-login-tab"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setErrors({});
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isLoginMode 
                    ? 'bg-white text-charcoal shadow-sm' 
                    : 'text-gray-600 hover:text-charcoal'
                }`}
                data-testid="button-register-tab"
              >
                Criar conta
              </button>
            </div>
          </div>

          {/* Mensagem de erro geral */}
          {errors.general && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <div>
                <Label className="text-charcoal font-medium">Nome completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-name"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label className="text-charcoal font-medium">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={`pl-10 pr-12 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {isLoginMode && (
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2 rounded border-gray-300" />
                  <span className="text-gray-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-baby-pink-dark hover:underline"
                  data-testid="button-forgot-password"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 text-white font-medium py-3"
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">{isLoginMode ? 'Entrando...' : 'Criando conta...'}</span>
                </>
              ) : (
                <span>{isLoginMode ? 'Entrar' : 'Criar conta'}</span>
              )}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            <Heart className="inline-block w-4 h-4 text-pink-400 mx-1" />
            Cuidando de você e seu bebê
            <Heart className="inline-block w-4 h-4 text-pink-400 mx-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}