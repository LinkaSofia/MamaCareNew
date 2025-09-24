import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { forceReloadWithCleanup, clearAllCaches, resetAndReload } from '@/utils/cacheUtils';

interface DebugCacheButtonProps {
  className?: string;
}

export function DebugCacheButton({ className = '' }: DebugCacheButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await clearAllCaches();
      console.log('✅ Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndReload = async () => {
    setIsLoading(true);
    try {
      await resetAndReload();
    } catch (error) {
      console.error('❌ Erro ao resetar:', error);
      setIsLoading(false);
    }
  };

  const handleForceCleanup = async () => {
    setIsLoading(true);
    try {
      await forceReloadWithCleanup();
    } catch (error) {
      console.error('❌ Erro na limpeza completa:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Debug Cache
        </Button>
      </div>

      {/* Modal de debug */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-orange-800">
                  Debug de Cache
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-sm text-orange-600">
                Ferramentas para resolver problemas de cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleClearCache}
                disabled={isLoading}
                variant="outline"
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
              
              <Button
                onClick={handleResetAndReload}
                disabled={isLoading}
                variant="outline"
                className="w-full justify-start"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar e Recarregar
              </Button>
              
              <Button
                onClick={handleForceCleanup}
                disabled={isLoading}
                variant="destructive"
                className="w-full justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Limpeza Completa
              </Button>
              
              {isLoading && (
                <div className="text-center text-sm text-gray-600">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Processando...
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
                <strong>Dica:</strong> Se as páginas ficam em branco, use "Limpeza Completa" 
                para limpar tudo e recarregar.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}




