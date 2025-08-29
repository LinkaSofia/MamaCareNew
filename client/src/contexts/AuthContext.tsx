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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Criar contexto
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estados locais
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

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (params: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", params);
      return response.json();
    },
    onSuccess: (data) => {
      setUserData(data.user);
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; name: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", params);
      return response.json();
    },
    onSuccess: (data) => {
      setUserData(data.user);
      window.location.href = "/pregnancy-setup";
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setUserData(null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  // Funções do contexto
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (email: string, password: string, name: string) => {
    return registerMutation.mutateAsync({ email, password, name });
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Valor do contexto
  const contextValue: AuthContextType = {
    user: userData,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}