import Monumento from '../monumento.js';
import Enemigos from '../enemigos.js';
import CollisionManager from '../collisionManager.js';

const altScale = window.innerHeight / 1080;
var player;
var platforms;
let movingPlatformC, movingPlatformL, movingPlatformR; // Variables para plataformas móviles
var cursors;
var leftZone, rightZone, upZone; // Control de zonas táctiles
var currentControl = 'keyboard'; // Variable para cambiar de controles táctiles a teclado
var backgroundMountain, backgroundCiudad, indicadorVida, indicadorVida2; // Variables para los fondos parallax
let monumentoManager;
let enemigosManager;
let collisionManager;
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

let soundButton; // Referencia al botón
let isSoundOn; // Estado inicial del sonido
let jumpSound, cacaSaltoSound, colisionCacaSound, abuelaGolpeSound, choquePatineteSound;
let cogerGalletasSound, lanzarGalletaSound;
let gritoPajaros = [];

const LEVEL_WIDTH = 30000 * altScale; // Ancho total del nivel


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.salud = 100; // Salud inicial
    }
    

    preload() {
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
    this.load.image('monumento6', 'assets/pedrera.png');

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
    this.load.image('informatica1','assets/informatica1.png');
    this.load.image('valla','assets/valla.png');
    this.load.image('colegio1','assets/colegio1.png');

    //__________________SONIDOS______________________
    this.load.audio('backgroundSound', 'assets/sonidos/backgroundSound.mp3');
    this.load.image('soundOn', 'assets/soundOn.png');
    this.load.image('soundOff', 'assets/soundOff.png');
    this.load.audio('abuelaSalto', 'assets/sonidos/abuelaSalto.mp3');
    this.load.audio('cacaSalto', 'assets/sonidos/cacaSalto.mp3');
    this.load.audio('colisionCacaAsco', 'assets/sonidos/colisionCacaAsco.mp3');
    this.load.audio('abuelaGolpe', 'assets/sonidos/abuelaGolpe.mp3');
    this.load.audio('choquePatinete', 'assets/sonidos/lauraPatinete2.mp3');
    this.load.audio('cogerGalletas', 'assets/sonidos/cogerGalletas.mp3');
    this.load.audio('lanzarGalleta', 'assets/sonidos/lanzarGalleta.wav');
    this.load.audio('gritoPajaro1', 'assets/sonidos/gritoPajaro1.wav');
    this.load.audio('gritoPajaro2', 'assets/sonidos/gritoPajaro2.wav');

    }

    create() {
        //____________________________CREATE__________________________________________________________________________________________
    console.log(window.innerHeight);
    // Definir el tamaño del mundo del juego y de la camara
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, window.innerHeight);

    this.salud = salud; //Asigno la varianle como propiedad del collision

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
    const carniceria1 = this.add.image(3460 * altScale, window.innerHeight - 180 * altScale, 'carniceria1').setScale(0.6 * altScale).setOrigin(0.5, 1);
    const panaderia1 = this.add.image(2870 * altScale, window.innerHeight - 140 * altScale, 'panaderia1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    const carpinteria1 = this.add.image(4580 * altScale, window.innerHeight - 180 * altScale, 'carpinteria1').setScale(0.55 * altScale).setOrigin(0.5, 1);
    const badulaque1 = this.add.image(4020 * altScale, window.innerHeight - 140 * altScale, 'badulaque1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    const colegio1 = this.add.image(5790 * altScale, window.innerHeight - 180 * altScale, 'colegio1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    const informatica1 = this.add.image(5130 * altScale, window.innerHeight - 140 * altScale, 'informatica1').setScale(0.7 * altScale).setOrigin(0.5, 1);
    

    // Crear grupo de plataformas, incluido el suelo__________________PLATAFORMAS_______________________________
    platforms = this.physics.add.staticGroup();
    //platforms.depth = 1;
    //platforms.create(LEVEL_WIDTH / 2, window.innerHeight - 50  * altScale, 'suelo').setDisplaySize(LEVEL_WIDTH, 140  * altScale).refreshBody(); //Suelo se repite

 const bloquesYHuecos = [ //Array posiciones suelo, inicio ancho y huecos
        { x: 0, ancho: 2800 }, // Bloque 1
        { hueco: 350},         // Hueco 1
        {  x: 3150, ancho: 5000 }, // Bloque 2
        { hueco: 200 },         // Hueco 2
        { x: 8350, ancho: 100 }, // Bloque 3
        { hueco: 250 },         // Hueco 3
        { x: 8700, ancho: 4500 }, // Bloque 4
        { hueco: 200 },         // Hueco 4
        { x: 13400, ancho: 3000 }, // Bloque 5
        { hueco: 250 },         // Hueco 5
        { x: 16650, ancho: 5000 }, // Bloque 6
        { hueco: 250 },         // Hueco 6
        { x: 21900, ancho: 100 }, // Bloque 7
        { hueco: 200 },         // Hueco 7
        { x: 22200, ancho: 80 }, // Bloque 8
        { hueco: 300 },         // Hueco 8
        { x: 22580, ancho: 120 }, // Bloque 9
        { hueco: 250 },         // Hueco 9
        { x: 22950, ancho: 50 }, // Bloque 10
        { hueco: 300 },         // Hueco 10
        { x: 23300, ancho: 100 }, // Bloque 11
        { hueco: 200 },         // Hueco 11
        { x: 23600, ancho: 6400 }, // Bloque 12
    ];

let currentX = 0 * altScale; // Posición inicial del primer bloque

bloquesYHuecos.forEach((bloque) => {
    if (bloque.ancho !== undefined && bloque.x !== undefined) {
        // Creo bloque de suelo usando los valores de "x" y "ancho" escalados AltScale
        platforms.create(
            bloque.x * altScale + (bloque.ancho * altScale) / 2, // Centrar el bloque en su posición escalada
            window.innerHeight - 50 * altScale, // Altura ajustada
            'suelo'
        )
        .setDisplaySize(bloque.ancho * altScale, 140 * altScale) // Ajustar tamaño del bloque
        .refreshBody();
    }
});
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
        frames: this.anims.generateFrameNumbers('abuelaMovimiento2', { start: 4, end: 10 }), // Rango para salto
        frameRate: 14,
        repeat: 0 // Sin bucle, se ejecuta una vez por salto
    });
    /*
    this.anims.create({
        key: 'muerte',
        frames: this.anims.generateFrameNumbers('abuelaMuerte', { start: 0, end: 10 }), // Cambia los valores según tu spritesheet
        frameRate: 15,
        repeat: 0 // Sin bucle, se ejecuta una vez
    });*/

   
    // Instancia a la clase
    enemigosManager = new Enemigos(this, altScale);
    collisionManager = new CollisionManager(this, this.player, altScale);

     // __________________________________PALOMAS__________________________________________
  
    // Animación de las palomas volar
    this.anims.create({
        key: 'volar',
        frames: this.anims.generateFrameNumbers('paloma', { start: 0, end: 5 }),
        frameRate: 15,
        repeat: -1 // Animación en bucle
    });
        
    //Creación de palomas
    enemigosManager.crearPalomas(20);
    // Crear colisión entre las palomas y la abuela
    this.physics.add.overlap(enemigosManager.palomas, this.player, this.colisionPaloma, null, this);

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
    enemigosManager.crearPatinetes(26); //Crear patinetes
    // Crear colisiones entre los patinetes y el suelo
    this.physics.add.collider(enemigosManager.patinetes, platforms);
    this.physics.add.overlap(enemigosManager.patinetes, this.player, this.colisionPatinete, null, this); //overlap lanza un evento

    // Habilitar controles
    cursors = this.input.keyboard.createCursorKeys();
    if (this.sys.game.device.input.touch) {
        createTouchControls(this);
    }

    // __________________________________CACAS__________________________________________

    enemigosManager.crearCacas(8); // Crear cacas

    // Colisiones de cacas con el jugador usando CollisionManager
    this.physics.add.overlap(enemigosManager.cacas,this.player,collisionManager.colisionCaca.bind(collisionManager),null,this); // Manejado por CollisionManager
    this.physics.add.collider(enemigosManager.cacas, platforms);// Colisiones suelo
    //this.physics.add.overlap(enemigosManager.cacas, this.player, colisionCaca, null, this);  //detecta colisiones cacas

    
    
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

    // Generar frascos de galletas en el nivel
    this.generarFrascosGalletas(3);
    

    // Colisión entre la abuela y los FRASCOS GALLETAS
    this.physics.add.overlap(this.player, frascosGalletas, (player, frasco) => {

        if (this.isSoundOn && this.cogerGalletasSound) {
            this.cogerGalletasSound.play();
        }
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
         // Reproducir un sonido aleatorio de grito de pájaro al chocar con abuela
        if (this.isSoundOn && this.gritoPajaros) {
            const sonidoAleatorio = Phaser.Math.Between(0, this.gritoPajaros.length - 1);
            this.gritoPajaros[sonidoAleatorio].play();
        }

        // Destruir la paloma y el sprite de explosión tras la animación
        explosion.on('animationcomplete', () => {
        explosion.destroy();
        });

        paloma.destroy(); // Elimina la paloma
        puntos += 10; // Añadir puntos por destruir la paloma
        puntosTexto.setText(`Puntos: ${puntos}`);
    });

    this.physics.add.overlap(this.galletas, enemigosManager.patinetes, (galleta, patinete) => {
        galleta.destroy(); // Elimina la galleta
        patinete.destroy(); // Elimina el patinete
    }); 

    this.lanzarGalleta = () => {
        if (galletasDisponibles > 0) {
            const galleta = this.galletas.create(this.player.x, this.player.y - 45 * altScale, 'galleta').setScale(0.15 * altScale);
            galleta.setVelocityX(this.player.flipX ? -800 * altScale : 800 * altScale); // Dirección según la orientación del jugador
            galleta.body.allowGravity = false; // Desactivar gravedad de la galleta

            if (this.isSoundOn && this.lanzarGalletaSound) {
                this.lanzarGalletaSound.play();
            }
    
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
    this.actualizarBarraSalud(this.salud);

    this.anims.create({
        key: 'brillarParacetamol',
        frames: this.anims.generateFrameNumbers('paracetamol', { start: 0, end: 9 }), // Ajusta los frames según el sprite sheet
        frameRate: 10, // Velocidad de la animación
        repeat: -1 // Animación en bucle
    });

    // Crear grupo de pastillas
    pastillas = this.physics.add.group();

    this.generarPastillas(3); // Genera 3 pastillas en posiciones aleatorias
   
    // Colisiones entre las pastillas y las plataformas
    this.physics.add.collider(pastillas, platforms);
    this.physics.add.overlap(this.player, pastillas, this.recogerPastilla, null, this); //abuela recoje pastilla

       
    let valla = this.add.image(5500 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);
    valla = this.add.image(5608 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);
    valla = this.add.image(5716 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);
    valla = this.add.image(5824 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);
    valla = this.add.image(5932 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);
    valla = this.add.image(6040 * altScale, window.innerHeight - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1);


     //__________________________SONIDOS___________________ 
    //Crear al final para tener todas las variables asociadas definidas
    // Recuperar el estado del sonido por defecto "data".
    this.isSoundOn = this.data.get('isSoundOn') !== undefined ? this.data.get('isSoundOn') : false;
    //this.isSoundOn = false;

     this.backgroundSound = this.sound.add('backgroundSound', {
        loop: true,
        volume: 0.2,
    });
     
    // Iniciar la música si estaba encendida
    if (this.isSoundOn) {
        this.backgroundSound.play();
    }


    // Crear botón de sonido en la esquina superior derecha
     soundButton = this.add.image(window.innerWidth - 50 * altScale, 80 * altScale, this.isSoundOn ? 'soundOn' : 'soundOff') // Ajusta imagen segun estado
     .setOrigin(0.5)
     .setScrollFactor(0) // Fijo en la pantalla
     .setInteractive()
     .setScale(0.3 * altScale);

      // Activar desactivar sonido
      soundButton.on('pointerdown', () => {
        this.isSoundOn = !this.isSoundOn; // Cambiar el estado global
        this.data.set('isSoundOn', this.isSoundOn); // Guardar el estado en 'data'
        //console.log('Estado de sonido actualizado:', this.isSoundOn);
    
        if (this.isSoundOn) {
            soundButton.setTexture('soundOn'); // Cambiar el ícono
            this.backgroundSound.play(); // Iniciar música
        } else {
            soundButton.setTexture('soundOff'); // Cambiar el ícono
            this.backgroundSound.stop(); // Detener música
        }
    });

    //Sonidos añadidos en el create
    this.jumpSound = this.sound.add('abuelaSalto', { volume: 0.05 }); // Volumen inicial del sonido
    this.cacaSaltoSound = this.sound.add('cacaSalto', { volume: 0.2 });  
    this.colisionCacaSound = this.sound.add('colisionCacaAsco', { volume: 0.3 });
    this.abuelaGolpeSound = this.sound.add('abuelaGolpe', { volume: 0.3 });
    this.choquePatineteSound = this.sound.add('choquePatinete', { volume: 1 });
    this.cogerGalletasSound = this.sound.add('cogerGalletas', { volume: 0.5 });
    this.lanzarGalletaSound = this.sound.add('lanzarGalleta', { volume: 0.3 });
    this.gritoPajaros = [this.sound.add('gritoPajaro1', { volume: 0.5 }), this.sound.add('gritoPajaro2', { volume: 0.5 })];


    this.actualizarBarraSalud = this.actualizarBarraSalud.bind(this);//Hace que la barra de salud este disponible en cualquier lugar de la escena
    }

    update() {
        
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
            if (this.isSoundOn) { // Reproducir el sonido de salto si el sonido está activado
                console.log('sonido activado');
                this.jumpSound.play();
            }
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

    if (this.salud <= 0){
        // Desactivar controles mientras se reproduce la animación
        this.physics.pause(); // Pausa físicas para evitar movimiento durante la animación
        this.player.setVelocity(0); // Detener al jugador
        this.player.anims.play('muerte', true); // Reproducir animación de muerte

        this.data.set('isSoundOn', this.isSoundOn); // Guardar el estado del sonido en `data` antes de reiniciar
        
            // Detener la música si está sonando
        if (this.backgroundSound && this.backgroundSound.isPlaying) {
            this.backgroundSound.stop();
        }

        // Reiniciar la escena después de que termine la animación
         this.time.delayedCall(2000, () => { // Ajusta el tiempo al de la duración de la animación
            salud = 100;
            puntos = 0;
            galletasDisponibles = 10;
            isInvulnerable = false; // Asegurar que no quede invulnerable
            this.physics.world.colliders.destroy();// Reinica las colisiones - no colision cacas
            
            this.scene.restart(); // Reinicia la escena
         });
    }
    
    }

colisionPaloma(player, paloma) {

    if (isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    if (this.isSoundOn && this.abuelaGolpeSound) { // Reproducir el sonido de golpe
        this.abuelaGolpeSound.play();
    }

    this.salud -= 10; // Reducir la salud
    if (this.salud < 0) salud = 0; // Asegurar que no sea negativa
    this.actualizarBarraSalud(this.salud); // Actualizar la barra de salud

    // Crear la animación de explosión en la posición de la paloma
    const explosion = this.add.sprite(paloma.x, paloma.y, 'explosion')
        .setScale(0.5 * altScale)
        //.setDepth(10); // Asegurar que esté visible sobre otros elementos

    explosion.play('efectoExplosion', true);

    // Sonido aleatorio de grito de pájaro al chocar con abuela
    if (this.isSoundOn && this.gritoPajaros) {
        const sonidoAleatorio = Phaser.Math.Between(0, this.gritoPajaros.length - 1);
        console.log(`Reproduciendo sonido de grito de pájaro: ${sonidoAleatorio}`);
        this.gritoPajaros[sonidoAleatorio].play();
    }

    // Verificar eventos de animación
    explosion.on('animationstart', () => console.log('Animación iniciada'));
    explosion.on('animationcomplete', () => {   
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

colisionPatinete(player, patinete) {
    if (isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    if (this.isSoundOn && this.choquePatineteSound) {
        this.choquePatineteSound.play();
    }

    this.salud -= 30; // Reducir la salud
    if (this.salud < 0) this.salud = 0; // Asegurar que no sea negativa
    this.actualizarBarraSalud(this.salud); // Actualizar la barra de salud
    
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

actualizarBarraSalud(valor) {
     
    if (valor < 0) valor = 0;
    if (valor > 100) valor = 100; // Máximo permitido

   barraSalud.clear(); // Limpia el gráfico anterior
   // Dibujar el fondo de la barra
   barraSalud.fillStyle(0x000000); // Color negro
   barraSalud.fillRect(80, 63, 140, 25); // Posición (20, 20), ancho 200px, alto 20px

   // Dibujar la barra de salud actual
   barraSalud.fillStyle(0xff0000); // Color rojo
   
   barraSalud.fillRect(80, 63, (140 * valor) / 100, 25); // Escalar ancho según la salud
   console.log(`Barra de salud actualizada: ${valor}`);
   
}

recogerPastilla(player, pastilla) {
    console.log('¡Has recogido una pastilla!');
    // Subir salud, pero no más de 100
    salud = Math.min(this.salud + 20, 100);
    this.actualizarBarraSalud(salud);
    pastilla.destroy();

}

generarPastillas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(100, LEVEL_WIDTH - 100);
        const y = Phaser.Math.Between(100, window.innerHeight - 200);
        const pastilla = pastillas.create(x, y, 'paracetamol').setScale(0.1 * altScale).setBounce(0.5);
        //pastilla.body.setAllowGravity(false);
        pastilla.play('brillarParacetamol'); // Reproducir la animación
    }
}

generarFrascosGalletas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(200, LEVEL_WIDTH - 200);
        const y = Phaser.Math.Between(100, window.innerHeight - 200);
        const frasco = frascosGalletas.create(x, y, 'frascoGalletas').setScale(0.3 * altScale).setBounce(0.5).setSize(210,200);
        frasco.body.setAllowGravity(true); // Sin gravedad para los frascos
    }
}
}

export default GameScene;
