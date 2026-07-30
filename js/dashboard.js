const NOMBRES_TIPO_DASH = {
  bautizo: "Bautizo",
  primera_comunion: "Primera Comunión",
  confirmacion: "Confirmación"
};

function formatearFechaHora(fechaISO) {
  return new Date(fechaISO.replace(" ", "T") + (fechaISO.includes("Z") ? "" : "Z"))
    .toLocaleString("es-MX", { timeZone: "America/Mexico_City", dateStyle: "medium", timeStyle: "short" });
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString("es-MX", { timeZone: "UTC" });
}

async function cargarDashboard() {
  try {
    const respuesta = await fetch(`${API_URL}/api/dashboard/resumen`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const datos = await respuesta.json();

    document.getElementById("tarjetasResumen").innerHTML = `
      <div class="tarjeta-numero">
        <div class="numero">${datos.totalPersonas}</div>
        <div class="etiqueta">Personas registradas</div>
      </div>
      <div class="tarjeta-numero">
        <div class="numero">${datos.sacramentosEsteAnio.bautizo}</div>
        <div class="etiqueta">Bautizos este año</div>
      </div>
      <div class="tarjeta-numero">
        <div class="numero">${datos.sacramentosEsteAnio.primera_comunion}</div>
        <div class="etiqueta">Comuniones este año</div>
      </div>
      <div class="tarjeta-numero">
        <div class="numero">${datos.sacramentosEsteAnio.confirmacion}</div>
        <div class="etiqueta">Confirmaciones este año</div>
      </div>
    `;

    const contenedorPersonas = document.getElementById("listaUltimasPersonas");
    if (datos.ultimasPersonas.length === 0) {
      contenedorPersonas.innerHTML = '<p class="sin-datos">Sin registros aún.</p>';
    } else {
      contenedorPersonas.innerHTML = datos.ultimasPersonas.map(p => `
        <div class="item-dashboard">
          <a href="expediente.html?id=${p.id}" class="nombre-item link-nombre">${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ""}</a>
          <div class="detalle-item">Registrado el ${formatearFechaHora(p.creado_en)}</div>
        </div>
      `).join("");
    }

    const contenedorBoletas = document.getElementById("listaUltimasBoletas");
    if (datos.ultimasBoletas.length === 0) {
      contenedorBoletas.innerHTML = '<p class="sin-datos">Aún no se han generado boletas.</p>';
    } else {
      contenedorBoletas.innerHTML = datos.ultimasBoletas.map(b => `
        <div class="item-dashboard">
          <span class="nombre-item">${NOMBRES_TIPO_DASH[b.tipo]} — ${b.nombre} ${b.apellido_paterno}</span>
          <div class="detalle-item">Por ${b.generado_por}, el ${formatearFechaHora(b.generado_en)}</div>
        </div>
      `).join("");
    }

    const contenedorProximos = document.getElementById("listaProximos");
    if (datos.proximosProgramados.length === 0) {
      contenedorProximos.innerHTML = '<p class="sin-datos">No hay sacramentos programados próximamente.</p>';
    } else {
      contenedorProximos.innerHTML = datos.proximosProgramados.map(s => `
        <div class="item-dashboard">
          <span class="nombre-item">${NOMBRES_TIPO_DASH[s.tipo]} — ${s.nombre} ${s.apellido_paterno}</span>
          <div class="detalle-item">${formatearFecha(s.fecha_sacramento)}</div>
        </div>
      `).join("");
    }

  } catch (err) {
    console.error(err);
    alert("No se pudo cargar el dashboard");
  }
}

cargarDashboard();