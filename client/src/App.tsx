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

// Login simples
function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🤱 Mama Care</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Entrar
          </button>
          <p className="text-sm text-gray-600">
            Não tem conta? <a href="/register" className="text-pink-500 hover:underline">Registre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Router simples com wouter
import { Switch, Route } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;