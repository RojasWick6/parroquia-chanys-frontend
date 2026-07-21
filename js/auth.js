document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  const mensajeError = document.getElementById("mensajeError");

  mensajeError.textContent = "";

  try {
    const respuesta = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = datos.error || "Error al iniciar sesión";
      return;
    }

    // Guardamos la sesión en sessionStorage (patrón que ya usas en MyControl)
    sessionStorage.setItem("usuario", JSON.stringify(datos));
    sessionStorage.setItem("loginTime", Date.now().toString());

    alert("Login exitoso. Bienvenido, " + datos.nombre_completo);
    // Cuando exista dashboard.html, aquí redirigimos:
    // window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    mensajeError.textContent = "No se pudo conectar con el servidor";
  }
});