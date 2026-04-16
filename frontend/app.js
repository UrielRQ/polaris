const form = document.getElementById('formMiembro');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        rol: document.getElementById('rol').value
    };

    await fetch('http://localhost:3000/miembros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    form.reset();
    cargarMiembros();
});

async function cargarMiembros() {
    const res = await fetch('http://localhost:3000/miembros');
    const data = await res.json();

    const contenedor = document.getElementById('listaMiembros');
    contenedor.innerHTML = '';

    data.forEach(m => {
        contenedor.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition border border-purple-100">
                <h3 class="text-lg font-bold text-purple-700">${m.nombre}</h3>
                <p class="text-gray-600">${m.correo}</p>
                <span class="inline-block mt-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                    ${m.rol}
                </span>
            </div>
        `;
    });
}

cargarMiembros();