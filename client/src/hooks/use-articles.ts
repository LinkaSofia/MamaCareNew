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
    enabled: !!week && week > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}