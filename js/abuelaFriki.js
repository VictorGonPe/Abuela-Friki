/**
 * Nombre del archivo: abuelaFriki.js
 * Autor: Víctor González Pérez
 * Fecha de creación: 2024-2025
 * Descripción: Desarrollo Abuela Friki
 * Derechos de autor (c) 2024, Víctor González Pérez
*/
import Monumento from './monumento.js';
import Enemigos from './enemigos.js';



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
            debug: false  // Activar el modo de depuración para ver colisiones y límites
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
let monumentoManager;
let enemigosManager;
let isInvulnerable = false; //Para que no dañen continuamente a la abuela
//PUNTOS Y SALUD
let puntosTexto;
let puntos = 0;
let barraSalud;
let salud = 100; //Salud Incial





const LEVEL_WIDTH = 6500 * altScale; // Ancho total del nivel
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

    this.load.spritesheet('paloma', 'assets/paloma.png', {frameWidth: 370, frameHeight: 390});
    this.load.spritesheet('explosion', 'assets/explosion.png', {frameWidth: 298, frameHeight: 300});
    this.load.spritesheet('patinete', 'assets/patinete.png', {frameWidth: 313.3, frameHeight: 360});
}

function create() { //____________________________CREATE__________________________________________________________________________________________
    // Definir el tamaño del mundo del juego y de la camara
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    //const mountainAspectRatio = 1797 / 1080;
    //const cityAspectRatio = 1815 / 1080;

    // Fondo azul cielo que ocupa todo el nivel ________________________FONDOS___________________________________
    this.add.rectangle(0, 0, LEVEL_WIDTH, window.innerHeight, 0x42aaff).setOrigin(0, 0);
    // Fondo montañoso que se moverá lentamente
    backgroundMountain = this.add.tileSprite(0, 0, LEVEL_WIDTH / altScale, 1080, 'backgroundMountain').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);
    // Fondo de ciudad que se moverá más rápido
    backgroundCiudad = this.add.tileSprite(0, 0 , LEVEL_WIDTH /altScale, 1080, 'backgroundCiudad').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);
    //Instancia y creacion de monumentos
    monumentoManager = new Monumento(this, altScale); //Esta escena y la escala
    monumentoManager.crearMonumentos();

    // Crear grupo de plataformas, incluido el suelo__________________PLATAFORMAS_______________________________
    platforms = this.physics.add.staticGroup();
    //platforms.depth = 1;
    platforms.create(LEVEL_WIDTH / 2, window.innerHeight - 50  * altScale, 'suelo').setDisplaySize(LEVEL_WIDTH, 140  * altScale).refreshBody();

    // Añadir plataformas fijas
    platforms.create(300 * altScale, 800 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    platforms.create(360 * altScale, 800 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(420 * altScale, 800 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    platforms.create(700 * altScale, 850 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    platforms.create(760 * altScale, 850 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(816 * altScale, 850 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(872 * altScale, 850 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(930 * altScale, 850 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    // Crear plataformas móviles
    movingPlatformL = this.physics.add.image(455 * altScale, 730 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    movingPlatformC = this.physics.add.image(515 * altScale, 730 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    movingPlatformR = this.physics.add.image(575 * altScale, 730 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    // Desactivar la gravedad para la plataforma móvil
    [movingPlatformL, movingPlatformC, movingPlatformR].forEach(platform => {
        platform.body.setAllowGravity(false).setImmovable(true).setVelocityX(100 * altScale);;
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

    // Anims: propiedad de phaser para animar. Animaciones de la abuela
    this.anims.create({
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

    // __________________________________PALOMAS__________________________________________
    // Instancia a la clase
    enemigosManager = new Enemigos(this, altScale);
    // Animación de las palomas volar
    this.anims.create({
        key: 'volar',
        frames: this.anims.generateFrameNumbers('paloma', { start: 0, end: 5 }),
        frameRate: 15,
        repeat: -1 // Animación en bucle
    });
        //Creación de palomas
        enemigosManager.crearPalomas(10);
        // Crear colisión entre las palomas y la abuela
    this.physics.add.overlap(enemigosManager.palomas, this.player, colisionPaloma, null, this);
    // Animación de las palomas explosión
    this.anims.create({
        key: 'efectoExplosion',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }), // Ajusta los frames si es necesario
        frameRate: 10, // Velocidad de la animación
        repeat: 0 // No repetir, se ejecuta una sola vez
    });

    
    // __________________________________PATINETES__________________________________________

    // Animación mover patinetes
    this.anims.create({
        key: 'moverPatinete',
        frames: this.anims.generateFrameNumbers('patinete', { start: 0, end: 5 }),
        frameRate: 6,
        repeat: -1 // Animación en bucle
    });
    enemigosManager.crearPatinetes(1); //Crear patinetes
    // Crear colisiones entre los patinetes y el suelo
    this.physics.add.collider(enemigosManager.patinetes, platforms);
    this.physics.add.overlap(enemigosManager.patinetes, this.player, colisionPatinete, null, this); //overlap lanza un evento

    // Habilitar controles
    cursors = this.input.keyboard.createCursorKeys();
    if (this.sys.game.device.input.touch) {
        createTouchControls(this);
    }

    // __________________________________PUNTOS Y SALUD__________________________________________
    // Mostrar los puntos en la esquina superior izquierda
    puntosTexto = this.add.text(16, 16, `Puntos: ${puntos}`, {fontSize: '30px',fill: '#ffffff',fontFamily: 'Arial',}).setScrollFactor(0).setScale(0.8 * altScale); // Para que no se mueva con la cámara

    // Crear un objeto de gráficos para la barra de salud
    barraSalud = this.add.graphics().setScrollFactor(0);
    // Dibujar la barra de salud inicial
    actualizarBarraSalud(salud);

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
        //monumento.tilePositionX = 1200 - this.cameras.main.scrollX * 0.5;
    }

    // Actualizar posición de los monumentos con el scroll de la cámara
    const scrollX = this.cameras.main.scrollX;
    monumentoManager.actualizar(scrollX);
    enemigosManager.actualizar(scrollX);

    // Cambiar dirección de plataformas móviles
    if (movingPlatformL.x >= 700 * altScale) {
        movingPlatformL.setVelocityX(-100 * altScale);
        movingPlatformC.setVelocityX(-100 * altScale);
        movingPlatformR.setVelocityX(-100 * altScale);
    } else if (movingPlatformL.x <= 300 * altScale) {
        movingPlatformL.setVelocityX(100 * altScale);
        movingPlatformC.setVelocityX(100 * altScale);
        movingPlatformR.setVelocityX(100 * altScale);
    }

    
}


//________________________________________________________OTRAS FUNCIONES______________________________________________________

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


// Función de colisión entre las palomas y la abuela
function colisionPaloma(player, paloma) {

    if (isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    salud -= 10; // Reducir la salud
    if (salud < 0) salud = 0; // Asegurar que no sea negativa
    actualizarBarraSalud(salud); // Actualizar la barra de salud

    // Crear la animación de explosión en la posición de la paloma
    const explosion = this.add.sprite(paloma.x, paloma.y, 'explosion')
        .setScale(0.5 * altScale)
        //.setDepth(10); // Asegurar que esté visible sobre otros elementos

    explosion.play('efectoExplosion', true);

    // Verificar eventos de animación
    explosion.on('animationstart', () => console.log('Animación iniciada'));
    explosion.on('animationcomplete', () => {
        console.log('Animación completada');
        explosion.destroy(); // Destruir el sprite tras la animación
    });

    // Hacer a la abuela invulnerable
    isInvulnerable = true;

    for (let i = 0; i < 5; i++) {
        this.time.delayedCall(200 * i, () => {
            player.visible = !player.visible; // Alternar visibilidad
        });
    }
    // Asegurarse de que quede visible al final del parpadeo
    this.time.delayedCall(1000, () => {
        player.visible = true;
        isInvulnerable = false; // Termina invulnerabilidad
    });

    paloma.destroy(); // Destruir la paloma

    // Sumar puntos y actualizar el texto
    puntos += 10; // Añadir 10 puntos
    puntosTexto.setText(`Puntos: ${puntos}`);


}



// Función de colisión entre los patinetes y la abuela
function colisionPatinete(player, patinete) {
    if (isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    salud -= 30; // Reducir la salud
    if (salud < 0) salud = 0; // Asegurar que no sea negativa
    actualizarBarraSalud(salud); // Actualizar la barra de salud
    
    // Reducir puntos
    puntos -= 20;
    if (puntos < 0) puntos = 0;
    puntosTexto.setText(`Puntos: ${puntos}`);
    
    // Hacer a la abuela invulnerable
    isInvulnerable = true;
    player.setTint(0xff0000); // Cambiar color como indicativo de daño

    // Hacer que parpadee durante el período de invulnerabilidad
    for (let i = 0; i < 5; i++) {
        this.time.delayedCall(200 * i, () => {
            player.visible = !player.visible; // Alternar visibilidad
        });
    }

    // Restaurar visibilidad y eliminar invulnerabilidad después del tiempo
    this.time.delayedCall(1000, () => {
        player.visible = true; // Asegurarse de que sea visible
        isInvulnerable = false; // Termina invulnerabilidad
        player.clearTint(); // Quitar el color
    });
}


function actualizarBarraSalud(valor) {
    barraSalud.clear(); // Limpia el gráfico anterior

    barraSalud.fillStyle(0xD4AF37); // Color negro
    barraSalud.fillRect(16, 46, 208, 28); // Posición (20, 20), ancho 200px, alto 20px

    // Dibujar el fondo de la barra
    barraSalud.fillStyle(0x000000); // Color negro
    barraSalud.fillRect(20, 50, 200, 20); // Posición (20, 20), ancho 200px, alto 20px

    // Dibujar la barra de salud actual
    barraSalud.fillStyle(0xff0000); // Color rojo
    barraSalud.fillRect(20, 50, (200 * valor) / 100, 20); // Escalar ancho según la salud
}
