import { useQuery } from "@tanstack/react-query";
import type { Article } from "@shared/schema";
import { API_CONFIG } from "@/lib/apiConfig";

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
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      if (authToken) {
        headers['X-Auth-Token'] = authToken;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/articles/categories`, {
        credentials: "include",
        headers
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles categories');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

