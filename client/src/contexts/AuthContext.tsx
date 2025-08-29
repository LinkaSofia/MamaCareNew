import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  name: string;
  profilePhotoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.log("Auth check failed, user not authenticated");
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/login", params);
      return response.json();
    },
    onSuccess: (data) => {
      setUserData(data.user);
      // Aguardar um pouco para garantir que o estado seja atualizado
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; name: string; birthDate?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", params);
      return response.json();
    },
    onSuccess: (data) => {
      setUserData(data.user);
      window.location.href = "/pregnancy-setup"; // Redirecionamento direto
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setUserData(null);
      queryClient.clear();
      window.location.href = "/login"; // Redirecionamento direto
    },
  });

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    return loginMutation.mutateAsync({ email, password, rememberMe });
  };

  const register = async (email: string, password: string, name: string, birthDate?: string) => {
    return registerMutation.mutateAsync({ email, password, name, birthDate });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: userData,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}