import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Import das páginas essenciais
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PregnancySetup from "@/pages/pregnancy-setup";
import Setup from "@/pages/setup";
import ResetPassword from "@/pages/reset-password";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/forgot-password" component={ResetPassword} />
      <Route path="/pregnancy-setup" component={PregnancySetup} />
      <Route path="/setup" component={Setup} />
      <Route path="/" component={Dashboard} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Página não encontrada</h1>
            <a href="/login" className="text-blue-600 hover:underline">Voltar ao Login</a>
          </div>
        </div>
      </Route>
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