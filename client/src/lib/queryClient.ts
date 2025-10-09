import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_CONFIG } from "./apiConfig";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = `${res.status}: ${res.statusText}`;
    let fieldErrors = undefined;
    try {
      const text = await res.text();
      const jsonData = JSON.parse(text);
      errorMessage = jsonData.error || errorMessage;
      fieldErrors = jsonData.fieldErrors;
    } catch (parseError) {
      // Usar statusText se não conseguir parsear JSON
      errorMessage = `${res.status}: ${res.statusText}`;
    }
    const error = new Error(errorMessage) as any;
    if (fieldErrors) {
      error.response = { fieldErrors };
    }
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Se a URL não começar com http, adicionar a base URL
  const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  
  // Pegar token do localStorage
  const authToken = localStorage.getItem('authToken');
  
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    
    // Pegar token do localStorage
    const authToken = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    if (authToken) {
      headers['X-Auth-Token'] = authToken;
    }
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
