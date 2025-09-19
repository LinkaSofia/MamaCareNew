import { Baby, Heart, Sparkles } from "lucide-react";

interface CreativeLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function CreativeLoading({ message = "Carregando...", size = "md" }: CreativeLoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Loading animado com ícones temáticos */}
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse`}>
          <Baby className="text-white animate-bounce" size={iconSizes[size]} />
        </div>
        
        {/* Elementos orbitais */}
        <div className="absolute inset-0 animate-spin">
          <Heart 
            className="absolute text-pink-400/60 animate-pulse" 
            size={iconSizes[size] / 2}
            style={{
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>
        
        <div className="absolute inset-0 animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}>
          <Sparkles 
            className="absolute text-purple-400/60 animate-pulse" 
            size={iconSizes[size] / 2}
            style={{
              bottom: '-8px',
              right: '-8px'
            }}
          />
        </div>
      </div>
      
      {/* Texto com animação */}
      <div className="text-center">
        <p className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          {message}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

