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
            debug: false  // Activar el modo de depuración para ver colisiones y límites
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
let movingPlatformC, movingPlatformL, movingPlatformR; // Variables para plataformas móviles
var cursors;
var leftZone, rightZone, upZone; // Control de zonas táctiles
var currentControl = 'keyboard'; // Variable para cambiar de controles táctiles a teclado
var backgroundMountain, backgroundCiudad; // Variables para los fondos parallax

const LEVEL_WIDTH = 5500; // Ancho total del nivel
var game = new Phaser.Game(config); // Inicializo el juego

function preload() {
    // Cargar recursos
    this.load.image('backgroundMountain', 'assets/backgroundMountain.png'); // Fondo montañoso
    this.load.image('backgroundCiudad', 'assets/backgroundCiudad.png'); // Fondo ciudad
    this.load.image('suelo', 'assets/platform.png'); // Cargar suelo
    this.load.spritesheet('abuela', 'assets/abuelaSprite2.png', { frameWidth: 294, frameHeight: 378 }); 
    this.load.image('plataformasL', 'assets/plataformaBarnaIzq.png'); // Cargar plataformas
    this.load.image('plataformasR', 'assets/plataformaBarnaDer.png'); 
    this.load.image('plataformasC', 'assets/plataformaBarnaC.png'); 
    this.load.image('monumento1', 'assets/colon1.png');
    this.load.image('monumento2', 'assets/torresMafre1.png');
    this.load.image('monumento3', 'assets/sagradaFamilia1.png');
    this.load.image('monumento4', 'assets/torreGlorias1.png');
    this.load.image('monumento5', 'assets/tresTorres1.png');
}

function create() {
    // Definir el tamaño del mundo del juego
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);

    // Fondo azul cielo que ocupa todo el nivel
    this.add.rectangle(0, 0, LEVEL_WIDTH, window.innerHeight, 0x42aaff).setOrigin(0, 0);

    // Fondo montañoso que se moverá lentamente
    backgroundMountain = this.add.tileSprite(0, 0, LEVEL_WIDTH, window.innerHeight, 'backgroundMountain')
        .setOrigin(0, 0)
        .setScrollFactor(0);

    // Fondo de ciudad que se moverá más rápido
    backgroundCiudad = this.add.tileSprite(0, 0, LEVEL_WIDTH, window.innerHeight, 'backgroundCiudad')
        .setOrigin(0, 0)
        .setScrollFactor(0);


    //Monumentos // Ajustar según la altura del suelo
    monumento = this.add.image(1100, window.innerHeight - 140, 'monumento1').setOrigin(0.5, 1); // Anclar la parte inferior del monumento al suelo
    monumento = this.add.image(2100, window.innerHeight - 90, 'monumento2').setOrigin(0.5, 1); 
    monumento = this.add.image(3100, window.innerHeight - 140, 'monumento3').setOrigin(0.5, 1); 
    monumento = this.add.image(4100, window.innerHeight - 130, 'monumento4').setOrigin(0.5, 1); 
    monumento = this.add.image(5100, window.innerHeight - 130, 'monumento5').setOrigin(0.5, 1); 
     


    monumento.depth = 0; // Asegurarnos de que se renderice detrás del jugador y plataformas



    // Crear grupo de plataformas, incluido el suelo
    platforms = this.physics.add.staticGroup();
    //platforms.depth = 1;
    platforms.create(LEVEL_WIDTH / 2, window.innerHeight - 50, 'suelo').setDisplaySize(LEVEL_WIDTH, 140).refreshBody();

    // Añadir plataformas fijas
    platforms.create(300, 900, 'plataformasL').setScale(0.35).refreshBody();
    platforms.create(345, 900, 'plataformasC').setScale(0.35).refreshBody();
    platforms.create(390, 900, 'plataformasR').setScale(0.35).refreshBody();

    platforms.create(700, 850, 'plataformasL').setScale(0.35).refreshBody();
    platforms.create(745, 850, 'plataformasC').setScale(0.35).refreshBody();
    platforms.create(790, 850, 'plataformasC').setScale(0.35).refreshBody();
    platforms.create(835, 850, 'plataformasC').setScale(0.35).refreshBody();
    platforms.create(880, 850, 'plataformasR').setScale(0.35).refreshBody();

    // Crear plataformas móviles
    movingPlatformL = this.physics.add.image(455, 730, 'plataformasL').setScale(0.35).refreshBody();
    movingPlatformC = this.physics.add.image(500, 730, 'plataformasC').setScale(0.35).refreshBody();
    movingPlatformR = this.physics.add.image(545, 730, 'plataformasR').setScale(0.35).refreshBody();

    // Desactivar la gravedad para la plataforma móvil
    [movingPlatformL, movingPlatformC, movingPlatformR].forEach(platform => {
        platform.body.setAllowGravity(false).setImmovable(true).setVelocityX(100);;
    });


    // Crear el jugador
    player = this.physics.add.sprite(100, 250, 'abuela').setScale(0.4);

    // Configurar físicas del jugador
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Hacer que la cámara siga al jugador
    this.cameras.main.startFollow(player);

    // Añadir colisiones
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, movingPlatformL);
    this.physics.add.collider(player, movingPlatformC);
    this.physics.add.collider(player, movingPlatformR);

    // Animaciones de la abuela
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('abuela', { start: 0, end: 20 }),
        frameRate: 30,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'abuela', frame: 21 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('abuela', { start: 0, end: 20 }),
        frameRate: 30,
        repeat: -1
    });

    // Habilitar controles
    cursors = this.input.keyboard.createCursorKeys();
    if (this.sys.game.device.input.touch) {
        createTouchControls(this);
    }
}

function update() {
    if (currentControl === 'keyboard') {
        // Controlar movimiento horizontal
        if (cursors.left.isDown) {
            player.setVelocityX(-300);
            player.anims.play('left', true);
            player.flipX = true;
        } else if (cursors.right.isDown) {
            player.setVelocityX(300);
            player.anims.play('right', true);
            player.flipX = false;
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        // Salto del jugador
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-630);
        }
    }

    // Fondos parallax
    const maxScrollX = LEVEL_WIDTH - window.innerWidth; //Calcula el desplazamiento dependiendo del ancho de la ventana

    if (this.cameras.main.scrollX < maxScrollX) {
        backgroundMountain.tilePositionX = this.cameras.main.scrollX * 0.2; // Movimiento lento
        backgroundCiudad.tilePositionX = this.cameras.main.scrollX * 0.4; // Movimiento rápido
        monumento.tilePositionX = 1200 - this.cameras.main.scrollX * 0.5;
    }

    // Cambiar dirección de plataformas móviles
    if (movingPlatformL.x >= 700) {
        movingPlatformL.setVelocityX(-100);
        movingPlatformC.setVelocityX(-100);
        movingPlatformR.setVelocityX(-100);
    } else if (movingPlatformL.x <= 300) {
        movingPlatformL.setVelocityX(100);
        movingPlatformC.setVelocityX(100);
        movingPlatformR.setVelocityX(100);
    }
}

// Función para controles táctiles
function createTouchControls(scene) {
    // Crear zonas táctiles
    leftZone = scene.add.zone(0, 0, window.innerWidth / 3, window.innerHeight);
    rightZone = scene.add.zone(window.innerWidth / 3, 0, window.innerWidth / 3, window.innerHeight);
    upZone = scene.add.zone((2 * window.innerWidth) / 3, 0, window.innerWidth / 3, window.innerHeight);

    // Habilitar interacción táctil
    leftZone.setInteractive().on('pointerdown', () => {
        currentControl = 'touch';
        player.setVelocityX(-300);
    });

    rightZone.setInteractive().on('pointerdown', () => {
        currentControl = 'touch';
        player.setVelocityX(300);
    });

    upZone.setInteractive().on('pointerdown', () => {
        currentControl = 'touch';
        if (player.body.touching.down) {
            player.setVelocityY(-630);
        }
    });

    // Detener movimiento al soltar
    scene.input.on('pointerup', () => {
        currentControl = 'keyboard';
        player.setVelocityX(0);
    });
}
