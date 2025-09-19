import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

interface ArticlesResponse {
  success: boolean;
  week: number;
  articles: Article[];
}

export function useArticles(week: number) {
  return useQuery<ArticlesResponse>({
    queryKey: ["/api/articles/week", week],
    queryFn: async () => {
      const response = await fetch(`/api/articles/week/${week}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
    enabled: !!week && week > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}