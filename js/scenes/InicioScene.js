class InicioScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InicioScene' });
    }

    preload() {
        this.load.image('titulo', 'assets/titulo.png');
        //this.load.audio('backgroundSound', 'assets/sonidos/backgroundSound.mp3');
    }

    create() {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1e90ff).setOrigin(0, 0);

        this.add.image(this.scale.width / 2, this.scale.height / 3, 'titulo').setScale(0.5);

        const texto = this.add.text(this.scale.width / 2,this.scale.height / 1.5,'Presiona cualquier tecla para continuar',{ fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

        // Reproducir audio de fondo
        //const backGroundAudio = this.sound.add('backgroundSound', { loop: true });
        //backGroundAudio.play();
        
        this.input.keyboard.on('keydown', () => {this.scene.start('HistoriaInicialScene');}); //Cambia a la scene Juego
    }
}

export default InicioScene;
