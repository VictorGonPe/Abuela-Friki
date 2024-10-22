// Configuración básica del juego
var config = {
    type: Phaser.AUTO, //Usará webGL y si no admite navegador Canvas
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,    // Escala para ajustar a diferentes pantallas
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 }, //gravedad de la tierra
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var platforms;
var cursors;
var touchControls; // Control para táctil

var game = new Phaser.Game(config);

function preload () {
    // Cargar imágenes y recursos
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('abuela', 'assets/abuelaSprite.png', { frameWidth: 71, frameHeight: 100 });  
    //this.load.image('dust', 'assets/polvo.png');// Cargar el sprite de partículas
}

function create () {
    // Añadir fondo
    this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background').setDisplaySize(window.innerWidth, window.innerHeight);

    // Crear el suelo en la posición central horizontal
    this.ground = this.physics.add.staticImage(window.innerWidth / 2, window.innerHeight - 40, 'ground');

    // Crear grupo de plataformas
    platforms = this.physics.add.staticGroup();

    // Añadir plataformas
    //platforms.create(0, window.innerWidth/2, 'ground').setScale(1).refreshBody();
    //platforms.create(window.innerWidth / 2, window.innerHeight - 40, 'ground');
    //platforms.create(50, 250, 'ground');
    //platforms.create(750, 220, 'ground');

    // Crear el jugador (Abuela)
    player = this.physics.add.sprite(100, 450, 'abuela');

    // Configurar físicas del jugador
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Animaciones de la abuela
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('abuela', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'abuela', frame: 6 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('abuela', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // Habilitar teclas de control y táctil
    cursors = this.input.keyboard.createCursorKeys();
    touchControls = this.input.addPointer(); // Soporte táctil

    // Colisiones entre el jugador y las plataformas
    this.physics.add.collider(player, platforms);
}

function update () {
    // Controlar el movimiento horizontal del jugador
    if (cursors.left.isDown || touchControls.isDown) {
        player.setVelocityX(-300);  // Mover a la izquierda
        player.anims.play('left', true);  // Animación de caminar hacia la izquierda
    }
    else if (cursors.right.isDown || touchControls.isDown) {
        player.setVelocityX(300);  // Mover a la derecha
        player.anims.play('right', true);  // Animación de caminar hacia la derecha
    }
    else {
        player.setVelocityX(0);  // Pararse si no se pulsa ninguna tecla
        player.anims.play('turn');  // Animación de quedarse quieto
    }

  
    // Controlar el salto del jugador
    if (cursors.up.isDown && player.body.touching.down) { 
        //Añadir sonido de salto
        player.setVelocityY(-630);  // Aplicar un impulso hacia arriba para el salto
  

    }
}
