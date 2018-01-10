const technonameField = document.querySelector('#techno-name');
const technoDescriptionField = document.querySelector('#techno-description');
const technoUrlField = document.querySelector('#techno-url');
const addTechnoForm = document.querySelector('#add-techno-form');

addTechnoForm.addEventListener('submit', evt => {
    evt.preventDefault();

    const payload = {
        id: Date.now(),
        name: technonameField.value,
        description: technoDescriptionField.value,
        url: technoUrlField.value,
        unsynced: true,
    }

    fetch('https://nodetestapi-thyrrtzgdz.now.sh/technos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(resp => {
            console.log('resp to post to /technos', resp);
        })
        .catch(() => {
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                console.log('SyncManager supported by browser');
                console.log('we are probably offline');
                navigator.serviceWorker.ready.then(registration => {
                    // put techno in IndexedDB for later syncing
                    console.log('dans le catch de add_techno car offline');
                    console.log('dans le catch de add_techno id vaut', payload.id);
                    console.log()
                    return putTechno(payload, payload.id).then(() => {
                        // register a sync with the ServiceWorker
                        return registration.sync.register('sync-technos')
                    });
                })
            } else {
                // TODO browser does NOT support SyncManager: send data to server via ajax
                console.log('SyncManager NOT supported by your browser');
            }
        })
        .then(() => {
            clearForm();
        })
        .catch(error => console.error(error));
});

const clearForm = () => {
    technonameField.value = '';
    technoDescriptionField.value = '';
    technoUrlField.value = '';
    technonameField.focus();
};