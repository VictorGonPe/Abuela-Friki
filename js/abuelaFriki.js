// Configuración básica del juego - mediante un JSON
var config = {
    type: Phaser.AUTO, // Usará webGL y si no admite navegador Canvas
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE, // Escala para ajustar a diferentes pantallas
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 }, // gravedad de la tierra
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
let movingPlatformC, movingPlatformL, movingPlatformR;  // Variable para la plataforma móvil
var cursors;
var leftZone, rightZone, upZone; // Control de zonas táctiles

var game = new Phaser.Game(config); //Inicializo el juego

function preload () {  // Función principal de carga de imágenes y recursos
    //this -> se refiere al mismo juego
    this.load.image('background', 'assets/background.png');
    this.load.image('suelo', 'assets/platform.png'); // Cargar suelo
    //this.load.spritesheet('abuela', 'assets/abuelaSprite.png', { frameWidth: 250, frameHeight: 343 });  
    this.load.spritesheet('abuela', 'assets/abuelaSprite2.png', { frameWidth: 294, frameHeight: 378 }); 
    this.load.image('plataformasL', 'assets/platformLeft.png'); // Cargar plataformas
    this.load.image('plataformasR', 'assets/platformRight.png'); 
    this.load.image('plataformasC', 'assets/platformCenter.png'); 
}

function create () {
    // Añadir fondo
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(window.innerWidth, window.innerHeight); //Colocamos el background modificando su centro "setOrigin"

    this.add.tileSprite(0, config.height - 120, config.width, 0, 'suelo').setOrigin(0,0);
    // Crear grupo de plataformas, incluido el suelo
    platforms = this.physics.add.staticGroup();
    platforms.create(window.innerWidth / 2, window.innerHeight - 50, 'suelo').setDisplaySize(window.innerWidth, 140).refreshBody(); // Suelo
    //platforms.create(0,config.height - 33,config.width + 15, 2688, 'suelo').setOrigin(0,0);
    
    // Añadir otras plataformas
    platforms.create(300, 900, 'plataformasL').setScale(0.1).refreshBody();
    platforms.create(345, 900, 'plataformasC').setScale(0.1).refreshBody();
    platforms.create(390, 900, 'plataformasR').setScale(0.1).refreshBody();



    platforms.create(700, 850, 'plataformasL').setScale(0.1).refreshBody();
    platforms.create(745, 850, 'plataformasC').setScale(0.1).refreshBody();
    platforms.create(790, 850, 'plataformasC').setScale(0.1).refreshBody();
    platforms.create(835, 850, 'plataformasC').setScale(0.1).refreshBody();
    platforms.create(880, 850, 'plataformasR').setScale(0.1).refreshBody(); 

   // Crear la plataforma móvil
   movingPlatformL = this.physics.add.image(455, 730, 'plataformasL').setScale(0.11).refreshBody();
   movingPlatformC = this.physics.add.image(500, 730, 'plataformasC').setScale(0.11).refreshBody();
   movingPlatformR = this.physics.add.image(545, 730, 'plataformasR').setScale(0.11).refreshBody();

   // Desactivar la gravedad para la plataforma móvil
   movingPlatformL.body.setAllowGravity(false);
   movingPlatformC.body.setAllowGravity(false);
   movingPlatformR.body.setAllowGravity(false);

   // Configurar la plataforma para que se mueva horizontalmente
   movingPlatformL.setImmovable(true);  // Hacerla inamovible por colisiones
   movingPlatformL.setVelocityX(100);  // Velocidad inicial hacia la derecha
   movingPlatformR.setImmovable(true); 
   movingPlatformR.setVelocityX(100);
   movingPlatformC.setImmovable(true); 
   movingPlatformC.setVelocityX(100);


    
    // Crear el jugador (Abuela)
    player = this.physics.add.sprite(100, 250, 'abuela').setScale(0.4);

    // Configurar físicas del jugador
    player.setBounce(0.2); //rebote
    player.setCollideWorldBounds(true);

   // Añadir colisión entre el jugador y las plataformas estáticas
   this.physics.add.collider(player, platforms);

   // Añadir colisión entre el jugador y la plataforma móvil
   this.physics.add.collider(player, movingPlatformL);
   this.physics.add.collider(player, movingPlatformC);
   this.physics.add.collider(player, movingPlatformR);



    // Animaciones de la abuela
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('abuela', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'abuela', frame: 21 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('abuela', { start: 0, end: 20 }),
        frameRate: 21,
        repeat: -1
    });

    // Habilitar teclas de control
    cursors = this.input.keyboard.createCursorKeys();

    // Crear zonas táctiles para mover al jugador
    createTouchControls(this);
    
    // Colisiones entre el jugador y las plataformas
    this.physics.add.collider(player, platforms);

    // Añadir colisión entre el jugador y la plataforma móvil
    this.physics.add.collider(player, movingPlatformL);
    this.physics.add.collider(player, movingPlatformC);
    this.physics.add.collider(player, movingPlatformR);
}



function update () {
    // Controlar el movimiento horizontal del jugador con teclas
    if (cursors.left.isDown) {
        player.setVelocityX(-300);  // Mover a la izquierda
        player.anims.play('left', true);  // Animación de caminar hacia la izquierda
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(150);  // Mover a la derecha
        player.anims.play('right', true);  // Animación de caminar hacia la derecha
    }
    else {
        player.setVelocityX(0);  // Pararse si no se pulsa ninguna tecla
        player.anims.play('turn');  // Animación de quedarse quieto
    }

    // Controlar el salto del jugador
    if (cursors.up.isDown && player.body.touching.down) { 
        player.setVelocityY(-630);  // Aplicar un impulso hacia arriba para el salto
    }

    // Cambiar la dirección de la plataforma cuando alcance ciertos límites
    if (movingPlatformL.x >= 700) {  // Limite derecho
        movingPlatformL.setVelocityX(-100); // Mover hacia la izquierda
        movingPlatformC.setVelocityX(-100);
        movingPlatformR.setVelocityX(-100);  
    } else if (movingPlatformL.x <= 300) {  // Limite izquierdo
        movingPlatformL.setVelocityX(100); // Mover hacia la derecha
        movingPlatformC.setVelocityX(100);
        movingPlatformR.setVelocityX(100);  
    }


}


// Función para crear controles táctiles
function createTouchControls(scene) {
    // Zonas para mover al jugador a la izquierda, derecha y saltar
    leftZone = scene.add.zone(0, 0, window.innerWidth / 3, window.innerHeight);
    rightZone = scene.add.zone(window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight);
    upZone = scene.add.zone(2 * window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight);

    // Habilitar interacción táctil
    leftZone.setInteractive().on('pointerdown', () => player.setVelocityX(-300));
    rightZone.setInteractive().on('pointerdown', () => player.setVelocityX(300));
    upZone.setInteractive().on('pointerdown', () => {
        if (player.body.touching.down) {
            player.setVelocityY(-630); // Aplicar un impulso hacia arriba para el salto
        }
    });

    // Cuando se suelta la pantalla, detener el movimiento
    scene.input.on('pointerup', () => {
        player.setVelocityX(0); // Detener al jugador
    });
}