const NOMBRES_ACCION = {
  crear: "Creó",
  editar: "Editó",
  eliminar_logico: "Eliminó",
  reimprimir_boleta: "Generó boleta"
};

const REGISTROS_POR_PAGINA = 10;
let todosLosRegistros = [];
let paginaActual = 1;

function formatearFechaAuditoria(fechaISO) {
  return new Date(fechaISO.replace(" ", "T") + (fechaISO.includes("Z") ? "" : "Z"))
    .toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" });
}

async function cargarAuditoria() {
  const tabla = document.getElementById("tablaAuditoria");

  try {
    const respuesta = await fetch(`${API_URL}/api/auditoria`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const registros = await respuesta.json();

    if (!respuesta.ok) {
      tabla.innerHTML = `<tr><td colspan="5">${registros.error || "Error al cargar auditoría"}</td></tr>`;
      document.getElementById("paginacion").style.display = "none";
      return;
    }

    todosLosRegistros = registros;
    paginaActual = 1;
    renderizarPagina();

  } catch (err) {
    console.error(err);
    tabla.innerHTML = `<tr><td colspan="5">Error al conectar con el servidor</td></tr>`;
  }
}

function renderizarPagina() {
  const tabla = document.getElementById("tablaAuditoria");
  const paginacion = document.getElementById("paginacion");

  if (todosLosRegistros.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5">Sin movimientos registrados.</td></tr>`;
    paginacion.style.display = "none";
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(todosLosRegistros.length / REGISTROS_POR_PAGINA));
  const inicio = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const registrosPagina = todosLosRegistros.slice(inicio, inicio + REGISTROS_POR_PAGINA);

  tabla.innerHTML = registrosPagina.map(r => `
    <tr>
      <td>${formatearFechaAuditoria(r.creado_en)}</td>
      <td>${r.usuario_nombre || "Desconocido"}</td>
      <td>${NOMBRES_ACCION[r.accion] || r.accion}</td>
      <td>${r.entidad}</td>
      <td>${r.detalle || "-"}</td>
    </tr>
  `).join("");

  document.getElementById("infoPagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
  document.getElementById("btnAnterior").disabled = paginaActual === 1;
  document.getElementById("btnSiguiente").disabled = paginaActual === totalPaginas;
  paginacion.style.display = "flex";
}

document.getElementById("btnAnterior").addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    renderizarPagina();
  }
});

document.getElementById("btnSiguiente").addEventListener("click", () => {
  const totalPaginas = Math.ceil(todosLosRegistros.length / REGISTROS_POR_PAGINA);
  if (paginaActual < totalPaginas) {
    paginaActual++;
    renderizarPagina();
  }
});

cargarAuditoria();