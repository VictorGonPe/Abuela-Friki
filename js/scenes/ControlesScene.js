import Phaser from 'phaser';

class ControlesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlesScene' });
    }

    preload() {
        // Opcional: Carga imágenes o recursos si los necesitas
    }

    create() {
        // Fondo negro
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 1);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);

        // Texto de instrucciones
        const tamanoFuente = 40 * 1;

        const esTactil = this.sys.game.device.input.touch;
        const instrucciones = esTactil
            ? 'Botones izquierda / derecha: abajo a la izquierda\nBotones saltar / lanzar: abajo a la derecha\n\nToca la pantalla para continuar'
            : '← : Mover a la izquierda\n→ : Mover a la derecha\n↑ : Saltar\nX : Lanzar galletas\n\nPulsa ESPACIO para continuar';

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 100,
            instrucciones,
            {
                fontSize: `${tamanoFuente}px`,
                fontFamily: 'Bangers',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 10 * 1,
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
            }
        ).setOrigin(0.5);

        const continuar = () => this.scene.start('GameScene');
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', continuar);
        this.input.on('pointerdown', continuar);
    }
}

export default ControlesScene;
