const POR_PAGINA = 10;
let todasLasBodas = [];
let paginaActual = 1;
let bodaEditandoId = null;
let sacerdotesCargados = false;

const esAdmin = sesionActual && sesionActual.rol === "admin";

// Cada id del formulario se llama igual que la columna de la tabla "matrimonios"
const CAMPOS_FORM = [
  "fecha_matrimonio", "templo", "sacerdote_id", "libro", "folio", "numero_acta",
  "esposo_nombre", "esposo_apellido_paterno", "esposo_apellido_materno",
  "esposo_fecha_nacimiento", "esposo_lugar_nacimiento", "esposo_padre", "esposo_madre",
  "esposa_nombre", "esposa_apellido_paterno", "esposa_apellido_materno",
  "esposa_fecha_nacimiento", "esposa_lugar_nacimiento", "esposa_padre", "esposa_madre",
  "testigo1", "testigo2", "padrino_velacion", "madrina_velacion",
  "observaciones"
];

function escaparHtml(texto) {
  return String(texto === null || texto === undefined ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nombreCompleto(nombre, paterno, materno) {
  return `${nombre || ""} ${paterno || ""} ${materno || ""}`.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------
// LISTA
// ---------------------------------------------------------
async function cargarBodas(busqueda = "") {
  try {
    const url = busqueda
      ? `${API_URL}/api/matrimonios?busqueda=${encodeURIComponent(busqueda)}`
      : `${API_URL}/api/matrimonios`;

    const respuesta = await fetch(url, { headers: { "x-usuario-id": sesionActual.id } });
    todasLasBodas = await respuesta.json();
    paginaActual = 1;
    renderizarPagina();
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de bodas");
  }
}

function renderizarPagina() {
  const tabla = document.getElementById("tablaBodas");
  const mensajeVacio = document.getElementById("mensajeVacio");
  const paginacion = document.getElementById("paginacion");

  if (!Array.isArray(todasLasBodas) || todasLasBodas.length === 0) {
    tabla.innerHTML = "";
    mensajeVacio.style.display = "block";
    paginacion.style.display = "none";
    return;
  }
  mensajeVacio.style.display = "none";

  const totalPaginas = Math.max(1, Math.ceil(todasLasBodas.length / POR_PAGINA));
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const pagina = todasLasBodas.slice(inicio, inicio + POR_PAGINA);

  tabla.innerHTML = pagina.map((b, indice) => {
    const numero = todasLasBodas.length - inicio - indice;
    const esposo = nombreCompleto(b.esposo_nombre, b.esposo_apellido_paterno, b.esposo_apellido_materno);
    const esposa = nombreCompleto(b.esposa_nombre, b.esposa_apellido_paterno, b.esposa_apellido_materno);
    const fecha = b.fecha_matrimonio
      ? new Date(b.fecha_matrimonio).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "-";
    const puedeGenerarBoleta = b.fecha_matrimonio && b.numero_acta;

    return `
      <tr>
        <td>${numero}</td>
        <td>${escaparHtml(esposo)}</td>
        <td>${escaparHtml(esposa)}</td>
        <td>${fecha}</td>
        <td>${escaparHtml(b.numero_acta) || "-"}</td>
        <td>
          ${puedeGenerarBoleta ? `<button class="btn-boleta" data-id="${b.id}">Boleta</button>` : ""}
          <button class="btn-editar" data-id="${b.id}">Editar</button>
          ${esAdmin ? `<button class="btn-eliminar" data-id="${b.id}">Eliminar</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll(".btn-boleta").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = `${API_URL}/api/matrimonios/${btn.dataset.id}/boleta?usuarioId=${sesionActual.id}`;
      window.open(url, "_blank");
    });
  });
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
  });
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => eliminarBoda(btn.dataset.id));
  });

  document.getElementById("infoPagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btnAnterior").disabled = paginaActual === 1;
  document.getElementById("btnSiguiente").disabled = paginaActual === totalPaginas;
  paginacion.style.display = "flex";
}

document.getElementById("btnAnterior").addEventListener("click", () => {
  if (paginaActual > 1) { paginaActual--; renderizarPagina(); }
});
document.getElementById("btnSiguiente").addEventListener("click", () => {
  const totalPaginas = Math.ceil(todasLasBodas.length / POR_PAGINA);
  if (paginaActual < totalPaginas) { paginaActual++; renderizarPagina(); }
});

let temporizador;
document.getElementById("inputBusqueda").addEventListener("input", function () {
  clearTimeout(temporizador);
  const valor = this.value.trim();
  temporizador = setTimeout(() => cargarBodas(valor), 400);
});

// ---------------------------------------------------------
// SACERDOTES (lista desplegable)
// ---------------------------------------------------------
async function cargarSacerdotesDropdown() {
  if (sacerdotesCargados) return;
  try {
    const respuesta = await fetch(`${API_URL}/api/sacerdotes`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const sacerdotes = await respuesta.json();
    const select = document.getElementById("sacerdote_id");
    select.innerHTML = '<option value="">Selecciona...</option>';
    sacerdotes.forEach((s) => {
      const opcion = document.createElement("option");
      opcion.value = s.id;
      opcion.textContent = s.nombre_completo;
      select.appendChild(opcion);
    });
    sacerdotesCargados = true;
  } catch (err) {
    console.error(err);
  }
}

// ---------------------------------------------------------
// MODAL: NUEVA / EDITAR BODA
// ---------------------------------------------------------
async function abrirModalNueva() {
  bodaEditandoId = null;
  document.getElementById("modalTitulo").textContent = "Registrar boda";
  document.getElementById("formBoda").reset();
  document.getElementById("modalError").textContent = "";
  await cargarSacerdotesDropdown();
  document.getElementById("modalBoda").style.display = "flex";

  // Sugerir libro y número de acta
  try {
    const respuesta = await fetch(`${API_URL}/api/matrimonios/siguiente-acta`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const sugerido = await respuesta.json();
    if (respuesta.ok) {
      if (!document.getElementById("libro").value) document.getElementById("libro").value = sugerido.libro || "";
      if (!document.getElementById("numero_acta").value) document.getElementById("numero_acta").value = sugerido.siguiente || "";
    }
  } catch (err) {
    console.error("No se pudo sugerir libro/acta:", err);
  }
}

async function abrirModalEditar(id) {
  try {
    await cargarSacerdotesDropdown();
    const respuesta = await fetch(`${API_URL}/api/matrimonios/${id}`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const boda = await respuesta.json();
    if (!respuesta.ok) {
      alert(boda.error || "No se pudo cargar la boda");
      return;
    }

    bodaEditandoId = id;
    document.getElementById("modalTitulo").textContent = "Editar boda";
    document.getElementById("modalError").textContent = "";

    CAMPOS_FORM.forEach((campo) => {
      const input = document.getElementById(campo);
      let valor = boda[campo];
      if (valor === null || valor === undefined) valor = "";
      if (input.type === "date" && valor) valor = String(valor).split("T")[0];
      input.value = valor;
    });

    document.getElementById("modalBoda").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la boda");
  }
}

function cerrarModal() {
  document.getElementById("modalBoda").style.display = "none";
}

document.getElementById("btnNuevaBoda").addEventListener("click", abrirModalNueva);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);

document.getElementById("formBoda").addEventListener("submit", async function (e) {
  e.preventDefault();

  const datos = {};
  CAMPOS_FORM.forEach((campo) => {
    datos[campo] = document.getElementById(campo).value.trim();
  });

  const modalError = document.getElementById("modalError");
  modalError.textContent = "";

  try {
    const esEdicion = bodaEditandoId !== null;
    const url = esEdicion
      ? `${API_URL}/api/matrimonios/${bodaEditandoId}`
      : `${API_URL}/api/matrimonios`;

    const respuesta = await fetch(url, {
      method: esEdicion ? "PUT" : "POST",
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
    cargarBodas(document.getElementById("inputBusqueda").value.trim());
  } catch (err) {
    console.error(err);
    modalError.textContent = "No se pudo conectar con el servidor";
  }
});

// ---------------------------------------------------------
// ELIMINAR (solo administrador)
// ---------------------------------------------------------
async function eliminarBoda(id) {
  if (!confirm("¿Eliminar esta boda? Dejará de aparecer en la lista.")) return;
  try {
    const respuesta = await fetch(`${API_URL}/api/matrimonios/${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": sesionActual.id }
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      alert(resultado.error || "No se pudo eliminar");
      return;
    }
    cargarBodas(document.getElementById("inputBusqueda").value.trim());
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor");
  }
}

// ---------------------------------------------------------
// LIBRO Y NUMERACIÓN (solo administrador)
// ---------------------------------------------------------
async function abrirModalLibro() {
  document.getElementById("libroError").textContent = "";
  try {
    const respuesta = await fetch(`${API_URL}/api/matrimonios/libro`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const libro = await respuesta.json();
    document.getElementById("libroActual").value = libro.libro || "";
    document.getElementById("ultimoActa").value = libro.ultimo_numero_acta || 0;
    document.getElementById("modalLibro").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la configuración del libro");
  }
}

if (esAdmin) {
  const btnLibro = document.getElementById("btnLibro");
  btnLibro.style.display = "inline-block";
  btnLibro.addEventListener("click", abrirModalLibro);
}

document.getElementById("btnCancelarLibro").addEventListener("click", () => {
  document.getElementById("modalLibro").style.display = "none";
});

document.getElementById("formLibro").addEventListener("submit", async function (e) {
  e.preventDefault();
  const libroError = document.getElementById("libroError");
  libroError.textContent = "";

  try {
    const respuesta = await fetch(`${API_URL}/api/matrimonios/libro`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-usuario-id": sesionActual.id },
      body: JSON.stringify({
        libro: document.getElementById("libroActual").value.trim(),
        ultimo_numero_acta: document.getElementById("ultimoActa").value
      })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      libroError.textContent = resultado.error || "Error al guardar";
      return;
    }
    document.getElementById("modalLibro").style.display = "none";
    alert("Libro y numeración de bodas actualizados");
  } catch (err) {
    console.error(err);
    libroError.textContent = "No se pudo conectar con el servidor";
  }
});

cargarBodas();
