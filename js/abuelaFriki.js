/*
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
var backgroundMountain, backgroundCiudad, indicadorVida, indicadorVida2; // Variables para los fondos parallax
let monumentoManager;
let enemigosManager;
let isInvulnerable = false; //Para que no dañen continuamente a la abuela
//PUNTOS Y SALUD
let puntosTexto;
let puntos = 0;
let barraSalud;
let salud = 100; //Salud Incial
let pastillas;

let galletasDisponibles = 10; // Número inicial de galletas
let galletasTexto; // Texto que mostrará cuántas galletas quedan
let galletaIcono; //PAra colocar la imagen
let frascosGalletas;


const LEVEL_WIDTH = 30000 * altScale; // Ancho total del nivel
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

    this.load.image('indicadorVida', 'assets/indicadorVida.png');
    this.load.image('indicadorVida2', 'assets/indicadorVida2.png');

    this.load.spritesheet('paracetamol', 'assets/paracetamol.png', {frameWidth: 550, frameHeight: 520});
    this.load.image('galleta', 'assets/galleta.png');
    this.load.image('frascoGalletas', 'assets/frascoGalletas.png');


    this.load.spritesheet('paloma', 'assets/paloma.png', {frameWidth: 370, frameHeight: 390});
    this.load.spritesheet('explosion', 'assets/explosion.png', {frameWidth: 298, frameHeight: 300});
    this.load.spritesheet('patinete', 'assets/patinete.png', {frameWidth: 313.3, frameHeight: 360});
    this.load.spritesheet('caca', 'assets/caca.png', {frameWidth: 345.5, frameHeight: 300});

    //__________________ESCENARIO____________________
    this.load.image('cartelBarcelona', 'assets/cartelBarcelona.png');
    this.load.image('quiosco1', 'assets/quiosco1.png');
    this.load.image('tiendaComic1','assets/tiendaComic1.png');
    this.load.image('panaderia1','assets/panaderia1.png');
    this.load.image('pescaderia1','assets/pescaderia2.png');
    this.load.image('carniceria1','assets/carniceria2.png');
    this.load.image('carpinteria1','assets/carpinteria1.png');
    this.load.image('badulaque1','assets/badulaque1.png');
}

function create() { //____________________________CREATE__________________________________________________________________________________________
    
    // Definir el tamaño del mundo del juego y de la camara
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    //const mountainAspectRatio = 1797 / 1080;
    //const cityAspectRatio = 1815 / 1080;
    console.log("Escena activa:", this);
    // Fondo azul cielo que ocupa todo el nivel ________________________FONDOS___________________________________
    this.add.rectangle(0, 0, LEVEL_WIDTH, window.innerHeight, 0x42aaff).setOrigin(0, 0);
    // Fondo montañoso que se moverá lentamente
    backgroundMountain = this.add.tileSprite(0, 0, LEVEL_WIDTH / altScale, 1080, 'backgroundMountain').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);
    // Fondo de ciudad que se moverá más rápido
    backgroundCiudad = this.add.tileSprite(0, 0 , LEVEL_WIDTH /altScale, 1080, 'backgroundCiudad').setOrigin(0, 0).setScrollFactor(0).setScale(1 * altScale);
    //Instancia y creacion de monumentos
    monumentoManager = new Monumento(this, altScale); //Esta escena y la escala
    monumentoManager.crearMonumentos();


    //__________________CREAR ESCENARIO____________________

    const cartelBarcelona = this.add.image(400 * altScale, window.innerHeight - 120 * altScale, 'cartelBarcelona').setScale(0.5 * altScale).setOrigin(0.5, 1);
    const quiosco1 = this.add.image(1000 * altScale, window.innerHeight - 140 * altScale, 'quiosco1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    const pescaderia1 = this.add.image(2250 * altScale, window.innerHeight - 180 * altScale, 'pescaderia1').setScale(0.6 * altScale).setOrigin(0.5, 1);
    const tiendaComic1 = this.add.image(1750 * altScale, window.innerHeight - 140 * altScale, 'tiendaComic1').setScale(0.6 * altScale).setOrigin(0.5, 1);
    const carniceria1 = this.add.image(3500 * altScale, window.innerHeight - 180 * altScale, 'carniceria1').setScale(0.6 * altScale).setOrigin(0.5, 1);
    const panaderia1 = this.add.image(2870 * altScale, window.innerHeight - 140 * altScale, 'panaderia1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    const carpinteria1 = this.add.image(4650 * altScale, window.innerHeight - 180 * altScale, 'carpinteria1').setScale(0.6 * altScale).setOrigin(0.5, 1);
    const badulaque1 = this.add.image(4050 * altScale, window.innerHeight - 140 * altScale, 'badulaque1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    
/*
const cartelBarcelona = this.add.image(400 * altScale, window.innerHeight - 140 * altScale, 'cartelBarcelona').setScale(0.3 * altScale).setOrigin(0.5, 1);
const quiosco1 = this.add.image(1000 * altScale, window.innerHeight - 160 * altScale, 'quiosco1').setScale(0.5 * altScale).setOrigin(0.5, 1);
const pescaderia1 = this.add.image(2250 * altScale, window.innerHeight - 200 * altScale, 'pescaderia1').setScale(0.4 * altScale).setOrigin(0.5, 1);
const tiendaComic1 = this.add.image(1750 * altScale, window.innerHeight - 160 * altScale, 'tiendaComic1').setScale(0.4 * altScale).setOrigin(0.5, 1);
const carniceria1 = this.add.image(3500 * altScale, window.innerHeight - 200 * altScale, 'carniceria1').setScale(0.4 * altScale).setOrigin(0.5, 1);
const panaderia1 = this.add.image(2870 * altScale, window.innerHeight - 160 * altScale, 'panaderia1').setScale(0.4 * altScale).setOrigin(0.5, 1);
const badulaque1 = this.add.image(4150 * altScale, window.innerHeight - 160 * altScale, 'badulaque1').setScale(0.4 * altScale).setOrigin(0.5, 1);
*/

    // Crear grupo de plataformas, incluido el suelo__________________PLATAFORMAS_______________________________
    platforms = this.physics.add.staticGroup();
    //platforms.depth = 1;
    platforms.create(LEVEL_WIDTH / 2, window.innerHeight - 50  * altScale, 'suelo').setDisplaySize(LEVEL_WIDTH, 140  * altScale).refreshBody();

    // Añadir plataformas fijas
    platforms.create(700 * altScale, 770 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    platforms.create(760 * altScale, 770 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(820 * altScale, 770 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    platforms.create(1000 * altScale, 650 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    platforms.create(1060 * altScale, 650 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(1116 * altScale, 650 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(1172 * altScale, 650 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    platforms.create(1230 * altScale, 650 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

    // Crear plataformas móviles
    movingPlatformL = this.physics.add.image(1455 * altScale, 530 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody();
    movingPlatformC = this.physics.add.image(1515 * altScale, 530 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody();
    movingPlatformR = this.physics.add.image(1575 * altScale, 530 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody();

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

    // __________________________________CACAS__________________________________________

    enemigosManager.crearCacas(5); // Crear cacas

    this.physics.add.collider(enemigosManager.cacas, platforms);// Colisiones suelo
    this.physics.add.overlap(enemigosManager.cacas, this.player, colisionCaca, null, this);  //detecta colisiones cacas

    
    



    // __________________________________GALLETAS__________________________________________
    // Crear un contenedor para mostrar la imagen de la galleta y el número de galletas
    galletaIcono = this.add.image(45 * altScale, 150 * altScale, 'galleta').setScale(0.2 * altScale).setScrollFactor(0);
    galletasTexto = this.add.text(85 * altScale, 140 * altScale, `= ${ galletasDisponibles}`, {
        fontSize: '30px',
        fill: '#ffffff',
        fontFamily: 'Arial',
    }).setScrollFactor(0).setScale(0.8 * altScale);


    // Crear grupo de frascos de galletas
    frascosGalletas = this.physics.add.group();

    //frascosGalletas.body.setSize(229,250).setOffset(50 * altScale, 50 * altScale);
    
    // Generar frascos de galletas en el nivel
    generarFrascosGalletas(3);
    

    // Colisión entre la abuela y los FRASCOS GALLETAS
    this.physics.add.overlap(this.player, frascosGalletas, (player, frasco) => {
        console.log('¡Has recogido un frasco de galletas!');
        galletasDisponibles += 10; // Incrementar galletas
        galletasTexto.setText(`${galletasDisponibles}`); // Actualizar texto
        frasco.destroy(); // Eliminar frasco recolectado
    });
    this.physics.add.collider(frascosGalletas, platforms);

    this.galletas = this.physics.add.group();

    this.keys = {
        lanzarGalleta: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X) // Lanzar galletas
    };

    // Colisiones de las galletas con enemigos
    // Colisiones de las galletas con enemigos
    this.physics.add.overlap(this.galletas, enemigosManager.palomas, (galleta, paloma) => {
        console.log('¡Galleta impactó una paloma!');
        galleta.destroy(); // Elimina la galleta

        // Crear la animación de explosión en la posición de la paloma
        const explosion = this.add.sprite(paloma.x, paloma.y, 'explosion').setScale(0.5 * altScale);

        explosion.play('efectoExplosion', true);

        // Destruir la paloma y el sprite de explosión tras la animación
        explosion.on('animationcomplete', () => {
        explosion.destroy();
        });

        paloma.destroy(); // Elimina la paloma
        puntos += 10; // Añadir puntos por destruir la paloma
        puntosTexto.setText(`Puntos: ${puntos}`);
    });


    this.physics.add.overlap(this.galletas, enemigosManager.patinetes, (galleta, patinete) => {
        console.log('¡Galleta impactó un patinete!');
        galleta.destroy(); // Elimina la galleta
        patinete.destroy(); // Elimina el patinete
    }); 

    this.lanzarGalleta = () => {
        if (galletasDisponibles > 0) {
            const galleta = this.galletas.create(this.player.x, this.player.y - 45, 'galleta').setScale(0.15 * altScale);
            galleta.setVelocityX(this.player.flipX ? -800 * altScale : 800 * altScale); // Dirección según la orientación del jugador
            galleta.body.allowGravity = false; // Desactivar gravedad de la galleta
    
            // Reducir la cantidad de galletas disponibles
            galletasDisponibles--;
            galletasTexto.setText(`${galletasDisponibles}`); // Actualizar el texto en pantalla
    
            // Destruir la galleta después de un tiempo
            this.time.delayedCall(3000, () => {
                galleta.destroy();
            });
        } else {
            console.log('No tienes galletas suficientes para lanzar.');
        }
    };
    
    


    // __________________________________PUNTOS, SALUD Y PASTILLAS__________________________________________
    // Mostrar los puntos en la esquina superior izquierda
    puntosTexto = this.add.text(25  * altScale, 12  * altScale, `Puntos: ${puntos}`, {fontSize: '30px',fill: '#ffffff',fontFamily: 'Arial',}).setScrollFactor(0).setScale(0.8 * altScale); // Para que no se mueva con la cámara
    
    indicadorVida = this.add.image(15 * altScale, 40 * altScale, 'indicadorVida').setOrigin(0,0).setScale(0.5 * altScale).setScrollFactor(0);
    
    // Crear un objeto de gráficos para la barra de salud
    barraSalud = this.add.graphics().setScrollFactor(0).setScale(1 * altScale);

    indicadorVida2 = this.add.image(15 * altScale, 40 * altScale, 'indicadorVida2').setOrigin(0,0).setScale(0.5 * altScale).setScrollFactor(0);
    
    // Dibujar la barra de salud inicial
    actualizarBarraSalud(salud);

    this.anims.create({
        key: 'brillarParacetamol',
        frames: this.anims.generateFrameNumbers('paracetamol', { start: 0, end: 9 }), // Ajusta los frames según el sprite sheet
        frameRate: 10, // Velocidad de la animación
        repeat: -1 // Animación en bucle
    });

    // Crear grupo de pastillas
    pastillas = this.physics.add.group();

    generarPastillas(3); // Genera 3 pastillas en posiciones aleatorias
   
    // Colisiones entre las pastillas y las plataformas
    this.physics.add.collider(pastillas, platforms);
    this.physics.add.overlap(this.player, pastillas, recogerPastilla, null, this); //abuela recoje pastilla

}

function update() { //____________________________UPDATE__________________________________________________________________________________________

   
    //******* MOVIMIENTOS ********/
    if (currentControl === 'keyboard') {
        // Controlar si el jugador está en el aire
        //console.log(this.player.body.touching.down);
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
        
        // ABUELA -- Lanzar galleta
        if (Phaser.Input.Keyboard.JustDown(this.keys.lanzarGalleta)) {
            this.lanzarGalleta(); // Lógica para lanzar galleta
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
    enemigosManager.actualizar(scrollX); //maneja a todos los enemigos

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

    if (salud <= 0){
        salud = 100;
        puntos = 0;
        isInvulnerable = false; // Asegurar que no quede invulnerable
        this.scene.restart(); // Reinicia la escena
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

   

    // Dibujar el fondo de la barra
    barraSalud.fillStyle(0x000000); // Color negro
    barraSalud.fillRect(80, 63, 140, 25); // Posición (20, 20), ancho 200px, alto 20px

    // Dibujar la barra de salud actual
    barraSalud.fillStyle(0xff0000); // Color rojo
    barraSalud.fillRect(80, 63, (140 * valor) / 100, 25); // Escalar ancho según la salud

    
}

function recogerPastilla(player, pastilla) {
    console.log('¡Has recogido una pastilla!');

    // Subir salud, pero no más de 100
    salud = Math.min(salud + 20, 100);

    actualizarBarraSalud(salud);
    pastilla.destroy();

}

function generarPastillas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(100, LEVEL_WIDTH - 100);
        const y = Phaser.Math.Between(100, window.innerHeight - 200);
        const pastilla = pastillas.create(x, y, 'paracetamol').setScale(0.1 * altScale).setBounce(0.5);
        //pastilla.body.setAllowGravity(false);
        pastilla.play('brillarParacetamol'); // Reproducir la animación
    }
}

function generarFrascosGalletas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(200, LEVEL_WIDTH - 200);
        const y = Phaser.Math.Between(100, window.innerHeight - 200);
        const frasco = frascosGalletas.create(x, y, 'frascoGalletas').setScale(0.3 * altScale).setBounce(0.5).setSize(210,200);
        frasco.body.setAllowGravity(true); // Sin gravedad para los frascos
    }
}


function colisionCaca(player, caca) {
    if (this.tocandoCaca) return; // Si ya está procesando una colisión, no hacer nada
    this.tocandoCaca = true; // Marcar como en colisión

    console.log('Colisión con caca');
    console.log('Player:', player);
    console.log('Caca:', caca);

    salud -= 15;
    if (salud < 0) salud = 0;
    actualizarBarraSalud(salud);

    player.setTint(0x964B00);
    this.time.delayedCall(500, () => {
        if (player) player.clearTint();
        this.tocandoCaca = false; // Permitir nuevas colisiones
    });

    if (caca && caca.body) {
        caca.body.enable = false;
        caca.removeAllListeners();
        caca.destroy();
    }
}



