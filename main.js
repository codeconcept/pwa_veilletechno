console.log('hello depuis main');
const technosDiv = document.querySelector('#technos');

let technos = [
    {id: 1, name: 'Angular', description: 'le framework front-end', url: 'https://angular.io/'},
    {id: 2, name: 'Node', description: 'JavaScript côté backe-end', url: 'https://nodejs.org/en/'},
    {id: 3, name: 'MongoDB', description: 'la célèbre base noSQL', url: 'https://www.mongodb.com/'},
    {id: 4, name: 'PWA', description: 'rendre vos applications ++', url: 'https://developer.mozilla.org/en-US/Apps/Progressive'}
];

function loadTechnologies(technos) {
    const allTechnos = technos
        .map(t => `<div><b>${t.name}</b> ${t.description} - site officiel </div>`)
        .join('');

    technosDiv.innerHTML = allTechnos; 
}

loadTechnologies(technos);