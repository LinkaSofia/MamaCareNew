import { useEffect, useRef, useState } from 'react';
import { Baby } from 'lucide-react';

interface ThreeDBabyProps {
  week: number;
  size?: number;
}

export default function ThreeDBaby({ week, size = 80 }: ThreeDBabyProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate baby development stage based on week
  const getStageColor = (week: number) => {
    if (week <= 12) return "text-baby-pink-dark";
    if (week <= 24) return "text-baby-blue-dark";
    return "text-coral";
  };

  const getBabyIcon = (week: number) => {
    return <Baby className={`${getStageColor(week)} transition-colors duration-500`} />;
  };

  return (
    <div 
      className={`
        w-20 h-20 bg-white bg-opacity-20 rounded-full 
        flex items-center justify-center 
        ${isAnimating ? 'animate-bounce-slow' : 'animate-pulse-slow'}
        transition-all duration-1000
      `}
      style={{ width: size, height: size }}
      data-testid="three-d-baby"
    >
      <div className="text-2xl">
        {getBabyIcon(week)}
      </div>
    </div>
  );
}
