

const listaTenisica = document.getElementById('lista-tenisica');
const formaDodaj = document.getElementById('forma-dodaj-tenisicu');
const notifikacija = document.getElementById('notifikacija');

const backendUrl = '/tenisice';
let tenisicaZaUrediti = null;

function prikaziNotifikaciju(poruka, tip = 'uspjeh') {
    notifikacija.textContent = poruka;
    notifikacija.className = tip === 'uspjeh' ? 'vidljivo uspjeh' : 'vidljivo greska';
    setTimeout(() => { notifikacija.className = 'skriveno'; }, 3000);
}

function prikaziTenisice() {
    listaTenisica.innerHTML = '';
    fetch(backendUrl)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                listaTenisica.innerHTML = '<p>Nema tenisica u bazi.</p>';
            }
            data.forEach(t => {
                const div = document.createElement('div');
                div.classList.add('tenisica');
                div.innerHTML = `
                    <h3>${t.naziv}</h3>
                    <p>Brend: ${t.brend}</p>
                    <p>Cijena: ${t.cijena} €</p>
                    <p>${t.opis}</p>
                    <button onclick="obrisiTenisicu(${t.id})">Obriši</button>
                    <button onclick="urediTenisicu(${t.id})">Uredi</button>
                `;
                listaTenisica.appendChild(div);
            });
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
    if (!confirm('Jeste li sigurni da želite obrisati ovu tenisicu?')) return;
    fetch(`${backendUrl}/${id}`, { method: 'DELETE' })
        .then(() => { prikaziTenisice(); prikaziNotifikaciju('Tenisica je uspješno obrisana!'); })
        .catch(() => prikaziNotifikaciju('Greška prilikom brisanja!', 'greska'));
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

// Prikaz tenisica pri učitavanju
prikaziTenisice();