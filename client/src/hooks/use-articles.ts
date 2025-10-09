import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";
import { API_CONFIG } from "@/lib/apiConfig";

interface ArticlesResponse {
  success: boolean;
  week: number;
  articles: Article[];
}

export function useArticles(week: number) {
  return useQuery<ArticlesResponse>({
    queryKey: ["/api/articles/week", week],
    queryFn: async () => {
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (authToken) {
        headers['X-Auth-Token'] = authToken;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/articles/week/${week}`, {
        credentials: "include",
        headers
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
    enabled: !!week && week > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}