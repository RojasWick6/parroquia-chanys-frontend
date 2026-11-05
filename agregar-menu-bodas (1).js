// Agrega el enlace "Bodas" al menú lateral de todas las pantallas.
// Uso (desde la carpeta del frontend):  node agregar-menu-bodas.js
// Es seguro correrlo varias veces: si una pantalla ya tiene el enlace, no lo repite.
const fs = require("fs");

const ARCHIVOS = [
  "dashboard.html", "personas.html", "sacramentos.html", "sacerdotes.html",
  "usuarios.html", "auditoria.html", "configuracion.html",
  "boletas-lote.html", "expediente.html",
];

const MARCA = /^([ \t]*)<a href="sacerdotes\.html" class="nav-item/m;

function bloque(sangria) {
  return [
    `<a href="bodas.html" class="nav-item">`,
    `  <svg viewBox="0 0 24 24"><circle cx="9" cy="13" r="5"/><circle cx="15" cy="13" r="5"/><path d="M12 3l1.2 2.2L12 7.4 10.8 5.2z"/></svg>`,
    `  Bodas`,
    `</a>`,
  ].map((l) => sangria + l).join("\n") + "\n";
}

ARCHIVOS.forEach((archivo) => {
  if (!fs.existsSync(archivo)) {
    console.log(`[NO ENCONTRADO] ${archivo}  (¿estás en la carpeta del frontend?)`);
    return;
  }
  const html = fs.readFileSync(archivo, "utf8");
  if (html.includes('href="bodas.html"')) {
    console.log(`[YA TENÍA]      ${archivo}`);
    return;
  }
  const m = html.match(MARCA);
  if (!m) {
    console.log(`[SIN MARCA]     ${archivo}  (no encontré el enlace de Sacerdotes; agrégalo a mano)`);
    return;
  }
  const nuevo = html.replace(MARCA, (todo, sangria) => bloque(sangria) + todo);
  fs.writeFileSync(archivo, nuevo, "utf8");
  console.log(`[AGREGADO]      ${archivo}`);
});
