import Phaser from 'phaser';
import { aplicarHover } from '../ui/botonTexto.js';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/historia/menuBackground.png'); // Fondo del menú
        
    }

    create() {
       
        // Fondo del menú
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground').setScale(1.08 *  1);
        const tamanio = 40 * 1;

        // Crear un fondo blanco detrás de los botones
        const background = this.add.rectangle(
            this.cameras.main.width / 2,  // Posición X centrada
            this.cameras.main.height / 2 - 60, // Posición Y centrada
            500 * tamanio,                          // Ancho
            this.scale.height + 300,                          // Alto
            0x000000                      // Color blanco
        );
        background.setAlpha(0.5);       // 70% de opacidad

        // Botones del menú
        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 2.6, 'Iniciar Juego', {
            fontFamily: 'Bangers',
            fontSize: tamanio,
            fontStyle: 'bold',
            color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }).setOrigin(0.5).setInteractive();

        aplicarHover(startButton);

  

        const settingsButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Ajustes', {
            fontFamily: 'Bangers',
            fontSize: tamanio,
            fontStyle: 'bold',
            color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }).setOrigin(0.5).setInteractive();

        aplicarHover(settingsButton);


        // Acciones de los botones
        startButton.on('pointerdown', () => this.scene.start('ControlesScene')); // Cambia a la escena del juego
        settingsButton.on('pointerdown', () => this.scene.start('AjustesScene')); // Cambia a ajustes
    }
}

export default MenuScene;