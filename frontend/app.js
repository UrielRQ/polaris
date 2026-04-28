// ── Navigation ──────────────────────────────────────────────────────────
function navigateTo(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const targetView = document.getElementById('view-' + view);
  const targetNav  = document.getElementById('nav-' + view);

  if (targetView) { targetView.classList.add('active'); window.scrollTo({top:0, behavior:'smooth'}); }
  if (targetNav)  { targetNav.classList.add('active'); }

  if (view === 'dashboard') cargarDashboard();
  if (view === 'equipo')    cargarEquipo();
}

// ── State ────────────────────────────────────────────────────────────────
const form = document.getElementById('formMiembro');
const formProyecto = document.getElementById('formProyecto');
let editandoId = null, editandoProyectoId = null;
let idAEliminar = null, idAEliminarProyecto = null;

const COLORES_ROL = [
  'bg-blue-100 text-blue-700','bg-polar-100 text-polar-700',
  'bg-green-100 text-green-700','bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700','bg-teal-100 text-teal-700',
];
const coloresAsignados = {};
let colorIndex = 0;
function colorPorRol(rol) {
  if (!coloresAsignados[rol]) coloresAsignados[rol] = COLORES_ROL[colorIndex++ % COLORES_ROL.length];
  return coloresAsignados[rol];
}
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const f = new Date(`${fechaISO}T00:00:00`);
  if (isNaN(f)) return fechaISO;
  return `${String(f.getDate()).padStart(2,'0')}/${String(f.getMonth()+1).padStart(2,'0')}/${f.getFullYear()}`;
}

// ── Form mode helpers ────────────────────────────────────────────────────
function setModoRegistro() {
  document.getElementById('tituloFormulario').textContent = '➕ Registrar nuevo miembro';
  document.getElementById('textoBotonMiembro').textContent = 'Registrar miembro';
  document.getElementById('btnCancelar').classList.add('hidden');
  document.getElementById('modoBanner').className = 'bg-polar-600 px-5 py-3 flex items-center justify-between';
}
function setModoEdicion(nombre) {
  document.getElementById('tituloFormulario').textContent = `Editando: ${nombre}`;
  document.getElementById('textoBotonMiembro').textContent = 'Guardar cambios';
  document.getElementById('btnCancelar').classList.remove('hidden');
  document.getElementById('modoBanner').className = 'bg-amber-500 px-5 py-3 flex items-center justify-between';
}
function cancelarEdicion() { editandoId = null; form.reset(); setModoRegistro(); }

function setModoRegistroProyecto() {
  document.getElementById('tituloFormProyecto').textContent = '➕ Registrar nuevo proyecto';
  document.getElementById('btnProyecto').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>Crear proyecto`;
  document.getElementById('btnCancelarProyecto').classList.add('hidden');
  document.getElementById('modoBannerProyecto').className = 'bg-polar-600 px-5 py-3 flex items-center justify-between';
}
function setModoEdicionProyecto(nombre) {
  document.getElementById('tituloFormProyecto').textContent = `Editando: ${nombre}`;
  document.getElementById('btnProyecto').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Guardar cambios`;
  document.getElementById('btnCancelarProyecto').classList.remove('hidden');
  document.getElementById('modoBannerProyecto').className = 'bg-amber-500 px-5 py-3 flex items-center justify-between';
}
function cancelarEdicionProyecto() {
  editandoProyectoId = null; formProyecto.reset();
  document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => cb.checked = false);
  actualizarValidacionParticipantes(); setModoRegistroProyecto();
}
function actualizarValidacionParticipantes() {
  const pi = document.getElementById('participantesValidacion');
  if (!pi) return;
  const sel = document.querySelectorAll('#miembros input[type=checkbox]:checked').length;
  const c = document.getElementById('contadorSeleccionados');
  if (c) c.textContent = sel;
  pi.value = sel > 0 ? '1' : '';
  pi.setCustomValidity(sel > 0 ? '' : 'Selecciona al menos un participante.');
}

// ── Modals ───────────────────────────────────────────────────────────────
function abrirModal(id, nombre) {
  idAEliminar = id; document.getElementById('nombreAEliminar').textContent = nombre;
  const m = document.getElementById('modalEliminar');
  m.classList.remove('hidden'); m.classList.add('flex');
}
function cerrarModal() {
  idAEliminar = null;
  const m = document.getElementById('modalEliminar');
  m.classList.add('hidden'); m.classList.remove('flex');
}
function abrirModalProyecto(id, nombre) {
  idAEliminarProyecto = id; document.getElementById('nombreAEliminarProyecto').textContent = nombre;
  const m = document.getElementById('modalEliminarProyecto');
  m.classList.remove('hidden'); m.classList.add('flex');
}
function cerrarModalProyecto() {
  idAEliminarProyecto = null;
  const m = document.getElementById('modalEliminarProyecto');
  m.classList.add('hidden'); m.classList.remove('flex');
}

document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
  if (!idAEliminar) return;
  await fetch(`http://localhost:3000/miembros/${idAEliminar}`, { method: 'DELETE' });
  cerrarModal(); cargarMiembros();
});
document.getElementById('btnConfirmarEliminarProyecto').addEventListener('click', async () => {
  if (!idAEliminarProyecto) return;
  await fetch(`http://localhost:3000/proyectos/${idAEliminarProyecto}`, { method: 'DELETE' });
  cerrarModalProyecto(); cargarProyectos();
});
document.getElementById('modalEliminar').addEventListener('click', e => { if (e.target===e.currentTarget) cerrarModal(); });
document.getElementById('modalEliminarProyecto').addEventListener('click', e => { if (e.target===e.currentTarget) cerrarModalProyecto(); });
document.getElementById('miembros')?.addEventListener('change', actualizarValidacionParticipantes);

// ── CRUD Miembros ────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('nombreMiembro').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    rol: document.getElementById('rol').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
  };
  if (editandoId) {
    await fetch(`http://localhost:3000/miembros/${editandoId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    editandoId = null; setModoRegistro();
  } else {
    await fetch('http://localhost:3000/miembros', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  }
  form.reset(); cargarMiembros();
});

async function cargarMiembros() {
  let data = [];
  try {
    const res = await fetch('http://localhost:3000/miembros');
    data = await res.json();
  } catch(e) { /* backend not running */ }

  const contenedor = document.getElementById('listaMiembros');
  const vacioMsg   = document.getElementById('vacioMiembros');
  const contador   = document.getElementById('contadorMiembros');
  if (contador) contador.textContent = data.length;
  contenedor.innerHTML = '';

  const homeStat = document.getElementById('home-stat-miembros');
  if (homeStat) homeStat.textContent = data.length;

  if (data.length === 0) { vacioMsg.classList.remove('hidden'); }
  else {
    vacioMsg.classList.add('hidden');
    data.forEach((m, i) => {
      const cb = colorPorRol(m.rol);
      const ini = m.nombre.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
      const card = document.createElement('div');
      card.className = 'card-anim bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4';
      card.style.animationDelay = `${i*40}ms`;
      card.innerHTML = `
        <div class="flex-shrink-0 w-11 h-11 rounded-full bg-polar-100 text-polar-700 flex items-center justify-center font-bold text-sm select-none">${ini}</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 text-sm leading-tight truncate">${m.nombre}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">${m.correo}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">${m.telefono||'Sin teléfono'}</p>
          <p class="text-xs text-gray-400 mt-0.5">${m.fechaNacimiento ? formatearFecha(m.fechaNacimiento) : 'Sin fecha'}</p>
          <span class="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cb}">${m.rol}</span>
        </div>
        <div class="flex-shrink-0 flex flex-col gap-1.5">
          <button onclick="editar(${m.id},'${escapar(m.nombre)}','${escapar(m.correo)}','${escapar(m.rol)}','${escapar(m.telefono||'')}','${escapar(m.fechaNacimiento||'')}')"
            class="flex items-center gap-1.5 text-xs bg-polar-50 text-polar-700 border border-polar-200 px-3 py-1.5 rounded-lg hover:bg-polar-100 transition font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Editar
          </button>
          <button onclick="abrirModal(${m.id},'${escapar(m.nombre)}')"
            class="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Eliminar
          </button>
        </div>`;
      contenedor.appendChild(card);
    });
  }

  // Update participant checkboxes in project form
  const miembrosDiv = document.getElementById('miembros');
  if (miembrosDiv) {
    if (data.length === 0) {
      miembrosDiv.innerHTML = '<p class="text-xs text-gray-400 italic">Registra miembros primero para poder seleccionarlos.</p>';
    } else {
      miembrosDiv.innerHTML = '';
      data.forEach(m => {
        const cb = colorPorRol(m.rol);
        miembrosDiv.innerHTML += `
          <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-polar-50 cursor-pointer transition">
            <input type="checkbox" value="${m.id}" class="accent-polar-600 w-4 h-4">
            <span class="text-sm font-medium text-gray-700">${m.nombre}</span>
            <span class="ml-auto text-xs px-2 py-0.5 rounded-full ${cb}">${m.rol}</span>
          </label>`;
      });
    }
  }
  return data;
}

function editar(id, nombre, correo, rol, telefono, fechaNacimiento) {
  navigateTo('miembros');
  setTimeout(() => {
    document.getElementById('nombreMiembro').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;
    document.getElementById('telefono').value = telefono;
    document.getElementById('fechaNacimiento').value = fechaNacimiento;
    editandoId = id; setModoEdicion(nombre);
    document.getElementById('formMiembro').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 100);
}

function escapar(str) { return String(str||'').replace(/'/g,"\\'"); }

// ── CRUD Proyectos ────────────────────────────────────────────────────────
async function crearProyecto() {
  const checkboxes = document.querySelectorAll('#miembros input[type=checkbox]:checked');
  const participantes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const data = {
    nombre: document.getElementById('nombreProyecto').value.trim(),
    tipo:   document.getElementById('tipo').value.trim(),
    fecha:  document.getElementById('fecha').value,
    descripcion: document.getElementById('descripcion').value.trim(),
    participantes,
  };
  if (!data.nombre) return;
  if (editandoProyectoId) {
    await fetch(`http://localhost:3000/proyectos/${editandoProyectoId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    editandoProyectoId = null; setModoRegistroProyecto();
  } else {
    await fetch('http://localhost:3000/proyectos', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  }
  formProyecto.reset();
  document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => cb.checked = false);
  actualizarValidacionParticipantes(); cargarProyectos();
}

formProyecto.addEventListener('submit', async (e) => {
  e.preventDefault(); actualizarValidacionParticipantes();
  if (!formProyecto.checkValidity()) { formProyecto.reportValidity(); return; }
  await crearProyecto();
});

function editarProyecto(id, nombre, tipo, fecha, descripcion, participantes) {
  navigateTo('proyectos');
  setTimeout(() => {
    document.getElementById('nombreProyecto').value = nombre;
    document.getElementById('tipo').value = tipo;
    document.getElementById('fecha').value = fecha;
    document.getElementById('descripcion').value = descripcion;
    editandoProyectoId = id; setModoEdicionProyecto(nombre);
    document.querySelectorAll('#miembros input[type=checkbox]').forEach(cb => {
      cb.checked = participantes.includes(parseInt(cb.value));
    });
    actualizarValidacionParticipantes();
    document.getElementById('nombreProyecto').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 100);
}

function eliminarProyecto(id, nombre) { abrirModalProyecto(id, nombre); }

async function cargarProyectos() {
  let data = [];
  try {
    const res = await fetch('http://localhost:3000/proyectos', { cache:'no-store' });
    data = await res.json();
  } catch(e) { /* backend not running */ }

  const contenedor = document.getElementById('lista');
  const vacioProyectos = document.getElementById('vacioProyectos');
  const contadorProyectos = document.getElementById('contadorProyectos');
  contenedor.innerHTML = '';

  const homeStat = document.getElementById('home-stat-proyectos');
  if (homeStat) homeStat.textContent = data.length;

  if (data.length === 0) { vacioProyectos.classList.remove('hidden'); }
  else {
    vacioProyectos.classList.add('hidden');
    data.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'card-anim bg-white rounded-xl shadow-sm border border-gray-100 p-5';
      card.style.animationDelay = `${i*40}ms`;
      const fechaF = p.fecha ? formatearFecha(p.fecha) : 'Sin fecha';
      const partHTML = p.participantesInfo && p.participantesInfo.length > 0
        ? p.participantesInfo.map(m=>`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorPorRol(m.rol)}">${m.nombre}</span>`).join('')
        : '<span class="text-xs text-gray-400 italic">Sin participantes asignados</span>';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <h3 class="font-bold text-gray-800 text-base leading-tight truncate">${p.nombre}</h3>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              ${p.tipo?`<span class="text-xs bg-polar-50 text-polar-700 border border-polar-200 px-2.5 py-0.5 rounded-full font-semibold">${p.tipo}</span>`:''}
              <span class="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                ${fechaF}
              </span>
            </div>
          </div>
          <div class="flex flex-shrink-0 gap-1.5">
            <button onclick="editarProyecto(${p.id},'${escapar(p.nombre)}','${escapar(p.tipo)}','${p.fecha}','${escapar(p.descripcion)}',${JSON.stringify(p.participantes)})"
              class="flex items-center gap-1 text-xs bg-polar-50 text-polar-700 border border-polar-200 px-2.5 py-1.5 rounded-lg hover:bg-polar-100 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </button>
            <button onclick="abrirModalProyecto(${p.id},'${escapar(p.nombre)}')"
              class="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Eliminar
            </button>
          </div>
        </div>
        ${p.descripcion?`<p class="text-xs text-gray-600 mb-3 leading-relaxed">${p.descripcion}</p>`:''}
        <div>
          <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Participantes</p>
          <div class="flex flex-wrap gap-2">${partHTML}</div>
        </div>`;
      contenedor.appendChild(card);
    });
  }
  if (contadorProyectos) contadorProyectos.textContent = contenedor.querySelectorAll('.card-anim').length;
  return data;
}

// ── Equipo view ──────────────────────────────────────────────────────────
async function cargarEquipo() {
  let data = [];
  try { const r = await fetch('http://localhost:3000/miembros'); data = await r.json(); } catch(e) {}
  const listado = document.getElementById('equipoListado');
  if (!listado) return;
  listado.innerHTML = '';
  if (data.length === 0) {
    listado.innerHTML = '<div class="bg-white rounded-xl p-5 border border-dashed border-gray-200 text-center col-span-2"><p class="text-gray-400 text-sm">No hay miembros registrados aún.</p></div>';
    return;
  }
  data.forEach((m, i) => {
    const cb  = colorPorRol(m.rol);
    const ini = m.nombre.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
    const card = document.createElement('div');
    card.className = 'card-anim bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4';
    card.style.animationDelay = `${i*60}ms`;
    card.innerHTML = `
      <div class="w-14 h-14 rounded-2xl bg-polar-100 text-polar-700 flex items-center justify-center font-display text-xl font-bold select-none flex-shrink-0">${ini}</div>
      <div class="min-w-0">
        <p class="font-semibold text-gray-800">${m.nombre}</p>
        <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cb}">${m.rol}</span>
        <p class="text-xs text-gray-500 mt-1.5 truncate">${m.correo}</p>
        <p class="text-xs text-gray-400 mt-0.5">${m.telefono||''}</p>
      </div>`;
    listado.appendChild(card);
  });
}

// ── Dashboard ────────────────────────────────────────────────────────────
async function cargarDashboard() {
  let miembros = [], proyectos = [];
  try { miembros = await (await fetch('http://localhost:3000/miembros')).json(); } catch(e){}
  try { proyectos = await (await fetch('http://localhost:3000/proyectos')).json(); } catch(e){}

  const totalPart = proyectos.reduce((acc, p) => acc + (p.participantes||[]).length, 0);

  const dm = document.getElementById('dash-miembros');
  const dp = document.getElementById('dash-proyectos');
  const dpar = document.getElementById('dash-participaciones');
  if (dm) dm.textContent = miembros.length;
  if (dp) dp.textContent = proyectos.length;
  if (dpar) dpar.textContent = totalPart;

  const um = document.getElementById('dash-ultimos-miembros');
  const up = document.getElementById('dash-ultimos-proyectos');
  if (um) {
    um.innerHTML = miembros.length === 0 ? '<p class="text-xs text-gray-400 italic">Sin miembros aún.</p>'
      : miembros.slice(-5).reverse().map(m=>`
        <div class="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
          <div class="w-7 h-7 rounded-full bg-polar-100 text-polar-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            ${m.nombre.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-800 truncate">${m.nombre}</p>
            <p class="text-xs text-gray-400">${m.rol}</p>
          </div>
        </div>`).join('');
  }
  if (up) {
    up.innerHTML = proyectos.length === 0 ? '<p class="text-xs text-gray-400 italic">Sin proyectos aún.</p>'
      : proyectos.slice(-5).reverse().map(p=>`
        <div class="py-1.5 border-b border-gray-50 last:border-0">
          <p class="text-sm font-medium text-gray-800">${p.nombre}</p>
          <div class="flex items-center gap-2 mt-0.5">
            ${p.tipo?`<span class="text-xs bg-polar-50 text-polar-600 px-2 py-0.5 rounded-full">${p.tipo}</span>`:''}
            <span class="text-xs text-gray-400">${p.fecha ? formatearFecha(p.fecha) : ''}</span>
          </div>
        </div>`).join('');
  }
}

// ── Init ─────────────────────────────────────────────────────────────────
cargarMiembros();
cargarProyectos();