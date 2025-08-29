// Gerenciador de autenticação sem React Context
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

  private async checkAuth() {
    try {
      console.log("🔍 Checking authentication...");
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-cache",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ User authenticated:", data);
        this.user = data;
      } else {
        console.log("❌ User not authenticated");
        this.user = null;
      }
    } catch (error) {
      console.log("❌ Auth check failed:", error);
      this.user = null;
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    this.user = data.user;
    this.notifyListeners();
    
    console.log("✅ Login successful, user:", this.user);
    // Aguardar um pouco e recarregar a página para garantir estado limpo
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const response = await fetch("/api/auth/register", {
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
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    this.user = null;
    this.notifyListeners();
    window.location.href = "/login";
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