// Textura provisional de la peseta, dibujada por código hasta que haya un sprite definitivo.
// Las texturas son globales al juego: se crea una sola vez y la comparten todas las escenas.
export function asegurarTexturaPeseta(scene) {
    if (scene.textures.exists('peseta')) return;

    const g = scene.make.graphics({}, false);
    g.fillStyle(0xb8860b);
    g.fillCircle(32, 32, 32);
    g.fillStyle(0xffd700);
    g.fillCircle(32, 32, 27);
    g.fillStyle(0xb8860b);
    g.fillCircle(32, 32, 18);
    g.fillStyle(0xffe866);
    g.fillCircle(32, 32, 15);
    g.generateTexture('peseta', 64, 64);
    g.destroy();
}
