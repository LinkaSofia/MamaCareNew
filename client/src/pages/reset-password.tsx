import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Mail, ArrowLeft, Heart } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import logoImage from "@assets/4_1755308511005.png";
import { TokenReset } from "./token-reset";

// Componente de animação de fundo igual ao login
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

// Cache buster - v4.0 - Modern design with forced blue colors
export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string; general?: string}>({});
  const [isResetMode, setIsResetMode] = useState(false);
  const [showTokenReset, setShowTokenReset] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const emailFromUrl = urlParams.get('email');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsResetMode(true);
    } else if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
      setSentEmail(decodeURIComponent(emailFromUrl));
      setShowTokenReset(true); // Mostrar tela de token quando vem do login
      setIsResetMode(false);
    } else {
      setIsResetMode(false);
    }
  }, []);

  const validateEmailForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage("");
    setErrors({});
    
    if (!validateEmailForm()) {
      return;
    }
    
    setEmailLoading(true);

    try {
      console.log("📧 Sending email request for:", email);
      
      const response = await apiRequest("POST", "/api/auth/forgot-password", {
        email,
      });
      console.log("📧 Response status:", response.status);
      const data = await response.json();
      console.log("📧 Email response data:", data);
      setEmailMessage(data.message);
      setSentEmail(email);
      console.log("📧 Setting showTokenReset to true, sentEmail:", email);
      setShowTokenReset(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error.message.includes("não cadastrado")) {
        setErrors({ email: "Email não cadastrado. Verifique o endereço ou crie uma conta." });
      } else {
        setErrors({ general: error.message || "Erro ao solicitar recuperação" });
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      const data = await response.json();
      setMessage(data.message);
      setSuccess(true);
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setErrors({ general: error.message || "Erro ao redefinir senha" });
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    // Modo redefinir senha com token
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gradient-bg">
        <AnimatedBackground />
        
        <div className="text-center mb-8 z-10">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-6 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImage} 
              alt="Mama Care Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Nova Senha</h1>
          <p className="text-gray-600">Digite sua nova senha abaixo</p>
        </div>

        <Card className="w-full max-w-sm glass-effect shadow-xl z-10">
          <CardContent className="p-6">
            {message && (
              <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
                success 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                {success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}

            {success ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-charcoal font-medium">
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Digite sua nova senha"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-charcoal font-medium">
                    Confirmar nova senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Confirme sua nova senha"
                      data-testid="input-confirm-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.general}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-medium py-3 rounded-lg shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                  data-testid="button-reset-password"
                >
                  {loading ? "Redefinindo..." : "Redefinir Senha"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline flex items-center justify-center gap-1 transition-colors duration-200"
                    data-testid="button-back-to-login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Login
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug: Log do estado atual
  console.log("📧 Current state - showTokenReset:", showTokenReset, "sentEmail:", sentEmail);

  // Se deve mostrar a tela de token
  if (showTokenReset) {
    console.log("📧 Rendering TokenReset component with email:", sentEmail);
    return (
      <TokenReset 
        email={sentEmail}
        onBack={() => {
          setLocation('/login');
        }}
      />
    );
  }

  // Modo solicitar email de recuperação
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AnimatedBackground />
      
      {/* Logo e título */}
      <div className="text-center mb-10 z-10">
        <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <img
            src={logoImage}
            alt="MamaCare Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Esqueci minha senha</h1>
        <p className="text-gray-600 text-lg">Digite seu email para receber as instruções de recuperação</p>
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl shadow-2xl z-10">
        <CardContent className="p-8">
          {emailMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{emailMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-700 font-semibold text-base">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="pl-12 h-12 text-base rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  required
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.email}
                </p>
              )}
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.general}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={emailLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                data-testid="button-send-email"
              >
                {emailLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Enviando...
                  </div>
                ) : (
                  "Enviar email de recuperação"
                )}
              </button>

              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-base rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}