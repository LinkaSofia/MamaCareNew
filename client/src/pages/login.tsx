import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logoImage from "@assets/4_1755308511005.png";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      if (isLoginMode) {
        setErrors({ general: "Funcionalidade de login será implementada em breve!" });
      } else {
        setErrors({ general: "Funcionalidade de registro será implementada em breve!" });
      }
    }, 2000);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    
    const providerNames = {
      google: 'Google',
      facebook: 'Facebook',
      apple: 'Apple'
    };
    
    setTimeout(() => {
      setIsLoading(false);
      setErrors({ general: `Login com ${providerNames[provider]} será implementado em breve!` });
    }, 1500);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
        {/* Animações de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`heart-${i}`}
              className="absolute text-pink-300/30 animate-bounce"
              style={{
                left: `${10 + (i * 12) % 80}%`,
                top: `${15 + (i * 15) % 70}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${3 + (i % 3)}s`,
                fontSize: `${20 + (i % 3) * 10}px`
              }}
            >
              ♥
            </div>
          ))}
        </div>

        <Card className="w-full max-w-sm bg-white/80 backdrop-blur-sm shadow-xl z-10">
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Esqueci minha senha</h2>
              <p className="text-gray-600 text-sm">Digite seu email para recuperar a senha</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <Label className="text-gray-800 font-medium">Email</Label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-3 text-gray-400">✉</div>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="pl-10 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white"
                data-testid="button-send-recovery"
              >
                Enviar link de recuperação
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-800 hover:bg-gray-100"
                data-testid="button-back-to-login"
              >
                Voltar ao login
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-xs text-gray-500 z-10">
          <p>©2025 MamãeCare</p>
          <div className="flex justify-center items-center space-x-3 mt-2">
            <button className="hover:text-pink-600 transition-colors" data-testid="link-terms">
              Termos
            </button>
            <span>•</span>
            <button className="hover:text-pink-600 transition-colors" data-testid="link-privacy">
              Privacidade
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animações de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute text-pink-300/30 animate-bounce"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`,
              fontSize: `${20 + (i % 3) * 10}px`
            }}
          >
            ♥
          </div>
        ))}
        
        {[...Array(12)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-pink-200/20 to-blue-200/20 animate-pulse"
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
        
        {[...Array(6)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute text-yellow-300/40 animate-pulse"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${i * 1.2}s`,
              fontSize: '16px'
            }}
          >
            ★
          </div>
        ))}
      </div>

      {/* Logo */}
      <div className="mb-8 text-center z-10">
        <img 
          src={logoImage} 
          alt="MamãeCare Logo" 
          className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vinda!</h1>
        <p className="text-gray-600">Acompanhe sua jornada materna</p>
      </div>

      <Card className="w-full max-w-sm bg-white/80 backdrop-blur-sm shadow-xl z-10">
        <CardContent>
          {/* Toggle Login/Registro */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLoginMode
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              data-testid="tab-login"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLoginMode
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              data-testid="tab-register"
            >
              Criar conta
            </button>
          </div>

          {/* Mensagem de erro geral */}
          {errors.general && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <div className="flex items-center">
                <div className="text-red-600 mr-2">⚠</div>
                <AlertDescription className="text-red-700">
                  {errors.general}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (só no registro) */}
            {!isLoginMode && (
              <div>
                <Label className="text-gray-800 font-medium">Nome completo</Label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-3 text-gray-400">👤</div>
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                    data-testid="input-name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <Label className="text-gray-800 font-medium">E-mail</Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-3 text-gray-400">✉</div>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`pl-10 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label className="text-gray-800 font-medium">Senha</Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-3 text-gray-400">🔒</div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`pl-10 pr-10 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Opções adicionais para login */}
            {isLoginMode && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 rounded"
                    data-testid="checkbox-remember"
                  />
                  <span className="text-gray-600">Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-pink-600 hover:underline"
                  data-testid="link-forgot-password"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold py-3 transition-all duration-200 disabled:opacity-50"
              data-testid="button-submit"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isLoginMode ? "Entrando..." : "Criando conta..."}
                </div>
              ) : (
                isLoginMode ? "Entrar" : "Criar conta"
              )}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-1 rounded-full text-gray-500 backdrop-blur-sm border border-gray-100">
                ou continue com
              </span>
            </div>
          </div>

          {/* Botões de login social */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              className="py-3 flex items-center justify-center"
              disabled={isLoading}
              data-testid="button-google-login"
            >
              <span className="text-red-500 text-xl">G</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              className="py-3 flex items-center justify-center"
              disabled={isLoading}
              data-testid="button-facebook-login"
            >
              <span className="text-blue-600 text-xl">f</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin('apple')}
              className="py-3 flex items-center justify-center"
              disabled={isLoading}
              data-testid="button-apple-login"
            >
              <span className="text-black text-xl">🍎</span>
            </Button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            ♥ Cuidando de você e seu bebê ♥
          </div>
        </CardContent>
      </Card>

      {/* Rodapé */}
      <div className="text-center mt-8 text-xs text-gray-500 z-10">
        <p>©2025 MamãeCare</p>
        <div className="flex justify-center items-center space-x-3 mt-2">
          <button className="hover:text-pink-600 transition-colors" data-testid="link-terms">
            Termos
          </button>
          <span>•</span>
          <button className="hover:text-pink-600 transition-colors" data-testid="link-privacy">
            Privacidade
          </button>
        </div>
      </div>
    </div>
  );
}