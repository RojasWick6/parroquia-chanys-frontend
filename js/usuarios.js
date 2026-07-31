let usuarioEditandoId = null;

async function cargarUsuarios() {
  const tabla = document.getElementById("tablaUsuarios");

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios`, {
      headers: { "x-usuario-id": sesionActual.id }
    });
    const usuarios = await respuesta.json();

    tabla.innerHTML = "";
    usuarios.forEach((u) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${u.nombre_completo}</td>
        <td>${u.usuario}</td>
        <td>${u.rol === "admin" ? "Administrador" : "Secretaria"}</td>
        <td>${u.activo ? "Activo" : "Inactivo"}</td>
        <td>
          <button class="btn-editar" data-id="${u.id}">Editar</button>
          <button class="btn-editar" data-id="${u.id}" data-accion="password">Contraseña</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    document.querySelectorAll('[data-accion="password"]').forEach((btn) => {
      btn.addEventListener("click", () => abrirModalPassword(btn.dataset.id));
    });
    document.querySelectorAll('.btn-editar:not([data-accion="password"])').forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEditar(btn.dataset.id, usuarios));
    });

  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de usuarios");
  }
}

function abrirModalNuevo() {
  usuarioEditandoId = null;
  document.getElementById("modalTitulo").textContent = "Nuevo usuario";
  document.getElementById("formUsuario").reset();
  document.getElementById("modalError").textContent = "";
  document.getElementById("campoUsuarioLogin").style.display = "block";
  document.getElementById("campoPassword").style.display = "block";
  document.getElementById("campoActivo").style.display = "none";
  document.getElementById("usuario_login").required = true;
  document.getElementById("password").required = true;
  document.getElementById("modalUsuario").style.display = "flex";
}

function abrirModalEditar(id, listaUsuarios) {
  const u = listaUsuarios.find(x => x.id == id);
  if (!u) return;

  usuarioEditandoId = id;
  document.getElementById("modalTitulo").textContent = "Editar usuario";
  document.getElementById("modalError").textContent = "";
  document.getElementById("nombre_completo").value = u.nombre_completo;
  document.getElementById("rol").value = u.rol;
  document.getElementById("activo").checked = u.activo;

  // En edicion no se cambia el usuario de login ni la contraseña desde aqui (para eso esta el modal de password)
  document.getElementById("campoUsuarioLogin").style.display = "none";
  document.getElementById("campoPassword").style.display = "none";
  document.getElementById("usuario_login").required = false;
  document.getElementById("password").required = false;
  document.getElementById("campoActivo").style.display = "block";

  document.getElementById("modalUsuario").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalUsuario").style.display = "none";
}

function abrirModalPassword(id) {
  document.getElementById("passwordUsuarioId").value = id;
  document.getElementById("passwordNuevo").value = "";
  document.getElementById("passwordError").textContent = "";
  document.getElementById("modalPassword").style.display = "flex";
}

function cerrarModalPassword() {
  document.getElementById("modalPassword").style.display = "none";
}

document.getElementById("btnNuevoUsuario").addEventListener("click", abrirModalNuevo);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);
document.getElementById("btnCancelarPassword").addEventListener("click", cerrarModalPassword);

document.getElementById("formUsuario").addEventListener("submit", async function (e) {
  e.preventDefault();

  const modalError = document.getElementById("modalError");
  modalError.textContent = "";

  try {
    const esEdicion = usuarioEditandoId !== null;

    if (esEdicion) {
      const datos = {
        nombre_completo: document.getElementById("nombre_completo").value.trim(),
        rol: document.getElementById("rol").value,
        activo: document.getElementById("activo").checked,
      };

      const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioEditandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-usuario-id": sesionActual.id },
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) { modalError.textContent = resultado.error || "Error al guardar"; return; }

    } else {
      const datos = {
        nombre_completo: document.getElementById("nombre_completo").value.trim(),
        usuario: document.getElementById("usuario_login").value.trim(),
        password: document.getElementById("password").value,
        rol: document.getElementById("rol").value,
      };

      const respuesta = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-usuario-id": sesionActual.id },
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) { modalError.textContent = resultado.error || "Error al guardar"; return; }
    }

    cerrarModal();
    cargarUsuarios();
  } catch (err) {
    console.error(err);
    modalError.textContent = "No se pudo conectar con el servidor";
  }
});

document.getElementById("formPassword").addEventListener("submit", async function (e) {
  e.preventDefault();

  const passwordError = document.getElementById("passwordError");
  passwordError.textContent = "";
  const id = document.getElementById("passwordUsuarioId").value;
  const password = document.getElementById("passwordNuevo").value;

  try {
    const respuesta = await fetch(`${API_URL}/api/usuarios/${id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-usuario-id": sesionActual.id },
      body: JSON.stringify({ password })
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) { passwordError.textContent = resultado.error || "Error al cambiar contraseña"; return; }

    cerrarModalPassword();
    alert("Contraseña actualizada correctamente");
  } catch (err) {
    console.error(err);
    passwordError.textContent = "No se pudo conectar con el servidor";
  }
});

cargarUsuarios();