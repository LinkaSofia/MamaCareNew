import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorIllustration } from "@/components/ErrorIllustration";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
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
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [errors, setErrors] = useState<{email?: string; password?: string; name?: string; birthDate?: string; general?: string}>({});
  const [formData, setFormData] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
    name: "",
    birthDate: "",
  });
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string; name?: string; birthDate?: string; general?: string} = {};

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

    if (!isLoginMode && !formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!isLoginMode && !formData.birthDate) {
      newErrors.birthDate = "Data de nascimento é obrigatória";
    } else if (!isLoginMode && formData.birthDate) {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (birthYear < 1900 || birthYear > currentYear) {
        newErrors.birthDate = "Digite um ano válido";
      }
      
      if (birthYear > currentYear - 13) {
        newErrors.birthDate = "Idade mínima: 13 anos";
      }
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
        // Salvar preferências de "lembrar de mim" antes do login
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
        }
        await login(formData.email, formData.password);
        // O AuthManager já cuida do redirecionamento
      } else {
        if (!formData.name.trim()) {
          setErrors({ general: "Nome é obrigatório" });
          return;
        }
        await register(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      console.log("Login/Register error:", error);
      const errorMessage = error.message || "";
      
      // Verificar se temos erros de campo específicos do backend
      if (error.response && error.response.fieldErrors) {
        setErrors(error.response.fieldErrors);
        return;
      }
      
      if (errorMessage.includes("não encontrado")) {
        setErrors({ email: "Usuário não cadastrado" });
      } else if (errorMessage.includes("Senha incorreta")) {
        setErrors({ password: "Senha incorreta" });
      } else if (errorMessage.includes("credentials") || errorMessage.includes("Invalid")) {
        setErrors({ general: "Email ou senha incorretos" });
      } else if (errorMessage.includes("already exists") || errorMessage.includes("User already exists") || errorMessage.includes("já está cadastrado")) {
        setErrors({ email: "Este email já possui cadastro" });
      } else if (errorMessage.includes("Data de nascimento inválida")) {
        setErrors({ birthDate: "Data inválida" });
      } else if (error.response?.status === 401) {
        // Para erros 401, vamos mostrar mensagens mais específicas
        setErrors({ general: "Dados de login incorretos. Verifique email e senha." });
      } else {
        // Mostrar mensagens mais específicas e amigáveis
        if (isLoginMode) {
          setErrors({ general: "Verifique seus dados e tente novamente" });
        } else {
          setErrors({ general: "Não foi possível criar a conta" });
        }
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");

    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", {
        email: forgotPasswordEmail,
      });
      const data = await response.json();
      setForgotPasswordMessage(data.message);
    } catch (error: any) {
      setForgotPasswordMessage(error.message || "Erro ao enviar email de recuperação");
    } finally {
      setForgotPasswordLoading(false);
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
            
            {forgotPasswordMessage && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-blue-800 text-sm">{forgotPasswordMessage}</p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label className="text-charcoal font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="seu@email.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-forgot-email"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                data-testid="button-send-recovery"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? "Enviando..." : "Enviar link de recuperação"}
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
      <div className="text-center mb-10 z-10">
        <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-6 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <img 
            src={logoImage} 
            alt="Maternidade Logo" 
            className="w-full h-full object-cover"
            data-testid="img-logo"
          />
        </div>
        <h1 className="text-4xl font-bold text-charcoal mb-3">Bem-vinda!</h1>
        <p className="text-gray-600 text-lg">Acompanhe sua jornada maternal</p>
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

          {/* Mensagem de erro geral com ilustração amigável */}
          {errors.general && (
            <div className="mb-6">
              <ErrorIllustration
                type={errors.general.includes("incorretos") || errors.general.includes("credentials") ? "login" : "register"}
                title={errors.general.includes("não encontrado")
                  ? "Usuário não cadastrado"
                  : errors.general.includes("Senha incorreta")
                    ? "Senha incorreta"
                    : errors.general.includes("incorretos") || errors.general.includes("credentials") 
                      ? "Oops! Dados incorretos" 
                      : errors.general.includes("já está em uso") 
                        ? "Email já cadastrado" 
                        : "Algo deu errado"}
                message={
                  errors.general.includes("não encontrado")
                    ? "Email não cadastrado"
                    : errors.general.includes("Senha incorreta")
                      ? "Senha incorreta"
                      : errors.general.includes("incorretos") || errors.general.includes("credentials")
                        ? "Email ou senha incorretos"
                        : errors.general.includes("já está cadastrado")
                          ? "Email já possui conta"
                          : "Erro interno"
                }
              />
            </div>
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
                    className={`pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark ${
                      errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    data-testid="input-name"
                  />
                </div>
                {errors.name && (
                  <div className="mt-2 p-2 bg-red-50/40 border border-red-200/30 rounded-lg">
                    <p className="text-sm text-red-400/90 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 text-red-300/80" />
                      {errors.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isLoginMode && (
              <div>
                <Label className="text-charcoal font-medium">Data de nascimento</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Data de nascimento"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className={`pl-10 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark ${
                      errors.birthDate ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    max="2024-12-31"
                    min="1900-01-01"
                    data-testid="input-birth-date"
                    required
                  />
                </div>
                {errors.birthDate && (
                  <div className="mt-1 p-2 bg-red-50/40 border border-red-200/30 rounded-md">
                    <p className="text-xs text-red-400/90 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 text-red-300/80" />
                      {errors.birthDate}
                    </p>
                  </div>
                )}
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
                <div className="mt-1 p-2 bg-red-50/40 border border-red-200/30 rounded-md">
                  <p className="text-xs text-red-400/90 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-red-300/80" />
                    {errors.email}
                  </p>
                </div>
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
                <div className="mt-1 p-2 bg-red-50/40 border border-red-200/30 rounded-md">
                  <p className="text-xs text-red-400/90 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-red-300/80" />
                    {errors.password}
                  </p>
                </div>
              )}
            </div>

            {isLoginMode && (
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded border-gray-300 text-baby-pink focus:ring-baby-pink" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    data-testid="checkbox-remember-me"
                  />
                  <span className="text-gray-600">Lembrar-me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setLocation(`/reset-password?email=${encodeURIComponent(formData.email)}`)}
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