/**
 * service-worker.js arranges caching and offline functionality
 */


// Cache name -> change upon updates
const CACHE_NAME = 'bass-ball-cache-20250809-v2';

// Files to be cached
const urlsToCache = [
    './',
    './index.html',
    './latestupdates.html',
    './uitleg.html',
    './oefeningen/lesson_explanation.html',
    './oefeningen/content/exercise-1-0.html',
    './styles/style.css',
    './styles/uitleg-style.css',
    './main.js',
    './elements/ballColorModule.js',
    './elements/skyElements.js',
    './modules/animation.js',
    './modules/ballAnimationEffects.js',
    './modules/dom.js',
    './modules/index.js',
    './modules/lessonExplanationLoader.js',
    './modules/lessonManager.js',
    './modules/loadingIndicator.js',
    './modules/metronome.js',
    './modules/paths.js',
    './modules/screenLocker.js',
    './oefeningen/lessonData.js',
    './oefeningen/parentLessons.js',
    './favicon.svg',
    './play-button.svg',
    './stop-button.svg',
    './manifest.json'
];

// The 'install' event listener: caching essential files
self.addEventListener('install', event => {
    // Wait till cache is openened and files are added
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened, adding files...');
            
            // Cache all files and log errors
            return Promise.all(
                urlsToCache.map(url => {
                    return fetch(url).then(response => {
                        if (!response.ok) {
                            throw new Error(`File couldn't be cached: ${url}, status: ${response.status}`);
                        }
                        return cache.put(url, response);
                    }).catch(error => {
                        console.error('Error caching the file:', error);
                        return Promise.reject(error);
                    });
                })
            );
        }).then(() => {
            console.log('All files cached succesfully.');
        }).catch(error => {
            console.error('Installation of the service worker failed:', error);
        })
    );
});

// The 'fetch' event listener: delivers files from the cache or the network
self.addEventListener('fetch', event => {
    event.respondWith(
        // Searches request in the cache
        caches.match(event.request)
            .then(response => {
                // If the file is in the cache, give it back
                if (response) {
                    return response;
                }
                // If not, retrieve from network
                return fetch(event.request);
            })
    );
});

// The 'activate' event listener: clears old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Remove old caches
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

