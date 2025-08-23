import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!response.ok) {
          return null;
        }
        return response.json();
      } catch (error) {
        console.log("Auth check failed, user not authenticated");
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; rememberMe?: boolean }) => {
      const response = await apiRequest("POST", "/api/auth/login", params);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      setLocation("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (params: { email: string; password: string; name: string; birthDate?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", params);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      setLocation("/pregnancy-setup");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/login");
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
    user: (userData as any)?.user || null,
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