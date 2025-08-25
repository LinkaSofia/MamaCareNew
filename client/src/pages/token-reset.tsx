import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle2, RefreshCw, Lock, Heart } from 'lucide-react';
import logoImage from "@assets/4_1755308511005.png";

// Componente de animação de fundo igual ao login
function AnimatedBackground({ step }: { step: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Corações flutuantes */}
      {[...Array(8)].map((_, i) => {
        const heartId = `${step}-heart-${i}`;
        return (
          <Heart
            key={heartId}
            className={`absolute text-pink-300/30 animate-float-1`}
            size={20 + (i % 3) * 10}
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        );
      })}
      
      {/* Bolinhas flutuantes */}
      {[...Array(12)].map((_, i) => {
        const bubbleId = `${step}-bubble-${i}`;
        return (
          <div
            key={bubbleId}
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
        );
      })}
      
      {/* Estrelas piscantes */}
      {[...Array(6)].map((_, i) => {
        const starId = `${step}-star-${i}`;
        return (
          <div
            key={starId}
            className={`absolute w-2 h-2 bg-yellow-300/40 animate-pulse`}
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 12) % 60}%`,
              animationDelay: `${i * 1.2}s`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        );
      })}
    </div>
  );
}

interface TokenResetProps {
  email: string;
  onBack: () => void;
}

export function TokenReset({ email, onBack }: TokenResetProps) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<'token' | 'password'>('token');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({
        title: "Token obrigatório",
        description: "Por favor, insira o token recebido no email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/verify-reset-token', { token });
      setStep('password');
      toast({
        title: "Token válido!",
        description: "Agora você pode definir sua nova senha",
      });
    } catch (error: any) {
      toast({
        title: "Token inválido",
        description: error.message || "Verifique o token e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha ambos os campos de senha",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Verifique se as senhas são idênticas",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('POST', '/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso",
      });
      setLocation('/login');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao redefinir senha",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await apiRequest('POST', '/api/auth/forgot-password', { email });
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada novamente",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reenviar email",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  if (step === 'password') {
    // Tela de nova senha
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gradient-bg">
        <AnimatedBackground step="password" />
        
        <div className="text-center mb-8 z-10">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-6 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src={logoImage} 
              alt="Mama Care Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Nova Senha</h1>
          <p className="text-gray-600">Defina sua nova senha segura</p>
        </div>

        <Card className="w-full max-w-sm glass-effect shadow-xl z-10">
          <CardContent className="p-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-charcoal font-medium">
                  Nova senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Digite sua nova senha"
                    data-testid="input-new-password"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-charcoal font-medium">
                  Confirmar senha
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
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 text-white font-medium py-3"
                data-testid="button-reset-password"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-sm text-baby-pink-dark hover:underline flex items-center justify-center gap-1"
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de inserir token
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gradient-bg">
      <AnimatedBackground step="token" />
      
      <div className="text-center mb-8 z-10">
        <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-baby-pink to-baby-blue flex items-center justify-center mb-6 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <img 
            src={logoImage} 
            alt="Mama Care Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Cuidados com a mamãe</h1>
        <p className="text-gray-600">Recuperação de senha</p>
      </div>

      <Card className="w-full max-w-sm glass-effect shadow-xl z-10">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-2">Seta o Token</h2>
            <p className="text-sm text-gray-600">Token enviado para {email}</p>
          </div>

          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-charcoal font-medium">
                Token de Recuperação
              </Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Digite o token recebido no email"
                className="text-center text-lg tracking-wider"
                data-testid="input-reset-token"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90 text-white font-medium py-3"
              data-testid="button-verify-token"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verificar Token
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline" 
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full border-baby-pink-dark text-baby-pink-dark hover:bg-baby-pink/10"
              data-testid="button-resend-email"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Email
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-baby-pink-dark hover:underline flex items-center justify-center gap-1"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}