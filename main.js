const technosDiv = document.querySelector('#technos');

function loadTechnologies(technos) {
    fetch('http://localhost:3001/technos')
        .then(response => {
            response.json()
                .then(technos => {
                    const allTechnos = technos.map(t => `<div><b>${t.name}</b> ${t.description}  <a href="${t.url}">site de ${t.name}</a> </div>`)
                            .join('');
            
                    technosDiv.innerHTML = allTechnos; 
                });
        })
        .catch(console.error);
}

loadTechnologies(technos);

if(navigator.serviceWorker) {
    navigator.serviceWorker
        .register('sw.js')
        .catch(err => console.error('service worker NON enregistré', err));
}

if (window.Notification && window.Notification !== 'denied') {
    Notification.requestPermission(perm => {
        if(perm === 'granted') {
            const options = {
                body: 'Je suis le body de la notification',
                icon: 'images/icons/icon-72x72.png'
            }
            const notif = new Notification('Hello notification', options);
        } else {
            console.log('autorisation de recevoir des notification réfusée');
        }
    })
}