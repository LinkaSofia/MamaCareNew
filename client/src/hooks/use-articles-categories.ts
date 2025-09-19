import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";

interface Category {
  icon: string;
  name: string;
  subcategories: { [key: string]: string };
  articles: Article[];
}

interface ArticlesCategoriesResponse {
  success: boolean;
  categories: Category[];
}

export function useArticlesCategories() {
  return useQuery<ArticlesCategoriesResponse>({
    queryKey: ["/api/articles/categories"],
    queryFn: async () => {
      const response = await fetch("/api/articles/categories");
      if (!response.ok) {
        throw new Error('Failed to fetch articles categories');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

