import Phaser from 'phaser';
import Monumento from '../monumento.js';
import Enemigos from '../enemigos.js';
import CollisionManager from '../collisionManager.js';
import entrada from '../entrada.js';
import { BARCELONA } from '../niveles/barcelona.js';
import { aplicarHover } from '../ui/botonTexto.js';
import HUD from '../ui/hud.js';

const altScale = 1; // Siempre 1: altura de diseño fija a 1080px (Phaser.Scale.FIT)
const sueloAltura = 50;
const tiempoTransformacion = 60000;
const LEVEL_WIDTH = BARCELONA.anchoNivel; // Ancho total del nivel (definido en barcelona.js)


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // init() se llama antes de create() en cada restart. Gestiona el estado persistente.
    init(data) {
        // Puntos y galletas sobreviven a perder una vida; se pasan explícitamente en scene.restart()
        this.puntos = data?.puntos ?? 0;
        this.galletasDisponibles = data?.galletasDisponibles ?? 10;
        this.vidas = data?.vidas ?? 3;
        // El resto siempre se reinicia
        this.salud = 100;
        this.isInvulnerable = false;
        this.isTransformed = false;
        this.dobleSalto = false;
        this.saltosRestantes = 2;
        this.saltando = false;
        this.transformacionRestante = tiempoTransformacion;
        this.haMuerto = false;
    }

    create() {

        //____________________________CREATE__________________________________________________________________________________________
    // Definir el tamaño del mundo del juego y de la camara
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, this.scale.height);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, this.scale.height);

    this.add.rectangle(0, 0, LEVEL_WIDTH, this.scale.height, 0xFFCC00)
    .setOrigin(0, 0)
    .setAlpha(0.2) // Establecer opacidad al 30%
    .setDepth(0.5); // Ajustar profundidad


    // Fondo azul cielo que ocupa todo el nivel ________________________FONDOS___________________________________
    this.add.rectangle(0, 0, LEVEL_WIDTH, this.scale.height, 0x42aaff).setOrigin(0, 0);
    // Fondo montañoso que se moverá lentamente
    this.backgroundMountain = this.add.tileSprite(0, this.scale.height - 40, LEVEL_WIDTH, 1080, 'backgroundMountain').setOrigin(0, 1).setScrollFactor(0).setScale(1);
    // Fondo de ciudad que se moverá más rápido
    this.backgroundCiudad = this.add.tileSprite(0, this.scale.height - 40, LEVEL_WIDTH, 1080, 'backgroundCiudad').setOrigin(0, 1).setScrollFactor(0).setScale(1);
    this.backgroundCesped = this.add.tileSprite(
    0,
    this.scale.height - 40,
    LEVEL_WIDTH,
    1080,
    'cesped'
    )
    .setOrigin(0, 1)
    .setScale(1);

    
    //Instancia y creacion de monumentos
    this.monumentoManager = new Monumento(this, altScale); //Esta escena y la escala
    this.monumentoManager.crearMonumentos();


    //__________________CREAR ESCENARIO____________________
    // Imágenes decorativas del nivel (tiendas, edificios, objetos de calle)
    BARCELONA.imagenes.forEach(({ key, x, y, escala, depth, flipX }) => {
        const img = this.add.image(x * altScale, this.scale.height - y * altScale, key)
            .setScale(escala * altScale)
            .setOrigin(0.5, 1);
        if (depth !== undefined) img.setDepth(depth);
        if (flipX) img.flipX = true;
    });

    // Pivotes repetidos (Sagrada Família) y vallas de obra
    BARCELONA.pivotes.forEach(({ inicio, fin }) => this.crearPivote(inicio, fin));
    BARCELONA.vallasObra.forEach(({ inicio, fin }) => this.ponerVallasObra(inicio, fin));

   
    

    // Crear grupo de plataformas, incluido el suelo__________________SUELOS_______________________________
    this.platforms = this.physics.add.staticGroup();

BARCELONA.bloquesYHuecos.forEach((bloque) => {
    if (bloque.ancho !== undefined && bloque.x !== undefined) {
        // Creo bloque de suelo usando los valores de "x" y "ancho" escalados AltScale
        this.platforms.create(
            bloque.x * altScale + (bloque.ancho * altScale) / 2, // Centrar el bloque en su posición escalada
            this.alturaSuelo = this.scale.height - 50 * altScale, // Altura ajustada
            'suelo'
        )
        
        .setDisplaySize(bloque.ancho * altScale, 140 * altScale) // Ajustar tamaño del bloque
        .refreshBody();
    }
});

// Plataformas elevadas del nivel
BARCELONA.plataformas.forEach(p => {
    if (p.tipo === 'uno')    this.plataformaDeUno(p.x, p.y);
    else if (p.tipo === 'dos')    this.plataformaDeDos(p.x1, p.y1, p.x2, p.y2);
    else if (p.tipo === 'grande') this.plataformaGrande(p.x, p.y);
});
    

    //this.platforms.body.setSize(140, 70).setOffset(50 * altScale, 50 * altScale);

   

    // __________________________________CREAR ABUELA___________________________________________

    this.player = this.physics.add.sprite(BARCELONA.jugadorInicio.x, BARCELONA.jugadorInicio.y, 'abuelaMovimiento1').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1);
    // 10500 Zona cafeteria //13500 Zona Sagrada //21000 Agbar obras
    // Ajustar el cuerpo físico del jugador
    this.player.body.setSize(130, 320).setOffset(50 * altScale, 70 * altScale); // Ajusta tamaño y desplazamiento
    // Configurar físicas del jugador
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true); //Evita que se salgo de los limites del escenario
    //const playerScale = this.scale.height / 800;// Escala el personaje segun el tamaño de la pantalla
    //player.setScale(playerScale);

    // Hacer que la cámara siga al jugador
    this.cameras.main.startFollow(this.player);


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
    
    this.anims.create({
        key: 'muerte',
        frames: this.anims.generateFrameNumbers('abuelaMuerte', { start: 0, end: 5 }), // Cambia los valores según tu spritesheet
        frameRate: 10,
        repeat: -1 // Sin bucle, se ejecuta una vez
    });

    // Animaciones de la transformación
    this.anims.create({
        key: 'transformWukong',
        frames: this.anims.generateFrameNumbers('abuelaTWukong', { start: 0, end: 8 }),
        frameRate: 8,
        repeat: 0
    });

    // Crear la animación de idle (quieta) en la forma transformada
    this.anims.create({
        key: 'idleWukong',
        frames: this.anims.generateFrameNumbers('abuelaQuietaWukong', { start: 0, end: 12 }),
        frameRate: 4,
        repeat: -1
    });

    // Crear la animación de andar en la forma transformada
    this.anims.create({
        key: 'walkWukong',
        frames: this.anims.generateFrameNumbers('abuelaMov1Wukong', { start: 0, end: 20 }),
        frameRate: 30,
        repeat: -1
    });

    // Crear la animación de andar en la forma transformada
    this.anims.create({
        key: 'jumpWukong',
        frames: this.anims.generateFrameNumbers('abuelaMov2Wukong', { start: 0, end: 6 }),
        frameRate: 14,
        repeat: 0
    });

   
    // Instancias a la clase
    this.enemigosManager = new Enemigos(this, altScale);
    this.collisionManager = new CollisionManager(this, this.player, altScale);
    this.colisionPlataformas(); //Colisiones abuela-plataforma
  
    // __________________________________PALOMAS__________________________________________
    // Animación de las palomas volar
    this.anims.create({
        key: 'volar',
        frames: this.anims.generateFrameNumbers('paloma', { start: 0, end: 1 }),
        frameRate: 9,
        repeat: -1, // Animación en buclecxxxxxx
    });
    //Creación de palomas
    this.enemigosManager.crearPalomas(BARCELONA.enemigos.palomas);
    // Crear colisión entre las palomas y la abuela
    this.physics.add.overlap(this.enemigosManager.palomas, this.player, this.colisionPaloma, null, this);

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
    this.enemigosManager.crearPatinetes(BARCELONA.enemigos.patinetes); //Crear patinetes
    // Crear colisiones entre los patinetes y el suelo
    this.physics.add.collider(this.enemigosManager.patinetes, this.platforms);
    this.physics.add.overlap(this.enemigosManager.patinetes, this.player, this.colisionPatinete, null, this); //overlap lanza un evento

    // Habilitar controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(3); // permite hasta 4 toques simultáneos
    this.crearBotonesTactiles();
    this.gritoPatineteSound = this.sound.add('gritoPatinete', { volume: 0.5 });

    // __________________________________CACAS__________________________________________

    this.enemigosManager.crearCacas(BARCELONA.enemigos.cacas); // Crear cacas

    // Colisiones de cacas con el jugador usando CollisionManager
    this.physics.add.overlap(this.enemigosManager.cacas,this.player,this.collisionManager.colisionCaca.bind(this.collisionManager),null,this); // Manejado por CollisionManager
    this.physics.add.collider(this.enemigosManager.cacas, this.platforms);// Colisiones suelo
    //this.physics.add.overlap(this.enemigosManager.cacas, this.player, colisionCaca, null, this);  //detecta colisiones cacas

    // __________________________________GALLETAS__________________________________________
    // Crear grupo de frascos de galletas
    this.frascosGalletas = this.physics.add.group();

    // Generar frascos de galletas en el nivel
    this.generarFrascosGalletas(BARCELONA.recogibles.frascosGalletas);
    

    // Colisión entre la abuela y los FRASCOS GALLETAS
    this.physics.add.overlap(this.player, this.frascosGalletas, (player, frasco) => {

        if (this.isSoundOn && this.cogerGalletasSound) {
            this.cogerGalletasSound.play();
        }
        this.galletasDisponibles += 10; // Incrementar galletas
        this.hud.actualizarGalletas(this.galletasDisponibles); // Actualizar texto
        frasco.destroy(); // Eliminar frasco recolectado
    });
    this.physics.add.collider(this.frascosGalletas, this.platforms);

    this.galletas = this.physics.add.group();

    this.keys = {
        lanzarGalleta: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X) // Lanzar galletas
    };

    // Colisiones de las galletas con enemigos
    // Colisiones de las galletas con enemigos
    this.physics.add.overlap(this.galletas, this.enemigosManager.palomas, (galleta, paloma) => {
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
        this.puntos += 10; // Añadir puntos por destruir la paloma
        this.hud.actualizarPuntos(this.puntos);
    });

    this.physics.add.overlap(this.galletas, this.enemigosManager.patinetes, (galleta, patinete) => {
        galleta.destroy(); // Elimina la galleta
        patinete.destroy(); // Elimina el patinete
        // Reproducir sonido de grito al destruir un patinete
        if (this.isSoundOn && this.gritoPatineteSound) {
            this.gritoPatineteSound.play();
        }
        
    }); 

    this.lanzarGalleta = () => {
        if (this.galletasDisponibles > 0) {


            const galleta = this.galletas.create(this.player.x, this.player.y - this.player.displayHeight / 2, 'galleta').setScale(0.15 * altScale);
            galleta.setVelocityX(this.player.flipX ? -800 * altScale : 800 * altScale); // Dirección según la orientación del jugador
            galleta.body.allowGravity = false; // Desactivar gravedad de la galleta

            if (this.isSoundOn && this.lanzarGalletaSound) {
                this.lanzarGalletaSound.play();
            }
    
            // Reducir la cantidad de galletas disponibles
            this.galletasDisponibles--;
            this.hud.actualizarGalletas(this.galletasDisponibles); // Actualizar el texto en pantalla
    
            // Destruir la galleta después de un tiempo
            this.time.delayedCall(3000, () => {
                galleta.destroy();
            });
        } else {
            console.log('No tienes galletas suficientes para lanzar.');
        }
    };
 
    //____________________________LUNA_WUKONG___________________________
    // Crear un grupo de físicas para el objeto lunaWukong
    this.lunasWukong = this.physics.add.group({
        allowGravity: true, // Permitir gravedad
        bounceY: 0.5,       // Rebote ligero si cae
        collideWorldBounds: true, // Evitar que salga del mundo
        setDepth: 1
    });

    

    // Posicionar una lunaWukong en una coordenada específica
    BARCELONA.recogibles.lunasWukong.forEach(x => this.crearLunaWukong(x));

    // Recoger objeto
    this.physics.add.overlap(this.player, this.lunasWukong, this.recogerLunaWukong, null, this);

    // Colisiones plataformas
    this.physics.add.collider(this.lunasWukong, this.platforms);
    


    // __________________________________HUD__________________________________________
    this.hud = new HUD(this, {
        puntos: this.puntos,
        salud: this.salud,
        vidas: this.vidas,
        galletasDisponibles: this.galletasDisponibles,
    });


    this.anims.create({
        key: 'brillarParacetamol',
        frames: this.anims.generateFrameNumbers('paracetamol', { start: 0, end: 9 }), // Ajusta los frames según el sprite sheet
        frameRate: 10, // Velocidad de la animación
        repeat: -1 // Animación en bucle
    });

    // Crear grupo de pastillas___________________________________________
    this.pastillas = this.physics.add.group();

    this.generarPastillas(BARCELONA.recogibles.pastillas); // Genera pastillas en posiciones aleatorias
   
    // Colisiones entre las pastillas y las plataformas
    this.physics.add.collider(this.pastillas, this.platforms);
    this.physics.add.overlap(this.player, this.pastillas, this.recogerPastilla, null, this); //abuela recoje pastilla
    

       
    let valla = this.add.image(5504 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5); //Colegio
    valla = this.add.image(5312 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);
    valla = this.add.image(5420 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);
    valla = this.add.image(5528 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);
    valla = this.add.image(5636 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);
    valla = this.add.image(5744 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);
    valla = this.add.image(5852 * altScale, this.scale.height - 90 * altScale, 'valla').setScale(0.4 * altScale).setOrigin(0.5, 1).setDepth(1.5);

     //__________________________SONIDOS___________________ 
    //Crear al final para tener todas las variables asociadas definidas
    // Recuperar el estado del sonido por defecto "data".
    this.isSoundOn = this.data.get('isSoundOn') !== undefined ? this.data.get('isSoundOn') : true;
    //this.isSoundOn = false;

     this.backgroundSound = this.sound.add('backgroundSound', {
        loop: true,
        volume: 0.15,
    });
     
    // Iniciar la música si estaba encendida
    if (this.isSoundOn) {
        this.backgroundSound.play();
    }


    // Crear botón de sonido en la esquina superior derecha
     this.soundButton = this.add.image(this.scale.width - 50 * altScale, 80 * altScale, this.isSoundOn ? 'soundOn' : 'soundOff') // Ajusta imagen segun estado
     .setOrigin(0.5)
     .setScrollFactor(0) // Fijo en la pantalla
     .setInteractive()
     .setScale(0.3 * altScale).setDepth(2);

      // Activar desactivar sonido
      this.soundButton.on('pointerdown', () => {
        this.isSoundOn = !this.isSoundOn; // Cambiar el estado global
        this.data.set('isSoundOn', this.isSoundOn); // Guardar el estado en 'data'

        if (this.isSoundOn) {
            this.soundButton.setTexture('soundOn'); // Cambiar el ícono
            this.backgroundSound.play(); // Iniciar música
        } else {
            this.soundButton.setTexture('soundOff'); // Cambiar el ícono
            this.backgroundSound.stop(); // Detener música
        }
    });

    //Sonidos añadidos en el create
    this.jumpSound = this.sound.add('abuelaSalto', { volume: 0.05 }); // Volumen inicial del sonido
    this.cacaSaltoSound = this.sound.add('cacaSalto', { volume: 0.2 });  
    this.colisionCacaSound = this.sound.add('colisionCacaAsco', { volume: 0.3 });
    this.abuelaGolpeSound = this.sound.add('abuelaGolpe', { volume: 0.3 });
    this.choquePatineteSound = this.sound.add('choquePatinete', { volume: 1 });
    this.cogerGalletasSound = this.sound.add('cogerGalletas', { volume: 0.7 });
    this.lanzarGalletaSound = this.sound.add('lanzarGalleta', { volume: 0.3 });
    this.gritoPajaros = [this.sound.add('gritoPajaro1', { volume: 0.5 }), this.sound.add('gritoPajaro2', { volume: 0.5 })];
    this.gritoTransformacion = this.sound.add('gritoTransformacion', {volume: 0.5});


    this.nivelCompletado = false;
    }

    //________________________________UPDATE__________________________________
    update() {
    
       
        this.movimientosAbuela();  
        this.updateParallax(); //Controla desplazamientos, fondos, monumentos, enemigos, etc.
        //this.updateMovingPlatforms();

        
        // Restablecer el doble salto cuando toque el suelo
        if (this.player.body.touching.down) {
            this.dobleSalto = false;
        }


        if (this.player.x >= BARCELONA.finNivel * altScale && !this.nivelCompletado) {
            this.nivelCompletado = true; // Asegurarte de que esto ocurra solo una vez
            this.nivel1Completado(); // Llama a la función que maneja el fin del nivel
        }
        

        const limiteInferior = this.scale.height - 10; // Ajusta este valor según el diseño del nivel
        if (this.player.y > limiteInferior) {
            this.salud = 0; 
        }

        this.verificaMuerte();

            // Calcular el ancho actual de la barra basado en el tiempo restante
            //const anchoBarra = (140 * transformacionRestante) / tiempoTransformacion;

            if (this.isTransformed && this.hud.barraTransformacion) {
                this.transformacionRestante -= this.game.loop.delta; // Reducir tiempo segun frames
                if (this.transformacionRestante <= 0) {
                    this.transformacionRestante = 0;
                    this.revertirTransformacion(); // Revertir cuando el tiempo se acabe
                }

                this.hud.dibujarBarraTransformacion(this.transformacionRestante, tiempoTransformacion);
            }
    }
        
    
    


//___________________________________METODOS GAME_________________________________

colisionPaloma(player, paloma) {

    if (this.isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    if (this.isSoundOn && this.abuelaGolpeSound) { // Reproducir el sonido de golpe
        this.abuelaGolpeSound.play();
    }

    this.salud -= 10; // Reducir la salud
    if (this.salud < 0) this.salud = 0; // Asegurar que no sea negativa
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
    this.isInvulnerable = true;

    for (let i = 0; i < 5; i++) {
        this.time.delayedCall(200 * i, () => {
            player.visible = !player.visible; // Alternar visibilidad
        });
    }
    // Asegurarse de que quede visible al final del parpadeo
    this.time.delayedCall(1000, () => {
        player.visible = true;
        this.isInvulnerable = false; // Termina invulnerabilidad
    });

    paloma.destroy(); // Destruir la paloma

    // Sumar puntos y actualizar el texto
    this.puntos += 10; // Añadir 10 puntos
    this.hud.actualizarPuntos(this.puntos);

    this.verificaMuerte(); //Si llega a 0 verifica y activa animacion muerte


}

colisionPatinete(player, patinete) {
    if (this.isInvulnerable) {
        return; // No aplicar daño si la abuela es invulnerable
    }

    if (this.isSoundOn && this.choquePatineteSound) {
        this.choquePatineteSound.play();
    }

    this.salud -= 30; // Reducir la salud
    if (this.salud < 0) this.salud = 0; // Asegurar que no sea negativa
    this.actualizarBarraSalud(this.salud); // Actualizar la barra de salud
    
    // Reducir puntos
    this.puntos -= 20;
    if (this.puntos < 0) this.puntos = 0;
    this.hud.actualizarPuntos(this.puntos);
    
    // Hacer a la abuela invulnerable
    this.isInvulnerable = true;
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
        this.isInvulnerable = false; // Termina invulnerabilidad
        player.clearTint(); // Quitar el color
    });
    this.verificaMuerte();
}

actualizarBarraSalud(valor) {
    this.hud.actualizarSalud(valor);
}

recogerPastilla(player, pastilla) {
    console.log('¡Has recogido una pastilla!');
    // Subir salud, pero no más de 100
    this.salud = Math.min(this.salud + 20, 100);
    this.actualizarBarraSalud(this.salud);
    pastilla.destroy();

}

generarPastillas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(100, LEVEL_WIDTH - 100);
        const y = Phaser.Math.Between(100, this.scale.height - 200);
        const pastilla = this.pastillas.create(x, y, 'paracetamol').setScale(0.1 * altScale).setBounce(0.5).setDepth(1);
        //pastilla.body.setAllowGravity(false);
        pastilla.play('brillarParacetamol'); // Reproducir la animación
    }
}

generarFrascosGalletas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = Phaser.Math.Between(200, LEVEL_WIDTH - 200);
        const y = Phaser.Math.Between(100, this.scale.height - 200);
        const frasco = this.frascosGalletas.create(x, y, 'frascoGalletas').setScale(0.3 * altScale).setBounce(0.5).setSize(210,200);
        frasco.body.setAllowGravity(true); // Sin gravedad para los frascos
    }
}

movimientosAbuela() {
    //******* MOVIMIENTOS ********/

    // Bloquear movimientos si el jugador ha muerto o está transformándose
    if (this.haMuerto || this.isTransforming) {
        this.player.setVelocityX(0); // Detener el movimiento horizontal
        return;
    }

    // Controlar si el jugador está en el suelo
    let isOnGround = this.player.body.touching.down;

    // Si toca el suelo, restablecer los saltos restantes (Doble Salto)
    if (isOnGround) {
        this.saltosRestantes = 2;
        this.saltando = false; // Reiniciar estado de salto
        this.dobleSalto = false; // Restablecer estado de doble salto
    }

    // ABUELA -- Movimiento horizontal
    if (this.cursors.left.isDown || entrada.izquierda) {
        this.player.setVelocityX(-300 * altScale);
        if (isOnGround) this.player.anims.play(this.isTransformed ? 'walkWukong' : 'left', true); // Alterna entre las anim..
        this.player.flipX = true;
        if(!this.isTransformed) {
            this.player.body.setOffset(180, 50); //Compensa el desplazamiento del cuerpo físico abuela Normal ,al no ser centro img
        }
    } else if (this.cursors.right.isDown || entrada.derecha) {
        this.player.setVelocityX(300 * altScale);
        if (isOnGround) this.player.anims.play(this.isTransformed ? 'walkWukong' : 'right', true);
        this.player.flipX = false;
        if(!this.isTransformed) {
            this.player.body.setOffset(50 ,50);
        }

    } else {
        this.player.setVelocityX(0);
        // Animación idle según el estado de transformación
        if (isOnGround) {
            this.player.setOrigin(0.5,1);
            this.player.anims.play(this.isTransformed ? 'idleWukong' : 'abuelaIdle', true);

        }

    }

    // Lógica de salto
    const quereSaltar = Phaser.Input.Keyboard.JustDown(this.cursors.up) || (!this.saltando && this.cursors.up.isDown) || entrada.saltar;
    entrada.saltar = false;
    if (quereSaltar) {
        if (isOnGround) {
            // Salto normal
            this.jumpSound.play();
            this.player.setVelocityY(-700 * altScale);
            this.player.anims.play(this.isTransformed ? 'jumpWukong' : 'jump', true);
            this.saltosRestantes--; // Reducir los saltos restantes
            this.saltando = true; // Marcar que el personaje está saltando
        } else if (this.isTransformed && this.saltosRestantes > 0) {
            // Doble salto solo en estado transformado
            this.jumpSound.play();
            this.player.setVelocityY(-900 * altScale);
            this.player.anims.play('jumpWukong', true);

            // Efectos visuales o sonoros
            const emisorParticulas = this.add.particles('particulas').createEmitter({
                x: this.player.x,
                y: this.player.y,
                speed: { min: -100, max: 100 },
                lifespan: 500,
                quantity: 1,
                scale: { start: 1, end: 0 }, // Las partículas se hacen más pequeñas

            }).setScale(0.3 * altScale);

            // Hacer que las partículas sigan al jugador
            emisorParticulas.startFollow(this.player);

            // Configurar para que el emisor dure solo un instante
            this.time.delayedCall(1000, () => {
                emisorParticulas.stop(); // Detener emisión de partículas
                emisorParticulas.manager.destroy(); // Eliminar el sistema de partículas para liberar memoria
            });

            this.saltosRestantes--; // Reducir saltos restantes
        }
    }

    // Detectar cuando se suelta la tecla de salto para reiniciar el estado de salto
    if (Phaser.Input.Keyboard.JustUp(this.cursors.up)) {
        this.saltando = false;
    }

    // ABUELA -- Lanzar galleta
    if (Phaser.Input.Keyboard.JustDown(this.keys.lanzarGalleta) || entrada.lanzar) {
        entrada.lanzar = false;
        this.lanzarGalleta(); // Lógica para lanzar galleta
    }
}




updateParallax() {
    // Fondos parallax
    const maxScrollX = LEVEL_WIDTH - this.scale.width; //Calcula el desplazamiento dependiendo del ancho de la ventana

    if (this.cameras.main.scrollX < maxScrollX) {
        this.backgroundMountain.tilePositionX = this.cameras.main.scrollX * 0.2; // Movimiento lento
        this.backgroundCiudad.tilePositionX = this.cameras.main.scrollX * 0.4; // Movimiento rápido
        //monumento.tilePositionX = 1200 - this.cameras.main.scrollX * 0.5;
    }

    // Actualizar posición de los monumentos con el scroll de la cámara
    const scrollX = this.cameras.main.scrollX;
    this.monumentoManager.actualizar(scrollX);
    this.enemigosManager.actualizar(scrollX); //maneja a todos los enemigos   
}


gameOver() {
    // Detener toda la física y lógica del juego
    this.physics.pause();
    this.player.setTint(0xff0000); // Cambiar color del jugador para indicar el final
    this.player.anims.stop(); // Detener cualquier animación del jugador

     // Fondo negro semitransparente
     const overlay = this.add.graphics();
     overlay.depth = 3;
     overlay.fillStyle(0x000000, 0.7); // Color negro con 70% de opacidad
     overlay.fillRect(
         this.cameras.main.worldView.x,
         this.cameras.main.worldView.y,
         this.cameras.main.width,
         this.cameras.main.height
     );

    //const tamaño = 64 * altScale;

    // Mostrar un texto de "Game Over"
    const gameOverText = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2,
        'GAME OVER',
        {
            fontSize: `${64  * altScale}px`,
            fill: '#ff0000',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }
    ).setOrigin(0.5).setDepth(3);



    // Mostrar botón para reiniciar el juego
    const restartButton = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 * altScale + 100,
        'Reiniciar',
        {
            fontSize: `${32  * altScale}px`,
            fill: '#ffffff',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }
    ).setOrigin(0.5).setInteractive().setDepth(3);

    aplicarHover(restartButton);
    

    // Al hacer clic en el botón, reiniciar el juego (init() resetea todo a defaults)
    restartButton.on('pointerdown', () => {
        this.scene.restart();
    });

    // Detener música y sonidos si están activos
    if (this.backgroundSound && this.backgroundSound.isPlaying) {
        this.backgroundSound.stop();
    }

    // Opción de volver al menú principal (opcional)
    const menuButton = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 * altScale + 160,
        'Menú Principal',
        {
            fontSize: `${32  * altScale}px`,
            fill: '#ffffff',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }
    ).setOrigin(0.5).setInteractive().setDepth(3);
    
    aplicarHover(menuButton);

    menuButton.on('pointerdown', () => {
        this.scene.start('MenuScene');
    });
}

plataformaDeUno(x, y) {
    // Añadir plataformas fijas
    const plataforma = this.platforms.create(x * altScale, this.scale.height - y * altScale, 'plataformasL')
    .setScale(0.6 * altScale)
    .refreshBody()
    .setSize(90 * altScale, 15 * altScale) //Tamaño cuerpo físico
    .setOffset(7 * altScale, 25 * altScale); //Colocación

    plataforma.depth = 1;

}

plataformaDeDos(x1, y1, x2, y2) { //97 px entre una x y la otra

   // Añadir plataformas fijas
   const plataforma1 = this.platforms.create(x1 * altScale, this.scale.height - y1 * altScale, 'plataformasL').setScale(0.6 * altScale).refreshBody()
   .setSize(90 * altScale, 15 * altScale)
   .setSize(90 * altScale, 15 * altScale) //Tamaño cuerpo físico
   .setOffset(7 * altScale, 25 * altScale); //Colocación

   const plataforma2 = this.platforms.create(x2 * altScale, this.scale.height - y2 * altScale, 'plataformasR').setScale(0.6 * altScale).refreshBody()
   .setSize(90 * altScale, 15 * altScale)
   .setSize(90 * altScale, 15 * altScale) //Tamaño cuerpo físico
   .setOffset(0 * altScale, 25 * altScale); //Colocación

   plataforma1.depth = 1;
   plataforma2.depth = 1;

}

plataformaGrande(x, y) {

    const plataforma = this.platforms.create(x * altScale, this.scale.height - y * altScale, 'plataformasC')
    .setScale(0.6 * altScale)
    .refreshBody()
    .setSize(500 * altScale, 15 * altScale) //Tamaño cuerpo físico
    .setOffset(0 * altScale, 25 * altScale); //Colocación

    plataforma.depth = 1;
    
    /*
     // Crear plataformas móviles
     movingPlatformL = this.physics.add.image(1455 * altScale, this.scale.height - 800 * altScale, 'plataformasL').setScale(0.45 * altScale).refreshBody().setSize(130 * altScale, 15 * altScale);
     movingPlatformC = this.physics.add.image(1515 * altScale, this.scale.height - 630 * altScale, 'plataformasC').setScale(0.45 * altScale).refreshBody().setSize(750 * altScale, 15 * altScale);
     movingPlatformR = this.physics.add.image(1575 * altScale, this.scale.height - 800 * altScale, 'plataformasR').setScale(0.45 * altScale).refreshBody().setSize(130 * altScale, 15 * altScale);
 
     // Desactivar la gravedad para la plataforma móvil
     [movingPlatformL, movingPlatformC, movingPlatformR].forEach(platform => {
         platform.body.setAllowGravity(false).setImmovable(true).setVelocityX(100 * altScale);;
     });
 */
 
 }

colisionPlataformas() {
     // Añadir colisiones abuela con plataformas
     this.physics.add.collider(this.player, this.platforms);
}

crearPivote(x,y) { //Sagrada Familia = 13450 a 16350
    for (x; x <= y; x += 100){
        this.add.image(x * altScale, this.scale.height - 105 * altScale, 'pivote2').setScale(0.5 * altScale).setOrigin(0.5, 1).setDepth(1.1);
    }   
}

ponerVallasObra(x,y) { //Vallas zona agujeros
    for (x; x<= y; x+=102.5){
        this.add.image(x * altScale, this.scale.height - 130 * altScale, 'vallas2').setScale(0.6 * altScale).setOrigin(0.5, 1);
    }
}

verificaMuerte() {
    //Cuando muere
    if (this.salud <= 0 && !this.haMuerto)  {
        this.haMuerto = true;
        this.vidas--;
        this.isTransformed = false; // Volver a estado normal
        // vidas viaja a través de init() data en scene.restart()
        //Restarua el cuerpo físico si viene de Wukong
        this.player.body.setSize(150, 320).setOffset(50 * altScale, 50 * altScale);

        this.hud.actualizarVidas(this.vidas);
        // Desactivar controles mientras se reproduce la animación
        this.physics.pause(); // Pausa físicas para evitar movimiento durante la animación
        this.player.setVelocity(0); // Detener al jugador
        this.player.anims.play('muerte', true); // Reproducir animación de muerte

        this.data.set('isSoundOn', this.isSoundOn); // El estado de sonido sigue en data
        
            // Detener la música si está sonando
        if (this.backgroundSound && this.backgroundSound.isPlaying) {
            this.backgroundSound.stop();
        }

        // Reiniciar la escena después de que termine la animación
        this.time.delayedCall(2000, () => { // Ajusta el tiempo al de la duración de la animación
            console.log(`Vidas restantes: ${this.vidas}`);
            if(this.vidas <= 0) {
                this.hud.actualizarVidas(this.vidas);
                this.gameOver();
            }else{
                this.physics.world.colliders.destroy(); // Reinicia las colisiones
                // Pasar puntos y galletas para que sobrevivan a la muerte; init() resetea el resto
                this.scene.restart({ puntos: this.puntos, galletasDisponibles: this.galletasDisponibles, vidas: this.vidas });
            }
        });
    }
}

nivel1Completado() {
    // Pausar el juego
    this.physics.pause();
    // Detener cualquier animación activa de la abuela
    this.player.anims.stop();
    // Tween para hacer que la abuela desaparezca gradualmente
    this.tweens.add({
        targets: this.player, // realizarlo a player
        alpha: 0, // Cambiar la opacidad a 0
        duration: 1500, // Duración del efecto en milisegundos (1.5 segundos)
        onComplete: () => {
            this.player.setVisible(false); // Esconder el sprite después del tween
            this.sound.stopAll();
            this.cacaSaltoSound.stop();
        
            this.mostrarPantallaVictoria();
        }
    });



}

mostrarPantallaVictoria() {


    // Fondo negro semitransparente
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7); // Negro con 70% de opacidad
    overlay.fillRect(
        this.cameras.main.worldView.x,
        this.cameras.main.worldView.y,
        this.cameras.main.width,
        this.cameras.main.height
    );

    // Mensaje de nivel completado
    const message = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 - 50,
        '¡Has pasado el nivel!\nViajando al siguiente destino.\n\n - En construcción -',
        {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
            align: 'center',
        }
    ).setOrigin(0.5).setDepth(10);

    // Botón para ir al menú principal
    const menuButton = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 + 100,
        'Ir al Menú',
        {
            fontSize: '36px',
            fontFamily: 'Bangers',
            backgroundColor: '#000000',
            padding: { left: 10, right: 15, top: 10, bottom: 15},
        }
    ).setOrigin(0.5).setInteractive().setDepth(10);

    aplicarHover(menuButton);

    menuButton.on('pointerdown', () => {
        this.scene.start('MenuScene'); // Cambiar a la escena del menú principal
    });

} 

crearLunaWukong(x) {
    // Crear la luna en la posición `x` y una posición temporal en `y`
    const luna = this.lunasWukong.create(x * altScale, this.scale.height - 200 * altScale, 'lunaWukong')
        .setScale(0.15  * altScale)
        .setBounce(0.5);

    // Ajustar la posición `y` para que esté sobre una plataforma o el suelo
    luna.body.setSize(300, 300); // Ajustar el cuerpo físico si es necesario
    luna.body.allowGravity = true; // Habilitar gravedad
    luna.setInteractive();

    // Reproducir animación (si existe)
    this.anims.create({
        key: 'brillarLunaWukong',
        frames: this.anims.generateFrameNumbers('lunaWukong', { start: 0, end: 5 }), // Ajusta los frames disponibles
        frameRate: 8,
        repeat: -1
    });
    luna.play('brillarLunaWukong');

    //console.log(`Luna Wukong creada en X: ${x}`);
}


recogerLunaWukong(player, luna) {
    luna.destroy(); // Eliminar la luna
    this.player.body.setSize(130 * altScale, 150 * altScale).setOffset(100 * altScale, 100 * altScale);
    this.gritoTransformacion.play();

    if (!this.isTransformed) {
        this.isTransformed = true; // Controlar el estado de transformación
        this.isTransforming = true; // Indicar que la transformación está en curso
        this.transformacionRestante = tiempoTransformacion; // Reiniciar el tiempo de transformación

         // Crear la barra de transformación al recoger la luna
        this.hud.crearBarraTransformacion();
        this.hud.dibujarBarraTransformacion(this.transformacionRestante, tiempoTransformacion);

        this.physics.pause(); // Pausar la física de toda la escena
        this.input.enabled = false; // Deshabilitar las entradas mientras ocurre la transformación

        this.player.play('transformWukong'); // Llama a la animación
        //this.player.setOrigin(0.5, 1);
        

        this.player.once('animationcomplete', (anim) => {
            if (anim.key === 'transformWukong') {
                this.player.play('idleWukong', true); // Cambiar a idleWukong manualmente
                if (this.isTransforming == true) {
                    //this.player.body.setOffset(140 * altScale ,80 * altScale);
                    this.player.body.setSize(130, 320).setOffset(150 * altScale, 150 * altScale);
                }
                
                //this.player.body.setSize(150 * altScale, 250 * altScale).setOffset(100 * altScale, 110 * altScale);
                this.isTransforming = false; // Finalizar transformación
                this.physics.resume(); // Reanudar la física
                this.input.enabled = true; // Reanudar las entradas
            }
        });
    }
}

revertirTransformacion() {
    this.isTransformed = false; // Cambiar el estado a la abuela normal

    // Cambiar el sprite y animación de vuelta a la abuela normal
    this.player.setTexture('abuelaMovimiento1');
    this.player.play('abuelaIdle');
    
    // Restablecer el cuerpo físico
    this.player.body.setSize(130, 320).setOffset(50 * altScale, 50 * altScale);

    // Eliminar la barra de transformación
    this.hud.eliminarBarraTransformacion();

    this.transformacionRestante = tiempoTransformacion; // Reiniciar el tiempo
}

crearBotonesTactiles() {
    const h = this.scale.height;
    const w = this.scale.width;
    const margen = 30;
    const estilo = {
        fontFamily: 'Bangers',
        fontSize: '52px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: { left: 22, right: 22, top: 14, bottom: 14 },
    };

    const btnIzq   = this.add.text(margen + 45,       h - margen - 40, '←', estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2).setAlpha(0.85).setInteractive();
    const btnDer   = this.add.text(margen + 160,      h - margen - 40, '→', estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2).setAlpha(0.85).setInteractive();
    const btnSaltar = this.add.text(w - margen - 160, h - margen - 40, '↑', estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2).setAlpha(0.85).setInteractive();
    const btnLanzar = this.add.text(w - margen - 45,  h - margen - 40, 'X', estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2).setAlpha(0.85).setInteractive();

    this.botonesMoviles = [btnIzq, btnDer, btnSaltar, btnLanzar];
    this.botonesMoviles.forEach(b => b.setVisible(false));

    // Botones hold (izquierda / derecha)
    btnIzq.on('pointerdown',  () => { entrada.izquierda = true; });
    btnIzq.on('pointerup',    () => { entrada.izquierda = false; });
    btnIzq.on('pointerout',   () => { entrada.izquierda = false; });
    btnDer.on('pointerdown',  () => { entrada.derecha = true; });
    btnDer.on('pointerup',    () => { entrada.derecha = false; });
    btnDer.on('pointerout',   () => { entrada.derecha = false; });

    // Botones pulso (saltar / lanzar)
    btnSaltar.on('pointerdown', () => { entrada.saltar = true; });
    btnLanzar.on('pointerdown', () => { entrada.lanzar = true; });

    // Mostrar al tocar, ocultar al usar teclado
    this.input.on('pointerdown', () => {
        this.botonesMoviles.forEach(b => b.setVisible(true));
    });
    this.input.keyboard.on('keydown', () => {
        this.botonesMoviles.forEach(b => b.setVisible(false));
        entrada.izquierda = false;
        entrada.derecha   = false;
    });
}

}



export default GameScene;
