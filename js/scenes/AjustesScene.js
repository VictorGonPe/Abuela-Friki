class AjustesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AjustesScene' });
    }

    preload() {
        this.load.image('menuAjustes', 'assets/historia/menuAjustes.png');
    }

    create() {
        const escalaPantalla = window.innerHeight / 1080;
        const tamanoFuente = 24 * escalaPantalla;

        // Asocia la imagen del menú ajustes
        this.menuAjustes = this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuAjustes')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height); // Tamaño inicial ajustado al canvas

        // Fondo negro para el texto
        const textoFondo = this.add.graphics();
        textoFondo.fillStyle(0x000000, 0.7);
        textoFondo.fillRect(50 * escalaPantalla, 120 * escalaPantalla, this.scale.width / 4 - 5 * escalaPantalla, 500 * escalaPantalla);

        // Título
        this.add.text(this.scale.width / 2, 1030 * escalaPantalla, 'Ajustes', {
            fontSize: `${32 * escalaPantalla}px`,
            fontStyle: 'bold',
            color: '#000000',
        }).setOrigin(0.5);

        // Música
        let musicOn = true;
        const musicButton = this.add.text(100 * escalaPantalla, 150 * escalaPantalla, `Música: On`, {
            fontSize: `${tamanoFuente}px`,
            fontStyle: 'bold',
            color: '#ffffff',
        }).setInteractive();

        musicButton.on('pointerdown', () => {
            musicOn = !musicOn;
            musicButton.setText(`Música: ${musicOn ? 'On' : 'Off'}`);
        });

        // Efectos de sonido
        let sfxOn = true;
        const sfxButton = this.add.text(100 * escalaPantalla, 250 * escalaPantalla, `Efectos de Sonido: On`, {
            fontSize: `${tamanoFuente}px`,
            fontStyle: 'bold',
            color: '#ffffff',
        }).setInteractive();

        sfxButton.on('pointerdown', () => {
            sfxOn = !sfxOn;
            sfxButton.setText(`Efectos de Sonido: ${sfxOn ? 'On' : 'Off'}`);
        });

        // Pantalla Completa
        let isFullscreen = false;
        const fullscreenButton = this.add.text(100 * escalaPantalla, 350 * escalaPantalla, 'Pantalla Completa: Off', {
            fontSize: `${tamanoFuente}px`,
            fontStyle: 'bold',
            color: '#ffffff',
        }).setInteractive();

        fullscreenButton.on('pointerdown', () => {
            if (!isFullscreen) {
                this.scale.startFullscreen();
                fullscreenButton.setText('Pantalla Completa: On');
            } else {
                this.scale.stopFullscreen();
                fullscreenButton.setText('Pantalla Completa: Off');
            }
            isFullscreen = !isFullscreen;

            // Redimensiona elementos inmediatamente
            this.redimensionarElementos();
        });

        // Dificultad
        const difficulties = ['Fácil', 'Medio', 'Difícil'];
        let currentDifficulty = 1;

        const difficultyText = this.add.text(100 * escalaPantalla, 450 * escalaPantalla, `Dificultad: ${difficulties[currentDifficulty]}`, {
            fontSize: `${tamanoFuente}px`,
            fontStyle: 'bold',
            color: '#ffffff',
        }).setInteractive();

        difficultyText.on('pointerdown', () => {
            currentDifficulty = (currentDifficulty + 1) % difficulties.length;
            difficultyText.setText(`Dificultad: ${difficulties[currentDifficulty]}`);
        });

        // Volver al menú principal
        const backButton = this.add.text(100 * escalaPantalla, 550 * escalaPantalla, 'Volver', {
            fontSize: `${tamanoFuente}px`,
            fontStyle: 'bold',
            color: '#ffffff',
        }).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Escuchar eventos de redimensionamiento
        this.scale.on('resize', () => this.redimensionarElementos());
    }

    /**
     * Método para redimensionar elementos al cambiar tamaño de pantalla
     */
    redimensionarElementos() {
        const newWidth = this.scale.width;
        const newHeight = this.scale.height;
        const escalaPantalla = newHeight / 1080;

        // Redimensionar la imagen del menú ajustes
        if (this.menuAjustes) {
            this.menuAjustes.setDisplaySize(newWidth, newHeight);
        }

        

        // Redimensionar botones y texto
        const tamanoFuente = 24 * escalaPantalla;
        const botones = this.children.list.filter(child => child.text);

        botones.forEach((boton, index) => {
            boton.setFontSize(`${tamanoFuente}px`);
            boton.setPosition(100 * escalaPantalla, (150 + index * 100) * escalaPantalla);
        });
    }
}

export default AjustesScene;
