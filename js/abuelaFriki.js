// Configuración básica del juego - mediante un JSON
// Escala basada en la altura de la pantalla
const altScale = window.innerHeight / 1080; // Referencia de diseño: 1080px de altura
var config = {
    type: Phaser.AUTO, // Usará webGL y si no admite navegador Canvas
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE, // Escala para ajustar a diferentes pantallas
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { //Añade las físicas
        default: 'arcade',
        arcade: {
            gravity: { y: 980 * altScale}, // gravedad de la tierra
            debug: true  // Activar el modo de depuración para ver colisiones y límites
        }
    },
    scene: { //Funciones de phaser para crear la escena
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


const LEVEL_WIDTH = 5500 * altScale; // Ancho total del nivel
var game = new Phaser.Game(config); // Inicializo el juego

function preload() {
    // Cargar recursos
    this.load.image('backgroundMountain', 'assets/backgroundMountain.png'); // Fondo montañoso
    this.load.image('backgroundCiudad', 'assets/backgroundCiudad.png'); // Fondo ciudad
    this.load.image('suelo', 'assets/platform.png'); // Cargar suelo
    //this.load.spritesheet('abuela', 'assets/abuelaSprite2.png', { frameWidth: 294, frameHeight: 378 }); 
    //this.load.spritesheet('abuelaMovimiento','assets/abuelaSpriteSheet.png', {frameWidth: 363, frameHeight: 378});
    this.load.spritesheet('abuelaMovimiento1', 'assets/abuelaAndar.png', {frameWidth: 363,frameHeight: 378});
    this.load.spritesheet('abuelaMovimiento2', 'assets/abuelaSalto.png', {frameWidth: 363,frameHeight: 374});
    this.load.spritesheet('abuelaQuieta', 'assets/abuelaIdle.png', {frameWidth: 363,frameHeight: 378});
    
    this.load.image('plataformasL', 'assets/plataformaBarnaIzq.png'); // Cargar plataformas
    this.load.image('plataformasR', 'assets/plataformaBarnaDer.png'); 
    this.load.image('plataformasC', 'assets/plataformaBarnaC.png'); 

    this.load.image('monumento1', 'assets/colon1.png');
    this.load.image('monumento2', 'assets/torresMafre1.png');
    this.load.image('monumento3', 'assets/sagradaFamilia1.png');
    this.load.image('monumento4', 'assets/torreGlorias1.png');
    this.load.image('monumento5', 'assets/tresTorres1.png');

    this.load.image('nube1', 'assets/nube1.png', {frameWidth: 205, frameHeight: 98});
    this.load.image('nube2', 'assets/nube2.png', {frameWidth: 286, frameHeight: 103});
    this.load.image('nube3', 'assets/nube3.png', {frameWidth: 184, frameHeight: 104});


}

function create() { //____________________________CREATE__________________________________________________________________________________________
    // Definir el tamaño del mundo del juego y de la camara
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
   
    

    //const mountainAspectRatio = 1797 / 1080;
    //const cityAspectRatio = 1815 / 1080;

    // Fondo azul cielo que ocupa todo el nivel
    this.add.rectangle(0, 0, LEVEL_WIDTH, window.innerHeight, 0x42aaff).setOrigin(0, 0);

    // Fondo montañoso que se moverá lentamente
    backgroundMountain = this.add.tileSprite(0, 0, LEVEL_WIDTH / altScale, 1080, 'backgroundMountain').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);

    // Fondo de ciudad que se moverá más rápido
    backgroundCiudad = this.add.tileSprite(0, 0 , LEVEL_WIDTH /altScale, 1080, 'backgroundCiudad').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);



    //Monumentos // Ajustar según la altura del suelo
    monumento = this.add.image(1100 * altScale, window.innerHeight - 140 * altScale, 'monumento1').setOrigin(0.5, 1).setScale(0.5  * altScale); // Anclo la parte inferior del monumento al suelo
    monumento = this.add.image(2100 * altScale, window.innerHeight - 90 * altScale, 'monumento2').setOrigin(0.5, 1).setScale(0.5  * altScale); 
    monumento = this.add.image(3100 * altScale, window.innerHeight - 140 * altScale, 'monumento3').setOrigin(0.5, 1).setScale(0.5  * altScale); 
    monumento = this.add.image(4100 * altScale, window.innerHeight - 130 * altScale, 'monumento4').setOrigin(0.5, 1).setScale(0.5  * altScale); 
    monumento = this.add.image(5100 * altScale, window.innerHeight - 130 * altScale, 'monumento5').setOrigin(0.5, 1).setScale(0.5  * altScale); 
     


    monumento.depth = 0; // Asegurarnos de que se renderice detrás del jugador y plataformas



    // Crear grupo de plataformas, incluido el suelo
    platforms = this.physics.add.staticGroup();
    //platforms.depth = 1;
    platforms.create(LEVEL_WIDTH / 2, window.innerHeight - 50  * altScale, 'suelo').setDisplaySize(LEVEL_WIDTH, 140  * altScale).refreshBody();

    // Añadir plataformas fijas
    platforms.create(300 * altScale, 800 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    platforms.create(360 * altScale, 800 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(420 * altScale, 800 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    platforms.create(700, 850, 'plataformasL').setScale(0.45).refreshBody();
    platforms.create(760, 850, 'plataformasC').setScale(0.45).refreshBody();
    platforms.create(816, 850, 'plataformasC').setScale(0.45).refreshBody();
    platforms.create(872, 850, 'plataformasC').setScale(0.45).refreshBody();
    platforms.create(930, 850, 'plataformasR').setScale(0.45).refreshBody();

    // Crear plataformas móviles
    movingPlatformL = this.physics.add.image(455, 730, 'plataformasL').setScale(0.45).refreshBody();
    movingPlatformC = this.physics.add.image(515, 730, 'plataformasC').setScale(0.45).refreshBody();
    movingPlatformR = this.physics.add.image(575, 730, 'plataformasR').setScale(0.45).refreshBody();

    // Desactivar la gravedad para la plataforma móvil
    [movingPlatformL, movingPlatformC, movingPlatformR].forEach(platform => {
        platform.body.setAllowGravity(false).setImmovable(true).setVelocityX(100);;
    });



    // __________________________________CREAR ABUELA___________________________________________
    //this.player = this.physics.add.sprite(100, 250, 'abuela').setScale(0.4);
    this.player = this.physics.add.sprite(150 * altScale, 250 * altScale, 'abuelaMovimiento1').setScale(0.4 * altScale).setOrigin(0.5,1);

    // Ajustar el cuerpo físico del jugador
    this.player.body.setSize(150, 320).setOffset(50 * altScale, 50 * altScale); // Ajusta tamaño y desplazamiento
    // Configurar físicas del jugador
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true); //Evita que se salgo de los limites del escenario
    //const playerScale = this.scale.height / 800;// Escala el personaje segun el tamaño de la pantalla
    //player.setScale(playerScale);

    // Hacer que la cámara siga al jugador
    this.cameras.main.startFollow(this.player);

    // Añadir colisiones con objetos
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.player, movingPlatformL);
    this.physics.add.collider(this.player, movingPlatformC);
    this.physics.add.collider(this.player, movingPlatformR);


    this.anims.create({ // Anims: propiedad de phaser para animar. Animaciones de la abuela
        key: 'left',
        frames: this.anims.generateFrameNumbers('abuelaMovimiento1', { start: 0, end: 20 }),
        frameRate: 30,
        repeat: -1
    });

    this.anims.create({
        key: 'abuelaIdle',
        //frames: [{ key: 'abuelaQuieta', frame: 1}],
        frames: this.anims.generateFrameNumbers('abuelaQuieta', { start: 0, end: 12 }),
        frameRate: 4,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('abuelaMovimiento1', { start: 0, end: 20 }),
        frameRate: 30,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('abuelaMovimiento2', { start: 0, end: 20 }), // Rango para salto
        frameRate: 14,
        repeat: 0 // Sin bucle, se ejecuta una vez por salto
    });

    // Habilitar controles
    cursors = this.input.keyboard.createCursorKeys();
    if (this.sys.game.device.input.touch) {
        createTouchControls(this);
    }
}

function update() { //____________________________UPDATE__________________________________________________________________________________________

   
        //******* MOVIMIENTOS ********/
        if (currentControl === 'keyboard') {
        // Controlar si el jugador está en el aire
        let isOnGround = this.player.body.touching.down;

        // ABUELA -- Movimiento horizontal
        if (cursors.left.isDown) {
            this.player.setVelocityX(-300 * altScale);
            if (isOnGround) this.player.anims.play('left', true);
            this.player.flipX = true;
            //console.log('Mira a la izquierda');
            this.player.body.setOffset(150, 50); // Al hacer el flipX es necesario jugar con los offset para centrar cuerpo físico
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(300 * altScale);
            if (isOnGround) this.player.anims.play('right', true);
            this.player.flipX = false;
            this.player.body.setOffset(50, 50);
        } else {
            this.player.setVelocityX(0);
            if (isOnGround) this.player.anims.play('abuelaIdle', true); // Animación de reposo si está en el suelo
            if (this.player.flipX == true){  //Mira izquierda o derecha
                this.player.body.setOffset(150, 50);
            }else{
                this.player.body.setOffset(50, 50);
            }
        }

        // ABUELA -- Salto 
        if (cursors.up.isDown && isOnGround) {
            this.player.setVelocityY(-700  * altScale);
            this.player.anims.play('jump'); // Reproducir animación de salto una vez
            this.player.body.setOffset(150, 50);
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
        this.player.setVelocityX(-300);
    });

    rightZone.setInteractive().on('pointerdown', () => {
        currentControl = 'touch';
        this.player.setVelocityX(300);
    });

    upZone.setInteractive().on('pointerdown', () => {
        currentControl = 'touch';
        if (this.player.body.touching.down) {
            this.player.setVelocityY(-700);
        }
    });

    // Detener movimiento al soltar
    scene.input.on('pointerup', () => {
        currentControl = 'keyboard';
        this.player.setVelocityX(0);
    });
}
