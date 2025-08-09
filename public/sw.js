// Service Worker for offline functionality
const CACHE_NAME = 'wanderlust-v1';
const STATIC_CACHE = 'wanderlust-static-v1';
const DYNAMIC_CACHE = 'wanderlust-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.openweathermap\.org/,
  /^https:\/\/api\.mapbox\.com/,
  /^https:\/\/images\.pexels\.com/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(response => {
          return response || fetch(request);
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return cache.match(request)
            .then(response => {
              if (response) {
                // Serve from cache and update in background
                fetch(request)
                  .then(fetchResponse => {
                    if (fetchResponse.ok) {
                      cache.put(request, fetchResponse.clone());
                    }
                  })
                  .catch(() => {
                    // Network failed, but we have cache
                  });
                return response;
              }

              // Not in cache, fetch from network
              return fetch(request)
                .then(fetchResponse => {
                  if (fetchResponse.ok) {
                    cache.put(request, fetchResponse.clone());
                  }
                  return fetchResponse;
                })
                .catch(() => {
                  // Return offline fallback for API calls
                  return new Response(
                    JSON.stringify({
                      error: 'Offline',
                      message: 'This feature requires an internet connection'
                    }),
                    {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );
                });
            });
        })
    );
    return;
  }

  // Handle other requests (images, assets, etc.)
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(fetchResponse => {
            // Don't cache non-successful responses
            if (!fetchResponse.ok) {
              return fetchResponse;
            }

            // Cache successful responses
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone);
              });

            return fetchResponse;
          })
          .catch(() => {
            // Return offline fallback for images
            if (request.destination === 'image') {
              return new Response(
                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">Image unavailable offline</text></svg>',
                {
                  headers: { 'Content-Type': 'image/svg+xml' }
                }
              );
            }

            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-trip-data') {
    event.waitUntil(syncTripData());
  }
});

// Sync trip data when online
async function syncTripData() {
  try {
    const pendingData = await getStoredData('pending_sync_data');
    if (pendingData) {
      // Attempt to sync with server
      const response = await fetch('/api/sync-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData)
      });

      if (response.ok) {
        // Clear pending data on successful sync
        await clearStoredData('pending_sync_data');
        console.log('Trip data synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync trip data:', error);
  }
}

// Helper functions for IndexedDB operations
function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WanderlustDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync_data')) {
        db.createObjectStore('sync_data', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync_data'], 'readonly');
      const store = transaction.objectStore('sync_data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data);
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WanderlustDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sync_data')) {
        db.createObjectStore('sync_data', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sync_data'], 'readwrite');
      const store = transaction.objectStore('sync_data');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}