import { Heart, Sparkles, Baby, Flower2 } from "lucide-react";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Corações flutuantes com diferentes tamanhos e cores */}
      {[...Array(12)].map((_, i) => (
        <Heart
          key={`heart-${i}`}
          className={`absolute text-pink-300/40 animate-float-${i % 4 + 1}`}
          size={15 + (i % 4) * 8}
          style={{
            left: `${5 + (i * 8) % 85}%`,
            top: `${10 + (i * 7) % 75}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${4 + (i % 3)}s`,
            color: i % 3 === 0 ? '#fbb6ce' : i % 3 === 1 ? '#f0abfc' : '#a5b4fc'
          }}
        />
      ))}
      
      {/* Bolinhas flutuantes com gradientes */}
      {[...Array(16)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          className={`absolute rounded-full animate-bounce`}
          style={{
            width: `${6 + (i % 5) * 4}px`,
            height: `${6 + (i % 5) * 4}px`,
            left: `${3 + (i * 6) % 92}%`,
            top: `${8 + (i * 5) % 85}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 4)}s`,
            background: i % 4 === 0 
              ? 'linear-gradient(45deg, #fbb6ce, #f0abfc)' 
              : i % 4 === 1 
              ? 'linear-gradient(45deg, #a5b4fc, #c4b5fd)'
              : i % 4 === 2
              ? 'linear-gradient(45deg, #fde68a, #fbbf24)'
              : 'linear-gradient(45deg, #86efac, #34d399)',
            opacity: 0.3 + (i % 3) * 0.1
          }}
        />
      ))}
      
      {/* Estrelas piscantes com diferentes formas */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`star-${i}`}
          className={`absolute animate-pulse`}
          style={{
            width: `${3 + (i % 3) * 2}px`,
            height: `${3 + (i % 3) * 2}px`,
            left: `${15 + (i * 9) % 70}%`,
            top: `${18 + (i * 8) % 65}%`,
            animationDelay: `${i * 0.8}s`,
            background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#f97316',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            opacity: 0.4 + (i % 2) * 0.2
          }}
        />
      ))}
      
      {/* Ícones temáticos de gestação */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`icon-${i}`}
          className="absolute animate-float-gentle"
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${25 + (i * 12) % 55}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${6 + (i % 2)}s`
          }}
        >
          {i % 3 === 0 ? (
            <Baby className="text-pink-300/30" size={24 + (i % 2) * 8} />
          ) : i % 3 === 1 ? (
            <Flower2 className="text-purple-300/30" size={20 + (i % 2) * 6} />
          ) : (
            <Sparkles className="text-blue-300/30" size={22 + (i % 2) * 7} />
          )}
        </div>
      ))}
      
      {/* Ondas suaves de fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-100/20 via-purple-100/10 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/20 via-pink-100/10 to-transparent"></div>
    </div>
  );
}
