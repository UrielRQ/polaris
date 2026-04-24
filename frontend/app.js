// ─── Estado global ────────────────────────────────────────────────────────────
const form = document.getElementById('formMiembro');
const formProyecto = document.getElementById('formProyecto');
let editandoId = null;
let editandoProyectoId = null;
let idAEliminar = null;      // para el modal de confirmación
let idAEliminarProyecto = null;

// ─── COLORES de rol (badge visual) ───────────────────────────────────────────
const COLORES_ROL = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];
// Asigna siempre el mismo color al mismo rol
const coloresAsignados = {};
let colorIndex = 0;
function colorPorRol(rol) {
  if (!coloresAsignados[rol]) {
    coloresAsignados[rol] = COLORES_ROL[colorIndex % COLORES_ROL.length];
    colorIndex++;
  }
  return coloresAsignados[rol];
}

function formatearFechaDDMMYYYY(fechaISO) {
  if (!fechaISO) return '';

  const fecha = new Date(`${fechaISO}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaISO;

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

// ─── HELPERS DE MODO FORMULARIO ──────────────────────────────────────────────
function setModoRegistro() {
  document.getElementById('tituloFormulario').textContent = '➕ Registrar nuevo miembro';
  document.getElementById('textoBotonMiembro').textContent = 'Registrar miembro';
  document.getElementById('btnCancelar').classList.add('hidden');
  document.getElementById('modoBanner').className =
    'bg-purple-700 px-5 py-3 flex items-center justify-between';
}

function setModoEdicion(nombre) {
  document.getElementById('tituloFormulario').textContent = `✏️ Editando: ${nombre}`;
  document.getElementById('textoBotonMiembro').textContent = 'Guardar cambios';
  document.getElementById('btnCancelar').classList.remove('hidden');
  document.getElementById('modoBanner').className =
    'bg-amber-500 px-5 py-3 flex items-center justify-between';
}

function cancelarEdicion() {
  editandoId = null;
  form.reset();
  setModoRegistro();
}

function setModoRegistroProyecto() {
  document.getElementById('tituloFormProyecto').textContent = '➕ Registrar nuevo proyecto';
  document.getElementById('btnProyecto').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
    Crear proyecto`;
  document.getElementById('btnCancelarProyecto').classList.add('hidden');
  document.getElementById('modoBannerProyecto').className =
    'bg-purple-700 px-5 py-3 flex items-center justify-between';
}

function setModoEdicionProyecto(nombre) {
  document.getElementById('tituloFormProyecto').textContent = `✏️ Editando: ${nombre}`;
  document.getElementById('btnProyecto').innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round"
            d="M5 13l4 4L19 7"/>
    </svg>
    Guardar cambios`;
  document.getElementById('btnCancelarProyecto').classList.remove('hidden');
  document.getElementById('modoBannerProyecto').className =
    'bg-amber-500 px-5 py-3 flex items-center justify-between';
}

function cancelarEdicionProyecto() {
  editandoProyectoId = null;
  formProyecto.reset();
  document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => cb.checked = false);
  actualizarValidacionParticipantes();
  setModoRegistroProyecto();
}

function actualizarValidacionParticipantes() {
  const participantesInput = document.getElementById('participantesValidacion');
  if (!participantesInput) return;

  const hayParticipantes = document.querySelectorAll('#miembros input[type=checkbox]:checked').length > 0;
  participantesInput.value = hayParticipantes ? '1' : '';
  participantesInput.setCustomValidity(hayParticipantes ? '' : 'Selecciona al menos un participante.');
}

function abrirModalProyecto(id, nombre) {
  idAEliminarProyecto = id;
  document.getElementById('nombreAEliminarProyecto').textContent = nombre;
  const modal = document.getElementById('modalEliminarProyecto');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModalProyecto() {
  idAEliminarProyecto = null;
  const modal = document.getElementById('modalEliminarProyecto');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.getElementById('btnConfirmarEliminarProyecto').addEventListener('click', async () => {
  if (!idAEliminarProyecto) return;
  await fetch(`http://localhost:3000/proyectos/${idAEliminarProyecto}`, { method: 'DELETE' });
  cerrarModalProyecto();
  cargarProyectos();
});

document.getElementById('modalEliminarProyecto').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) cerrarModalProyecto();
});

// ─── MODAL DE CONFIRMACIÓN ───────────────────────────────────────────────────
function abrirModal(id, nombre) {
  idAEliminar = id;
  document.getElementById('nombreAEliminar').textContent = nombre;
  const modal = document.getElementById('modalEliminar');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModal() {
  idAEliminar = null;
  const modal = document.getElementById('modalEliminar');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
  if (!idAEliminar) return;
  await fetch(`http://localhost:3000/miembros/${idAEliminar}`, { method: 'DELETE' });
  cerrarModal();
  cargarMiembros();
});

// Cerrar modal al hacer clic fuera del cuadro
document.getElementById('modalEliminar').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) cerrarModal();
});

document.getElementById('miembros')?.addEventListener('change', actualizarValidacionParticipantes);

// ─── SUBMIT (CREATE o UPDATE) ─────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById('nombreMiembro').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    rol:    document.getElementById('rol').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
  };

  if (editandoId) {
    await fetch(`http://localhost:3000/miembros/${editandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    editandoId = null;
    setModoRegistro();
  } else {
    await fetch('http://localhost:3000/miembros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  form.reset();
  cargarMiembros();
});

// ─── CARGAR MIEMBROS ──────────────────────────────────────────────────────────
async function cargarMiembros() {
  const res = await fetch('http://localhost:3000/miembros');
  const data = await res.json();

  const contenedor    = document.getElementById('listaMiembros');
  const vacioMsg      = document.getElementById('vacioMiembros');
  const contador      = document.getElementById('contadorMiembros');

  contador.textContent = data.length;
  contenedor.innerHTML = '';

  if (data.length === 0) {
    vacioMsg.classList.remove('hidden');
  } else {
    vacioMsg.classList.add('hidden');

    data.forEach((m, i) => {
      const colorBadge = colorPorRol(m.rol);
      const iniciales  = m.nombre.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

      const card = document.createElement('div');
      card.className = 'card-anim bg-white rounded-xl shadow-sm border border-purple-100 p-4 flex items-center gap-4';
      card.style.animationDelay = `${i * 40}ms`;
      card.innerHTML = `
        <!-- Avatar con iniciales -->
        <div class="flex-shrink-0 w-11 h-11 rounded-full bg-purple-100 text-purple-700
                    flex items-center justify-center font-bold text-sm select-none">
          ${iniciales}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 text-sm leading-tight truncate">${m.nombre}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">${m.correo}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">${m.telefono || 'Sin telefono'}</p>
          <p class="text-xs text-gray-400 truncate mt-0.5">${m.fechaNacimiento ? formatearFechaDDMMYYYY(m.fechaNacimiento) : 'Sin fecha de nacimiento'}</p>
          <span class="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                       ${colorBadge}">
            ${m.rol}
          </span>
        </div>

        <!-- Acciones -->
        <div class="flex-shrink-0 flex flex-col gap-1.5">
            <button onclick="editar(${m.id}, '${escapar(m.nombre)}', '${escapar(m.correo)}', '${escapar(m.rol)}', '${escapar(m.telefono || '')}', '${escapar(m.fechaNacimiento || '')}')"
                  class="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200
                         px-3 py-1.5 rounded-lg hover:bg-purple-100 transition font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                       m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Editar
          </button>
          <button onclick="abrirModal(${m.id}, '${escapar(m.nombre)}')"
                  class="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200
                         px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                       L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Eliminar
          </button>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }

  // Actualizar checkboxes de participantes en el form de proyectos
  const miembrosDiv = document.getElementById('miembros');
  if (miembrosDiv) {
    if (data.length === 0) {
      miembrosDiv.innerHTML = '<p class="text-xs text-gray-400 italic">Registra miembros primero para poder seleccionarlos.</p>';
    } else {
      miembrosDiv.innerHTML = '';
      data.forEach(m => {
        const colorBadge = colorPorRol(m.rol);
        miembrosDiv.innerHTML += `
          <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition">
            <input type="checkbox" value="${m.id}" class="accent-purple-700 w-4 h-4">
            <span class="text-sm font-medium text-gray-700">${m.nombre}</span>
            <span class="ml-auto text-xs px-2 py-0.5 rounded-full ${colorBadge}">${m.rol}</span>
          </label>
        `;
      });
    }
  }
}

// ─── EDITAR MIEMBRO ───────────────────────────────────────────────────────────
function editar(id, nombre, correo, rol, telefono, fechaNacimiento) {
  document.getElementById('nombreMiembro').value = nombre;
  document.getElementById('correo').value         = correo;
  document.getElementById('rol').value            = rol;
  document.getElementById('telefono').value       = telefono;
  document.getElementById('fechaNacimiento').value = fechaNacimiento;
  editandoId = id;
  setModoEdicion(nombre);
  // Scroll suave al formulario
  document.getElementById('formMiembro').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── UTILIDAD: escapar comillas simples para uso en onclick inline ────────────
function escapar(str) {
  return str.replace(/'/g, "\\'");
}

// ─── CREAR / EDITAR PROYECTO ──────────────────────────────────────────────────
async function crearProyecto() {
  const checkboxes    = document.querySelectorAll('#miembros input[type=checkbox]:checked');
  const participantes = Array.from(checkboxes).map(cb => parseInt(cb.value));

  const data = {
    nombre:       document.getElementById('nombreProyecto').value.trim(),
    tipo:         document.getElementById('tipo').value.trim(),
    fecha:        document.getElementById('fecha').value,
    descripcion:  document.getElementById('descripcion').value.trim(),
    participantes,
  };

  if (!data.nombre) return;

  if (editandoProyectoId) {
    await fetch(`http://localhost:3000/proyectos/${editandoProyectoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    editandoProyectoId = null;
    setModoRegistroProyecto();
  } else {
    await fetch('http://localhost:3000/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Limpiar formulario proyecto
  formProyecto.reset();
  document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => cb.checked = false);
  actualizarValidacionParticipantes();

  cargarProyectos();
}

formProyecto.addEventListener('submit', async (e) => {
  e.preventDefault();

  actualizarValidacionParticipantes();

  if (!formProyecto.checkValidity()) {
    formProyecto.reportValidity();
    return;
  }

  await crearProyecto();
});

// ─── EDITAR PROYECTO ──────────────────────────────────────────────────────────
function editarProyecto(id, nombre, tipo, fecha, descripcion, participantes) {
  document.getElementById('nombreProyecto').value = nombre;
  document.getElementById('tipo').value           = tipo;
  document.getElementById('fecha').value          = fecha;
  document.getElementById('descripcion').value    = descripcion;
  editandoProyectoId = id;
  setModoEdicionProyecto(nombre);

  document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => {
    cb.checked = participantes.includes(parseInt(cb.value));
  });

  actualizarValidacionParticipantes();

  document.getElementById('nombreProyecto').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── ELIMINAR PROYECTO ────────────────────────────────────────────────────────
function eliminarProyecto(id, nombre) {
  abrirModalProyecto(id, nombre);
}

// ─── CARGAR PROYECTOS ─────────────────────────────────────────────────────────
async function cargarProyectos() {
  const res  = await fetch('http://localhost:3000/proyectos', { cache: 'no-store' });
  const data = await res.json();

  const contenedor    = document.getElementById('lista');
  const vacioProyectos = document.getElementById('vacioProyectos');
  const contadorProyectos = document.getElementById('contadorProyectos');
  contenedor.innerHTML = '';

  if (data.length === 0) {
    vacioProyectos.classList.remove('hidden');
  } else {
    vacioProyectos.classList.add('hidden');

    data.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'card-anim bg-white rounded-xl shadow-sm border border-purple-100 p-4';
      card.style.animationDelay = `${i * 40}ms`;

      const fechaFormato = p.fecha ? formatearFechaDDMMYYYY(p.fecha) : '';

      const participantesHTML = p.participantesInfo && p.participantesInfo.length > 0
        ? p.participantesInfo.map(m => {
            const c = colorPorRol(m.rol);
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c}">${m.nombre}</span>`;
          }).join('')
        : '<span class="text-xs text-gray-400 italic">Sin participantes asignados</span>';

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="font-bold text-gray-800 text-sm leading-tight">${p.nombre}</h3>
          <div class="flex flex-shrink-0 gap-1.5">
            <button onclick="editarProyecto(${p.id}, '${escapar(p.nombre)}', '${escapar(p.tipo)}',
                            '${p.fecha}', '${escapar(p.descripcion)}', ${JSON.stringify(p.participantes)})"
                    class="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-200
                           px-2.5 py-1.5 rounded-lg hover:bg-purple-100 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </button>
                <button onclick="abrirModalProyecto(${p.id}, '${escapar(p.nombre)}')"
                    class="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200
                           px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                         L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2">
          ${p.tipo ? `<span class="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full font-medium">${p.tipo}</span>` : ''}
          ${fechaFormato ? `<span class="text-xs text-gray-400">${fechaFormato}</span>` : ''}
        </div>

        ${p.descripcion ? `<p class="text-xs text-gray-600 mb-3 leading-relaxed">${p.descripcion}</p>` : ''}

        <div>
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Participantes</p>
          <div class="flex flex-wrap gap-1.5">${participantesHTML}</div>
        </div>
      `;
      contenedor.appendChild(card);
    });
  }

  if (contadorProyectos) {
    contadorProyectos.textContent = contenedor.querySelectorAll('.card-anim').length;
  }
}

// ─── INICIAR ──────────────────────────────────────────────────────────────────
cargarMiembros();
cargarProyectos();
