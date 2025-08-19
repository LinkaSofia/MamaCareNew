import { Heart, User, Lock } from "lucide-react";

interface ErrorIllustrationProps {
  type: 'login' | 'register' | 'general';
  title: string;
  message: string;
}

export function ErrorIllustration({ type, title, message }: ErrorIllustrationProps) {
  return (
    <div className="text-center py-6">
      {/* SVG Illustration */}
      <div className="mb-6 flex justify-center">
        <svg width="200" height="160" viewBox="0 0 200 160" className="text-pink-300">
          {/* Fundo com gradiente */}
          <defs>
            <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f8bbd9', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#87ceeb', stopOpacity: 0.3}} />
            </linearGradient>
          </defs>
          
          {/* Fundo suave */}
          <ellipse cx="100" cy="140" rx="80" ry="15" fill="url(#errorGradient)" />
          
          {/* Personagem principal */}
          <g transform="translate(100, 80)">
            {/* Corpo */}
            <ellipse cx="0" cy="20" rx="25" ry="35" fill="#f8bbd9" opacity="0.7" />
            
            {/* Cabeça */}
            <circle cx="0" cy="-20" r="25" fill="#f8bbd9" opacity="0.8" />
            
            {/* Rosto triste */}
            <circle cx="-8" cy="-25" r="2" fill="#d946ef" opacity="0.6" />
            <circle cx="8" cy="-25" r="2" fill="#d946ef" opacity="0.6" />
            <path d="M-8 -10 Q0 -5 8 -10" stroke="#d946ef" strokeWidth="2" fill="none" opacity="0.6" />
            
            {/* Braços */}
            <ellipse cx="-30" cy="10" rx="8" ry="20" fill="#f8bbd9" opacity="0.7" transform="rotate(-20)" />
            <ellipse cx="30" cy="10" rx="8" ry="20" fill="#f8bbd9" opacity="0.7" transform="rotate(20)" />
            
            {/* Pernas */}
            <ellipse cx="-12" cy="55" rx="6" ry="15" fill="#f8bbd9" opacity="0.7" />
            <ellipse cx="12" cy="55" rx="6" ry="15" fill="#f8bbd9" opacity="0.7" />
          </g>
          
          {/* Elementos decorativos baseados no tipo de erro */}
          {type === 'login' && (
            <>
              {/* Cadeado quebrado */}
              <g transform="translate(60, 40)">
                <rect x="0" y="10" width="20" height="15" rx="3" fill="#ef4444" opacity="0.6" />
                <path d="M5 10 Q5 5, 10 5 Q15 5, 15 10" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
                <line x1="12" y1="8" x2="20" y2="0" stroke="#ef4444" strokeWidth="2" opacity="0.6" />
              </g>
              
              {/* Interrogação */}
              <g transform="translate(140, 30)">
                <circle cx="0" cy="0" r="12" fill="#fbbf24" opacity="0.6" />
                <text x="0" y="6" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold">?</text>
              </g>
            </>
          )}
          
          {type === 'register' && (
            <>
              {/* Envelope */}
              <g transform="translate(50, 35)">
                <rect x="0" y="0" width="24" height="16" rx="2" fill="#ef4444" opacity="0.6" />
                <path d="M0 0 L12 8 L24 0" stroke="white" strokeWidth="1.5" fill="none" />
              </g>
              
              {/* X mark */}
              <g transform="translate(145, 35)">
                <circle cx="0" cy="0" r="10" fill="#ef4444" opacity="0.6" />
                <line x1="-5" y1="-5" x2="5" y2="5" stroke="white" strokeWidth="2" />
                <line x1="5" y1="-5" x2="-5" y2="5" stroke="white" strokeWidth="2" />
              </g>
            </>
          )}
          
          {/* Corações tristes flutuando */}
          <g opacity="0.4">
            <path d="M30 20 L25 15 Q22 12, 22 10 Q22 8, 25 8 Q28 8, 28 10 Q28 8, 31 8 Q34 8, 34 10 Q34 12, 31 15 Z" 
                  fill="#f8bbd9" transform="rotate(15)" />
            <path d="M170 25 L165 20 Q162 17, 162 15 Q162 13, 165 13 Q168 13, 168 15 Q168 13, 171 13 Q174 13, 174 15 Q174 17, 171 20 Z" 
                  fill="#87ceeb" transform="rotate(-10)" />
          </g>
        </svg>
      </div>
      
      {/* Título e mensagem */}
      <h3 className="text-xl font-semibold text-charcoal mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">{message}</p>
      
      {/* Decoração de corações */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <Heart size={16} className="text-pink-300" />
        <div className="w-8 h-px bg-gradient-to-r from-pink-300 to-blue-300"></div>
        <Heart size={16} className="text-blue-300" />
      </div>
    </div>
  );
}