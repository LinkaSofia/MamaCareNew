// Service Worker para PWA com estratégia de cache melhorada
const CACHE_NAME = 'maternidade-app-v2';
const STATIC_CACHE = 'maternidade-static-v2';
const DYNAMIC_CACHE = 'maternidade-dynamic-v2';

// Recursos estáticos que devem ser cacheados
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cacheando recursos estáticos');
        return cache.addAll(STATIC_URLS);
      }),
      self.skipWaiting() // Força ativação imediata
    ])
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativando...');
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Assume controle imediato
    ])
  );
});

// Estratégia de cache: Network First para HTML, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requests não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Estratégia Network First para páginas HTML
  if (request.destination === 'document' || url.pathname === '/') {
    return networkFirst(request);
  }
  
  // Estratégia Cache First para assets estáticos
  if (isStaticAsset(request)) {
    return cacheFirst(request);
  }
  
  // Estratégia Stale While Revalidate para outros recursos
  return staleWhileRevalidate(request);
}

// Network First: tenta rede primeiro, fallback para cache
async function networkFirst(request) {
  // Não fazer cache de requisições POST, PUT, DELETE
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Se a resposta é válida, atualiza o cache
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Rede falhou, tentando cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Página não encontrada', { status: 404 });
  }
}

// Cache First: tenta cache primeiro, fallback para rede
async function cacheFirst(request) {
  // Não fazer cache de requisições POST, PUT, DELETE
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Erro ao buscar recurso:', request.url, error);
    return new Response('Recurso não encontrado', { status: 404 });
  }
}

// Stale While Revalidate: retorna cache imediatamente e atualiza em background
async function staleWhileRevalidate(request) {
  // Não fazer cache de requisições POST, PUT, DELETE
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Busca na rede em background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Retorna cache imediatamente se disponível, senão aguarda rede
  return cachedResponse || networkResponsePromise;
}

// Verifica se é um asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Sincronização em segundo plano');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implementar sincronização de dados offline
  return Promise.resolve();
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  let notificationData = {
    title: '👶 MamaCare',
    body: 'Venha ver como seu bebê está se desenvolvendo hoje!',
    icon: '/icons/baby-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    }
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    ...notificationData,
    actions: [
      {
        action: 'open',
        title: 'Abrir App',
        icon: '/icons/baby-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close-192.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Abrir o app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Senão, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Escuta mensagens do cliente para forçar atualização
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Pulando espera - ativando nova versão');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ Limpando todos os caches');
    event.waitUntil(clearAllCaches());
  }
});

// Função para limpar todos os caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('✅ Todos os caches foram limpos');
}