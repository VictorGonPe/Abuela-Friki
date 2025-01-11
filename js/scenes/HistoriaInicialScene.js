class HistoriaInicialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HistoriaInicialScene' });
    }

    preload() {
        this.load.audio('historiaAudio', 'assets/sonidos/historiaAudio.mp3'); 
        this.load.image('imagen1', 'assets/historia/imagen1.png'); 
        this.load.image('imagen2', 'assets/historia/imagen2.png'); 
        this.load.image('imagen3', 'assets/historia/imagen3.png'); 
    }

    create() {
        // Crear un fondo negro para asegurarte de que las transiciones se vean bien
        this.cameras.main.setBackgroundColor('#000000');
        const tamanoFuente = 30 * window.innerHeight / 1080;
    
        // Reproducir el audio de historia
        const historiaAudio = this.sound.add('historiaAudio', { loop: false });
        historiaAudio.play();
    
        // Mostrar el texto "Saltar intro: Pulsar Espacio"
        const textoSaltar = this.add.text(
            this.scale.width - 200 * window.innerHeight / 1080,
            50 * window.innerHeight / 1080, // Posición en la parte superior
            'Saltar intro: Pulsar Espacio',
            {
                fontFamily: 'Bangers',
                fontSize: `${30 * window.innerHeight / 1080}px`,
                color: '#ffffff',
                align: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        ).setOrigin(0.5).setDepth(10);
    
        // Crear imágenes
        const imagen1 = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imagen1').setScale(1.08 * window.innerHeight / 1080).setAlpha(0);
        const imagen2 = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imagen2').setScale(1.08 * window.innerHeight / 1080).setAlpha(0);
        const imagen3 = this.add.image(this.scale.width / 2, this.scale.height / 2, 'imagen3').setScale(1.08 * window.innerHeight / 1080).setAlpha(0);
    
        // Fondo negro para texto (estrecho y centrado)
        const textoAncho = this.scale.width * 0.6; // Ajusta el ancho del texto
        const textoFondo = this.add.graphics();
        textoFondo.fillStyle(0x000000, 0.7);
        textoFondo.fillRect(
            (this.scale.width - textoAncho) / 2, // Centrar el fondo
            this.scale.height - 200 * window.innerHeight / 1080,
            textoAncho,
            150 * window.innerHeight / 1080
        );
    
        // Crear texto centrado
        const texto = this.add.text(
            this.scale.width / 2, // Centrar horizontalmente
            this.scale.height - 125 * window.innerHeight / 1080, // Ajustar posición vertical
            '',
            {
                fontFamily: 'Bangers',
                fontSize: tamanoFuente,
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textoAncho - 20 }, // Ajustar al ancho del fondo con un pequeño margen
                padding: { left: 5, right: 5, top: 5, bottom: 5 },
            }
        ).setOrigin(0.5);
    
        // Mostrar las imágenes y textos en secuencia
        this.tweens.add({
            targets: imagen1,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                texto.setText('Desde que se convirtió en abuela, Carmen descubrió su verdadera pasión: los videojuegos y el mundo geek. Ahora, antes de viajar por el mundo con el Imserso, decidió comenzar su aventura explorando su ciudad natal: ¡Barcelona!');
            }
        });
    
        this.time.delayedCall(14000, () => {
            this.tweens.add({
                targets: imagen1,
                alpha: 0,
                duration: 1000,
            });
    
            this.tweens.add({
                targets: imagen2,
                alpha: 1,
                duration: 2000,
                onComplete: () => {
                    texto.setText('Lo que prometía ser un simple paseo lleno de diversión se convirtió en una misión inesperada. Barcelona, su querida ciudad, estaba infestada de enemigos cotidianos y surrealistas: palomas kamikazes, cacas mutantes, y hordas de patinetes descontrolados.');
                }
            });
        });
    
        this.time.delayedCall(28000, () => {
            this.tweens.add({
                targets: imagen2,
                alpha: 0,
                duration: 1000,
            });
    
            this.tweens.add({
                targets: imagen3,
                alpha: 1,
                duration: 2000,
                onComplete: () => {
                    texto.setText('Con su ingenio gamer y su espíritu friki, Carmen se lanzó a limpiar su ciudad y restaurar la paz. Sabía que esta era solo la primera fase: si lograba vencer a estos enemigos, estaría lista para su siguiente destino.');
                }
            });
        });
    
        // Pulsar SPACE para saltar
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.on('down', () => {
            historiaAudio.stop();
            this.scene.start('MenuScene');
        });
    
        // Al finalizar el audio, ir al menú
        historiaAudio.on('complete', () => {
            this.scene.start('GameScene');
        });
    }
    
}

export default HistoriaInicialScene;