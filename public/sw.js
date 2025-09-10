/* eslint-disable no-restricted-globals */

// Simple service worker to prevent 404 errors
self.addEventListener('install', () => {
    console.log('Service worker installing...');
});

self.addEventListener('activate', () => {
    console.log('Service worker activating...');
});

self.addEventListener('fetch', () => {
    // Do nothing, just prevent 404
});