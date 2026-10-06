// Módulo de entrada unificado: expone el estado combinado de teclado y botones táctiles.
// GameScene lo consulta en lugar de leer los cursors directamente.
//
// izquierda / derecha / arriba / abajo / lanzarMantenido: true mientras se mantiene pulsado (hold)
// saltar / lanzar / bajar: pulso de un frame — se pone a true en pointerdown
//                  y Abuela los resetea a false después de leerlos
// arriba, abajo y bajar solo se usan en el vuelo de la Abuela Cibernética;
// lanzarMantenido, para cargar la bola de energía de la Abuela Wukong

const entrada = {
    izquierda: false,
    derecha: false,
    saltar: false,
    lanzar: false,
    arriba: false,
    abajo: false,
    bajar: false,
    lanzarMantenido: false,
};

export default entrada;
