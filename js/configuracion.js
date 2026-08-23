async function cargarConfiguracion() {
  try {
    const respuesta = await fetch(`${API_URL}/api/configuracion`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const config = await respuesta.json();

    document.getElementById("nombre_parroquia").value = config.nombre_parroquia || "";
    document.getElementById("direccion").value = config.direccion || "";
    document.getElementById("ciudad").value = config.ciudad || "";
    document.getElementById("estado").value = config.estado || "";
    document.getElementById("telefono").value = config.telefono || "";
    document.getElementById("correo").value = config.correo || "";
    document.getElementById("nombre_parroco").value = config.nombre_parroco || "";
    document.getElementById("registro_sgar").value = config.registro_sgar || "";
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la configuración");
  }
}

document.getElementById("formConfiguracion").addEventListener("submit", async function (e) {
  e.preventDefault();

  const mensajeExito = document.getElementById("mensajeExito");
  const mensajeError = document.getElementById("mensajeError");
  mensajeExito.textContent = "";
  mensajeError.textContent = "";

  const datos = {
    nombre_parroquia: document.getElementById("nombre_parroquia").value.trim(),
    direccion: document.getElementById("direccion").value.trim(),
    ciudad: document.getElementById("ciudad").value.trim(),
    estado: document.getElementById("estado").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    nombre_parroco: document.getElementById("nombre_parroco").value.trim(),
    registro_sgar: document.getElementById("registro_sgar").value.trim(),
  };

  try {
    const respuesta = await fetch(`${API_URL}/api/configuracion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-usuario-id": sesionActual.id
      },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = resultado.error || "Error al guardar";
      return;
    }

    mensajeExito.textContent = "Datos guardados correctamente.";
  } catch (err) {
    console.error(err);
    mensajeError.textContent = "No se pudo conectar con el servidor";
  }
});

const NOMBRES_TIPO_LIBRO = {
  bautizo: "Bautizo",
  primera_comunion: "Primera Comunión",
  confirmacion: "Confirmación"
};

async function cargarLibros() {
  const contenedor = document.getElementById("listaLibros");
  try {
    const respuesta = await fetch(`${API_URL}/api/libros`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const libros = await respuesta.json();

    contenedor.innerHTML = libros.map(l => `
      <div class="fila-form" style="align-items:flex-end;">
        <div>
          <label>${NOMBRES_TIPO_LIBRO[l.tipo]} — Libro</label>
          <input type="text" data-tipo="${l.tipo}" class="input-libro" value="${l.libro || ""}">
        </div>
        <div>
          <label>Último número de acta</label>
          <input type="number" data-tipo="${l.tipo}" class="input-ultimo-acta" value="${l.ultimo_numero_acta || 0}">
        </div>
        <div>
          <button type="button" class="btn-secundario btn-guardar-libro" data-tipo="${l.tipo}">Guardar</button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".btn-guardar-libro").forEach(btn => {
      btn.addEventListener("click", () => guardarLibro(btn.dataset.tipo));
    });

  } catch (err) {
    console.error(err);
    contenedor.innerHTML = '<p class="mensaje-error">No se pudieron cargar los libros</p>';
  }
}

async function guardarLibro(tipo) {
  const inputLibro = document.querySelector(`.input-libro[data-tipo="${tipo}"]`);
  const inputActa = document.querySelector(`.input-ultimo-acta[data-tipo="${tipo}"]`);
  const libro = inputLibro.value.trim();
  const ultimo_numero_acta = parseInt(inputActa.value, 10) || 0;

  try {
    const respuesta = await fetch(`${API_URL}/api/libros/${tipo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-usuario-id": sesionActual.id },
      body: JSON.stringify({ libro, ultimo_numero_acta })
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      alert(resultado.error || "Error al guardar");
      return;
    }
    alert(`Configuración de ${NOMBRES_TIPO_LIBRO[tipo]} actualizada`);
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor");
  }
}

cargarLibros();

cargarConfiguracion();