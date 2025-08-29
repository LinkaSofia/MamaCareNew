import { useState, useEffect } from "react";
import { authManager, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(authManager.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(authManager.getIsLoading());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(() => {
      setUser(authManager.getUser());
      setIsLoading(authManager.getIsLoading());
    });

    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
  };
}