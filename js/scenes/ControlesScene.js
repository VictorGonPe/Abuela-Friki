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
        const tamanoFuente = 40 * window.innerHeight / 1080;

        this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 100,
            '← : Mover a la izquierda\n→ : Mover a la derecha\n↑ : Saltar\nX : Lanzar galletas\n\nPulsa ESPACIO para continuar',
            {
                fontSize: `${tamanoFuente}px`,
                fontFamily: 'Bangers',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 10 * window.innerHeight / 1080,
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
            }
        ).setOrigin(0.5);

        // Detectar la tecla Z para continuar
        const zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        zKey.on('down', () => {
            this.scene.start('GameScene'); // Cambia a la escena principal del juego
        });
    }
}

export default ControlesScene;
