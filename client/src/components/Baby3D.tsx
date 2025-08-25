import { useState, useEffect } from 'react';
import { getInterpolatedBabyData, getPregnancyPhase } from '@/lib/baby-data';

// Importar as imagens 3D geradas
import baby8weeks from '@assets/generated_images/8-week_fetus_3D_realistic_b436f945.png';
import baby12weeks from '@assets/generated_images/12-week_fetus_3D_realistic_52fbd5db.png';
import baby16weeks from '@assets/generated_images/16-week_fetus_3D_realistic_9c0a57bb.png';
import baby20weeks from '@assets/generated_images/20-week_fetus_3D_realistic_87f5a187.png';
import baby28weeks from '@assets/generated_images/28-week_fetus_3D_realistic_1158e5df.png';
import baby36weeks from '@assets/generated_images/36-week_fetus_3D_realistic_e9a2b0f5.png';

interface Baby3DProps {
  week: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showInfo?: boolean;
  interactive?: boolean;
  animate?: boolean;
}

const BABY_IMAGES = {
  1: baby8weeks,  // Para semanas muito iniciais
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
  animate = true
}: Baby3DProps) {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  const babyData = getInterpolatedBabyData(week);
  const pregnancyPhase = getPregnancyPhase(week);

  useEffect(() => {
    // Determinar qual imagem usar baseada na semana
    let selectedImage = baby8weeks; // padrão para semanas iniciais

    if (week >= 36) {
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

    setCurrentImage(selectedImage);
    
    // Simular carregamento para efeito suave
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [week]);

  useEffect(() => {
    if (!animate) return;
    
    // Animação de pulsação sutil para simular batimento cardíaco
    const heartbeatInterval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
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
      <div className={`flex items-center justify-center ${getSizeClasses()} ${className}`}>
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
      className={`relative ${getSizeClasses()} ${className} group`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-3xl bg-gradient-to-br 
        ${pregnancyPhase.phase === 'Primeiro Trimestre' ? 'from-pink-100/30 to-rose-100/30' : 
          pregnancyPhase.phase === 'Segundo Trimestre' ? 'from-blue-100/30 to-sky-100/30' :
          'from-purple-100/30 to-violet-100/30'}
        backdrop-blur-sm transition-all duration-500
        ${interactive ? 'hover:scale-105 cursor-pointer' : ''}
        ${animate && animationPhase % 2 === 0 ? 'scale-[1.02]' : 'scale-100'}
      `}>
        {/* Imagem principal do bebê */}
        <img
          src={currentImage}
          alt={`Bebê 3D - Semana ${week}`}
          className={`
            w-full h-full object-cover rounded-3xl transition-all duration-700
            ${animate ? 'animate-pulse-slow' : ''}
            ${isHovered ? 'scale-110' : 'scale-100'}
          `}
          style={{
            filter: `
              drop-shadow(0 15px 35px rgba(0,0,0,0.15)) 
              brightness(${isHovered ? '1.1' : '1'}) 
              contrast(${isHovered ? '1.1' : '1'})
            `
          }}
        />
        
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer"></div>
        
        {/* Partículas flutuantes */}
        {animate && (
          <>
            <div className="absolute top-4 left-4 w-2 h-2 bg-pink-300/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-blue-300/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-purple-300/50 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          </>
        )}
        
        {/* Informações do bebê */}
        {showInfo && (
          <>
            {/* Badge com a semana */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
              <span className="text-xs font-semibold text-gray-700">
                {week}ª semana
              </span>
            </div>

            {/* Informações na parte inferior */}
            <div className={`
              absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent 
              rounded-b-3xl p-4 transition-all duration-300
              ${isHovered || !interactive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
              <div className="text-white">
                <div className="text-sm font-medium mb-1">
                  {babyData.fruit_comparison}
                </div>
                <div className="text-xs opacity-80">
                  {babyData.length_cm && `${babyData.length_cm}cm`} 
                  {babyData.weight_grams && babyData.length_cm && ' • '}
                  {babyData.weight_grams && `${babyData.weight_grams}g`}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Indicador de fase da gravidez */}
        <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
          pregnancyPhase.phase === 'Primeiro Trimestre' ? 'bg-pink-400' :
          pregnancyPhase.phase === 'Segundo Trimestre' ? 'bg-blue-400' : 
          'bg-purple-400'
        } animate-pulse`} title={pregnancyPhase.phase}>
        </div>

        {/* Efeito de batimento cardíaco */}
        {animate && week >= 8 && (
          <div className="absolute top-6 left-6">
            <div className={`
              text-red-400 transition-all duration-200 
              ${animationPhase === 0 ? 'scale-125 opacity-100' : 'scale-100 opacity-60'}
            `}>
              💓
            </div>
          </div>
        )}

        {/* Overlay interativo */}
        {interactive && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200/10 to-blue-200/10 rounded-3xl flex items-center justify-center">
            <div className="text-white/80 text-sm font-medium bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
              Clique para mais detalhes
            </div>
          </div>
        )}
      </div>

      {/* Informações estendidas para componentes maiores */}
      {size === 'large' && showInfo && (
        <div className="mt-4 text-center">
          <div className={`text-lg font-semibold mb-1 ${pregnancyPhase.color}`}>
            {pregnancyPhase.phase}
          </div>
          <div className="text-gray-600 text-sm">
            {pregnancyPhase.description}
          </div>
        </div>
      )}
    </div>
  );
}