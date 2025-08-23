import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Import páginas funcionais
import Login from "@/pages/login";
import PregnancySetup from "@/pages/pregnancy-setup";

// Dashboard principal do app
function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">👶</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Mama Care</h1>
                <p className="text-xs text-gray-500">Semana 20 • 2º trimestre</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h5m-5-5v-14a1 1 0 011-1h3m-3 0a1 1 0 100-2h-3a1 1 0 00-1 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h3a1 1 0 100 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Card do bebê */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">👶</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Seu bebê</h2>
            <p className="text-gray-600">Tamanho de uma banana</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-pink-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-pink-600">~25cm</p>
              <p className="text-xs text-gray-600">Comprimento</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">~300g</p>
              <p className="text-xs text-gray-600">Peso</p>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-2xl mb-2">👆</div>
            <p className="font-semibold">Contar Chutes</p>
            <p className="text-xs opacity-90">Última sessão: Hoje</p>
          </button>
          
          <button className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl p-6 text-center shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-semibold">Peso</p>
            <p className="text-xs opacity-90">Último: 65kg</p>
          </button>
        </div>

        {/* Lembretes do dia */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
          <h3 className="font-bold text-gray-800 mb-4">Hoje</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">💊</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Ácido fólico</p>
                <p className="text-xs text-gray-500">8:00 - Manhã</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">📅</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">Consulta pré-natal</p>
                <p className="text-xs text-gray-500">14:00 - Dr. Silva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="grid grid-cols-4 gap-1">
            <button className="p-3 text-center text-pink-500">
              <div className="text-xl mb-1">🏠</div>
              <p className="text-xs">Início</p>
            </button>
            <button className="p-3 text-center text-gray-400">
              <div className="text-xl mb-1">👶</div>
              <p className="text-xs">Bebê</p>
            </button>
            <button className="p-3 text-center text-gray-400">
              <div className="text-xl mb-1">🤱</div>
              <p className="text-xs">Mamãe</p>
            </button>
            <button className="p-3 text-center text-gray-400">
              <div className="text-xl mb-1">⚙️</div>
              <p className="text-xs">Perfil</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/pregnancy-setup" component={PregnancySetup} />
      <Route path="/" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="App">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;