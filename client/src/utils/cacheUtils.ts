// Utilitários para gerenciamento de cache

export class CacheManager {
  private static instance: CacheManager;
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Limpa todos os caches
  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      console.warn('❌ Cache API não disponível');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`🗑️ Removendo cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
      console.log('✅ Todos os caches foram limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar caches:', error);
    }
  }

  // Limpa cache específico
  async clearCache(cacheName: string): Promise<void> {
    if (!('caches' in window)) {
      console.warn('❌ Cache API não disponível');
      return;
    }

    try {
      const deleted = await caches.delete(cacheName);
      if (deleted) {
        console.log(`✅ Cache ${cacheName} removido`);
      } else {
        console.log(`⚠️ Cache ${cacheName} não encontrado`);
      }
    } catch (error) {
      console.error(`❌ Erro ao remover cache ${cacheName}:`, error);
    }
  }

  // Lista todos os caches
  async listCaches(): Promise<string[]> {
    if (!('caches' in window)) {
      console.warn('❌ Cache API não disponível');
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      console.log('📋 Caches disponíveis:', cacheNames);
      return cacheNames;
    } catch (error) {
      console.error('❌ Erro ao listar caches:', error);
      return [];
    }
  }

  // Força atualização do Service Worker
  async forceServiceWorkerUpdate(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker não disponível');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        console.log('🔄 Service Worker atualizado');
        
        // Se há uma nova versão esperando, ativa ela
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          console.log('⚡ Nova versão ativada');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar Service Worker:', error);
    }
  }

  // Desregistra o Service Worker
  async unregisterServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker não disponível');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const unregistered = await registration.unregister();
        if (unregistered) {
          console.log('✅ Service Worker desregistrado');
          // Limpa todos os caches após desregistrar
          await this.clearAllCaches();
        }
      }
    } catch (error) {
      console.error('❌ Erro ao desregistrar Service Worker:', error);
    }
  }

  // Verifica se há atualizações disponíveis
  async checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return !!registration.waiting;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    }
    
    return false;
  }

  // Força reload da página
  forceReload(): void {
    console.log('🔄 Forçando reload da página');
    window.location.reload();
  }

  // Reseta completamente o cache e recarrega
  async resetAndReload(): Promise<void> {
    console.log('🔄 Resetando cache e recarregando...');
    await this.clearAllCaches();
    await this.unregisterServiceWorker();
    
    // Reload simples
    window.location.reload();
  }

  // Força reload agressivo com limpeza completa
  async forceReloadWithCleanup(): Promise<void> {
    console.log('🔄 Forçando reload com limpeza completa...');
    
    // Limpa localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpa todos os caches
    await this.clearAllCaches();
    
    // Desregistra service worker
    await this.unregisterServiceWorker();
    
    // Reload simples
    window.location.reload();
  }
}

// Instância singleton
export const cacheManager = CacheManager.getInstance();

// Funções utilitárias para uso direto
export const clearAllCaches = () => cacheManager.clearAllCaches();
export const clearCache = (name: string) => cacheManager.clearCache(name);
export const listCaches = () => cacheManager.listCaches();
export const forceServiceWorkerUpdate = () => cacheManager.forceServiceWorkerUpdate();
export const unregisterServiceWorker = () => cacheManager.unregisterServiceWorker();
export const checkForUpdates = () => cacheManager.checkForUpdates();
export const forceReload = () => cacheManager.forceReload();
export const resetAndReload = () => cacheManager.resetAndReload();
export const forceReloadWithCleanup = () => cacheManager.forceReloadWithCleanup();

// Adiciona funções globais para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  (window as any).cacheUtils = {
    clearAllCaches,
    clearCache,
    listCaches,
    forceServiceWorkerUpdate,
    unregisterServiceWorker,
    checkForUpdates,
    forceReload,
    resetAndReload,
    forceReloadWithCleanup
  };
  
  console.log('🔧 Cache utils disponíveis em window.cacheUtils');
  console.log('🔧 Para limpeza completa: window.cacheUtils.forceReloadWithCleanup()');
}
