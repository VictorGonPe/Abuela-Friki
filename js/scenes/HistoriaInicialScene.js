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

        // Reproducir el audio de historia
        const historiaAudio = this.sound.add('historiaAudio', { loop: false });
        historiaAudio.play();

        // Crear imágenes y texto
        const imagen1 = this.add.image(this.scale.width / 2, this.scale.height / 2 , 'imagen1').setScale(1 * window.innerHeight / 1080).setAlpha(0);
        const imagen2 = this.add.image(this.scale.width / 2, this.scale.height / 2 , 'imagen2').setScale(1 * window.innerHeight / 1080).setAlpha(0);
        const imagen3 = this.add.image(this.scale.width / 2, this.scale.height / 2 , 'imagen3').setScale(1 * window.innerHeight / 1080).setAlpha(0);


        // Crear un gráfico para el fondo del texto
        const textoFondo = this.add.graphics();
        textoFondo.fillStyle(0x000000, 0.7); // Color negro con 60% de opacidad
        textoFondo.fillRect(50, this.scale.height - 340 * window.innerHeight / 1080, this.scale.width - 100 , 120); // Rectángulo centrado en la parte inferior

        // Crear texto centrado en la parte inferior
        const texto = this.add.text(this.scale.width / 2 + 5, this.scale.height / 2 + 285 * window.innerHeight / 1080, '', {fontSize: '24px',color: '#ffffff', wordWrap: { width: this.scale.width - 100 },
            align: 'center',
        }).setOrigin(0.5);

        // Mostrar las imágenes y textos en secuencia
    this.tweens.add({
        targets: imagen1,
        alpha: 1, // Hacer visible
        duration: 2000, // Duración de la transición
        onComplete: () => {
            texto.setText('Desde que se convirtió en abuela, Carmen descubrió su verdadera pasión: los videojuegos y el mundo geek. Ahora, antes de viajar por el mundo con el Imserso, decidió comenzar su aventura explorando su ciudad natal: ¡Barcelona!');
        }
    });

    this.time.delayedCall(10000, () => {
        this.tweens.add({
            targets: imagen1,
            alpha: 0, // Desvanecer la imagen 1
            duration: 1000,
        });

        this.tweens.add({
            targets: imagen2,
            alpha: 1, // Mostrar la imagen 2
            duration: 2000,
            onComplete: () => {
                texto.setText('Lo que prometía ser un simple paseo lleno de diversión se convirtió en una misión inesperada. Barcelona, su querida ciudad, estaba infestada de enemigos cotidianos y surrealistas: palomas kamikazes, cacas mutantes, y hordas de patinetes descontrolados.');
            }
        });
    });

    this.time.delayedCall(20000, () => {
        this.tweens.add({
            targets: imagen2,
            alpha: 0, // Desvanecer la imagen 2
            duration: 1000,
        });

        this.tweens.add({
            targets: imagen3,
            alpha: 1, // Mostrar la imagen 3
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