// Odabir svih linkova u navbaru
const navLinks = document.querySelectorAll('.nav-links a');

// Dohvati ime trenutno učitane stranice
const currentPage = window.location.pathname.split('/').pop(); // npr. "index.html"

// Prođi kroz linkove i dodaj 'active' klasu na trenutni link
navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});
