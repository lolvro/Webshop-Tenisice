let sveTenisice = [];
const listaTenisica = document.getElementById('lista-tenisica') || document.getElementById('lista-tenisica-index');
const jeIndexStranica = !!document.getElementById('lista-tenisica-index');
const formaDodaj = document.getElementById('forma-dodaj-tenisicu');
const notifikacija = document.getElementById('notifikacija');
const sortiranjeSelect = document.getElementById('sortiranje');
const filterBrend = document.getElementById('filter-brend');

const backendUrl = 'http://localhost:3000/tenisice';
let tenisicaZaUrediti = null;

if (listaTenisica) {
    prikaziTenisice();
}

if (filterBrend) {
    filterBrend.addEventListener('change', () => {
        primijeniFiltere();
    });
}

document.getElementById('sortiranje').addEventListener('change', e => {
    const smjer = e.target.value;
    prikaziTenisice(smjer);
    });
if (sortiranjeSelect) {
    sortiranjeSelect.addEventListener('change', e => {
        prikaziTenisice(e.target.value);
    });
}


function prikaziNotifikaciju(poruka, tip = 'uspjeh') {
    notifikacija.textContent = poruka;
    notifikacija.className = tip === 'uspjeh' ? 'vidljivo uspjeh' : 'vidljivo greska';
    setTimeout(() => { notifikacija.className = 'skriveno'; }, 3000);
}

function prikaziTenisice(sort = '') {
    listaTenisica.innerHTML = '<p>Učitavanje tenisica...</p>';

    fetch(backendUrl)
        .then(res => {
            if (!res.ok) {
                throw new Error("Greška u odgovoru servera");
            }
            return res.json();
        })
        .then(data => {
            sveTenisice = data;
            popuniBrendove(data);
            primijeniFiltere();
        })
        .catch(err => {
            console.error(err);
            listaTenisica.innerHTML = '<p>Greška pri dohvaćanju tenisica.</p>';
        });

    }

formaDodaj.addEventListener('submit', (e) => {
    e.preventDefault();
    const cijenaValue = parseFloat(document.getElementById('cijena').value);
    if (cijenaValue <= 0) { prikaziNotifikaciju('Cijena mora biti veća od 0!', 'greska'); return; }

    const tenisica = {
        naziv: document.getElementById('naziv').value,
        brend: document.getElementById('brend').value,
        cijena: cijenaValue,
        opis: document.getElementById('opis').value
    };

    if (tenisicaZaUrediti) {
        fetch(`${backendUrl}/${tenisicaZaUrediti}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tenisica)
        })
        .then(res => res.json())
        .then(() => {
            prikaziTenisice();
            formaDodaj.reset();
            tenisicaZaUrediti = null;
            prikaziNotifikaciju('Tenisica je uspješno ažurirana!');
        })
        .catch(() => prikaziNotifikaciju('Greška prilikom ažuriranja!', 'greska'));
    } else {
        fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tenisica)
        })
        .then(res => res.json())
        .then(() => {
            prikaziTenisice();
            formaDodaj.reset();
            prikaziNotifikaciju('Tenisica je uspješno dodana!');
        })
        .catch(() => prikaziNotifikaciju('Greška prilikom dodavanja!', 'greska'));
    }
});

function obrisiTenisicu(id) {
    if (!confirm("Jeste li sigurni da želite obrisati ovu tenisicu?")) {
        return;
    }

    fetch(`${backendUrl}/${id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Greška pri brisanju");
        }
        ukloniProizvodIzKosaricePoID(id);
        prikaziTenisice();
        prikaziNotifikaciju("Tenisica je uspješno izbrisana!");
    })
    .catch(err => {
        console.error(err);
        alert("Došlo je do greške pri brisanju tenisice.");
    });
}


function urediTenisicu(id) {
    fetch(backendUrl)
        .then(res => res.json())
        .then(data => {
            const t = data.find(item => item.id === id);
            if (t) {
                document.getElementById('naziv').value = t.naziv;   
                document.getElementById('brend').value = t.brend;
                document.getElementById('cijena').value = t.cijena;
                document.getElementById('opis').value = t.opis;
                tenisicaZaUrediti = id;
            }
        });
}

function popuniBrendove(tenisice) {
    const select = document.getElementById('filter-brend');
    if (!select) return;

    const brendovi = [...new Set(tenisice.map(t => t.brend))];

    select.innerHTML = '<option value="">Svi brendovi</option>';

    brendovi.forEach(brend => {
        const option = document.createElement('option');
        option.value = brend;
        option.textContent = brend;
        select.appendChild(option);
    });
}

function primijeniFiltere() {
    let filtrirane = [...sveTenisice];

    const brend = document.getElementById('filter-brend')?.value;
    const sort = document.getElementById('sortiranje')?.value;

    if (brend) {
        filtrirane = filtrirane.filter(t => t.brend === brend);
    }

    if (sort === 'asc') {
        filtrirane.sort((a, b) => a.cijena - b.cijena);
    } else if (sort === 'desc') {
        filtrirane.sort((a, b) => b.cijena - a.cijena);
    }

    renderTenisice(filtrirane);
}

function renderTenisice(lista) {
    listaTenisica.innerHTML = '';

    if (lista.length === 0) {
        listaTenisica.innerHTML = `
        <p class="nema-proizvoda">Nema proizvoda u ponudi.</p>`;
        return;
    }

    const jeAdminStranica = window.location.pathname.includes('index.html');

    lista.forEach(t => {
        const div = document.createElement('div');
        div.classList.add(
            listaTenisica.id === 'lista-tenisica-index'
                ? 'tenisica-index'
                : 'tenisica'
        );

        div.innerHTML = `
            <h3>${t.naziv}</h3>
            <p>Brend: ${t.brend}</p>
            <p>Cijena: ${t.cijena} €</p>
            <p>${t.opis ?? ''}</p>

            <button onclick="dodajUKosaricu(${t.id}, '${t.naziv}', ${t.cijena})">
                Dodaj u košaricu
            </button>

            ${
                jeAdminStranica
                    ? `
                        <button onclick="urediTenisicu(${t.id})">Uredi</button>
                        <button onclick="obrisiTenisicu(${t.id})">Obriši</button>
                      `
                    : ''
            }
        `;

        listaTenisica.appendChild(div);
    });
}

// Prikaz tenisica pri učitavanju
prikaziTenisice();