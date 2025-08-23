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
  });
}

export function useAllBabyDevelopment() {
  return useQuery<AllBabyDevelopmentResponse>({
    queryKey: ["/api/baby-development"],
  });
}