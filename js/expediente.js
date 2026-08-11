const params = new URLSearchParams(window.location.search);
const personaId = params.get("id");

if (!personaId) {
  alert("No se especificó una persona");
  window.location.href = "personas.html";
}

let sacramentoEditandoId = null;

const NOMBRES_TIPO = {
  bautizo: "Bautizo",
  primera_comunion: "Primera Comunión",
  confirmacion: "Confirmación"
};

const NOMBRES_ESTADO = {
  pendiente: "Pendiente",
  programado: "Programado",
  realizado: "Realizado",
  boleta_entregada: "Boleta entregada"
};

async function cargarPersona() {
  try {
    const respuesta = await fetch(`${API_URL}/api/personas/${personaId}`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const persona = await respuesta.json();

    if (!respuesta.ok) {
      alert("Persona no encontrada");
      window.location.href = "personas.html";
      return;
    }

    const fecha = persona.fecha_nacimiento
      ? new Date(persona.fecha_nacimiento).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "-";

    document.getElementById("tituloExpediente").textContent = `${persona.nombre} ${persona.apellido_paterno}`;
    document.getElementById("tarjetaPersona").innerHTML = `
      <h2>${persona.nombre} ${persona.apellido_paterno} ${persona.apellido_materno || ""}</h2>
      <div class="datos-persona-grid">
        <span><strong>Fecha nac.:</strong> ${fecha}</span>
        <span><strong>CURP:</strong> ${persona.curp || "-"}</span>
        <span><strong>Teléfono:</strong> ${persona.telefono || "-"}</span>
        <span><strong>Padre:</strong> ${persona.nombre_padre || "-"}</span>
        <span><strong>Madre:</strong> ${persona.nombre_madre || "-"}</span>
        <span><strong>Dirección:</strong> ${persona.direccion || "-"}</span>
      </div>
    `;
  } catch (err) {
    console.error(err);
    alert("Error al cargar la persona");
  }
}

async function cargarSacerdotesDropdown() {
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
  } catch (err) {
    console.error(err);
  }
}

async function cargarSacramentos() {
  const lista = document.getElementById("listaSacramentos");

  try {
    const respuesta = await fetch(`${API_URL}/api/sacramentos/persona/${personaId}`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const sacramentos = await respuesta.json();

    if (sacramentos.length === 0) {
      lista.innerHTML = '<p class="mensaje-vacio">Esta persona aún no tiene sacramentos registrados.</p>';
      return;
    }

    lista.innerHTML = "";
    sacramentos.forEach((s) => {
      const fecha = s.fecha_sacramento
        ? new Date(s.fecha_sacramento).toLocaleDateString("es-MX", { timeZone: "UTC" })
        : "Sin fecha";

      const div = document.createElement("div");
      div.className = "tarjeta-sacramento";
      const puedeGenerarBoleta = s.fecha_sacramento && s.numero_acta;

            div.innerHTML = `
              <div>
                <h3>${NOMBRES_TIPO[s.tipo]} <span class="badge-estado badge-${s.estado}">${NOMBRES_ESTADO[s.estado]}</span></h3>
                <p>${fecha} · ${s.sacerdote_nombre || "Sin sacerdote asignado"} · Acta: ${s.numero_acta || "-"}</p>
              </div>
              <div>
                ${puedeGenerarBoleta
                  ? `<button class="btn-boleta" data-id="${s.id}">Generar boleta</button>`
                  : `<span class="texto-aviso" title="Falta fecha o número de acta">Falta info para boleta</span>`
                }
                <button class="btn-editar" data-id="${s.id}">Editar</button>
              </div>
            `;
      lista.appendChild(div);
    });

    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id));
    });

    document.querySelectorAll(".btn-boleta").forEach((btn) => {
      btn.addEventListener("click", () => generarBoleta(btn.dataset.id));
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = '<p class="mensaje-error">Error al cargar sacramentos</p>';
  }
}

function abrirModalNuevo() {
  sacramentoEditandoId = null;
  document.getElementById("modalTitulo").textContent = "Registrar sacramento";
  document.getElementById("formSacramento").reset();
  document.getElementById("modalError").textContent = "";
  document.getElementById("modalSacramento").style.display = "flex";
}

async function autocompletarLibroYActa() {
  if (sacramentoEditandoId !== null) return; // solo autocompletar en registros nuevos
  const tipo = document.getElementById("tipo").value;
  if (!tipo) return;

  try {
    const [respLibros, respActa] = await Promise.all([
      fetch(`${API_URL}/api/libros`, { headers: { "x-usuario-id": sesionActual.id } }),
      fetch(`${API_URL}/api/sacramentos/siguiente-acta?tipo=${tipo}`, { headers: { "x-usuario-id": sesionActual.id } })
    ]);
    const libros = await respLibros.json();
    const acta = await respActa.json();

    const libroCorrespondiente = libros.find(l => l.tipo === tipo);
    if (libroCorrespondiente && !document.getElementById("libro").value) {
      document.getElementById("libro").value = libroCorrespondiente.libro || "";
    }
    if (acta.siguiente && !document.getElementById("numero_acta").value) {
      document.getElementById("numero_acta").value = acta.siguiente;
    }
  } catch (err) {
    console.error("No se pudo autocompletar libro/acta:", err);
  }
}

document.getElementById("tipo").addEventListener("change", autocompletarLibroYActa);

async function abrirModalEditar(id) {
  try {
    const respuesta = await fetch(`${API_URL}/api/sacramentos/${id}`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const s = await respuesta.json();

    sacramentoEditandoId = id;
    document.getElementById("modalTitulo").textContent = "Editar sacramento";
    document.getElementById("modalError").textContent = "";

    document.getElementById("tipo").value = s.tipo;
    document.getElementById("estado").value = s.estado;
    document.getElementById("fecha_sacramento").value = s.fecha_sacramento ? s.fecha_sacramento.split("T")[0] : "";
    document.getElementById("sacerdote_id").value = s.sacerdote_id || "";
    document.getElementById("libro").value = s.libro || "";
    document.getElementById("folio").value = s.folio || "";
    document.getElementById("numero_acta").value = s.numero_acta || "";
    document.getElementById("lugar").value = s.lugar || "";
    document.getElementById("observaciones").value = s.observaciones || "";

    const padrino = s.padrinos.find(p => p.tipo_padrino === "padrino");
    const madrina = s.padrinos.find(p => p.tipo_padrino === "madrina");
    document.getElementById("padrino_nombre").value = padrino ? padrino.nombre : "";
    document.getElementById("madrina_nombre").value = madrina ? madrina.nombre : "";

    document.getElementById("modalSacramento").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar el sacramento");
  }
}

function cerrarModal() {
  document.getElementById("modalSacramento").style.display = "none";
}

document.getElementById("btnNuevoSacramento").addEventListener("click", abrirModalNuevo);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);

document.getElementById("formSacramento").addEventListener("submit", async function (e) {
  e.preventDefault();

  const padrinos = [];
  const padrinoNombre = document.getElementById("padrino_nombre").value.trim();
  const madrinaNombre = document.getElementById("madrina_nombre").value.trim();
  if (padrinoNombre) padrinos.push({ nombre: padrinoNombre, tipo_padrino: "padrino" });
  if (madrinaNombre) padrinos.push({ nombre: madrinaNombre, tipo_padrino: "madrina" });

  const datos = {
    tipo: document.getElementById("tipo").value,
    estado: document.getElementById("estado").value,
    fecha_sacramento: document.getElementById("fecha_sacramento").value || null,
    sacerdote_id: document.getElementById("sacerdote_id").value || null,
    libro: document.getElementById("libro").value.trim(),
    folio: document.getElementById("folio").value.trim(),
    numero_acta: document.getElementById("numero_acta").value.trim(),
    lugar: document.getElementById("lugar").value.trim(),
    observaciones: document.getElementById("observaciones").value.trim(),
    padrinos
  };

  const modalError = document.getElementById("modalError");
  modalError.textContent = "";

  try {
    const esEdicion = sacramentoEditandoId !== null;
    const url = esEdicion
      ? `${API_URL}/api/sacramentos/${sacramentoEditandoId}`
      : `${API_URL}/api/sacramentos/persona/${personaId}`;
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
    cargarSacramentos();
  } catch (err) {
    console.error(err);
    modalError.textContent = "No se pudo conectar con el servidor";
  }
});

function generarBoleta(sacramentoId) {
  const url = `${API_URL}/api/sacramentos/${sacramentoId}/boleta?usuarioId=${sesionActual.id}`;
  window.open(url, "_blank");
}


cargarPersona();
cargarSacerdotesDropdown();
cargarSacramentos();

if (params.get("nuevo") === "1") {
  setTimeout(abrirModalNuevo, 400);
}