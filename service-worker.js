importScripts('workbox-sw.prod.v2.0.1.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "3rdpartylicenses.txt",
    "revision": "de5f297f25e8371e75c5db7bacb8d329"
  },
  {
    "url": "assets/fonts/font-awesome/css/font-awesome.min.css",
    "revision": "a0e784c4ca94c271b0338dfb02055be6"
  },
  {
    "url": "assets/js/slick-shopper-sw.js",
    "revision": "b504ce95bc7c3aa39faef627e2c8e334"
  },
  {
    "url": "favicon.ico",
    "revision": "3c846fc1fc421d0408503940034be8e1"
  },
  {
    "url": "index.html",
    "revision": "fe2d113d7f56653e125bdd4d3d50dca0"
  },
  {
    "url": "inline.e54fb9bac40b246279cb.bundle.js",
    "revision": "2e6f37139060fd1db4d34964d6fc9237"
  },
  {
    "url": "main.e7864bce70c3600e265b.bundle.js",
    "revision": "b0af08ece135db76562f2a931611969a"
  },
  {
    "url": "polyfills.67d068662b88f84493d2.bundle.js",
    "revision": "ad4076ac41e8c08e5b5f872136081192"
  },
  {
    "url": "styles.13624c90cb620641595f.bundle.css",
    "revision": "13624c90cb620641595f8ce4ffc506f8"
  },
  {
    "url": "vendor.45715b41b2ba0b5e5274.bundle.js",
    "revision": "422d20df2bd4817574e03ca02e4baf4f"
  },
  {
    "url": "workbox-background-sync.dev.v2.0.3.js",
    "revision": "17d27a01fdfbba54c1492f22df460795"
  },
  {
    "url": "workbox-cacheable-response.dev.v2.0.3.js",
    "revision": "3eff1145213883f972fa281d3dd35719"
  },
  {
    "url": "workbox-routing.dev.v2.0.3.js",
    "revision": "860a0960d9ffbfd4d479073d905f29dd"
  },
  {
    "url": "workbox-runtime-caching.dev.v2.0.3.js",
    "revision": "89e032654341d3cd351aedb11ca4e07e"
  },
  {
    "url": "workbox-sw.dev.v2.0.3.js",
    "revision": "0139a62661742e590a2985c78180f88c"
  }
];

const workboxSW = new self.WorkboxSW();
workboxSW.precache(fileManifest);

importScripts('./workbox-routing.dev.v2.0.3.js');
importScripts('./workbox-runtime-caching.dev.v2.0.3.js');
importScripts('./workbox-cacheable-response.dev.v2.0.3.js');
importScripts('./workbox-background-sync.dev.v2.0.3.js');

// The route for any requests from the googleapis origin
workboxSW.router.registerRoute('https://fonts.googleapis.com/(.*)',
workboxSW.strategies.cacheFirst({
  cacheName: 'googleapis',
  cacheableResponse: {
    statuses: [0, 200]
  },
  networkTimeoutSeconds: 4
})
);
workboxSW.router.registerRoute('https://use.fontawesome.com/3ad7367c81/(.*)',
workboxSW.strategies.cacheFirst({
  cacheName: 'font-awesome',
  cacheableResponse: {
    statuses: [0, 200]
  },
  networkTimeoutSeconds: 4
})
);
workboxSW.router.registerRoute('https://slick-shopper-api.azurewebsites.net/sales/detail(.*)',
workboxSW.strategies.staleWhileRevalidate({
  cacheName: 'slick-shopper-api',
  cacheableResponse: {
    statuses: [0, 200]
  },
})
);
workboxSW.router.registerRoute('https://slick-shopper-api.azurewebsites.net/feedback(.*)',
workboxSW.strategies.networkFirst({
  cacheName: 'slick-shopper-api',
  cacheableResponse: {
    statuses: [0, 200]
  },
})
);

// Background sync

let syncQueue = new workbox.backgroundSync.QueuePlugin({
  callbacks: {
    replayDidSucceed: async(hash, res) => {
      self.registration.showNotification('slick-shopper', {
        body: 'feed back send',
      })
      console.log('[SW] feed back send')
    },
    replayDidFail: (hash) => {},
    requestWillEnqueue: (reqData) => {
      console.log('[SW] Request queued', reqData)
    },
    requestWillDequeue: (reqData) => {
      console.log('[SW] Request dequeued', reqData)
    },
  },
})

const postTweetRequestWrapper = new workbox.runtimeCaching.requestWrapper({
  plugins: [
    syncQueue
  ]
})

const postTweetCacheStrategy = new workbox.runtimeCaching.networkOnly({
  requestWrapper: postTweetRequestWrapper
})

const postTweetRoute = new workbox.routing.regExpRoute({
  regExp: /^https:\/\/slick-shopper-api.azurewebsites.net/,
  handler: postTweetCacheStrategy,
  method: 'POST'
})