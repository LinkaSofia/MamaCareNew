import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorIllustration } from "@/components/ErrorIllustration";
import { SimpleError } from "@/components/SimpleError";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import logoImage from "@assets/4_1755308511005.png";
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";


export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [errors, setErrors] = useState<{email?: string; password?: string; name?: string; birthDate?: string; general?: string}>({});
  const [realError, setRealError] = useState<string>("");
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

    if (!isLoginMode) {
      if (!formData.name.trim()) {
        newErrors.name = "Nome é obrigatório";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLoginMode) {
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
      
      // Capturar o erro real para debug
      setRealError(JSON.stringify({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      }));
      
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
      console.error("Erro ao enviar email de recuperação:", error);
      setForgotPasswordMessage("Erro ao enviar email. Tente novamente.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          <Card className="w-full max-w-sm glass-effect shadow-xl">
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
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={forgotPasswordLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                {forgotPasswordLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Enviar email de recuperação"
                )}
              </Button>
            </form>
            
            <Button
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-charcoal hover:bg-gray-100"
              data-testid="button-back-to-login"
            >
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Logo and title */}
        <div className="text-center mb-10">
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

          {/* Mensagem de erro simples e discreta */}
          {errors.general && (
            <div className="mb-4">
              <SimpleError message={errors.general} />
            </div>
          )}
          
          {/* Erro real para debug (apenas em desenvolvimento) */}
          {realError && process.env.NODE_ENV === 'development' && (
            <div className="mb-4">
              <SimpleError message={`Debug: ${realError}`} />
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite seu nome completo"
                    className="pl-10"
                    data-testid="input-name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <Label className="text-charcoal font-medium">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Digite seu email"
                  className="pl-10"
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label className="text-charcoal font-medium">Senha</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {isLoginMode && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      localStorage.setItem("rememberMe", e.target.checked.toString());
                      if (e.target.checked) {
                        localStorage.setItem("rememberedEmail", formData.email);
                      } else {
                        localStorage.removeItem("rememberedEmail");
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-pink-500 hover:text-pink-600"
                  data-testid="button-forgot-password"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3"
              data-testid="button-submit"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
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
    </AnimatedBackground>
  );
}
