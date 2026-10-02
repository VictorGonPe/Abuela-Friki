// Módulo de entrada unificado: expone el estado combinado de teclado y botones táctiles.
// GameScene lo consulta en lugar de leer los cursors directamente.
//
// izquierda / derecha: true mientras se mantiene pulsado (hold)
// saltar / lanzar: pulso de un frame — se pone a true en pointerdown
//                  y GameScene los resetea a false después de leerlos

const entrada = {
    izquierda: false,
    derecha: false,
    saltar: false,
    lanzar: false,
};

export default entrada;
