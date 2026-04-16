const form = document.getElementById('formMiembro');

let editandoId = null;

// SUBMIT (CREATE o UPDATE)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
    };

    if (editandoId) {
        // UPDATE
        await fetch(`http://localhost:3000/miembros/${editandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        editandoId = null;
    } else {
        // CREATE
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
            <div class="bg-white border border-white p-4 rounded-xl shadow-md">
                
                <h3 class="text-lg font-bold text-purple-800">${m.nombre}</h3>
                <p class="text-gray-400">${m.correo}</p>
                <span class="inline-block mt-2 px-3 py-1 text-sm bg-purple-700/20 text-purple-700 rounded-full">
                    ${m.rol}
                </span>

                <div class="mt-4 flex gap-2">
                    <button onclick="editar(${m.id}, '${m.nombre}', '${m.correo}', '${m.rol}')" 
                        class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white">
                        Editar
                    </button>

                    <button onclick="eliminar(${m.id})" 
                        class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm text-white">
                        Eliminar
                    </button>
                </div>

            </div>
        `;
    });
}

// EDITAR
function editar(id, nombre, correo, rol) {
    document.getElementById('nombre').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;

    editandoId = id;
}

// ELIMINAR
async function eliminar(id) {
    if (!confirm('¿Eliminar este miembro?')) return;

    await fetch(`http://localhost:3000/miembros/${id}`, {
        method: 'DELETE'
    });

    cargarMiembros();
}

// cargar al inicio
cargarMiembros();