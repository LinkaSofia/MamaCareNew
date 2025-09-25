// OPÇÃO 3: Card Flutuante com Comparação Centralizada
// Para usar esta opção, substitua o conteúdo do dashboard.tsx

{/* Card de Comparação Flutuante */}
{development && (
  <div className="mx-4 mb-6">
    <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-8 shadow-2xl border-2 border-orange-300 relative">
      {/* Título */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🍎 Comparação de Tamanho
        </h2>
        <p className="text-gray-600">
          Seu bebê tem o tamanho de
        </p>
      </div>
      
      {/* Imagem Central */}
      <div className="flex justify-center mb-6">
        <div className="w-48 h-48 bg-white rounded-3xl flex items-center justify-center shadow-xl border-4 border-orange-200">
          {renderComparisonImage(development.fruit_comparison, development.fruit_image_url, 'large')}
        </div>
      </div>
      
      {/* Texto da Comparação */}
      <div className="text-center">
        <p className="text-3xl font-bold text-orange-600">
          {development.fruit_comparison ?? "Calculando..."}
        </p>
      </div>
    </div>
  </div>
)}






