class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/historia/menuBackground.png'); // Fondo del menú
        this.load.audio('backgroundSound', 'assets/sonidos/backgroundSound.mp3');
    }

    create() {
       
        // Fondo del menú
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground').setScale(1.08 *  window.innerHeight / 1080);
        const tamanio = 40 * window.innerHeight / 1080;

        // Botones del menú
        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 3, 'Iniciar Juego', {
            fontSize: tamanio,
            fontStyle: 'bold',
            color: '#000000',
        }).setOrigin(0.5).setInteractive();

        const settingsButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Ajustes', {
            fontSize: tamanio,
            fontStyle: 'bold',
            color: '#000000',
        }).setOrigin(0.5).setInteractive();

        // Acciones de los botones
        startButton.on('pointerdown', () => this.scene.start('GameScene')); // Cambia a la escena del juego
        settingsButton.on('pointerdown', () => this.scene.start('AjustesScene')); // Cambia a ajustes
    }
}

export default MenuScene;