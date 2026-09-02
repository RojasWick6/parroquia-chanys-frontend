const NOMBRES_TIPO_SAC = {
  bautizo: "Bautizo",
  primera_comunion: "Primera Comunión",
  confirmacion: "Confirmación"
};
const NOMBRES_ESTADO_SAC = {
  pendiente: "Pendiente",
  programado: "Programado",
  realizado: "Realizado",
  boleta_entregada: "Boleta entregada"
};

const POR_PAGINA = 10;
let tipoActual = "bautizo";
let todosLosSacramentos = [];
let paginaActual = 1;

async function cargarSacramentos(busqueda = "") {
  try {
    const url = busqueda
      ? `${API_URL}/api/sacramentos?tipo=${tipoActual}&busqueda=${encodeURIComponent(busqueda)}`
      : `${API_URL}/api/sacramentos?tipo=${tipoActual}`;

    const respuesta = await fetch(url, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    todosLosSacramentos = await respuesta.json();
    paginaActual = 1;
    renderizarPagina();
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de sacramentos");
  }
}

function renderizarPagina() {
  const tabla = document.getElementById("tablaSacramentos");
  const mensajeVacio = document.getElementById("mensajeVacio");
  const paginacion = document.getElementById("paginacion");

  if (todosLosSacramentos.length === 0) {
    tabla.innerHTML = "";
    mensajeVacio.style.display = "block";
    paginacion.style.display = "none";
    return;
  }
  mensajeVacio.style.display = "none";

  const totalPaginas = Math.max(1, Math.ceil(todosLosSacramentos.length / POR_PAGINA));
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const pagina = todosLosSacramentos.slice(inicio, inicio + POR_PAGINA);

  tabla.innerHTML = pagina.map(s => {
    const nombreCompleto = `${s.nombre} ${s.apellido_paterno} ${s.apellido_materno || ""}`.trim();
    const fecha = s.fecha_sacramento
      ? new Date(s.fecha_sacramento).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "-";
    const puedeGenerarBoleta = s.fecha_sacramento && s.numero_acta;

    return `
      <tr>
        <td><a href="expediente.html?id=${s.persona_id}" class="link-nombre">${nombreCompleto}</a></td>
        <td>${fecha}</td>
        <td>${s.sacerdote_nombre || "-"}</td>
        <td>${s.numero_acta || "-"}</td>
        <td><span class="badge-estado badge-${s.estado}">${NOMBRES_ESTADO_SAC[s.estado]}</span></td>
        <td>
          ${puedeGenerarBoleta ? `<button class="btn-boleta" data-id="${s.id}">Boleta</button>` : ""}
          <a href="expediente.html?id=${s.persona_id}&editar=${s.id}" class="btn-editar" style="text-decoration:none;">Editar</a>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll(".btn-boleta").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = `${API_URL}/api/sacramentos/${btn.dataset.id}/boleta?usuarioId=${sesionActual.id}`;
      window.open(url, "_blank");
    });
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
  const totalPaginas = Math.ceil(todosLosSacramentos.length / POR_PAGINA);
  if (paginaActual < totalPaginas) { paginaActual++; renderizarPagina(); }
});

document.querySelectorAll(".tipo-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tipo-tab").forEach(b => b.classList.remove("tipo-activo"));
    btn.classList.add("tipo-activo");
    tipoActual = btn.dataset.tipo;
    document.getElementById("inputBusqueda").value = "";
    cargarSacramentos();
  });
});

let temporizador;
document.getElementById("inputBusqueda").addEventListener("input", function () {
  clearTimeout(temporizador);
  const valor = this.value.trim();
  temporizador = setTimeout(() => cargarSacramentos(valor), 400);
});

cargarSacramentos();