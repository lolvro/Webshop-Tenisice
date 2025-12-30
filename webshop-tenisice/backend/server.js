const path = require('path');

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = 3000;

// Povezivanje s MySQL bazom
const db = mysql.createConnection({
    host: 'localhost',
    user: 'lolvro',       // promijeni po potrebi
    password: 'Rokulja123#4',       // tvoja lozinka ako postoji
    database: 'webshop'
});

//Frontend
app.use(express.static(path.join(__dirname, '../frontend')));


//app.get('/', (req, res) => {
//  res.sendFile(path.join(__dirname, '../frontend/index.html'));
//});


db.connect(err => {
    if (err) {
        console.error('Greška kod povezivanja s bazom:', err);
        return;
    }
    console.log('Povezano na bazu webshop!');
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Backend radi! Za tenisice posjeti /tenisice');
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});



// Dohvat svih tenisica
app.get('/tenisice', (req, res) => {
    db.query('SELECT * FROM tenisice', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Dodavanje tenisice
app.post('/tenisice', (req, res) => {
    const { naziv, brend, cijena, opis } = req.body;
    if (cijena <= 0) return res.status(400).json({ error: 'Cijena mora biti veća od 0!' });

    db.query(
        'INSERT INTO tenisice (naziv, brend, cijena, opis) VALUES (?, ?, ?, ?)',
        [naziv, brend, cijena, opis],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

// Ažuriranje tenisice
app.put('/tenisice/:id', (req, res) => {
    const { id } = req.params;
    const { naziv, brend, cijena, opis } = req.body;
    if (cijena <= 0) return res.status(400).json({ error: 'Cijena mora biti veća od 0!' });

    db.query(
        'UPDATE tenisice SET naziv=?, brend=?, cijena=?, opis=? WHERE id=?',
        [naziv, brend, cijena, opis, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Tenisica ažurirana' });
        }
    );
});

// Brisanje tenisice
app.delete('/tenisice/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tenisice WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Tenisica izbrisana' });
    });
});

// Pokretanje servera
app.listen(3000, () => {
    console.log('Server radi na portu 3000');
});