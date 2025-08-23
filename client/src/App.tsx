// Dashboard simples sem imports problemáticos
function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🤱 Mama Care</h1>
        <p className="text-gray-600 mb-4">Dashboard Principal</p>
        <p className="text-sm text-gray-500">Sistema funcionando!</p>
      </div>
    </div>
  );
}

// Login bonito com animações
import { useState } from "react";
import { useLocation } from "wouter";

// Componente de animação de fundo
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Corações flutuantes */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`heart-${i}`}
          className="absolute text-pink-300/30 animate-pulse"
          style={{
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 15) % 70}%`,
            animationDelay: `${i * 0.7}s`,
            fontSize: `${20 + (i % 3) * 10}px`
          }}
        >
          💖
        </div>
      ))}
      
      {/* Bolinhas flutuantes */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          className="absolute rounded-full bg-gradient-to-r from-pink-200/20 to-blue-200/20 animate-bounce"
          style={{
            width: `${8 + (i % 4) * 6}px`,
            height: `${8 + (i % 4) * 6}px`,
            left: `${5 + (i * 8) % 90}%`,
            top: `${10 + (i * 8) % 80}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      
      {/* Estrelas piscantes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute animate-pulse"
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${20 + (i * 12) % 60}%`,
            animationDelay: `${i * 1.2}s`,
            fontSize: '16px'
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthDate: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
      const payload = isLoginMode 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setLocation("/");
      } else {
        const data = await response.json();
        setError(data.error || "Erro na operação");
      }
    } catch (err) {
      setError("Erro de conexão");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-pink-200/30 via-purple-100/20 to-blue-200/30">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo e header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-4xl">👶</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mama Care</h1>
            <p className="text-gray-600">Cuidando de você e seu bebê</p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-2xl text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required={!isLoginMode}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent"
                    required={!isLoginMode}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLoginMode ? "Entrando..." : "Criando conta..."}
                  </div>
                ) : (
                  isLoginMode ? "Entrar" : "Criar conta"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                {isLoginMode ? "Não tem conta?" : "Já tem conta?"}{" "}
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-pink-500 font-semibold hover:underline"
                >
                  {isLoginMode ? "Registre-se" : "Faça login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Router simples com wouter
import { Switch, Route } from "wouter";

// Verificação simples de auth
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useState(() => {
    // Verificar se está logado
    fetch("/api/auth/me", { credentials: "include" })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setLocation("/login");
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLocation("/login");
      });
  });

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Component />;
  }

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;