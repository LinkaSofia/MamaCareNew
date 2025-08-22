import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';

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
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        setStep('password');
        toast({
          title: "Token válido!",
          description: "Agora você pode definir sua nova senha",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Token inválido",
          description: error.error || "Verifique o token e tente novamente",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao verificar token. Tente novamente.",
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        })
      });

      if (response.ok) {
        toast({
          title: "Senha redefinida!",
          description: "Sua senha foi alterada com sucesso",
        });
        setLocation('/login');
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao redefinir senha",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao redefinir senha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada novamente",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao reenviar email",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reenviar email. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🤱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mama Care</h1>
          <p className="text-gray-600 mt-2">Recuperação de senha</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {step === 'token' ? 'Insira o Token' : 'Nova Senha'}
            </CardTitle>
            <CardDescription>
              {step === 'token' 
                ? `Token enviado para ${email}` 
                : 'Defina sua nova senha segura'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 'token' ? (
              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="token" className="text-sm font-medium text-gray-700">
                    Token de Recuperação
                  </label>
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
                  className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg"
                  disabled={isLoading}
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
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      data-testid="input-new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      data-testid="input-confirm-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      data-testid="button-toggle-confirm-password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg"
                  disabled={isLoading}
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
              </form>
            )}

            {/* Actions */}
            <div className="flex flex-col space-y-3 pt-4 border-t">
              {step === 'token' && (
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
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
              )}

              <Button
                variant="ghost"
                onClick={onBack}
                className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}