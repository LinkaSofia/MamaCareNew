import { useQuery } from "@tanstack/react-query";
import type { BabyDevelopment } from "@shared/schema";
import { getInterpolatedBabyData, getBabyDevelopmentData, getPregnancyPhase, type BabyDevelopmentData } from "@/lib/baby-data";

interface BabyDevelopmentResponse {
  developmentData: BabyDevelopment;
}

interface AllBabyDevelopmentResponse {
  developmentData: BabyDevelopment[];
}

export function useBabyDevelopment(week: number) {
  return useQuery<BabyDevelopmentResponse>({
    queryKey: ["/api/baby-development", week],
    enabled: week > 0 && week <= 42,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/baby-development/${week}`, {
          credentials: "include",
        });
        if (!response.ok) {
          return null;
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });
}

// Hook para dados locais de desenvolvimento do bebê
export function useBabyDevelopmentLocal(week: number) {
  return useQuery({
    queryKey: ['baby-development-local', week],
    queryFn: () => {
      return new Promise<BabyDevelopmentData>((resolve) => {
        setTimeout(() => {
          const data = getInterpolatedBabyData(week);
          resolve(data);
        }, 50);
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: week > 0 && week <= 42,
  });
}

export function useBabyDevelopmentRange(startWeek: number, endWeek: number) {
  return useQuery({
    queryKey: ['baby-development-range', startWeek, endWeek],
    queryFn: () => {
      return new Promise<BabyDevelopmentData[]>((resolve) => {
        setTimeout(() => {
          const weeks = Array.from(
            { length: endWeek - startWeek + 1 }, 
            (_, i) => startWeek + i
          );
          const data = weeks.map(week => getInterpolatedBabyData(week));
          resolve(data);
        }, 100);
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: startWeek > 0 && endWeek <= 42 && startWeek <= endWeek,
  });
}

export function useAllBabyDevelopment() {
  return useQuery<AllBabyDevelopmentResponse>({
    queryKey: ["/api/baby-development"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/baby-development", {
          credentials: "include",
        });
        if (!response.ok) {
          return null;
        }
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });
}

// Hook para obter marcos de desenvolvimento por trimestre
export function useDevelopmentMilestones(trimester: 1 | 2 | 3) {
  const weekRanges = {
    1: { start: 1, end: 12 },
    2: { start: 13, end: 27 },
    3: { start: 28, end: 40 }
  };

  const range = weekRanges[trimester];
  
  return useQuery({
    queryKey: ['development-milestones', trimester],
    queryFn: () => {
      return new Promise<{
        trimester: number;
        weeks: BabyDevelopmentData[];
        keyMilestones: string[];
        motherChanges: string[];
        phase: ReturnType<typeof getPregnancyPhase>;
      }>((resolve) => {
        setTimeout(() => {
          const weeks = Array.from(
            { length: range.end - range.start + 1 },
            (_, i) => range.start + i
          ).map(week => getInterpolatedBabyData(week));

          // Extrair marcos importantes para o trimestre
          const keyMilestones = weeks
            .flatMap(w => w.developments)
            .filter((milestone, index, arr) => arr.indexOf(milestone) === index)
            .slice(0, 5);

          const motherChanges = weeks
            .map(w => w.development_milestones_mom)
            .filter((change, index, arr) => arr.indexOf(change) === index)
            .slice(0, 3);

          const phase = getPregnancyPhase(Math.floor((range.start + range.end) / 2));

          resolve({
            trimester,
            weeks,
            keyMilestones,
            motherChanges,
            phase
          });
        }, 150);
      });
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Hook para obter comparações de tamanho
export function useBabySizeComparisons() {
  return useQuery({
    queryKey: ['baby-size-comparisons'],
    queryFn: () => {
      const comparisons = [
        { weeks: [1, 4], object: "🔸", name: "Ponto microscópico", size: "0.1mm" },
        { weeks: [4, 8], object: "🫘", name: "Semente", size: "4mm" },
        { weeks: [8, 12], object: "🫐", name: "Framboesa", size: "1.6cm" },
        { weeks: [12, 16], object: "🍋", name: "Limão", size: "5.4cm" },
        { weeks: [16, 20], object: "🥑", name: "Abacate", size: "11.6cm" },
        { weeks: [20, 24], object: "🍌", name: "Banana", size: "16.4cm" },
        { weeks: [24, 28], object: "🌽", name: "Espiga de milho", size: "21cm" },
        { weeks: [28, 32], object: "🍆", name: "Berinjela", size: "25cm" },
        { weeks: [32, 36], object: "🥥", name: "Coco", size: "28cm" },
        { weeks: [36, 40], object: "🥭", name: "Papaia", size: "32cm" },
        { weeks: [40], object: "🍉", name: "Melancia pequena", size: "36cm" },
      ];
      
      return Promise.resolve(comparisons);
    },
    staleTime: Infinity,
  });
}