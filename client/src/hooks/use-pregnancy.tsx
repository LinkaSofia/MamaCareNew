import { useQuery } from "@tanstack/react-query";
import { calculatePregnancyWeek, calculateProgress } from "@/lib/pregnancy-calculator";
import { API_CONFIG } from "@/lib/apiConfig";

export function usePregnancy() {
  const { data: pregnancyData, isLoading, error } = useQuery({
    queryKey: ["/api/pregnancies/active"],
    retry: false,
    queryFn: async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const headers: HeadersInit = {};
        if (authToken) {
          headers['X-Auth-Token'] = authToken;
        }
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/pregnancies/active`, {
          credentials: "include",
          headers
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

  const weekInfo = pregnancy ? calculatePregnancyWeek(pregnancy.dueDate, pregnancy.lastMenstrualPeriod) : null;
  const progress = weekInfo ? calculateProgress(weekInfo.week) : null;

  return {
    pregnancy,
    weekInfo,
    progress,
    isLoading,
    error,
  };
}
