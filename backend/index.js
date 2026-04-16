const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let miembros = []; // simulando base de datos

// CREATE (POST)
app.post('/miembros', (req, res) => {
    const { nombre, correo, rol } = req.body;

    const nuevo = {
        id: miembros.length + 1,
        nombre,
        correo,
        rol
    };

    miembros.push(nuevo);
    res.json(nuevo);
});

// READ (GET)
app.get('/miembros', (req, res) => {
    res.json(miembros);
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});