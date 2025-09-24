// OPÇÃO 2: Layout Minimalista com Comparação Lateral
// Para usar esta opção, substitua o conteúdo do dashboard.tsx

{/* Card de Comparação Lateral - Lado Direito */}
{development && (
  <div className="mx-4 mb-6">
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Imagem de Comparação */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            {renderComparisonImage(development.fruit_comparison, development.fruit_image_url, 'large')}
          </div>
        </div>
        
        {/* Informações */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Comparação de Tamanho
          </h3>
          <p className="text-lg text-gray-600 mb-3">
            Seu bebê tem o tamanho de
          </p>
          <p className="text-2xl font-bold text-orange-600">
            {development.fruit_comparison ?? "Calculando..."}
          </p>
        </div>
      </div>
    </div>
  </div>
)}





