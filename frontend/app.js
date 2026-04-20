const form = document.getElementById('formMiembro');

let editandoId = null;

// SUBMIT (CREATE o UPDATE)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombreMiembro').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
    };

    if (editandoId) {
        await fetch(`http://localhost:3000/miembros/${editandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        editandoId = null;
    } else {
        await fetch('http://localhost:3000/miembros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    form.reset();
    cargarMiembros();
});

// CARGAR MIEMBROS
async function cargarMiembros() {
    const res = await fetch('http://localhost:3000/miembros');
    const data = await res.json();

    const contenedor = document.getElementById('listaMiembros');
    contenedor.innerHTML = '';

    data.forEach(m => {
        contenedor.innerHTML += `
    <div class="bg-white rounded-xl shadow p-4 border border-purple-100">
        <h3 class="text-lg font-semibold text-purple-700">${m.nombre}</h3>
        <p class="text-sm text-gray-600">${m.correo}</p>
        <p class="text-sm text-gray-500">${m.rol}</p>
        <div class="flex gap-2 mt-3">
            <button onclick="editar(${m.id}, '${m.nombre}', '${m.correo}', '${m.rol}')"
                class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition">
                Editar
            </button>
            <button onclick="eliminar(${m.id})"
                class="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition">
                Eliminar
            </button>
        </div>
    </div>
`;
    });

    // Actualizar checkboxes de participantes en el form de proyectos
    const miembrosDiv = document.getElementById('miembros');
    if (miembrosDiv) {
        miembrosDiv.innerHTML = '';
        data.forEach(m => {
            miembrosDiv.innerHTML += `
                <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-50 cursor-pointer">
                    <input type="checkbox" value="${m.id}" class="accent-purple-700">
                    <span class="text-sm">${m.nombre} — ${m.rol}</span>
                </label>
            `;
        });
    }
}

// EDITAR
function editar(id, nombre, correo, rol) {
    document.getElementById('nombreMiembro').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;
    editandoId = id;
}

// ELIMINAR
async function eliminar(id) {
    if (!confirm('¿Eliminar este miembro?')) return;
    await fetch(`http://localhost:3000/miembros/${id}`, { method: 'DELETE' });
    cargarMiembros();
}

// CREAR PROYECTO
async function crearProyecto() {
    const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
    const participantes = Array.from(checkboxes).map(cb => parseInt(cb.value));

    const data = {
        nombre: document.getElementById('nombreProyecto').value,
        tipo: document.getElementById('tipo').value,
        fecha: document.getElementById('fecha').value,
        descripcion: document.getElementById('descripcion').value,
        participantes
    };

    await fetch('http://localhost:3000/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    document.getElementById('nombreProyecto').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('fecha').value = '';
    document.getElementById('descripcion').value = '';
    document.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);

    cargarProyectos();
}

// CARGAR PROYECTOS
async function cargarProyectos() {
    const res = await fetch('http://localhost:3000/proyectos');
    const data = await res.json();

    const contenedor = document.getElementById('lista');
    contenedor.innerHTML = "";

    data.forEach(p => {
        contenedor.innerHTML += `
            <div class="bg-white rounded-xl shadow p-4 border border-purple-100 mb-4">
                <h3 class="text-lg font-semibold text-purple-700">${p.nombre}</h3>
                <p class="text-sm text-purple-500 font-medium">${p.tipo} • ${p.fecha}</p>
                <p class="text-sm text-gray-600 mt-1">${p.descripcion}</p>
                <p class="text-sm font-semibold mt-2">Participantes:</p>
                <div class="flex flex-wrap gap-2 mt-1">
                    ${p.participantesInfo.map(m => `<span class="badge">${m.nombre}</span>`).join('')}
                </div>
            </div>
        `;
    });
}

// Iniciar
cargarMiembros();
cargarProyectos();
