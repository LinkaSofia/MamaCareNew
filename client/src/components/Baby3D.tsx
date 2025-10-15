import { useState, useEffect } from 'react';
import { getInterpolatedBabyData, getPregnancyPhase } from '@/lib/baby-data';
import SizeComparison from './SizeComparison';

// Importar as imagens 3D geradas
import baby8weeks from '@assets/generated_images/8-week_fetus_3D_realistic_b436f945.png';
import baby12weeks from '@assets/generated_images/12-week_fetus_3D_realistic_52fbd5db.png';
import baby16weeks from '@assets/generated_images/16-week_fetus_3D_realistic_9c0a57bb.png';
import baby20weeks from '@assets/generated_images/20-week_fetus_3D_realistic_87f5a187.png';
import baby28weeks from '@assets/generated_images/28-week_fetus_3D_realistic_1158e5df.png';
import baby36weeks from '@assets/generated_images/36-week_fetus_3D_realistic_e9a2b0f5.png';
// Imagens personalizadas
import baby2weeks from '@assets/2_1757176256170.jpeg';
import baby3weeks from '@assets/3_1757174102100.png';

interface Baby3DProps {
  week: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showInfo?: boolean;
  interactive?: boolean;
  animate?: boolean;
  babyImageUrl?: string; // URL da imagem do banco de dados
  fruitImageUrl?: string; // URL da imagem de comparação do banco de dados
  showSizeComparison?: boolean; // Nova prop para mostrar comparação de tamanho
  developmentData?: {
    length_cm: number;
    weight_grams: number;
    fruit_comparison: string;
  };
}

const BABY_IMAGES = {
  1: baby8weeks,  // Para semanas muito iniciais
  2: baby2weeks,  // Imagem personalizada da semana 2
  3: baby3weeks,  // Imagem personalizada da semana 3
  4: baby8weeks,
  8: baby8weeks,
  12: baby12weeks,
  16: baby16weeks,
  20: baby20weeks,
  24: baby20weeks,
  28: baby28weeks,
  32: baby28weeks,
  36: baby36weeks,
  40: baby36weeks,
};

export default function Baby3D({ 
  week, 
  size = 'medium',
  className = "",
  showInfo = true,
  interactive = false,
  animate = true,
  babyImageUrl,
  fruitImageUrl,
  showSizeComparison = false,
  developmentData
}: Baby3DProps) {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  // animationPhase removido para evitar piscar
  
  const babyData = getInterpolatedBabyData(week);
  const pregnancyPhase = getPregnancyPhase(week);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🖼️ Carregando imagem para semana ${week}`);
      console.log(`🖼️ URL do banco de dados:`, babyImageUrl);
    }
    
    // Função para verificar se a URL do banco é válida e acessível
    const isValidDatabaseImage = (url: string) => {
      // URLs que começam com @assets/ são válidas (vindas do banco de dados)
      if (url.startsWith('@assets/')) {
        return true;
      }
      // URLs que começam com /client/src/assets/ são válidas (convertidas para /src/assets/)
      if (url.startsWith('/client/src/assets/')) {
        return true;
      }
      // URLs que começam com /attached_assets/ são válidas
      if (url.startsWith('/attached_assets/')) {
        return true;
      }
      // URLs completas (http/https) são válidas
      if (url.startsWith('http')) {
        return true;
      }
      return false;
    };
    
    // Função para converter URL do banco para URL válida do navegador
    const convertDatabaseUrlToValidUrl = (url: string) => {
      if (url.startsWith('@assets/')) {
        return url.replace('@assets/', '/src/assets/');
      }
      if (url.startsWith('/client/src/assets/')) {
        return url.replace('/client/src/assets/', '/src/assets/');
      }
      return url;
    };
    
    // Priorizar imagem do banco de dados APENAS se for uma URL válida
    if (babyImageUrl && isValidDatabaseImage(babyImageUrl)) {
      const validUrl = convertDatabaseUrlToValidUrl(babyImageUrl);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🖼️ Usando imagem válida do banco de dados:`, babyImageUrl);
        console.log(`🖼️ URL convertida:`, validUrl);
      }
      setCurrentImage(validUrl);
      setImageError(false);
      setIsLoading(false);
      return;
    }
    
    // Fallback para imagens importadas diretamente baseadas na semana
    let selectedImage = baby8weeks;

    if (week === 2) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🖼️ Usando baby2weeks para semana 2 (fallback)`);
      }
      selectedImage = baby2weeks;
    } else if (week === 3) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🖼️ Usando baby3weeks para semana 3 (fallback)`);
      }
      selectedImage = baby3weeks;
    } else if (week >= 36) {
      selectedImage = baby36weeks;
    } else if (week >= 28) {
      selectedImage = baby28weeks;
    } else if (week >= 20) {
      selectedImage = baby20weeks;
    } else if (week >= 16) {
      selectedImage = baby16weeks;
    } else if (week >= 12) {
      selectedImage = baby12weeks;
    } else {
      selectedImage = baby8weeks;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🖼️ Imagem selecionada (fallback):`, selectedImage);
      if (babyImageUrl && !isValidDatabaseImage(babyImageUrl)) {
        console.log(`⚠️ URL do banco inválida ignorada:`, babyImageUrl);
      }
    }
    setCurrentImage(selectedImage);
    setImageError(false);
    setIsLoading(false);
  }, [week, babyImageUrl]);

  useEffect(() => {
    if (!animate) return;
    
    // Animação de pulsação sutil para simular batimento cardíaco
    // Usando uma animação CSS em vez de estado para evitar piscar
    const heartbeatInterval = setInterval(() => {
      // A animação será controlada via CSS classes
      const element = document.querySelector('.baby-3d-container');
      if (element) {
        element.classList.add('heartbeat-pulse');
        setTimeout(() => {
          element.classList.remove('heartbeat-pulse');
        }, 200);
      }
    }, 1200);

    return () => clearInterval(heartbeatInterval);
  }, [animate]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-32 h-32';
      case 'medium':
        return 'w-48 h-48';
      case 'large':
        return 'w-64 h-64 lg:w-80 lg:h-80';
      default:
        return 'w-48 h-48';
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${getSizeClasses()} ${className}`}
        data-testid={`baby-3d-loading-week-${week}`}
      >
        <div className="relative">
          {/* Loading animation com batimento cardíaco */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-blue-200 animate-pulse"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-pink-300 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-blue-100 animate-bounce"></div>
          
          {/* Heart icon no centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-pink-500 animate-pulse">💖</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`baby-3d-container relative ${getSizeClasses()} ${className} group`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      data-testid={`baby-3d-component-week-${week}`}
    >
      <div className={`
        relative overflow-hidden rounded-3xl bg-gradient-to-br 
        ${pregnancyPhase.phase === 'Primeiro Trimestre' ? 'from-pink-100/30 to-rose-100/30' : 
          pregnancyPhase.phase === 'Segundo Trimestre' ? 'from-blue-100/30 to-sky-100/30' :
          'from-purple-100/30 to-violet-100/30'}
        backdrop-blur-sm transition-all duration-500
        ${interactive ? 'hover:scale-105 cursor-pointer' : ''}
        scale-100
      `}>
        {/* Imagem principal do bebê */}
        {currentImage && !imageError ? (
          <img 
            src={currentImage}
            alt={`Bebê na semana ${week} de desenvolvimento`}
            className={`
              w-full h-full object-cover rounded-full transition-all duration-700
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            style={{
              filter: `
                drop-shadow(0 15px 35px rgba(0,0,0,0.15)) 
                brightness(${isHovered ? '1.1' : '1'}) 
                contrast(${isHovered ? '1.1' : '1'})
              `
            }}
            onError={() => setImageError(true)}
            data-testid={`baby-image-week-${week}`}
          />
        ) : (
          <div 
            className={`
              w-full h-full rounded-full bg-gradient-to-br from-pink-200 to-blue-200 
              flex items-center justify-center transition-all duration-700
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            data-testid={`baby-fallback-week-${week}`}
          >
            <div className="text-4xl opacity-60">👶</div>
          </div>
        )}
        
        {/* Efeito de brilho removido para evitar piscar */}
        
        {/* Partículas flutuantes removidas para evitar distração */}
        
        {/* Informações do bebê - removido tamanho e peso */}

        {/* Indicador de fase da gravidez */}
        <div 
          className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
            pregnancyPhase.phase === 'Primeiro Trimestre' ? 'bg-pink-400' :
            pregnancyPhase.phase === 'Segundo Trimestre' ? 'bg-blue-400' : 
            'bg-purple-400'
          }`} 
          title={pregnancyPhase.phase}
          data-testid={`pregnancy-phase-indicator-${pregnancyPhase.phase.toLowerCase().replace(/\s+/g, '-')}`}
        ></div>

        {/* Efeito de batimento cardíaco */}
        {animate && week >= 8 && (
          <div className="absolute top-6 left-6">
            <div className="text-red-400 scale-100 opacity-60">
              💓
            </div>
          </div>
        )}

        {/* Overlay interativo */}
        {interactive && isHovered && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-pink-200/10 to-blue-200/10 rounded-3xl flex items-center justify-center"
            data-testid="interactive-overlay"
          >
            <div 
              className="text-gray-800 text-sm font-medium bg-white/90 rounded-full px-4 py-2 backdrop-blur-sm shadow-lg"
              data-testid="interactive-overlay-text"
            >
              Clique para mais detalhes
            </div>
          </div>
        )}
      </div>

      {/* Comparação de tamanho com imagens reais */}
      {showSizeComparison && developmentData && (
        <div className="mt-4">
          <SizeComparison
            week={week}
            sizeCm={developmentData.length_cm}
            weightGrams={developmentData.weight_grams}
            fruitComparison={developmentData.fruit_comparison}
            fruitImageUrl={fruitImageUrl}
          />
        </div>
      )}
    </div>
  );
}