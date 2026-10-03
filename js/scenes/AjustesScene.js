import Phaser from 'phaser';
import { cargar, guardar } from '../almacenamiento.js';
import { aplicarHover } from '../ui/botonTexto.js';

const DIFICULTADES = ['Fácil', 'Medio', 'Difícil'];

class AjustesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AjustesScene' });
    }

    preload() {
        this.load.image('menuAjustes', 'assets/historia/menuAjustes.png');
    }

    create() {
        const datos = cargar();
        const tamano = 28;
        const centroX = this.scale.width / 2;

        // Fondo
        this.add.image(centroX, this.scale.height / 2, 'menuAjustes')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Panel semitransparente
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.75);
        panel.fillRoundedRect(centroX - 220, 140, 440, 520, 16);

        // Título
        this.add.text(centroX, 180, 'Ajustes', {
            fontFamily: 'Bangers', fontSize: '42px', color: '#ffd700',
        }).setOrigin(0.5);

        // Música
        let musicaOn = datos.musicaOn;
        const btnMusica = this.add.text(centroX, 280, `Música: ${musicaOn ? 'On' : 'Off'}`, {
            fontFamily: 'Bangers', fontSize: `${tamano}px`, color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnMusica);

        btnMusica.on('pointerdown', () => {
            musicaOn = !musicaOn;
            btnMusica.setText(`Música: ${musicaOn ? 'On' : 'Off'}`);
            guardar({ musicaOn });
        });

        // Efectos de sonido
        let efectosOn = datos.efectosOn;
        const btnEfectos = this.add.text(centroX, 360, `Efectos: ${efectosOn ? 'On' : 'Off'}`, {
            fontFamily: 'Bangers', fontSize: `${tamano}px`, color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnEfectos);

        btnEfectos.on('pointerdown', () => {
            efectosOn = !efectosOn;
            btnEfectos.setText(`Efectos: ${efectosOn ? 'On' : 'Off'}`);
            guardar({ efectosOn });
        });

        // Dificultad
        let dificultad = datos.dificultad;
        const btnDif = this.add.text(centroX, 440, `Dificultad: ${DIFICULTADES[dificultad]}`, {
            fontFamily: 'Bangers', fontSize: `${tamano}px`, color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnDif);

        btnDif.on('pointerdown', () => {
            dificultad = (dificultad + 1) % DIFICULTADES.length;
            btnDif.setText(`Dificultad: ${DIFICULTADES[dificultad]}`);
            guardar({ dificultad });
        });

        // Pantalla completa
        let enPantallaCompleta = this.scale.isFullscreen;
        const btnFull = this.add.text(centroX, 520, `Pantalla Completa: ${enPantallaCompleta ? 'On' : 'Off'}`, {
            fontFamily: 'Bangers', fontSize: `${tamano}px`, color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnFull);

        btnFull.on('pointerdown', () => {
            if (!enPantallaCompleta) {
                this.scale.startFullscreen();
            } else {
                this.scale.stopFullscreen();
            }
            enPantallaCompleta = !enPantallaCompleta;
            btnFull.setText(`Pantalla Completa: ${enPantallaCompleta ? 'On' : 'Off'}`);
        });

        // Volver
        const btnVolver = this.add.text(centroX, 610, 'Volver', {
            fontFamily: 'Bangers', fontSize: `${tamano}px`, color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnVolver);

        btnVolver.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

export default AjustesScene;
