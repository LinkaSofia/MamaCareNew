// OPÇÃO 4: Layout em Linha com Comparação Integrada
// Para usar esta opção, substitua o conteúdo do dashboard.tsx

{/* Informações do Bebê com Comparação Integrada */}
{development && (
  <div className="glass-effect rounded-2xl p-6 mx-4 backdrop-blur-md bg-white/80 mb-4">
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Seu bebê está crescendo! 🌱
      </h3>
      <p className="text-gray-600">
        {currentWeek <= 12 ? '1º Trimestre - Formação inicial' : 
         currentWeek <= 28 ? '2º Trimestre - Desenvolvimento acelerado' : 
         '3º Trimestre - Preparação para o nascimento'}
      </p>
    </div>

    {/* Layout em Linha - Medidas + Comparação */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tamanho */}
      <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-6 rounded-2xl border border-pink-200 shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📏</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">Tamanho</span>
        </div>
        <p className="text-2xl font-bold text-pink-600">
          {development.length_cm ? `${development.length_cm} cm` : (development.size ?? "Calculando...")}
        </p>
      </div>

      {/* Peso */}
      <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl border border-purple-200 shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">⚖️</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">Peso</span>
        </div>
        <p className="text-2xl font-bold text-purple-600">
          {development.weight_grams && Number(development.weight_grams) > 0 
            ? `${development.weight_grams}g` 
            : development.weight || "< 1g"}
        </p>
      </div>

      {/* Comparação - Card Especial */}
      <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-6 rounded-2xl border-2 border-orange-300 shadow-xl">
        <div className="text-center">
          <h4 className="font-bold text-gray-800 text-lg mb-4">Comparação</h4>
          <div className="w-24 h-24 bg-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            {renderComparisonImage(development.fruit_comparison, development.fruit_image_url, 'large')}
          </div>
          <p className="text-lg font-bold text-orange-600 leading-tight">
            {development.fruit_comparison ?? "Calculando..."}
          </p>
        </div>
      </div>
    </div>
  </div>
)}







