/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ url }) => true,
    new NetworkFirst({ cacheName: `runtime-cache-${version}`, networkTimeoutSeconds: 45 })
);
// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files  // everything in `static`
];

self.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
    // ignore POST requests etc
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            return cache.match(url.pathname);
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            const response = await fetch(event.request);

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch {
            return cache.match(event.request);
        }
    }

    event.respondWith(respond());
});
self.addEventListener('push', evt => {
    const data = evt.data.json();
    console.log(data);
    const title = data.title;
    const options = {
        body: data.body,
        icon: '/icon/logo.png',
    }
    evt.waitUntil(self.registration.showNotification(title, options));
    self.registration.pushManager.getSubscription().then(subscription => {
        console.log(subscription);
    }, err => console.log(err));
});
self.addEventListener('notificationclick', evt => {
    evt.notification.close();
    console.log(evt.notification.data);
    return evt.waitUntil(
        self.clients.openWindow(evt.notification.data&&evt.notification.data.target_url?evt.notification.data.target_url:'/')
    );
});