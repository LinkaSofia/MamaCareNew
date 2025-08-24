import { useState, useEffect } from 'react';

// Importar as imagens 3D geradas
import baby8weeks from '@assets/generated_images/8-week_fetus_3D_realistic_b436f945.png';
import baby12weeks from '@assets/generated_images/12-week_fetus_3D_realistic_52fbd5db.png';
import baby16weeks from '@assets/generated_images/16-week_fetus_3D_realistic_9c0a57bb.png';
import baby20weeks from '@assets/generated_images/20-week_fetus_3D_realistic_87f5a187.png';
import baby28weeks from '@assets/generated_images/28-week_fetus_3D_realistic_1158e5df.png';
import baby36weeks from '@assets/generated_images/36-week_fetus_3D_realistic_e9a2b0f5.png';

interface Baby3DProps {
  week: number;
  className?: string;
}

const BABY_IMAGES = {
  8: baby8weeks,
  12: baby12weeks,
  16: baby16weeks,
  20: baby20weeks,
  28: baby28weeks,
  36: baby36weeks,
};

export default function Baby3D({ week, className = "" }: Baby3DProps) {
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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
    } else if (week >= 8) {
      selectedImage = baby8weeks;
    }

    setCurrentImage(selectedImage);
    
    // Simular carregamento para efeito suave
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [week]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100/20 to-pink-100/20 backdrop-blur-sm">
        <img
          src={currentImage}
          alt={`Bebê 3D - Semana ${week}`}
          className="w-full h-full object-cover rounded-3xl animate-pulse-slow"
          style={{
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
          }}
        />
        
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        {/* Badge com a semana */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-xs font-semibold text-gray-700">
            {week}ª semana
          </span>
        </div>
      </div>
    </div>
  );
}