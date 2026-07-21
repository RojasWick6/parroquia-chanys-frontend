function obtenerSesion() {
  const datos = sessionStorage.getItem("usuario");
  const loginTime = sessionStorage.getItem("loginTime");

  if (!datos || !loginTime) {
    window.location.href = "index.html";
    return null;
  }

  const DOS_HORAS_MS = 2 * 60 * 60 * 1000;
  const tiempoTranscurrido = Date.now() - parseInt(loginTime, 10);

  if (tiempoTranscurrido > DOS_HORAS_MS) {
    sessionStorage.clear();
    alert("Tu sesión ha expirado, inicia sesión de nuevo.");
    window.location.href = "index.html";
    return null;
  }

  return JSON.parse(datos);
}

function cerrarSesion() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Fix del botón "atrás" del navegador: si el usuario navega hacia atrás
// después de cerrar sesión, esto vuelve a validar en vez de mostrar la página cacheada.
window.addEventListener("pageshow", function (evento) {
  if (evento.persisted) {
    obtenerSesion();
  }
});

const sesionActual = obtenerSesion();
if (sesionActual) {
  document.addEventListener("DOMContentLoaded", () => {
    const spanNombre = document.getElementById("nombreUsuario");
    if (spanNombre) spanNombre.textContent = sesionActual.nombre_completo + " (" + sesionActual.rol + ")";

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) btnLogout.addEventListener("click", cerrarSesion);
  });
}