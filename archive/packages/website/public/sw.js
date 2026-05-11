/**
 * Service Worker for UEPM Website
 * Provides caching, offline support, and performance optimization
 */

const CACHE_NAME = 'uepm-website-v1';
const STATIC_CACHE = 'uepm-static-v1';
const DYNAMIC_CACHE = 'uepm-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Critical CSS and JS will be added dynamically
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for dynamic content
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for frequently updated content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless they're assets)
  if (url.origin !== location.origin && !isAssetRequest(request)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Handle different types of requests with appropriate caching strategies
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Static assets (CSS, JS, images, fonts)
  if (isStaticAsset(request)) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // HTML pages
  if (isHTMLRequest(request)) {
    return staleWhileRevalidate(request, DYNAMIC_CACHE);
  }
  
  // API requests or other dynamic content
  if (isDynamicContent(request)) {
    return networkFirst(request, DYNAMIC_CACHE);
  }
  
  // Default to network first
  return networkFirst(request, DYNAMIC_CACHE);
}

/**
 * Cache first strategy - good for static assets
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network first strategy - good for dynamic content
 */
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Stale while revalidate strategy - good for frequently updated content
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network response
  return networkResponsePromise || new Response('Offline', { status: 503 });
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot)$/i)
  );
}

/**
 * Check if request is for HTML content
 */
function isHTMLRequest(request) {
  const acceptHeader = request.headers.get('accept') || '';
  return acceptHeader.includes('text/html');
}

/**
 * Check if request is for dynamic content
 */
function isDynamicContent(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/analytics/') ||
    url.search.includes('timestamp')
  );
}

/**
 * Check if request is for an asset from external origin
 */
function isAssetRequest(request) {
  const url = new URL(request.url);
  return (
    url.hostname.includes('cdn.') ||
    url.hostname.includes('assets.') ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot)$/i)
  );
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

/**
 * Sync analytics data when back online
 */
async function syncAnalytics() {
  try {
    // Get stored analytics data
    const cache = await caches.open('analytics-cache');
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRIC') {
    // Store performance metrics for later sync
    storePerformanceMetric(event.data.metric);
  }
});

/**
 * Store performance metrics for offline sync
 */
async function storePerformanceMetric(metric) {
  try {
    const cache = await caches.open('analytics-cache');
    const request = new Request('/analytics/performance', {
      method: 'POST',
      body: JSON.stringify(metric),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const response = new Response(JSON.stringify({ stored: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(request, response);
  } catch (error) {
    console.error('Failed to store performance metric:', error);
  }
}