let personaEditandoId = null;
const PERSONAS_POR_PAGINA = 10;
let todasLasPersonas = [];
let paginaPersonasActual = 1;

async function cargarPersonas(busqueda = "") {
  try {
    const url = busqueda
      ? `${API_URL}/api/personas?busqueda=${encodeURIComponent(busqueda)}`
      : `${API_URL}/api/personas`;

    const respuesta = await fetch(url, {
      headers: { "x-usuario-id": sesionActual.id }
    });

    todasLasPersonas = await respuesta.json();
    document.getElementById("contadorPersonas").textContent = `Personas registradas: ${todasLasPersonas.length}`;
    paginaPersonasActual = 1;
    renderizarPaginaPersonas();

  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de personas");
  }
}

function renderizarPaginaPersonas() {
  const tabla = document.getElementById("tablaPersonas");
  const mensajeVacio = document.getElementById("mensajeVacio");
  const paginacion = document.getElementById("paginacionPersonas");

  if (todasLasPersonas.length === 0) {
    tabla.innerHTML = "";
    mensajeVacio.style.display = "block";
    paginacion.style.display = "none";
    return;
  }
  mensajeVacio.style.display = "none";

  const totalPaginas = Math.max(1, Math.ceil(todasLasPersonas.length / PERSONAS_POR_PAGINA));
  const inicio = (paginaPersonasActual - 1) * PERSONAS_POR_PAGINA;
  const personasPagina = todasLasPersonas.slice(inicio, inicio + PERSONAS_POR_PAGINA);

  tabla.innerHTML = "";
  personasPagina.forEach((p) => {
    const nombreCompleto = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ""}`.trim();
    const fecha = p.fecha_nacimiento
      ? new Date(p.fecha_nacimiento).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "-";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><a href="expediente.html?id=${p.id}" class="link-nombre">${nombreCompleto}</a></td>
      <td>${fecha}</td>
      <td>${p.curp || "-"}</td>
      <td>${p.telefono || "-"}</td>
      <td>
        <button class="btn-editar" data-id="${p.id}">Editar</button>
        <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    tabla.appendChild(fila);
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
  });
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => eliminarPersona(btn.dataset.id));
  });

  document.getElementById("infoPaginaPersonas").textContent = `Página ${paginaPersonasActual} de ${totalPaginas}`;
  document.getElementById("btnAnteriorPersonas").disabled = paginaPersonasActual === 1;
  document.getElementById("btnSiguientePersonas").disabled = paginaPersonasActual === totalPaginas;
  paginacion.style.display = "flex";
}

document.getElementById("btnAnteriorPersonas").addEventListener("click", () => {
  if (paginaPersonasActual > 1) {
    paginaPersonasActual--;
    renderizarPaginaPersonas();
  }
});

document.getElementById("btnSiguientePersonas").addEventListener("click", () => {
  const totalPaginas = Math.ceil(todasLasPersonas.length / PERSONAS_POR_PAGINA);
  if (paginaPersonasActual < totalPaginas) {
    paginaPersonasActual++;
    renderizarPaginaPersonas();
  }
});

function abrirModalNueva() {
  personaEditandoId = null;
  document.getElementById("modalTitulo").textContent = "Nueva persona";
  document.getElementById("formPersona").reset();
  document.getElementById("modalError").textContent = "";
  document.getElementById("modalPersona").style.display = "flex";
}

async function abrirModalEditar(id) {
  try {
    const respuesta = await fetch(`${API_URL}/api/personas/${id}`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const persona = await respuesta.json();

    personaEditandoId = id;
    document.getElementById("modalTitulo").textContent = "Editar persona";
    document.getElementById("modalError").textContent = "";

    document.getElementById("nombre").value = persona.nombre || "";
    document.getElementById("apellido_paterno").value = persona.apellido_paterno || "";
    document.getElementById("apellido_materno").value = persona.apellido_materno || "";
    document.getElementById("fecha_nacimiento").value = persona.fecha_nacimiento
      ? persona.fecha_nacimiento.split("T")[0] : "";
    document.getElementById("lugar_nacimiento").value = persona.lugar_nacimiento || "";
    document.getElementById("curp").value = persona.curp || "";
    document.getElementById("nombre_padre").value = persona.nombre_padre || "";
    document.getElementById("nombre_madre").value = persona.nombre_madre || "";
    document.getElementById("direccion").value = persona.direccion || "";
    document.getElementById("telefono").value = persona.telefono || "";

    document.getElementById("modalPersona").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la persona");
  }
}

function cerrarModal() {
  document.getElementById("modalPersona").style.display = "none";
}

async function eliminarPersona(id) {
  if (!confirm("¿Seguro que deseas eliminar esta persona? Podrá recuperarse solo desde la base de datos.")) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/personas/${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": sesionActual.id }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.error || "No se pudo eliminar");
      return;
    }

    cargarPersonas(document.getElementById("inputBusqueda").value.trim());
  } catch (err) {
    console.error(err);
    alert("Error al eliminar la persona");
  }
}

document.getElementById("btnNuevaPersona").addEventListener("click", abrirModalNueva);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);

document.getElementById("formPersona").addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido_paterno: document.getElementById("apellido_paterno").value.trim(),
    apellido_materno: document.getElementById("apellido_materno").value.trim(),
    fecha_nacimiento: document.getElementById("fecha_nacimiento").value || null,
    lugar_nacimiento: document.getElementById("lugar_nacimiento").value.trim(),
    curp: document.getElementById("curp").value.trim().toUpperCase(),
    nombre_padre: document.getElementById("nombre_padre").value.trim(),
    nombre_madre: document.getElementById("nombre_madre").value.trim(),
    direccion: document.getElementById("direccion").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
  };

  const modalError = document.getElementById("modalError");
  modalError.textContent = "";

  try {
    const esEdicion = personaEditandoId !== null;
    const url = esEdicion ? `${API_URL}/api/personas/${personaEditandoId}` : `${API_URL}/api/personas`;
    const metodo = esEdicion ? "PUT" : "POST";

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "x-usuario-id": sesionActual.id
      },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      modalError.textContent = resultado.error || "Error al guardar";
      return;
    }

    cerrarModal();
    cargarPersonas(document.getElementById("inputBusqueda").value.trim());

    if (!esEdicion) {
      mostrarPromptSacramento(resultado.id, `${resultado.nombre} ${resultado.apellido_paterno}`);
    }

  } catch (err) {
    console.error(err);
    modalError.textContent = "No se pudo conectar con el servidor";
  }
});

function mostrarPromptSacramento(personaId, nombreCompleto) {
  document.getElementById("nombrePersonaCreada").textContent = nombreCompleto;
  document.getElementById("modalPromptSacramento").style.display = "flex";

  document.getElementById("btnOmitirSacramento").onclick = () => {
    document.getElementById("modalPromptSacramento").style.display = "none";
  };

  document.getElementById("btnIrASacramento").onclick = () => {
    window.location.href = `expediente.html?id=${personaId}&nuevo=1`;
  };
}

let temporizadorBusqueda;
document.getElementById("inputBusqueda").addEventListener("input", function () {
  clearTimeout(temporizadorBusqueda);
  const valor = this.value.trim();
  temporizadorBusqueda = setTimeout(() => cargarPersonas(valor), 400);
});

cargarPersonas();