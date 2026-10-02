/*
 * Nombre del archivo: abuelaFriki.js
 * Autor: Víctor González Pérez
 * Fecha de creación: 2024-2025
 * Descripción: Desarrollo Abuela Friki
 * Derechos de autor (c) 2024, Víctor González Pérez
*/

import Phaser from 'phaser';
import '@fontsource/bangers';
import InicioScene from './scenes/InicioScene.js';
import GameScene from './scenes/GameScene.js';
import HistoriaInicialScene from './scenes/HistoriaInicialScene.js';
import MenuScene from './scenes/MenuScene.js';
import AjustesScene from './scenes/AjustesScene.js';
import ControlesScene from './scenes/ControlesScene.js';



// Altura de diseño fija. El ancho se calcula según la proporción real, limitado entre 4:3 y 21:9.
const ALTURA_JUEGO = 1080;
const ratio = Math.min(Math.max(window.innerWidth / window.innerHeight, 4 / 3), 21 / 9);
const ANCHO_JUEGO = Math.round(ALTURA_JUEGO * ratio);

// Configuración básica del juego - mediante un JSON
var config = {
    type: Phaser.AUTO, // Usará webGL y si no admite navegador Canvas
    parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.FIT,        // Phaser escala el lienzo; el código siempre ve 1080px de alto
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: ANCHO_JUEGO,
        height: ALTURA_JUEGO,
    },
    physics: { //Añade las físicas
        default: 'arcade',
        arcade: {
            gravity: { y: 980 }, // Gravedad fija; altScale siempre vale 1 con altura fija
            debug: false
        }
    },
    /*
    scene: { //Funciones de phaser para crear la escena implementadas en cada escena
        preload: preload, create: create, update: update
    }
    */
   //Especie de máquina de estados
    scene: [InicioScene, HistoriaInicialScene, MenuScene, ControlesScene, GameScene, AjustesScene],
};


document.fonts.load('1em Bangers').then(() => {
    new Phaser.Game(config); // Inicializo el juego
});




