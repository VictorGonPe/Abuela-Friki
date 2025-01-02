/*
 * Nombre del archivo: abuelaFriki.js
 * Autor: Víctor González Pérez
 * Fecha de creación: 2024-2025
 * Descripción: Desarrollo Abuela Friki
 * Derechos de autor (c) 2024, Víctor González Pérez
*/

import InicioScene from './scenes/InicioScene.js';
import GameScene from './scenes/GameScene.js';
import HistoriaInicialScene from './scenes/HistoriaInicialScene.js';
import MenuScene from './scenes/MenuScene.js';
import AjustesScene from './scenes/AjustesScene.js';



// Configuración básica del juego - mediante un JSON
var config = {
    type: Phaser.AUTO, // Usará webGL y si no admite navegador Canvas
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE, // Escala para ajustar a diferentes pantallas
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { //Añade las físicas
        default: 'arcade',
        arcade: {
            gravity: { y: 980 * window.innerHeight / 1080}, // gravedad de la tierra * por la escala de la pantalla
            debug: false  // Activar el modo de depuración para ver colisiones y límites
        }
    },
    /*
    scene: { //Funciones de phaser para crear la escena implementadas en cada escena
        preload: preload, create: create, update: update
    }
    */
   //Especie de máquina de estados
    scene: [InicioScene, HistoriaInicialScene, MenuScene, GameScene, AjustesScene],
};


const game = new Phaser.Game(config); // Inicializo el juego




