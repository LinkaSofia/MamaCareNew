import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Lock, Shield, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';

const verifyResetSchema = z.object({
  token: z.string().min(1, 'Código é obrigatório'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type VerifyResetForm = z.infer<typeof verifyResetSchema>;

export default function VerifyResetPage() {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValidated, setTokenValidated] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerifyResetForm>({
    resolver: zodResolver(verifyResetSchema),
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const token = form.watch('token');

  // Verificar token automaticamente quando preenchido
  useEffect(() => {
    if (token && token.length >= 30) { // Assumindo que tokens têm pelo menos 30 caracteres
      verifyToken();
    } else {
      setTokenValidated(false);
    }
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setTokenValidated(true);
        toast({
          title: "✅ Código validado",
          description: "Agora você pode definir sua nova senha.",
        });
      } else {
        setError(data.error || 'Código inválido ou expirado');
        setTokenValidated(false);
      }
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
      setTokenValidated(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: VerifyResetForm) => {
    if (!tokenValidated) {
      setError('Código não foi validado ainda');
      return;
    }

    setIsResetting(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token,
          newPassword: data.newPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Senha alterada com sucesso!');
        toast({
          title: "🎉 Sucesso!",
          description: "Sua senha foi alterada. Redirecionando para o login...",
        });
        
        setTimeout(() => {
          setLocation('/login');
        }, 2000);
      } else {
        setError(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      setError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fundo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Senha Alterada!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Verificação & Nova Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite o código recebido por email e defina sua nova senha
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo do Código */}
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Código de Verificação
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="Digite o código recebido por email"
                          className="pl-10 h-12 border-gray-200 focus:border-pink-400 transition-colors"
                          data-testid="input-reset-token"
                        />
                        {tokenValidated && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {tokenValidated && (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Código validado com sucesso
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Nova Senha */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Nova Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-pink-400 transition-colors"
                          disabled={!tokenValidated}
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={!tokenValidated}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmar Senha */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Confirmar Nova Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua nova senha"
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-pink-400 transition-colors"
                          disabled={!tokenValidated}
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={!tokenValidated}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isVerifying || isResetting || !tokenValidated}
                data-testid="button-reset-password"
              >
                {isVerifying ? 'Verificando...' : isResetting ? 'Alterando Senha...' : 'Alterar Senha'}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link href="/login">
              <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Login
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}