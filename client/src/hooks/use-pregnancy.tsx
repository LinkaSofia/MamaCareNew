import { useQuery } from "@tanstack/react-query";
import { calculatePregnancyWeek, calculateProgress } from "@/lib/pregnancy-calculator";

export function usePregnancy() {
  const { data: pregnancyData, isLoading, error } = useQuery({
    queryKey: ["/api/pregnancies/active"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/pregnancies/active", {
          credentials: "include",
        });
        if (!response.ok) {
          // Se não autenticado ou não tem gravidez, return null
          return null;
        }
        return response.json();
      } catch (error) {
        // Em caso de erro, return null
        return null;
      }
    },
  });

  const pregnancy = pregnancyData?.pregnancy;

  const weekInfo = pregnancy ? calculatePregnancyWeek(pregnancy.dueDate) : null;
  const progress = weekInfo ? calculateProgress(weekInfo.week) : null;

  return {
    pregnancy,
    weekInfo,
    progress,
    isLoading,
    error,
  };
}
