// Cambia "Bodas" por "Matrimonios" en el menú lateral de todas las pantallas.
// Uso (desde la carpeta del frontend):  node renombrar-menu.js
const fs = require("fs");
const archivos = fs.readdirSync(".").filter((f) => f.endsWith(".html"));
let cambiados = 0;
for (const f of archivos) {
  let h = fs.readFileSync(f, "utf8");
  const antes = h;
  h = h.replace(/href="bodas\.html"/g, 'href="matrimonios.html"');
  h = h.replace(/(href="matrimonios\.html"[^>]*>[\s\S]*?<\/svg>\s*)Bodas(\s*<\/a>)/g, "$1Matrimonios$2");
  if (h !== antes) { fs.writeFileSync(f, h); cambiados++; console.log("OK  ", f); }
}
console.log(`Listo: ${cambiados} archivos actualizados.`);
