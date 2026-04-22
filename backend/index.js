const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let miembros = []; // simulando base de datos

let proyectos = []; // nueva "base de datos"

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

// CREATE PROYECTO
app.post('/proyectos', (req, res) => {
    const { nombre, tipo, fecha, descripcion, participantes } = req.body;

    const nuevoProyecto = {
        id: proyectos.length + 1,
        nombre,
        tipo,
        fecha,
        descripcion,
        participantes // array de IDs de miembros
    };

    proyectos.push(nuevoProyecto);
    res.json(nuevoProyecto);
});

// READ PROYECTOS
app.get('/proyectos', (req, res) => {
    // Opcional: enriquecer con info de miembros
    const resultado = proyectos.map(p => {
        const participantesInfo = miembros.filter(m =>
            p.participantes.includes(m.id)
        );

        return {
            ...p,
            participantesInfo
        };
    });

    res.json(resultado);
});
// UPDATE PROYECTO
app.put('/proyectos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, fecha, descripcion, participantes } = req.body;

    const proyecto = proyectos.find(p => p.id == id);

    if (!proyecto) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    proyecto.nombre = nombre;
    proyecto.tipo = tipo;
    proyecto.fecha = fecha;
    proyecto.descripcion = descripcion;
    proyecto.participantes = participantes; // permite agregar/remover participantes

    res.json(proyecto);
});

// DELETE PROYECTO
app.delete('/proyectos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = proyectos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    proyectos.splice(index, 1);
    res.json({ mensaje: 'Proyecto eliminado' });
});