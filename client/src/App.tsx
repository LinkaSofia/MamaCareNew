function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-blue-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mama Care</h1>
        <p className="text-gray-600">Aplicação carregando...</p>
        <div className="mt-4">
          <a href="/login" className="text-blue-600 hover:underline">Ir para Login</a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return <TestPage />;
}

export default App;