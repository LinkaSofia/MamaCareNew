import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Weight, Apple } from 'lucide-react';

interface SizeComparisonProps {
  week: number;
  sizeCm: number;
  weightGrams: number;
  fruitComparison: string;
  fruitImageUrl?: string;
  className?: string;
}

// Mapeamento de comparações de frutas/objetos com imagens
const COMPARISON_IMAGES = {
  // Semanas 1-4
  'semente de romã': '🍇',
  'grão de feijão': '🫘',
  'semente de gergelim': '🌰',
  'grão de arroz': '🍚',
  
  // Semanas 5-8
  'semente de maçã': '🍎',
  'grão de milho': '🌽',
  'ervilha': '🫛',
  'blueberry': '🫐',
  
  // Semanas 9-12
  'uva': '🍇',
  'morango': '🍓',
  'cereja': '🍒',
  'tomate cereja': '🍅',
  
  // Semanas 13-16
  'limão': '🍋',
  'laranja': '🍊',
  'pêssego': '🍑',
  'maçã pequena': '🍎',
  
  // Semanas 17-20
  'banana': '🍌',
  'pera': '🍐',
  'manga': '🥭',
  'abacate': '🥑',
  
  // Semanas 21-24
  'melancia pequena': '🍉',
  'abacaxi': '🍍',
  'coco': '🥥',
  'melão': '🍈',
  
  // Semanas 25-28
  'couve-flor': '🥬',
  'berinjela': '🍆',
  'abobrinha': '🥒',
  'cenoura': '🥕',
  
  // Semanas 29-32
  'repolho': '🥬',
  'cabeça de alface': '🥬',
  'couve': '🥬',
  'espinafre': '🥬',
  
  // Semanas 33-36
  'abacaxi grande': '🍍',
  'melancia': '🍉',
  'abóbora': '🎃',
  'melão grande': '🍈',
  
  // Semanas 37-40
  'cabeça de alface grande': '🥬',
  'couve-flor grande': '🥬',
  'repolho grande': '🥬',
  'abóbora grande': '🎃'
};

// Função para encontrar a imagem correspondente
const getComparisonImage = (comparison: string): string => {
  const normalizedComparison = comparison.toLowerCase().trim();
  
  // Buscar correspondência exata primeiro
  for (const [key, emoji] of Object.entries(COMPARISON_IMAGES)) {
    if (normalizedComparison.includes(key)) {
      return emoji;
    }
  }
  
  // Buscar correspondências parciais
  if (normalizedComparison.includes('romã') || normalizedComparison.includes('pomegranate')) {
    return '🍇';
  }
  if (normalizedComparison.includes('feijão') || normalizedComparison.includes('bean')) {
    return '🫘';
  }
  if (normalizedComparison.includes('gergelim') || normalizedComparison.includes('sesame')) {
    return '🌰';
  }
  if (normalizedComparison.includes('arroz') || normalizedComparison.includes('rice')) {
    return '🍚';
  }
  if (normalizedComparison.includes('maçã') || normalizedComparison.includes('apple')) {
    return '🍎';
  }
  if (normalizedComparison.includes('milho') || normalizedComparison.includes('corn')) {
    return '🌽';
  }
  if (normalizedComparison.includes('ervilha') || normalizedComparison.includes('pea')) {
    return '🫛';
  }
  if (normalizedComparison.includes('uva') || normalizedComparison.includes('grape')) {
    return '🍇';
  }
  if (normalizedComparison.includes('morango') || normalizedComparison.includes('strawberry')) {
    return '🍓';
  }
  if (normalizedComparison.includes('cereja') || normalizedComparison.includes('cherry')) {
    return '🍒';
  }
  if (normalizedComparison.includes('limão') || normalizedComparison.includes('lemon')) {
    return '🍋';
  }
  if (normalizedComparison.includes('laranja') || normalizedComparison.includes('orange')) {
    return '🍊';
  }
  if (normalizedComparison.includes('banana')) {
    return '🍌';
  }
  if (normalizedComparison.includes('pera') || normalizedComparison.includes('pear')) {
    return '🍐';
  }
  if (normalizedComparison.includes('manga') || normalizedComparison.includes('mango')) {
    return '🥭';
  }
  if (normalizedComparison.includes('abacate') || normalizedComparison.includes('avocado')) {
    return '🥑';
  }
  if (normalizedComparison.includes('melancia') || normalizedComparison.includes('watermelon')) {
    return '🍉';
  }
  if (normalizedComparison.includes('abacaxi') || normalizedComparison.includes('pineapple')) {
    return '🍍';
  }
  if (normalizedComparison.includes('coco') || normalizedComparison.includes('coconut')) {
    return '🥥';
  }
  if (normalizedComparison.includes('melão') || normalizedComparison.includes('melon')) {
    return '🍈';
  }
  if (normalizedComparison.includes('couve') || normalizedComparison.includes('cabbage')) {
    return '🥬';
  }
  if (normalizedComparison.includes('berinjela') || normalizedComparison.includes('eggplant')) {
    return '🍆';
  }
  if (normalizedComparison.includes('abobrinha') || normalizedComparison.includes('zucchini')) {
    return '🥒';
  }
  if (normalizedComparison.includes('cenoura') || normalizedComparison.includes('carrot')) {
    return '🥕';
  }
  if (normalizedComparison.includes('abóbora') || normalizedComparison.includes('pumpkin')) {
    return '🎃';
  }
  
  // Fallback para objetos não encontrados
  return '🍎';
};

export default function SizeComparison({ 
  week, 
  sizeCm, 
  weightGrams, 
  fruitComparison, 
  fruitImageUrl,
  className = "" 
}: SizeComparisonProps) {
  const [comparisonImage, setComparisonImage] = useState<string>('🍎');
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    if (fruitImageUrl && !imageError) {
      setComparisonImage(fruitImageUrl);
    } else {
      const emojiImage = getComparisonImage(fruitComparison);
      setComparisonImage(emojiImage);
    }
  }, [fruitComparison, fruitImageUrl, imageError]);

  // Função para converter URL do banco para URL válida do navegador
  const convertDatabaseUrlToValidUrl = (url: string): string => {
    if (url.startsWith('/client/src/assets/')) {
      return url.replace('/client/src/assets/', '/src/assets/');
    }
    return url;
  };

  // Função para verificar se é uma URL de imagem válida
  const isValidImageUrl = (url: string): boolean => {
    return url && (url.startsWith('/src/assets/') || url.startsWith('/client/src/assets/') || url.startsWith('http'));
  };

  return (
    <Card className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-xl border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Tamanho */}
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Ruler className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tamanho</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{sizeCm} cm</p>
          </div>

          {/* Peso */}
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Weight className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peso</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{weightGrams}g</p>
          </div>

          {/* Comparação */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border-2 border-orange-200 dark:border-orange-700">
              {isValidImageUrl(comparisonImage) ? (
                <img 
                  src={convertDatabaseUrlToValidUrl(comparisonImage)} 
                  alt={fruitComparison}
                  className="w-16 h-16 object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-4xl">{comparisonImage}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Comparação</p>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {fruitComparison}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



