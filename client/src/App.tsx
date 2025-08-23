function Dashboard() {
  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🤱 Mama Care</h1>
        <p className="text-gray-600">Dashboard funcionando!</p>
      </div>
    </div>
  );
}

function Login() {
  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
        <a href="/" className="text-blue-600 hover:underline">Ir para Dashboard</a>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}

export default App;