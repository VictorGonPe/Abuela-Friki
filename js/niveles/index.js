// Lista de niveles del juego. El nivel que se va a jugar se guarda en el registro de Phaser
// (clave 'nivel'), que comparten todas las escenas y sobrevive a los reinicios de GameScene.
import { BARCELONA } from './barcelona.js';
import { MADRID } from './madrid.js';

export const NIVELES = { barcelona: BARCELONA, madrid: MADRID };

export function nivelActual(registry) {
    return NIVELES[registry.get('nivel')] || BARCELONA;
}
