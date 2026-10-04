import Phaser from 'phaser';
import Monumento from '../monumento.js';
import Enemigos from '../enemigos.js';
import CollisionManager from '../collisionManager.js';
import entrada from '../entrada.js';
import { BARCELONA } from '../niveles/barcelona.js';
import { aplicarHover } from '../ui/botonTexto.js';
import HUD from '../ui/hud.js';
import Abuela from '../abuela.js';
import { cargar, guardar } from '../almacenamiento.js';
import { ECONOMIA } from '../economia.js';
import { asegurarTexturaPeseta } from '../ui/peseta.js';
import { desbloquearHazana, sumarEstadistica } from '../hazanas.js';
import { avisarHazana } from '../ui/avisoHazana.js';

const altScale = 1; // Siempre 1: altura de diseño fija a 1080px (Phaser.Scale.FIT)
const sueloAltura = 50;
const LEVEL_WIDTH = BARCELONA.anchoNivel; // Ancho total del nivel (definido en barcelona.js)


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // init() se llama antes de create() en cada restart. Gestiona el estado persistente.
    init(data) {
        // El reloj de la escena puede venir parado si se reinició o se salió desde el menú de pausa
        this.time.paused = false;

        // Puntos y galletas sobreviven a perder una vida; se pasan explícitamente en scene.restart()
        this.puntos = data?.puntos ?? 0;
        this.galletasDisponibles = data?.galletasDisponibles ?? 10;
        this.vidas = data?.vidas ?? 3;
        // Las pesetas recogidas también sobreviven a perder una vida. Se guardan los índices
        // de las ya recogidas para que no reaparezcan, y se ingresan en el saldo al acabar la partida.
        this.pesetasPartida = data?.pesetasPartida ?? 0;
        this.pesetasRecogidas = data?.pesetasRecogidas ?? [];
        // Continuar tras un game over (solo una vez por partida) reanuda con menos salud
        this.continuarUsado = data?.continuarUsado ?? false;
        this.saludInicial = data?.saludInicial ?? 100;

        // Lo que ha pasado en la partida, para las hazañas. Sobrevive a perder una vida.
        this.seguimiento = data?.seguimiento ?? {
            danoRecibido: false,
            galletaLanzada: false,
            vidaPerdida: false,
            monumentosVistos: [],
        };

        // Partida nueva (no una vida más de la misma): se gastan los objetos comprados en La Farmacia
        this.escudoInicial = false;
        if (!data?.continuaPartida) this.usarObjetosDeInicio();
    }

    usarObjetosDeInicio() {
        const inventario = { ...cargar().inventario };
        const usar = (id) => {
            if (inventario[id] <= 0) return false;
            inventario[id]--;
            return true;
        };

        if (usar('galletasExtra')) this.galletasDisponibles = ECONOMIA.galletasConExtra;
        if (usar('vidaExtra')) this.vidas = ECONOMIA.vidasConExtra;
        this.escudoInicial = usar('escudo');
        guardar({ inventario });
    }

    // Desbloquea la hazaña si no estaba conseguida y lo avisa en pantalla
    lograrHazana(id) {
        const hazana = desbloquearHazana(id);
        if (hazana) avisarHazana(this, hazana);
    }

    // Suma a una estadística acumulada y desbloquea su hazaña al llegar a la meta
    contarParaHazana(estadistica, id) {
        const total = sumarEstadistica(estadistica);
        const meta = ECONOMIA.hazanas.find(h => h.id === id).meta;
        if (total >= meta) this.lograrHazana(id);
    }

    comprobarHazanaPuntos() {
        const meta = ECONOMIA.hazanas.find(h => h.id === 'abuelaMillonaria').meta;
        if (this.puntos >= meta) this.lograrHazana('abuelaMillonaria');
        // El estado de la abuela (salud, invulnerabilidad, transformación, etc.)
        // se reinicia al crear la instancia de Abuela en create()
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
    // Franja negra detrás del suelo para que los huecos se vean negros en vez de azules
    this.add.rectangle(0, this.scale.height - 180, LEVEL_WIDTH, 250, 0x000000).setOrigin(0, 0);
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

    this.abuela = new Abuela(this, BARCELONA.jugadorInicio.x, BARCELONA.jugadorInicio.y);
    this.player = this.abuela.sprite; // Alias para colisiones y compatibilidad
    if (this.escudoInicial) this.abuela.activarEscudo(ECONOMIA.duracionEscudo);
    this.abuela.salud = this.saludInicial;

   
    // Leer dificultad del almacenamiento antes de usarla
    const ajustesDif = cargar();
    this.dificultad = ajustesDif.dificultad; // 0=fácil, 1=medio, 2=difícil
    // Multiplicador de dificultad: 0=fácil(0.7x), 1=medio(1x), 2=difícil(1.3x)
    this.multDificultad = [0.7, 1, 1.3][this.dificultad];
    this.enemigosManager = new Enemigos(this, altScale, this.multDificultad);
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
        this.contarParaHazana('palomas', 'reinaDelBaston');
        this.comprobarHazanaPuntos();
    });

    this.physics.add.overlap(this.galletas, this.enemigosManager.patinetes, (galleta, patinete) => {
        galleta.destroy();
        patinete.destroy();
        if (this.isSoundOn && this.gritoPatineteSound) {
            this.gritoPatineteSound.play();
        }
        this.puntos += 25;
        this.hud.actualizarPuntos(this.puntos);
        this.contarParaHazana('patinetes', 'cazapatinetes');
        this.comprobarHazanaPuntos();
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
            this.seguimiento.galletaLanzada = true;
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
    


    // __________________________________PESETAS__________________________________________
    asegurarTexturaPeseta(this);
    this.pesetas = this.physics.add.group({ allowGravity: false });
    this.crearPesetas(BARCELONA.recogibles.pesetas);
    this.physics.add.overlap(this.player, this.pesetas, this.recogerPeseta, null, this);


    // __________________________________HUD__________________________________________
    this.hud = new HUD(this, {
        puntos: this.puntos,
        salud: this.abuela.salud,
        vidas: this.vidas,
        galletasDisponibles: this.galletasDisponibles,
        pesetas: this.pesetasPartida,
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
    // Leer ajustes persistentes
    const ajustes = cargar();
    this.isSoundOn = ajustes.musicaOn && ajustes.efectosOn;
    this.musicaOn = ajustes.musicaOn;
    this.efectosOn = ajustes.efectosOn;
    // this.dificultad ya se leyó arriba, antes de crear enemigos

     this.backgroundSound = this.sound.add('backgroundSound', {
        loop: true,
        volume: 0.15,
    });
     
    // Iniciar la música si estaba encendida
    if (this.musicaOn) {
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
        this.isSoundOn = !this.isSoundOn;
        this.musicaOn = this.isSoundOn;
        this.efectosOn = this.isSoundOn;
        guardar({ musicaOn: this.isSoundOn, efectosOn: this.isSoundOn });

        if (this.isSoundOn) {
            this.soundButton.setTexture('soundOn');
            this.backgroundSound.play();
        } else {
            this.soundButton.setTexture('soundOff');
            this.backgroundSound.stop();
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
    this.estaPausado = false;
    this.elementosPausa = [];

    // Tecla P para pausar
    this.input.keyboard.addKey('P').on('down', () => this.togglePausa());

    // Botón de pausa táctil (a la izquierda del botón de sonido)
    const pausaX = this.soundButton.x - 70 * altScale;
    const pausaY = this.soundButton.y;
    const pausaR = 28 * altScale;

    const circuloPausa = this.add.graphics();
    circuloPausa.fillStyle(0x222222, 0.7);
    circuloPausa.fillCircle(0, 0, pausaR);
    circuloPausa.lineStyle(3, 0xffd700, 1);
    circuloPausa.strokeCircle(0, 0, pausaR);
    circuloPausa.setScrollFactor(0).setDepth(2);
    circuloPausa.setPosition(pausaX, pausaY);

    const iconoPausa = this.add.text(pausaX, pausaY, '⏸', {
        fontFamily: 'Bangers', fontSize: `${Math.round(28 * altScale)}px`, color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2);

    // Zona interactiva circular
    this.btnPausa = this.add.zone(pausaX, pausaY, pausaR * 2, pausaR * 2)
        .setScrollFactor(0).setDepth(2).setInteractive();
    this.btnPausa.on('pointerdown', () => this.togglePausa());
    }

    //________________________________UPDATE__________________________________
    update() {
        if (this.estaPausado) return;

        this.abuela.actualizar();
        this.updateParallax();

        if (this.player.x >= BARCELONA.finNivel * altScale && !this.nivelCompletado) {
            this.nivelCompletado = true;
            this.nivel1Completado();
        }

        const limiteInferior = this.scale.height - 10;
        if (this.player.y > limiteInferior) {
            this.abuela.salud = 0;
        }

        this.verificaMuerte();
        this.abuela.actualizarTransformacion(this.game.loop.delta);
    }
        
    
    


togglePausa() {
    if (this.nivelCompletado || this.abuela.haMuerto) return;

    this.estaPausado = !this.estaPausado;
    // Para también el reloj de la escena: sin esto los temporizadores que generan palomas
    // y patinetes siguen corriendo y al reanudar salen todos de golpe
    this.time.paused = this.estaPausado;

    if (this.estaPausado) {
        this.physics.pause();
        if (this.backgroundSound && this.backgroundSound.isPlaying) {
            this.backgroundSound.pause();
        }

        const cx = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const cy = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(
            this.cameras.main.worldView.x,
            this.cameras.main.worldView.y,
            this.cameras.main.width,
            this.cameras.main.height
        );
        overlay.setDepth(3);
        this.elementosPausa.push(overlay);

        const titulo = this.add.text(cx, cy - 80, 'PAUSA', {
            fontFamily: 'Bangers', fontSize: '52px', color: '#ffd700',
        }).setOrigin(0.5).setDepth(3);
        this.elementosPausa.push(titulo);

        const estiloBoton = {
            fontFamily: 'Bangers', fontSize: '32px', color: '#ffffff',
            padding: { left: 10, right: 10, top: 8, bottom: 8 },
        };

        const btnReanudar = this.add.text(cx, cy - 10, 'Reanudar', estiloBoton)
            .setOrigin(0.5).setInteractive().setDepth(3);
        aplicarHover(btnReanudar);
        btnReanudar.on('pointerdown', () => this.togglePausa());
        this.elementosPausa.push(btnReanudar);

        const btnReiniciar = this.add.text(cx, cy + 50, 'Reiniciar', estiloBoton)
            .setOrigin(0.5).setInteractive().setDepth(3);
        aplicarHover(btnReiniciar);
        btnReiniciar.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.restart({ puntos: 0, galletasDisponibles: 10, vidas: 3 });
        });
        this.elementosPausa.push(btnReiniciar);

        const btnSalir = this.add.text(cx, cy + 110, 'Salir al menú', estiloBoton)
            .setOrigin(0.5).setInteractive().setDepth(3);
        aplicarHover(btnSalir);
        btnSalir.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('MenuScene');
        });
        this.elementosPausa.push(btnSalir);
    } else {
        this.physics.resume();
        if (this.musicaOn && this.backgroundSound) {
            this.backgroundSound.resume();
        }
        this.elementosPausa.forEach(e => e.destroy());
        this.elementosPausa = [];
    }
}

//___________________________________METODOS GAME_________________________________

colisionPaloma(player, paloma) {
    if (!this.abuela.recibirDano(Math.round(10 * this.multDificultad))) return;
    this.seguimiento.danoRecibido = true;

    if (this.isSoundOn && this.abuelaGolpeSound) {
        this.abuelaGolpeSound.play();
    }

    this.hud.actualizarSalud(this.abuela.salud);

    // Crear la animación de explosión en la posición de la paloma
    const explosion = this.add.sprite(paloma.x, paloma.y, 'explosion')
        .setScale(0.5 * altScale)

    explosion.play('efectoExplosion', true);

    // Sonido aleatorio de grito de pájaro al chocar con abuela
    if (this.isSoundOn && this.gritoPajaros) {
        const sonidoAleatorio = Phaser.Math.Between(0, this.gritoPajaros.length - 1);
        console.log(`Reproduciendo sonido de grito de pájaro: ${sonidoAleatorio}`);
        this.gritoPajaros[sonidoAleatorio].play();
    }

    explosion.on('animationcomplete', () => {
        explosion.destroy();
    });

    paloma.destroy();
    this.verificaMuerte();
}

colisionPatinete(player, patinete) {
    if (!this.abuela.recibirDano(Math.round(30 * this.multDificultad))) return;
    this.seguimiento.danoRecibido = true;

    if (this.isSoundOn && this.choquePatineteSound) {
        this.choquePatineteSound.play();
    }

    this.hud.actualizarSalud(this.abuela.salud);

    // Tinte rojo como indicativo de daño (el parpadeo lo gestiona recibirDano)
    this.player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
        this.player.clearTint();
    });

    this.verificaMuerte();
}

recogerPastilla(player, pastilla) {
    this.abuela.salud = Math.min(this.abuela.salud + 20, 100);
    this.hud.actualizarSalud(this.abuela.salud);
    if (this.isSoundOn && this.cogerGalletasSound) {
        this.cogerGalletasSound.play();
    }
    pastilla.destroy();
}

crearPesetas(posiciones) {
    posiciones.forEach(({ x, y }, indice) => {
        if (this.pesetasRecogidas.includes(indice)) return;
        const peseta = this.pesetas.create(x * altScale, this.scale.height - y * altScale, 'peseta').setDepth(1);
        peseta.indice = indice;
        this.tweens.add({
            targets: peseta,
            y: peseta.y - 12 * altScale,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    });
}

recogerPeseta(player, peseta) {
    this.pesetasRecogidas.push(peseta.indice);
    this.tweens.killTweensOf(peseta);
    peseta.destroy();

    this.pesetasPartida += ECONOMIA.pesetaRecogida;
    this.hud.actualizarPesetas(this.pesetasPartida);
    if (this.isSoundOn && this.cogerGalletasSound) {
        this.cogerGalletasSound.play();
    }
}

// Pasa las pesetas de la partida al saldo guardado. Se llama al acabar la partida
// (victoria o game over); deja el contador a 0 para no ingresarlas dos veces.
ingresarPesetas() {
    const ganadas = this.pesetasPartida;
    this.pesetasPartida = 0;
    const saldo = cargar().pesetas + ganadas;
    guardar({ pesetas: saldo });
    return { ganadas, saldo };
}

// Devuelve una X aleatoria dentro de un bloque de suelo sólido
xSobreSuelo() {
    const bloques = BARCELONA.bloquesYHuecos.filter(b => b.ancho !== undefined);
    const bloque = bloques[Phaser.Math.Between(0, bloques.length - 1)];
    return Phaser.Math.Between(bloque.x + 50, bloque.x + bloque.ancho - 50);
}

generarPastillas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = this.xSobreSuelo();
        const y = this.scale.height - 200;
        const pastilla = this.pastillas.create(x, y, 'paracetamol').setScale(0.2 * altScale).setBounce(0.5).setDepth(1);
        pastilla.play('brillarParacetamol');
    }
}

generarFrascosGalletas(cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const x = this.xSobreSuelo();
        const y = this.scale.height - 200;
        const frasco = this.frascosGalletas.create(x, y, 'frascoGalletas').setScale(0.3 * altScale).setBounce(0.5).setSize(210, 200);
        frasco.body.setAllowGravity(true);
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
    this.comprobarHazanaTurista(scrollX);
    this.enemigosManager.actualizar(scrollX); //maneja a todos los enemigos   
}


comprobarHazanaTurista(scrollX) {
    const vistos = this.seguimiento.monumentosVistos;
    const total = this.monumentoManager.monumentos.length;
    if (vistos.length === total) return;

    this.monumentoManager.indicesEnPantalla(scrollX).forEach((i) => {
        if (!vistos.includes(i)) vistos.push(i);
    });
    if (vistos.length === total) this.lograrHazana('turista');
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



    const { ganadas, saldo } = this.ingresarPesetas();
    this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 + 50 * altScale,
        `Pesetas: +${ganadas}  (ahorros: ${saldo})`,
        {
            fontSize: `${28 * altScale}px`,
            fill: '#ffd700',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }
    ).setOrigin(0.5).setDepth(3);

    this.crearBotonContinuar(saldo);

    // Mostrar botón para reiniciar el juego
    const restartButton = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 * altScale + 160,
        'Reiniciar',
        {
            fontSize: `${32  * altScale}px`,
            fill: '#ffffff',
            fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5},
        }
    ).setOrigin(0.5).setInteractive().setDepth(3);

    aplicarHover(restartButton);
    

    // Al hacer clic en el botón, reiniciar el juego con valores iniciales
    restartButton.on('pointerdown', () => {
        this.scene.restart({ puntos: 0, galletasDisponibles: 10, vidas: 3 });
    });

    // Detener música y sonidos si están activos
    if (this.backgroundSound && this.backgroundSound.isPlaying) {
        this.backgroundSound.stop();
    }

    // Opción de volver al menú principal (opcional)
    const menuButton = this.add.text(
        this.cameras.main.worldView.x + this.cameras.main.width / 2,
        this.cameras.main.worldView.y + this.cameras.main.height / 2 * altScale + 220,
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

// Opción de seguir la partida pagando pesetas. Solo se ofrece una vez por partida.
crearBotonContinuar(saldo) {
    if (this.continuarUsado) return;

    const { precio, vidas, salud } = ECONOMIA.continuar;
    const x = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const y = this.cameras.main.worldView.y + this.cameras.main.height / 2 + 100 * altScale;
    const estilo = {
        fontSize: `${32 * altScale}px`,
        fontFamily: 'Bangers',
        padding: { left: 5, right: 5, top: 5, bottom: 5 },
    };

    if (saldo < precio) {
        this.add.text(x, y, `Continuar: ${precio} pesetas (te faltan ${precio - saldo})`, { ...estilo, fill: '#888888' })
            .setOrigin(0.5).setDepth(3);
        return;
    }

    const boton = this.add.text(x, y, `Continuar: ${precio} pesetas`, { ...estilo, fill: '#ffffff' })
        .setOrigin(0.5).setInteractive().setDepth(3);
    aplicarHover(boton);
    boton.on('pointerdown', () => {
        const datos = cargar();
        if (datos.pesetas < precio) return;
        guardar({ pesetas: datos.pesetas - precio });
        this.physics.world.colliders.destroy();
        this.scene.restart({
            puntos: this.puntos,
            galletasDisponibles: this.galletasDisponibles,
            vidas,
            saludInicial: salud,
            pesetasRecogidas: this.pesetasRecogidas,
            continuaPartida: true,
            continuarUsado: true,
            seguimiento: this.seguimiento,
        });
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
    if (this.abuela.salud <= 0 && !this.abuela.haMuerto) {
        this.abuela.haMuerto = true;
        this.seguimiento.danoRecibido = true;
        this.seguimiento.vidaPerdida = true;
        this.vidas--;
        this.abuela.isTransformed = false;
        // Restaura el cuerpo físico si viene de Wukong
        this.player.body.setSize(150, 320).setOffset(50 * altScale, 50 * altScale);

        this.hud.actualizarVidas(this.vidas);
        this.physics.pause();
        this.player.setVelocity(0);
        this.player.anims.play('muerte', true);

        if (this.backgroundSound && this.backgroundSound.isPlaying) {
            this.backgroundSound.stop();
        }

        this.time.delayedCall(2000, () => {
            console.log(`Vidas restantes: ${this.vidas}`);
            if (this.vidas <= 0) {
                this.hud.actualizarVidas(this.vidas);
                this.gameOver();
            } else {
                this.physics.world.colliders.destroy();
                this.scene.restart({
                    puntos: this.puntos,
                    galletasDisponibles: this.galletasDisponibles,
                    vidas: this.vidas,
                    pesetasPartida: this.pesetasPartida,
                    pesetasRecogidas: this.pesetasRecogidas,
                    continuaPartida: true,
                    continuarUsado: this.continuarUsado,
                    seguimiento: this.seguimiento,
                });
            }
        });
    }
}

nivel1Completado() {
    this.physics.pause();
    this.player.anims.stop();

    // Calcular bonificaciones
    this.bonusNivel = 500;
    this.bonusVidas = this.vidas * 100;
    this.puntosBase = this.puntos;
    this.puntos += this.bonusNivel + this.bonusVidas;

    this.tweens.add({
        targets: this.player,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
            this.player.setVisible(false);
            this.sound.stopAll();
            this.cacaSaltoSound.stop();
            this.mostrarPantallaVictoria();
        }
    });
}

mostrarPantallaVictoria() {
    const cx = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const cy = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const estiloTexto = { fontFamily: 'Bangers', fontSize: '28px', color: '#ffffff', align: 'center' };

    // Fondo negro semitransparente
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(
        this.cameras.main.worldView.x,
        this.cameras.main.worldView.y,
        this.cameras.main.width,
        this.cameras.main.height
    );
    overlay.setDepth(10);

    // Título
    this.add.text(cx, cy - 330, '¡Nivel completado!', {
        fontFamily: 'Bangers', fontSize: '48px', color: '#ffd700', align: 'center',
    }).setOrigin(0.5).setDepth(10);

    // Estrellas según puntuación total
    let estrellas = 1;
    if (this.puntos >= 800) estrellas = 2;
    if (this.puntos >= 1500) estrellas = 3;
    const estrellasTexto = '★'.repeat(estrellas) + '☆'.repeat(3 - estrellas);
    this.add.text(cx, cy - 265, estrellasTexto, {
        fontFamily: 'Bangers', fontSize: '64px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(10);

    // Desglose de puntos
    const desglose = [
        `Puntos en partida:  ${this.puntosBase}`,
        `Bonus nivel:  +${this.bonusNivel}`,
        `Bonus vidas (${this.vidas} x 100):  +${this.bonusVidas}`,
        `──────────────────`,
        `Total:  ${this.puntos}`,
    ].join('\n');
    this.add.text(cx, cy - 140, desglose, {
        ...estiloTexto, lineSpacing: 8,
    }).setOrigin(0.5).setDepth(10);

    // Récord
    const datosGuardados = cargar();
    const esNuevoRecord = this.puntos > datosGuardados.record;
    if (esNuevoRecord) {
        guardar({ record: this.puntos });
        this.add.text(cx, cy - 10, '¡Nuevo récord!', {
            fontFamily: 'Bangers', fontSize: '36px', color: '#ff4444',
        }).setOrigin(0.5).setDepth(10);
    } else {
        this.add.text(cx, cy - 10, `Récord: ${datosGuardados.record}`, {
            ...estiloTexto, color: '#aaaaaa',
        }).setOrigin(0.5).setDepth(10);
    }

    // Hazañas de fin de nivel (sus pesetas van directas al saldo, antes del desglose)
    this.lograrHazana('primeraVictoria');
    if (!this.seguimiento.danoRecibido) this.lograrHazana('intocable');
    if (!this.seguimiento.galletaLanzada) this.lograrHazana('pacifista');
    if (!this.seguimiento.vidaPerdida) this.lograrHazana('superviviente');
    if (estrellas === 3) this.lograrHazana('tresEstrellas');
    this.comprobarHazanaPuntos();

    // Pesetas: las recogidas más las recompensas por completar el nivel
    const recogidas = this.pesetasPartida;
    const pesetasEstrellas = ECONOMIA.bonusEstrellas[estrellas - 1];
    const pesetasVidas = this.vidas * ECONOMIA.bonusPorVida;
    this.pesetasPartida += ECONOMIA.completarNivel + pesetasEstrellas + pesetasVidas;
    const { ganadas, saldo } = this.ingresarPesetas();
    const desglosePesetas = [
        `Pesetas recogidas:  +${recogidas}`,
        `Nivel completado:  +${ECONOMIA.completarNivel}`,
        `Estrellas (${estrellas}):  +${pesetasEstrellas}`,
        `Vidas (${this.vidas} x ${ECONOMIA.bonusPorVida}):  +${pesetasVidas}`,
        `Total:  +${ganadas} pesetas  (ahorros: ${saldo})`,
    ].join('\n');
    this.add.text(cx, cy + 115, desglosePesetas, {
        ...estiloTexto, color: '#ffd700', lineSpacing: 8,
        padding: { left: 5, right: 5, top: 5, bottom: 5 },
    }).setOrigin(0.5).setDepth(10);

    // Botón menú
    const menuButton = this.add.text(cx, cy + 265, 'Ir al Menú', {
        fontFamily: 'Bangers', fontSize: '36px', color: '#ffffff',
        backgroundColor: '#333333',
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
    }).setOrigin(0.5).setInteractive().setDepth(10);
    aplicarHover(menuButton);

    menuButton.on('pointerdown', () => {
        this.scene.start('MenuScene');
    });
} 

crearLunaWukong(x) {
    // Crear la luna en la posición `x` y una posición temporal en `y`
    const luna = this.lunasWukong.create(x * altScale, this.scale.height - 200 * altScale, 'lunaWukong')
        .setScale(0.3 * altScale)
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
    luna.destroy();
    this.abuela.transformar();
    this.contarParaHazana('transformaciones', 'wukongMaestro');
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
