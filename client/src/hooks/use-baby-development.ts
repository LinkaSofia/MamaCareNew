import { useQuery } from "@tanstack/react-query";
import type { BabyDevelopment } from "@shared/schema";

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