import React, { useEffect, useRef } from "react";

const HEART_COLORS = [
  "text-pink-300",
  "text-pink-400",
  "text-pink-500",
  "text-rose-300",
  "text-rose-400",
  "text-fuchsia-300",
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function FloatingHearts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hearts: HTMLSpanElement[] = [];

    for (let i = 0; i < 18; i++) {
      const heart = document.createElement("span");
      heart.innerText = "❤";
      heart.className = `absolute select-none pointer-events-none text-3xl opacity-30 animate-floating-heart ${HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]}`;
      heart.style.left = `${randomBetween(0, 95)}vw`;
      heart.style.top = `${randomBetween(0, 90)}vh`;
      heart.style.fontSize = `${randomBetween(1.5, 3)}rem`;
      heart.style.animationDuration = `${randomBetween(6, 14)}s`;
      container.appendChild(heart);
      hearts.push(heart);
    }

    return () => {
      hearts.forEach((h) => h.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}

// Adicione este CSS em seu arquivo global ou tailwind.config.js
// Se usar Tailwind, adicione em globals.css:
/*
@keyframes floating-heart {
  0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.3; }
  50% { opacity: 0.5; }
  100% { transform: translateY(-80vh) scale(1.2) rotate(20deg); opacity: 0; }
}
.animate-floating-heart {
  animation: floating-heart linear infinite;
}
*/

UPDATE baby_development
SET baby_image_url = '/assets/4.png'
WHERE week = 4; -- ou o critério desejado