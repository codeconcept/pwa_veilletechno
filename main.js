const technosDiv = document.querySelector('#technos');

function loadTechnologies(technos) {
    // fetching from real node server
    fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos')
        .then(response => response.json())
        .then(technos => {
            console.log('response from loadTechnologies', technos);
            // mongodb is unreachable by node is, so cache is not used when on localhost
            if(technos.keys().count === 0) {
                allTechnos = ['Serveur accessible mais MongoDB inacessible'];
            }
            const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                .join('');

            technosDiv.innerHTML = allTechnos;
        })
        .catch(console.error);
}

loadTechnologies(technos);

// retrieved from https://github.com/web-push-libs/web-push readme
// and used to convert base64 string to Uint8Array == to an array buffer
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


if (navigator.serviceWorker) {
    navigator.serviceWorker
        .register('sw.js')
        .then(registration => {
            // public vapid key generate with web-push command line 
            const publicKey = 'BB1B2cSGFGDNIoiyeSyTya5JxEDMu1cc3ZSEZbfXbdREWnM9rruMbMHC3IV31wdO0C0mnI9XCiicQLtN-xK3Ois';
            registration.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                    console.log('subscription', subscription);
                    // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
                    const keyArrayBuffer = subscription.getKey('p256dh');
                    const authArrayBuffer = subscription.getKey('auth');
                    const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(keyArrayBuffer)));
                    const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(authArrayBuffer)));
                    console.log('p256dh key', keyArrayBuffer, p256dh);
                    console.log('auth key', authArrayBuffer, auth);
                    return subscription;
                } else {
                    // ask for a subscription 
                    const convertedKey = urlBase64ToUint8Array(publicKey);
                    return registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedKey
                    })
                        .then(newSubscription => {
                            // TODO post to a subscription DB
                            console.log('newSubscription', newSubscription);
                            // no more keys proprety directly visible on the subscription objet. So you have to use getKey()
                            const key = newSubscription.getKey('p256dh');
                            const auth = newSubscription.getKey('auth');
                            console.log('p256dh key', key);
                            console.log('auth key', auth);
                        })
                }
            })
        })
        .catch(err => console.error('service worker NON enregistré', err));
}

if (window.Notification && window.Notification !== 'denied') {
    Notification.requestPermission(perm => {
        if (perm === 'granted') {
            // const options = {
            //     body: 'Je suis le body de la notification',
            //     icon: 'images/icons/icon-72x72.png'
            // }
            // const notif = new Notification('Hello notification', options);
            console.log('autorisation de recevoir des notifications acceptée')
        } else {
            console.log('autorisation de recevoir des notifications réfusée');
        }
    })
}