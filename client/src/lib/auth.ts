// Gerenciador de autenticação sem React Context
import { API_CONFIG } from "./apiConfig";

export interface User {
  id: string;
  email: string;
  name: string;
  profilePhotoUrl?: string;
}

class AuthManager {
  private user: User | null = null;
  private isLoading: boolean = true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.checkAuth();
  }

  async checkAuth() {
    try {
      console.log("🔍 Checking authentication...");
      
      // Pegar token do localStorage
      const authToken = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Adicionar token se existir
      if (authToken) {
        headers['X-Auth-Token'] = authToken;
        console.log("🔑 Using auth token from localStorage");
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
        credentials: "include",
        cache: "no-cache",
        headers
      });
      
      console.log("🔍 Auth response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ User authenticated:", data);
        this.user = data;
      } else {
        console.log("❌ User not authenticated - Status:", response.status);
        this.user = null;
        // Limpar token inválido
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.log("❌ Auth check failed:", error);
      this.user = null;
      localStorage.removeItem('authToken');
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    this.user = data.user;
    
    // SALVAR TOKEN NO LOCALSTORAGE
    if (data.authToken) {
      localStorage.setItem('authToken', data.authToken);
      console.log("✅ Auth token saved to localStorage");
    }
    
    console.log("✅ Login successful, user:", this.user);
    
    // Notificar listeners
    this.notifyListeners();
    
    // Redirecionar para dashboard
    window.location.href = "/";
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    this.user = data.user;
    this.notifyListeners();
    window.location.href = "/pregnancy-setup";
  }

  async logout(): Promise<void> {
    // Limpar localStorage
    localStorage.removeItem('authToken');
    console.log("🗑️ Auth token removed from localStorage");
    
    await fetch(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

    this.user = null;
    this.notifyListeners();
    // Limpar cache e forçar reload completo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    setTimeout(() => {
      window.location.href = "/login";
      window.location.reload();
    }, 100);
  }

  getUser(): User | null {
    return this.user;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const authManager = new AuthManager();