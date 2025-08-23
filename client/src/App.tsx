function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👶</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Mama Care</h1>
              <p className="text-xs text-gray-500">Semana 20 • 2º trimestre</p>
            </div>
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

export default App;