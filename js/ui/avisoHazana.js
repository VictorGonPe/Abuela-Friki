// Aviso en pantalla al conseguir una hazaña. Si llegan varias a la vez
// (por ejemplo al terminar el nivel) se muestran una detrás de otra.

const DURACION_VISIBLE = 2200;

export function avisarHazana(scene, hazana) {
    if (!scene.colaAvisosHazana) {
        scene.colaAvisosHazana = [];
        scene.events.once('shutdown', () => { scene.colaAvisosHazana = null; });
    }
    scene.colaAvisosHazana.push(hazana);
    if (scene.colaAvisosHazana.length === 1) mostrarSiguiente(scene);
}

function mostrarSiguiente(scene) {
    const hazana = scene.colaAvisosHazana[0];
    const texto = scene.add.text(scene.scale.width / 2, -80, `¡Hazaña!  ${hazana.nombre}   +${hazana.pesetas} pesetas`, {
        fontFamily: 'Bangers', fontSize: '36px', color: '#ffd700',
        backgroundColor: '#222222',
        padding: { left: 24, right: 24, top: 14, bottom: 14 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    if (scene.isSoundOn && scene.cogerGalletasSound) scene.cogerGalletasSound.play();

    scene.tweens.add({
        targets: texto,
        y: 70,
        duration: 300,
        ease: 'Back.easeOut',
        hold: DURACION_VISIBLE,
        yoyo: true,
        onComplete: () => {
            texto.destroy();
            if (!scene.colaAvisosHazana) return; // la escena se reinició mientras tanto
            scene.colaAvisosHazana.shift();
            if (scene.colaAvisosHazana.length > 0) mostrarSiguiente(scene);
        },
    });
}
