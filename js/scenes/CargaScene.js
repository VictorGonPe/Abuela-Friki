import Phaser from 'phaser';
import { BARCELONA } from '../niveles/barcelona.js';

// Carga los assets del nivel y muestra una barra de progreso.
// Flujo: ControlesScene → CargaScene → GameScene.
// En reinicios (scene.restart en GameScene) los assets ya están en caché
// y esta escena no vuelve a ejecutarse.

class CargaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CargaScene' });
    }

    init(data) {
        this.nivel = data?.nivel ?? BARCELONA;
    }

    preload() {
        const { assets } = this.nivel;
        const ancho = this.scale.width;
        const alto  = this.scale.height;

        this.add.rectangle(0, 0, ancho, alto, 0x000000).setOrigin(0, 0);

        this.add.text(ancho / 2, alto * 0.42, 'Cargando...', {
            fontFamily: 'Bangers',
            fontSize:   '52px',
            color:      '#ffffff',
        }).setOrigin(0.5);

        const barraX = ancho * 0.2;
        const barraY = alto * 0.55;
        const barraW = ancho * 0.6;
        const barraH = 28;

        const marco = this.add.graphics();
        marco.lineStyle(3, 0xffffff, 1);
        marco.strokeRect(barraX, barraY, barraW, barraH);

        const relleno = this.add.graphics();

        this.load.on('progress', (valor) => {
            relleno.clear();
            relleno.fillStyle(0xffd700, 1);
            relleno.fillRect(barraX + 2, barraY + 2, (barraW - 4) * valor, barraH - 4);
        });

        // Cargar solo los assets que aún no estén en caché
        assets.imagenes.forEach(({ key, ruta }) => {
            if (!this.textures.exists(key)) this.load.image(key, ruta);
        });
        assets.spritesheets.forEach(({ key, ruta, fw, fh, spacing }) => {
            if (!this.textures.exists(key)) this.load.spritesheet(key, ruta, { frameWidth: fw, frameHeight: fh, spacing: spacing || 0 });
        });
        assets.audios.forEach(({ key, ruta }) => {
            if (!this.cache.audio.exists(key)) this.load.audio(key, ruta);
        });
    }

    create() {
        this.scene.start('GameScene');
    }
}

export default CargaScene;
