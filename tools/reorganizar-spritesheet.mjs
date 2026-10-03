#!/usr/bin/env node
// Reorganiza un spritesheet de una sola fila en varias filas.
// Uso: node tools/reorganizar-spritesheet.mjs <archivo> <frameWidth> <frameHeight> <colsPorFila>
//
// Ejemplo: node tools/reorganizar-spritesheet.mjs public/assets/abuelaAndar.png 363 378 7
// Convierte 21 frames en fila → 3 filas de 7 (2541 x 1134)

import sharp from 'sharp';
import { resolve } from 'path';

const [,, archivo, fwStr, fhStr, colsStr] = process.argv;

if (!archivo || !fwStr || !fhStr || !colsStr) {
    console.error('Uso: node tools/reorganizar-spritesheet.mjs <archivo> <fw> <fh> <colsPorFila>');
    process.exit(1);
}

const fw = parseInt(fwStr);
const fh = parseInt(fhStr);
const colsPorFila = parseInt(colsStr);
const ruta = resolve(archivo);

const img = sharp(ruta);
const meta = await img.metadata();
const totalFrames = Math.round(meta.width / fw);
const filas = Math.ceil(totalFrames / colsPorFila);

const nuevoAncho = colsPorFila * fw;
const nuevoAlto = filas * fh;

console.log(`${archivo}: ${meta.width}x${meta.height} → ${nuevoAncho}x${nuevoAlto} (${totalFrames} frames, ${filas} filas de ${colsPorFila})`);

// Extraer cada frame y componer la nueva imagen
const composiciones = [];
for (let i = 0; i < totalFrames; i++) {
    const srcX = i * fw;
    const dstFila = Math.floor(i / colsPorFila);
    const dstCol = i % colsPorFila;

    const frame = await sharp(ruta)
        .extract({ left: srcX, top: 0, width: fw, height: fh })
        .toBuffer();

    composiciones.push({
        input: frame,
        left: dstCol * fw,
        top: dstFila * fh,
    });
}

await sharp({
    create: {
        width: nuevoAncho,
        height: nuevoAlto,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
})
    .composite(composiciones)
    .png()
    .toFile(ruta + '.tmp.png');

// Reemplazar el original
import { rename } from 'fs/promises';
await rename(ruta + '.tmp.png', ruta);

console.log('Guardado.');
