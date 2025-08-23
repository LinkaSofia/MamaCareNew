import { useQuery } from "@tanstack/react-query";
import { calculatePregnancyWeek, calculateProgress } from "@/lib/pregnancy-calculator";

export function usePregnancy() {
  const { data: pregnancyData, isLoading, error } = useQuery({
    queryKey: ["/api/pregnancies/active"],
    retry: false,
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
