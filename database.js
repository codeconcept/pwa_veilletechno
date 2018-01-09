function technoDb() {
    return idb.open('techno-store', 2, upgradeDB => {
        switch (upgradeDB.oldVersion) {
            case 0: upgradeDB.createObjectStore('techno')
        }
    })
}

function getTechno(id) {
    return technoDb().then(db => {
        return db.transaction('techno')
            .objectStore('techno').get(id);
    })
}

function putTechno(value, key) {
    return technoDb().then(db => {
        const tx = db.transaction('techno', 'readwrite');
        tx.objectStore('techno').put(value, key);
        return tx.complete;
    });
}

function deleteTechno(id) {
    return technoDb().then(db => {
        const tx = db.transaction('techno', 'readwrite');
        tx.objectStore('techno').delete(id);
        return tx.complete;
    });
}

function clearTechnos() {
    return technoDb().then(db => {
        const tx = db.transaction('techno', 'readwrite');
        tx.objectStore('techno').clear();
        return tx.complete;
    });
}

function getAllTechnos() {
    return technoDb().then(db => {
        return db.transaction('techno')
            .objectStore('techno').getAllKeys().then(keys => {
                return Promise.all(keys.map(id => getTechno(id).then(content => (Object.assign({}, { id }, content)))))
            });
    })
}