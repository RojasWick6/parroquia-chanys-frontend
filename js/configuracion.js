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

cargarConfiguracion();