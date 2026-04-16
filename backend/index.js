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

// UPDATE (PUT)
app.put('/miembros/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;

    const miembro = miembros.find(m => m.id == id);

    if (!miembro) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
    }

    miembro.nombre = nombre;
    miembro.correo = correo;
    miembro.rol = rol;

    res.json(miembro);
});

// DELETE
app.delete('/miembros/:id', (req, res) => {
    const { id } = req.params;

    miembros = miembros.filter(m => m.id != id);

    res.json({ mensaje: 'Miembro eliminado' });
});