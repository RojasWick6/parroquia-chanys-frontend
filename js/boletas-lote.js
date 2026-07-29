document.getElementById("formLote").addEventListener("submit", function (e) {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const estado = document.getElementById("estado").value;
  const fechaDesde = document.getElementById("fechaDesde").value;
  const fechaHasta = document.getElementById("fechaHasta").value;
  const mensajeError = document.getElementById("mensajeError");

  mensajeError.textContent = "";

  if (!tipo) {
    mensajeError.textContent = "Selecciona un tipo de sacramento";
    return;
  }

  const parametros = new URLSearchParams({
    tipo,
    usuarioId: sesionActual.id
  });
  if (estado) parametros.append("estado", estado);
  if (fechaDesde) parametros.append("fechaDesde", fechaDesde);
  if (fechaHasta) parametros.append("fechaHasta", fechaHasta);

  const url = `${API_URL}/api/sacramentos/boletas/lote?${parametros.toString()}`;
  window.open(url, "_blank");
});