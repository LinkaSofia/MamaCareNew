import { useState } from 'react';
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
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const verifySchema = z.object({
  token: z.string().min(4, 'Código deve ter 4 números').max(4, 'Código deve ter 4 números'),
  newPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyTokenPage() {
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { toast } = useToast();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Primeiro verificar o token
      const verifyResponse = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token })
      });

      if (!verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        setError(verifyData.error || 'Código inválido');
        return;
      }

      // Se o token é válido, redefinir a senha
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token,
          newPassword: data.newPassword
        })
      });

      const resetData = await resetResponse.json();

      if (resetResponse.ok) {
        setSuccess('Senha alterada com sucesso!');
        toast({
          title: "Sucesso!",
          description: "Sua senha foi alterada. Redirecionando para o login...",
        });
        
        setTimeout(() => {
          setLocation('/login');
        }, 2000);
      } else {
        setError(resetData.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      setError('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur border-0 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Senha Alterada!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sua senha foi alterada com sucesso. Redirecionando...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur border-0 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Verificar Código
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite o código de 4 números recebido por email e sua nova senha
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
                      Código de Verificação (4 números)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0000"
                        maxLength={4}
                        className="text-center text-2xl h-16 font-mono tracking-widest"
                        data-testid="input-token"
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 4);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
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
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          className="pr-10 h-12"
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua nova senha"
                          className="pr-10 h-12"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold"
                disabled={isLoading}
                data-testid="button-verify-reset"
              >
                {isLoading ? 'Processando...' : 'Verificar e Alterar Senha'}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link href="/reset-password">
              <button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para solicitar código
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}