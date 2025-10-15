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
import { Heart, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [errors, setErrors] = useState<{email?: string; password?: string; name?: string; pregnancyDate?: string; general?: string}>({});
  const [formData, setFormData] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
    name: "",
    pregnancyDate: "",
    pregnancyType: "lastMenstruation" as "lastMenstruation" | "dueDate",
    profileImage: null as File | null,
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();


  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErrors({ general: "Por favor, selecione apenas imagens" });
        return;
      }
      
      // Validar tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ general: "A imagem deve ter no máximo 5MB" });
        return;
      }

      setFormData({ ...formData, profileImage: file });
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Limpar erros
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string; name?: string; pregnancyDate?: string; general?: string} = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      // Validação mais específica e suave
      const email = formData.email.trim();
      if (!email.includes('@')) {
        newErrors.email = "Digite um email válido";
      } else if (!email.includes('.')) {
        newErrors.email = "Email incompleto";
      } else {
        newErrors.email = "Formato de email inválido";
      }
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
      
      if (!formData.pregnancyDate) {
        newErrors.pregnancyDate = "Data da gravidez é obrigatória";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        await register(formData.email, formData.password, formData.name, formData.profileImage, {
          pregnancyDate: formData.pregnancyDate,
          pregnancyType: formData.pregnancyType
        });
      }
    } catch (error: any) {
      console.log("Login/Register error:", error);
      const errorMessage = error.message || "";
      
      
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
      } else if (error.response?.status === 401) {
        setErrors({ general: "Dados de login incorretos. Verifique email e senha." });
      } else {
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
      
      // Redirecionar para a tela de inserção do código após 2 segundos
      setTimeout(() => {
        setLocation(`/reset-password?email=${encodeURIComponent(forgotPasswordEmail)}`);
      }, 2000);
      
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      
      // Verificar se é erro de email não cadastrado
      if (error.message && error.message.includes("não cadastrado")) {
        setForgotPasswordMessage("Email não cadastrado no sistema. Verifique o endereço ou crie uma conta.");
      } else {
        setForgotPasswordMessage("Erro ao enviar email. Tente novamente.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex flex-col items-center justify-start pt-16 p-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-4 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img 
                src={logoImage} 
                alt="Maternidade Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-charcoal mb-2">Esqueci minha senha</h1>
            <p className="text-gray-600">Digite seu email para recuperar a senha</p>
          </div>

          <Card className="w-full max-w-md glass-effect shadow-2xl z-10">
            <CardContent className="p-8">
            {forgotPasswordMessage && (
              <div className={`mb-4 p-3 rounded-lg border ${
                forgotPasswordMessage.includes("não cadastrado") 
                  ? "bg-red-50 border-red-200" 
                  : "bg-blue-50 border-blue-200"
              }`}>
                <p className={`text-sm ${
                  forgotPasswordMessage.includes("não cadastrado") 
                    ? "text-red-800" 
                    : "text-blue-800"
                }`}>
                  {forgotPasswordMessage}
                </p>
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
                  className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 text-white font-medium py-3"
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
                className="w-full text-charcoal hover:bg-gray-100 mt-4"
                data-testid="button-back-to-login"
              >
                Voltar ao login
              </Button>
            </CardContent>
          </Card>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 p-6">
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-4 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
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

            {errors.general && (
              <div className="mb-4">
                <SimpleError message={errors.general} />
              </div>
            )}
            

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {!isLoginMode && (
                <>
                  {/* Foto de Perfil */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center shadow-lg overflow-hidden">
                        {profileImagePreview ? (
                          <img 
                            src={profileImagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <label 
                        htmlFor="profileImage"
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border-2 border-pink-200"
                      >
                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </label>
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Toque para adicionar foto
                    </p>
                  </div>

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
                    <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 px-2 py-1 rounded border border-red-200">{errors.name}</p>
                  )}
                  </div>
                </>
              )}

              <div>
                <Label className="text-charcoal font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Digite seu email"
                    className="pl-10"
                    data-testid="input-email"
                    autoComplete="email"
                    noValidate
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 px-2 py-1 rounded border border-red-200">{errors.email}</p>
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
                  <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 px-2 py-1 rounded border border-red-200">{errors.password}</p>
                )}
              </div>

              {!isLoginMode && (
                <>
                  {/* Tipo de Cálculo da Gravidez */}
                  <div>
                    <Label className="text-charcoal font-medium">Como você prefere calcular?</Label>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pregnancyType: "lastMenstruation" })}
                        className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.pregnancyType === "lastMenstruation"
                            ? "border-pink-300 bg-pink-50 text-pink-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Última Menstruação
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pregnancyType: "dueDate" })}
                        className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          formData.pregnancyType === "dueDate"
                            ? "border-pink-300 bg-pink-50 text-pink-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Data Prevista
                      </button>
                    </div>
                  </div>

                  {/* Campo de Data */}
                  <div>
                    <Label className="text-charcoal font-medium">
                      {formData.pregnancyType === "lastMenstruation" 
                        ? "Data da última menstruação *" 
                        : "Data prevista do parto *"
                      }
                    </Label>
                    <div className="relative mt-1">
                      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <Input
                        type="date"
                        value={formData.pregnancyDate}
                        onChange={(e) => setFormData({ ...formData, pregnancyDate: e.target.value })}
                        className="pl-10"
                        data-testid="input-pregnancy-date"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.pregnancyType === "lastMenstruation" 
                        ? "Calculamos automaticamente a data prevista do parto"
                        : "Calculamos automaticamente a data da última menstruação"
                      }
                    </p>
                    {errors.pregnancyDate && (
                      <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 px-2 py-1 rounded border border-red-200">{errors.pregnancyDate}</p>
                    )}
                  </div>
                </>
              )}

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
                    onClick={() => {
                      setForgotPasswordEmail(formData.email); // Preenche automaticamente com o email do login
                      setShowForgotPassword(true);
                    }}
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
