import Phaser from 'phaser';
import { aplicarHover } from '../ui/botonTexto.js';
import { cargar } from '../almacenamiento.js';
import { asegurarTexturaPeseta } from '../ui/peseta.js';

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/historia/menuBackground.png');
    }

    create() {
        const centroX = this.scale.width / 2;
        const centroY = this.scale.height / 2;
        const tamanio = 40;

        // Fondo del menú
        this.add.image(centroX, centroY, 'menuBackground').setScale(1.08);

        // Panel semitransparente
        const background = this.add.rectangle(centroX, centroY - 60, 500 * tamanio, this.scale.height + 300, 0x000000);
        background.setAlpha(0.5);

        // Botones del menú
        const startButton = this.add.text(centroX, centroY - 80, 'Iniciar Juego', {
            fontFamily: 'Bangers', fontSize: tamanio, fontStyle: 'bold', color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(startButton);

        const farmaciaButton = this.add.text(centroX, centroY, 'La Farmacia', {
            fontFamily: 'Bangers', fontSize: tamanio, fontStyle: 'bold', color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(farmaciaButton);

        const settingsButton = this.add.text(centroX, centroY + 80, 'Ajustes', {
            fontFamily: 'Bangers', fontSize: tamanio, fontStyle: 'bold', color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setOrigin(0.5).setInteractive();
        aplicarHover(settingsButton);

        startButton.on('pointerdown', () => this.scene.start('ControlesScene'));
        farmaciaButton.on('pointerdown', () => this.scene.start('FarmaciaScene'));
        settingsButton.on('pointerdown', () => this.scene.start('AjustesScene'));

        // Récord
        const datos = cargar();
        if (datos.record > 0) {
            this.add.text(centroX, centroY + 160, `Récord: ${datos.record}`, {
                fontFamily: 'Bangers', fontSize: '28px', color: '#ffd700',
            }).setOrigin(0.5);
        }

        // Saldo de pesetas
        asegurarTexturaPeseta(this);
        const textoPesetas = this.add.text(centroX + 20, centroY + 210, `${datos.pesetas} pesetas`, {
            fontFamily: 'Bangers', fontSize: '28px', color: '#ffd700',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setOrigin(0.5);
        this.add.image(textoPesetas.x - textoPesetas.width / 2 - 22, textoPesetas.y, 'peseta').setScale(0.5);

        // Controles
        const esTactil = this.sys.game.device.input.touch;
        const textoControles = esTactil
            ? '← → : Mover  |  ↑ : Saltar  |  X : Galleta'
            : '← → : Mover  |  ↑ : Saltar  |  X : Galleta  |  P : Pausa';
        this.add.text(centroX, this.scale.height - 60, textoControles, {
            fontFamily: 'Bangers', fontSize: '22px', color: '#cccccc', align: 'center',
        }).setOrigin(0.5);
    }
}

export default MenuScene;
