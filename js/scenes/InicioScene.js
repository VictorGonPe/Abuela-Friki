import Phaser from 'phaser';

class InicioScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InicioScene' });
        this.soundIsOn = false;
    }

    preload() {
        this.load.image('titulo', 'assets/titulo.png');
        this.load.audio('backgroundSound', 'assets/sonidos/pruebaBackground.mp3');
    }

    create() {


        const tamanoFuente = 30 * 1; 
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x1e90ff).setOrigin(0, 0); // fondo azul con rectángulo

        this.add.image(this.scale.width / 2, this.scale.height / 2 - 100 * 1 , 'titulo').setScale(0.7 * 1);

        const texto = this.add.text(this.scale.width / 2,this.scale.height / 2 + 300 * 1 ,'Toca la pantalla o pulsa cualquier tecla',{ fontSize: tamanoFuente, color: '#ffffff',fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},}).setOrigin(0.5);
        //const backGroundAudio = this.sound.add('backgroundSound', { loop: false });

        const backGroundAudio = this.sound.add('backgroundSound', {
            loop: true,
            volume: 0.2,
            loop: false ,
        });

        const avanzar = () => {
            if (this.soundIsOn) return; //salir si suena
            this.soundIsOn = true; //Hace que no se duplique el sonido al picar mas veces
            backGroundAudio.play();
            this.time.delayedCall(1400, () => {
                backGroundAudio.stop();
                this.scene.start('HistoriaInicialScene');
            });
        };

        this.input.keyboard.on('keydown', avanzar);
        this.input.on('pointerdown', avanzar);
    }
}

export default InicioScene;
