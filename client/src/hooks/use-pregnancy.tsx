import { useQuery } from "@tanstack/react-query";
import { calculatePregnancyWeek, calculateProgress } from "@/lib/pregnancy-calculator";

export function usePregnancy() {
  const { data: pregnancyData, isLoading } = useQuery({
    queryKey: ["/api/pregnancies/active"],
  });

  const pregnancy = pregnancyData?.pregnancy;

  const weekInfo = pregnancy ? calculatePregnancyWeek(pregnancy.dueDate) : null;
  const progress = weekInfo ? calculateProgress(weekInfo.week) : null;

  return {
    pregnancy,
    weekInfo,
    progress,
    isLoading,
  };
}
