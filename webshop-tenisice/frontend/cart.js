const KOSARICA_KEY = 'kosarica';

function dohvatiKosaricu() {
    return JSON.parse(localStorage.getItem(KOSARICA_KEY)) || [];
}

function spremiKosaricu(kosarica) {
    localStorage.setItem(KOSARICA_KEY, JSON.stringify(kosarica));
}

function dodajUKosaricu(id, naziv, cijena) {
    const kosarica = dohvatiKosaricu();

    const postojeci = kosarica.find(p => p.id === id);

    if (postojeci) {
        postojeci.kolicina += 1;
    } else {
        kosarica.push({
            id,
            naziv,
            cijena,
            kolicina: 1
        });
    }

    spremiKosaricu(kosarica);
    prikaziNotifikaciju("Proizvod je dodan u košaricu!");
}

function prikaziKosaricu() {
    const container = document.getElementById("kosarica");
    const ukupnoEl = document.getElementById("ukupno");

    if(!container) return;
    
    const kosarica = dohvatiKosaricu();
    container.innerHTML = '';

    if (kosarica.length === 0) {
        container.innerHTML = '<p class="empty-cart">Košarica je prazna.</p>';
        ukupnoEl.textContent = '';
        return;
    }

    let ukupno = 0;

    kosarica.forEach(p => {
        const ukupnoProizvod = p.cijena * p.kolicina;
        ukupno += ukupnoProizvod;

        container.innerHTML += `
            <div class="cart-item">
                <div class="item-details">
                    <strong>${p.naziv}</strong><br>
                    Cijena: ${p.cijena} €<br>
                    Količina: ${p.kolicina}<br>
                    <strong>Ukupno: ${ukupnoProizvod.toFixed(2)} €</strong>
                </div>
                <button class="remove-btn" onclick="ukloniIzKosarice(${p.id})">Ukloni</button>
            </div>
            <hr>
        `;
    });

    ukupnoEl.textContent = `Ukupno: ${ukupno.toFixed(2)} €`;
}

function ukloniIzKosarice(id) {
    let kosarica = dohvatiKosaricu();
    kosarica = kosarica.filter(p => p.id !== id);
    spremiKosaricu(kosarica);
    prikaziKosaricu();
}

function ukloniProizvodIzKosaricePoID(id) {
    let kosarica = dohvatiKosaricu();
    kosarica = kosarica.filter(p => p.id !== id);
    spremiKosaricu(kosarica);
}

function isprazniKosaricu() {
    localStorage.removeItem(KOSARICA_KEY);
    prikaziKosaricu();
}

prikaziKosaricu();
