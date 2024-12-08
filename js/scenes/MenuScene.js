class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/images/menuBackground.png'); // Fondo del menú
    }

    create() {
        // Fondo del menú
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground').setScale(0.6);

        // Botones del menú
        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 3, 'Iniciar Juego', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5).setInteractive();

        const settingsButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Ajustes', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5).setInteractive();

        // Acciones de los botones
        startButton.on('pointerdown', () => this.scene.start('GameScene')); // Cambia a la escena del juego
        settingsButton.on('pointerdown', () => this.scene.start('AjustesScene')); // Cambia a ajustes
    }
}

export default MenuScene;