class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/historia/menuBackground.png'); // Fondo del menú
        
    }

    create() {
       
        // Fondo del menú
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground').setScale(1.08 *  window.innerHeight / 1080);
        const tamanio = 40 * window.innerHeight / 1080;

        // Crear un fondo blanco detrás de los botones
        const background = this.add.rectangle(
            this.cameras.main.width / 2,  // Posición X centrada
            this.cameras.main.height / 2 - 60, // Posición Y centrada
            500 * tamanio,                          // Ancho
            window.innerHeight + 300,                          // Alto
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

         // Efecto al pasar el mouse sobre el botón
        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#FF0000' }); 
            startButton.setScale(1.2); // Aumenta el tamaño del texto
        });

        // Efecto al salir del botón
        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#ffffff' }); // Vuelve al color original
            startButton.setScale(1); // Restaura el tamaño original
        });

  

        const settingsButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Ajustes', {
            fontFamily: 'Bangers',
            fontSize: tamanio,
            fontStyle: 'bold',
            color: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }).setOrigin(0.5).setInteractive();

          // Efecto al pasar el mouse sobre el botón
          settingsButton.on('pointerover', () => {
            settingsButton.setStyle({ color: '#FF0000' }); 
            settingsButton.setScale(1.2); // Aumenta el tamaño del texto
        });

        // Efecto al salir del botón
        settingsButton.on('pointerout', () => {
            settingsButton.setStyle({ color: '#ffffff' }); // Vuelve al color original
            settingsButton.setScale(1); // Restaura el tamaño original
        });


        // Acciones de los botones
        startButton.on('pointerdown', () => this.scene.start('GameScene')); // Cambia a la escena del juego
        settingsButton.on('pointerdown', () => this.scene.start('AjustesScene')); // Cambia a ajustes
    }
}

export default MenuScene;