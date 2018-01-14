const cacheName = 'veille-techno' + '1.3.2';

self.importScripts('idb.js', 'database.js');

self.addEventListener('install', (evt) => {
    console.log(`sw installé à ${new Date().toLocaleTimeString()}`);
    const cachePromise = caches.open(cacheName).then(cache => {
        return cache.addAll([
            'index.html',
            'idb.js',
            'database.js',
            'main.js',
            'style.css',
            'vendors/bootstrap4.min.css',
            'add_techno.html',
            'add_techno.js',
            'contact.html',
            'contact.js',
        ])
            .then(console.log('cache initialisé'))
            .catch(console.err);
    });

    evt.waitUntil(cachePromise);

});

self.addEventListener('activate', (evt) => {
    console.log(`sw activé à ${new Date().toLocaleTimeString()}`);
    let cacheCleanedPromise = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key !== cacheName) {
                return caches.delete(key);
            }
        });
    });
    evt.waitUntil(cacheCleanedPromise);
});

// self.addEventListener('fetch', (evt) => {
//     if(!navigator.onLine) {
//         const headers = { headers: { 'Content-Type': 'text/html;charset=utf-8'} };
//         evt.respondWith(new Response('<h1>Pas de connexion internet</h1><div>Apllication en mode dégradé. Veuillez vous connecter</div>', headers));
//     }

//     // always serving css from the cache
//     if(evt.request.url.includes('css')) {
//         caches.open(cacheName).then(cache => {
//             console.log('servi depuis le cache', evt.request.url);
//             cache.match(evt.request);
//         })
//     } else {
//         console.log('fetch request passée à internet', evt.request.url);
//         evt.respondWith(fetch(evt.request));
//     } 
// });

// network first strategy
self.addEventListener('fetch', evt => {
    console.log('evt', evt);
    // to prevent this error when posting a form: 
    // "Uncaught (in promise) TypeError: Request method 'POST' is unsupported at caches.open.then.cache"
    if(evt.request.method === 'POST') {
        return;
    }
    evt.respondWith(
        fetch(evt.request).then(res => {
            // we add the latest version into the cache
            caches.open(cacheName).then(cache => cache.put(evt.request, res));
            // we clone it as a response can be read only once (it's like a one time read stream)
            return res.clone();
        })
            .catch(err => caches.match(evt.request))
    );
});

self.registration.showNotification('Notif depuis le sw', {
    body: 'je suis une notification dite "persistante"',
    actions: [
        { action: 'accept', title: 'accepter' },
        { action: 'refuse', title: 'refuser' }
    ]
});

self.addEventListener('notificationclose', evt => {
    console.log('notification fermée', evt);
});

self.addEventListener('notificationclick', evt => {
    if (evt.action === 'accept') {
        console.log('vous avez accepté');
    } else if (evt.action === 'refuse') {
        console.log('vous avez refusé')
    } else {
        console.log('vous avez cliqué sur la notification (pas sur un des boutons)')
    }
    evt.notification.close();
});

self.addEventListener('push', evt => {
    console.log(evt);
    console.log('data envoyée par la push notification des dev tools : ', evt.data.text())
    var title = evt.data.text();
    evt.waitUntil(self.registration.showNotification(title, { body: 'ça marche :)', image: 'images/icons/icon-152x152.png' }));
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-technos') {
        console.log('attempting sync', event.tag);
        console.log('syncing', event.tag);
        event.waitUntil(
            getAllTechnos().then(technos => {

                console.log('got technos from sync callback', technos);

                const unsynced = technos.filter(techno => techno.unsynced);

                console.log('pending sync', unsynced);

                return Promise.all(unsynced.map(techno => {
                    console.log('Attempting fetch', techno);
                    fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos', {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        method: 'POST',
                        body: JSON.stringify(techno)
                    })
                        .then(() => {
                            console.log('Sent to server');
                            console.log('id passé à putTechno', techno.id);
                            return putTechno(Object.assign({}, techno, { unsynced: false }), techno.id);
                        })
                }))
            })
        )
    }
});