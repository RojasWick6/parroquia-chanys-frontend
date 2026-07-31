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
        <div class="icono-tarjeta icono-personas"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M14.7 14.3c2.6-.3 4.8 1.9 5.3 5.3"/></svg></div>
        <div>
          <div class="numero">${datos.totalPersonas}</div>
          <div class="etiqueta">Personas registradas</div>
        </div>
      </div>
      <div class="tarjeta-numero">
        <div class="icono-tarjeta icono-bautizo"><svg viewBox="0 0 24 24"><path d="M12 2c2 3 4 5.5 4 9a4 4 0 1 1-8 0c0-3.5 2-6 4-9z"/></svg></div>
        <div>
          <div class="numero">${datos.sacramentosEsteAnio.bautizo}</div>
          <div class="etiqueta">Bautizos este año</div>
        </div>
      </div>
      <div class="tarjeta-numero">
        <div class="icono-tarjeta icono-comunion"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg></div>
        <div>
          <div class="numero">${datos.sacramentosEsteAnio.primera_comunion}</div>
          <div class="etiqueta">Comuniones este año</div>
        </div>
      </div>
      <div class="tarjeta-numero">
        <div class="icono-tarjeta icono-confirmacion"><svg viewBox="0 0 24 24"><path d="M3 12c3-4 6-4 9 0s6 4 9 0"/><path d="M3 17c3-4 6-4 9 0s6 4 9 0"/></svg></div>
        <div>
          <div class="numero">${datos.sacramentosEsteAnio.confirmacion}</div>
          <div class="etiqueta">Confirmaciones este año</div>
        </div>
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