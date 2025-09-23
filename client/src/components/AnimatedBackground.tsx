import React from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Gradiente de fundo principal */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-pink-100 to-purple-100" />
      
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Corações grandes */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-full h-full text-blue-300">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <div className="absolute top-32 right-16 w-12 h-12 opacity-15 animate-bounce">
          <svg viewBox="0 0 24 24" className="w-full h-full text-pink-300">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="absolute bottom-32 left-20 w-10 h-10 opacity-20 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-full h-full text-pink-400">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Estrelas */}
        <div className="absolute top-40 left-1/4 w-6 h-6 opacity-25 animate-ping">
          <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-300">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="absolute top-60 right-1/3 w-4 h-4 opacity-30 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-200">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="absolute bottom-40 right-1/4 w-5 h-5 opacity-20 animate-bounce">
          <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-300">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Círculos pequenos */}
        <div className="absolute top-24 right-1/2 w-3 h-3 bg-pink-300 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-48 left-1/3 w-2 h-2 bg-yellow-300 rounded-full opacity-25 animate-bounce" />
        <div className="absolute bottom-48 right-1/3 w-4 h-4 bg-blue-300 rounded-full opacity-20 animate-ping" />
        <div className="absolute bottom-24 left-1/2 w-2 h-2 bg-pink-400 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-16 w-3 h-3 bg-purple-300 rounded-full opacity-25 animate-bounce" />
        <div className="absolute top-1/3 right-20 w-2 h-2 bg-pink-200 rounded-full opacity-30 animate-ping" />

        {/* Formas abstratas */}
        <div className="absolute top-16 right-1/4 w-8 h-8 opacity-10 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-full h-full text-purple-300">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="absolute bottom-16 left-1/4 w-6 h-6 opacity-15 animate-bounce">
          <svg viewBox="0 0 24 24" className="w-full h-full text-pink-300">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Ondas suaves */}
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-5">
          <svg viewBox="0 0 1200 120" className="w-full h-full text-pink-200">
            <path
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}