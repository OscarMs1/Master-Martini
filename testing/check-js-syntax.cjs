/**
 * Revisa que todos los archivos JS/JSX tengan sintaxis válida.
 * Usa esbuild, que ya viene instalado con Vite.
 * No reemplaza npm run build, ya que no resuelve imports ni renderiza DOM.
 */
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

// Busca todos los archivos .js, .mjs, .cjs y .jsx dentro de una carpeta
function scan(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) return scan(fullPath);
    return /\.(m?js|jsx|cjs)$/.test(entry.name) ? [fullPath] : [];
  });
}

const files = ['src', 'server', 'testing'].flatMap(scan);
let errors = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    esbuild.transformSync(text, { loader: file.endsWith('.jsx') ? 'jsx' : 'js' });
  } catch (error) {
    errors++;
    console.error('FALLO', file, error.message);
  }
}

console.log(`Sintaxis ${files.length} archivos JS/JSX: ${errors} errores`);
process.exit(errors ? 1 : 0);
