import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSvg from '@/assets/logo.svg';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    // Iniciar partículas após 0.2s
    const particlesTimer = setTimeout(() => {
      setShowParticles(true);
    }, 200);

    // Mostrar logo após 0.3s
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 300);

    // Mostrar título após 0.8s
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 800);

    // Mostrar subtítulo após 1.5s
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
    }, 1500);

    // Completar após 3 segundos
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(particlesTimer);
      clearTimeout(logoTimer);
      clearTimeout(titleTimer);
      clearTimeout(subtitleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background com gradiente animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Efeito de brilho rotativo */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Partículas flutuantes */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-70"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  background: `linear-gradient(45deg, ${
                    ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 4)]
                  }, ${
                    ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24'][Math.floor(Math.random() * 4)]
                  })`,
                  left: `${Math.random() * 100}%`,
                }}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  y: -20,
                  scale: [0, 1, 0.8, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Círculos de fundo animados */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
          style={{
            background: "linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))",
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full"
          style={{
            background: "linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full"
          style={{
            background: "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.2))",
          }}
          animate={{
            scale: [1, 1.6, 1],
            rotate: [0, -180, -360],
            x: [0, 10, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/2 w-20 h-20 rounded-full"
          style={{
            background: "linear-gradient(45deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.2))",
          }}
          animate={{
            scale: [1.1, 0.8, 1.1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, -25, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo animada */}
        <AnimatePresence>
          {showLogo && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: 1,
                rotate: 0,
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
              }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Glow effect atrás da logo */}
                <motion.div
                  className="absolute inset-0 blur-2xl opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.4), rgba(139, 92, 246, 0.4))",
                  }}
                />
                
                {/* Logo SVG */}
                <img 
                  src={logoSvg} 
                  alt="MamaCare Logo" 
                  className="w-48 h-48 md:w-64 md:h-64 relative z-10"
                  style={{
                    filter: "drop-shadow(0 10px 30px rgba(236, 72, 153, 0.3))",
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nome do app */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-3"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                MamaCare
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtítulo */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              className="text-lg md:text-xl text-gray-600 mt-2 font-light text-center px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Sua jornada maternal começa aqui
            </motion.p>
          )}
        </AnimatePresence>

        {/* Barra de progresso sutil */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.div
              className="mt-8 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Efeito de brilho */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{
          duration: 2,
          delay: 1,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-pink-200/30 via-transparent to-transparent rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}
