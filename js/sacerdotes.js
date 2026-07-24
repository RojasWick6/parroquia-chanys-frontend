let sacerdoteEditandoId = null;

async function cargarSacerdotes() {
  const tabla = document.getElementById("tablaSacerdotes");
  const mensajeVacio = document.getElementById("mensajeVacio");

  try {
    const respuesta = await fetch(`${API_URL}/api/sacerdotes`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const sacerdotes = await respuesta.json();

    tabla.innerHTML = "";

    if (sacerdotes.length === 0) {
      mensajeVacio.style.display = "block";
      return;
    }
    mensajeVacio.style.display = "none";

    sacerdotes.forEach((s) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${s.nombre_completo}</td>
        <td>
          <button class="btn-editar" data-id="${s.id}" data-nombre="${s.nombre_completo}">Editar</button>
          <button class="btn-eliminar" data-id="${s.id}">Eliminar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id, btn.dataset.nombre));
    });
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => eliminarSacerdote(btn.dataset.id));
    });

  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de sacerdotes");
  }
}

function abrirModalNuevo() {
  sacerdoteEditandoId = null;
  document.getElementById("modalTitulo").textContent = "Nuevo sacerdote";
  document.getElementById("formSacerdote").reset();
  document.getElementById("modalError").textContent = "";
  document.getElementById("modalSacerdote").style.display = "flex";
}

function abrirModalEditar(id, nombre) {
  sacerdoteEditandoId = id;
  document.getElementById("modalTitulo").textContent = "Editar sacerdote";
  document.getElementById("modalError").textContent = "";
  document.getElementById("nombre_completo").value = nombre;
  document.getElementById("modalSacerdote").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalSacerdote").style.display = "none";
}

async function eliminarSacerdote(id) {
  if (!confirm("¿Seguro que deseas eliminar este sacerdote?")) return;

  try {
    const respuesta = await fetch(`${API_URL}/api/sacerdotes/${id}`, {
      method: "DELETE",
      headers: { "x-usuario-id": sesionActual.id }
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.error || "No se pudo eliminar");
      return;
    }
    cargarSacerdotes();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar");
  }
}

document.getElementById("btnNuevoSacerdote").addEventListener("click", abrirModalNuevo);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);

document.getElementById("formSacerdote").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre_completo = document.getElementById("nombre_completo").value.trim();
  const modalError = document.getElementById("modalError");
  modalError.textContent = "";

  try {
    const esEdicion = sacerdoteEditandoId !== null;
    const url = esEdicion ? `${API_URL}/api/sacerdotes/${sacerdoteEditandoId}` : `${API_URL}/api/sacerdotes`;
    const metodo = esEdicion ? "PUT" : "POST";

    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        "x-usuario-id": sesionActual.id
      },
      body: JSON.stringify({ nombre_completo })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      modalError.textContent = resultado.error || "Error al guardar";
      return;
    }

    cerrarModal();
    cargarSacerdotes();
  } catch (err) {
    console.error(err);
    modalError.textContent = "No se pudo conectar con el servidor";
  }
});

cargarSacerdotes();