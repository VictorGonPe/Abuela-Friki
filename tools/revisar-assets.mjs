// Revisa los assets del juego sin dependencias externas.
//
// Uso:  node tools/revisar-assets.mjs
//
// Informa de:
//   - texturas PNG que superan el límite seguro de los móviles (4096 px de lado)
//   - texturas por encima del objetivo recomendado (2048 px)
//   - archivos de assets que ningún .js carga
//   - peso total de lo que se usa y de lo que no
//
// Termina con código 1 si alguna textura EN USO supera los 4096 px,
// para poder usarlo como comprobación antes de compilar.

import { readdirSync, readFileSync, statSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';

const LIMITE_SEGURO = 4096;
const OBJETIVO = 2048;

const raiz = process.cwd();
// Tras la Fase 1 (Vite) los assets pasan a public/assets
const dirAssets = existsSync(join(raiz, 'public', 'assets')) ? join(raiz, 'public', 'assets') : join(raiz, 'assets');
const dirsCodigo = ['js', 'src'].map((d) => join(raiz, d)).filter(existsSync);

if (!existsSync(dirAssets)) {
    console.error('No encuentro la carpeta de assets. Ejecuta el script desde la raíz del proyecto.');
    process.exit(2);
}

function listar(dir) {
    const salida = [];
    for (const nombre of readdirSync(dir)) {
        if (nombre === '.DS_Store') continue;
        const ruta = join(dir, nombre);
        if (statSync(ruta).isDirectory()) salida.push(...listar(ruta));
        else salida.push(ruta);
    }
    return salida;
}

// El ancho y el alto de un PNG están en los bytes 16-23 de la cabecera IHDR
function dimensionesPng(ruta) {
    const cabecera = Buffer.alloc(24);
    const fd = openSync(ruta, 'r');
    readSync(fd, cabecera, 0, 24, 0);
    closeSync(fd);
    if (cabecera.toString('ascii', 1, 4) !== 'PNG') return null;
    return { ancho: cabecera.readUInt32BE(16), alto: cabecera.readUInt32BE(20) };
}

// Rutas "assets/..." que aparecen en el código, ignorando las líneas comentadas
const usados = new Set();
for (const dir of dirsCodigo) {
    for (const archivo of listar(dir).filter((f) => extname(f) === '.js')) {
        for (const linea of readFileSync(archivo, 'utf8').split('\n')) {
            if (linea.trim().startsWith('//')) continue;
            for (const m of linea.matchAll(/['"`](assets\/[^'"`]+)['"`]/g)) usados.add(m[1]);
        }
    }
}

const mb = (bytes) => (bytes / 1e6).toFixed(1) + ' MB';
const archivos = listar(dirAssets).map((ruta) => {
    const clave = 'assets/' + relative(dirAssets, ruta).split(sep).join('/');
    const dim = extname(ruta).toLowerCase() === '.png' ? dimensionesPng(ruta) : null;
    return { clave, bytes: statSync(ruta).size, dim, usado: usados.has(clave) };
});

const enUso = archivos.filter((a) => a.usado);
const sinUso = archivos.filter((a) => !a.usado);
const lado = (a) => (a.dim ? Math.max(a.dim.ancho, a.dim.alto) : 0);
const fila = (a) => `  ${String(a.dim.ancho).padStart(5)} x ${String(a.dim.alto).padEnd(5)} ${mb(a.bytes).padStart(8)}  ${a.clave}`;

const fueraDeLimite = enUso.filter((a) => lado(a) > LIMITE_SEGURO).sort((a, b) => lado(b) - lado(a));
const sobreObjetivo = enUso.filter((a) => lado(a) > OBJETIVO && lado(a) <= LIMITE_SEGURO).sort((a, b) => lado(b) - lado(a));

console.log(`\nCarpeta revisada: ${relative(raiz, dirAssets) || '.'}`);
console.log(`En uso:  ${enUso.length} archivos, ${mb(enUso.reduce((s, a) => s + a.bytes, 0))}`);
console.log(`Sin uso: ${sinUso.length} archivos, ${mb(sinUso.reduce((s, a) => s + a.bytes, 0))}`);

console.log(`\nTexturas en uso por encima de ${LIMITE_SEGURO} px (fallan en muchos móviles): ${fueraDeLimite.length}`);
fueraDeLimite.forEach((a) => console.log(fila(a)));

console.log(`\nTexturas en uso entre ${OBJETIVO} y ${LIMITE_SEGURO} px (conviene reducirlas): ${sobreObjetivo.length}`);
sobreObjetivo.forEach((a) => console.log(fila(a)));

console.log(`\nArchivos que ningún .js carga: ${sinUso.length}`);
sinUso.sort((a, b) => b.bytes - a.bytes).forEach((a) => console.log(`  ${mb(a.bytes).padStart(8)}  ${a.clave}`));

const noEncontrados = [...usados].filter((clave) => !archivos.some((a) => a.clave === clave));
if (noEncontrados.length) {
    console.log(`\nRutas que el código carga y no existen en disco: ${noEncontrados.length}`);
    noEncontrados.forEach((clave) => console.log(`  ${clave}`));
}

console.log('');
process.exit(fueraDeLimite.length || noEncontrados.length ? 1 : 0);
