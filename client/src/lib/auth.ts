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

  async register(email: string, password: string, name: string, profileImage?: File | null, pregnancyData?: { pregnancyDate: string; pregnancyType: string }): Promise<void> {
    // Teste do FormData primeiro
    if (profileImage) {
      console.log("🧪 Testing FormData with image...");
      const testFormData = new FormData();
      testFormData.append('email', email);
      testFormData.append('password', password);
      testFormData.append('name', name);
      testFormData.append('profileImage', profileImage);
      
      try {
        const testResponse = await fetch(`${API_CONFIG.BASE_URL}/api/test-formdata`, {
          method: "POST",
          credentials: "include",
          body: testFormData,
        });
        
        if (testResponse.ok) {
          const testResult = await testResponse.json();
          console.log("🧪 FormData test result:", testResult);
        }
      } catch (testError) {
        console.error("🧪 FormData test failed:", testError);
      }
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('name', name);
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    if (pregnancyData) {
      formData.append('pregnancyDate', pregnancyData.pregnancyDate);
      formData.append('pregnancyType', pregnancyData.pregnancyType);
    }

    console.log("📝 Sending register request with FormData");
    console.log("📝 FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`📝 ${key}:`, value);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    this.user = data.user;
    this.notifyListeners();
    
    // Aguardar um pouco para garantir que a sessão foi salva
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se a sessão está funcionando antes de redirecionar
    try {
      const meResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
        credentials: "include"
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log("✅ Session established, user data:", userData);
        this.user = userData;
        this.notifyListeners();
        window.location.href = "/";
      } else {
        console.error("❌ Session not established after registration");
        // Tentar novamente após mais tempo
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
      // Redirecionar mesmo assim
      window.location.href = "/";
    }
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

  // Método para recarregar os dados do usuário
  async refreshUser(): Promise<void> {
    try {
      console.log("🔄 Refreshing user data...");
      
      const authToken = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      if (authToken) {
        headers['X-Auth-Token'] = authToken;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/me`, {
        credentials: "include",
        cache: "no-cache",
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ User data refreshed:", data);
        this.user = data;
        this.notifyListeners();
      } else {
        console.log("❌ Failed to refresh user data");
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
    }
  }
}

export const authManager = new AuthManager();