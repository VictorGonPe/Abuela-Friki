import Phaser from 'phaser';
import Monumento from '../monumento.js';
import Enemigos from '../enemigos.js';
import CollisionManager from '../collisionManager.js';
import entrada from '../entrada.js';
import { nivelActual } from '../niveles/index.js';
import { aplicarHover } from '../ui/botonTexto.js';
import HUD from '../ui/hud.js';
import Abuela from '../abuela.js';
import { cargar, guardar } from '../almacenamiento.js';
import { ECONOMIA } from '../economia.js';
import { asegurarTexturaPeseta } from '../ui/peseta.js';
import { desbloquearHazana, sumarEstadistica } from '../hazanas.js';
import { avisarHazana } from '../ui/avisoHazana.js';

const altScale = 1; // Siempre 1: altura de diseño fija a 1080px (Phaser.Scale.FIT)
const VOLUMEN_TRANSFORMACION_CYBORG = 0.4;
// La luna es la de Wukong, teñida según la transformación que da
const TINTE_LUNA = { cibernetica: 0xff3030 };
// Rayo del ojo de la Abuela Cibernética. `brillo` es lo que dura el destello, en ms.
// `ojos` da el centro del ojo en píxeles del fotograma, por hoja: no está en el mismo sitio
// al andar que quieta. Si cambian los sprites hay que volver a medirlo.
const RAYO = {
    velocidad: 1600, duracion: 800, ancho: 90, alto: 10, brillo: 180,
    ojos: {
        abuelaQuietaCibernetica: { x: 138, y: 147 },
        abuelaMov1Cibernetica:   { x: 147, y: 142 },
        abuelaMov2Cibernetica:   { x: 138, y: 140 },
        abuelaVueloCibernetica:  { x: 139, y: 146 },
    },
};
// Galleta de la abuela normal. Sale de la mano cuando el brazo ya está estirado: `retraso` son los ms
// que tarda la animación de lanzar en llegar a ese fotograma, y `mano` es el punto de salida, justo
// delante de los dedos, en píxeles de ese fotograma (de `fotograma.ancho` x `fotograma.alto`).
const GALLETA = { velocidad: 800, duracion: 3000, retraso: 125, mano: { x: 235, y: 222 }, fotograma: { ancho: 363, alto: 378 } };
// Bola de energía de la Abuela Wukong. `mano` es la mano en píxeles del fotograma de disparo.
const BOLA = { velocidad: 900, duracion: 1500, radio: 22, mano: { x: 335, y: 268 } };
const sueloAltura = 50;


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // init() se llama antes de create() en cada restart. Gestiona el estado persistente.
    init(data) {
        // Los datos del nivel que se juega (js/niveles/). Lo elige el menú y se guarda en el registro
        this.nivel = nivelActual(this.registry);
        // El reloj de la escena puede venir parado si se reinició o se salió desde el menú de pausa
        this.time.paused = false;
        this.tactilVisible = false; // los botones táctiles se crean ocultos en cada arranque

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
    this.physics.world.setBounds(0, 0, this.nivel.anchoNivel, this.scale.height);
    this.cameras.main.setBounds(0, 0, this.nivel.anchoNivel, this.scale.height);

    const fondo = this.nivel.fondo;
    this.add.rectangle(0, 0, this.nivel.anchoNivel, this.scale.height, fondo.velo.color)
    .setOrigin(0, 0)
    .setAlpha(fondo.velo.alpha)
    .setDepth(0.5); // Ajustar profundidad


    // Fondo azul cielo que ocupa todo el nivel ________________________FONDOS___________________________________
    this.add.rectangle(0, 0, this.nivel.anchoNivel, this.scale.height, fondo.cielo).setOrigin(0, 0);
    // Franja negra detrás del suelo para que los huecos se vean negros en vez de azules
    this.add.rectangle(0, this.scale.height - 180, this.nivel.anchoNivel, 250, 0x000000).setOrigin(0, 0);
    // Fondo montañoso que se moverá lentamente
    this.backgroundMountain = this.add.tileSprite(0, this.scale.height - 40, this.nivel.anchoNivel, 1080, fondo.lejano).setOrigin(0, 1).setScrollFactor(0).setScale(1);
    // Fondo de ciudad que se moverá más rápido
    this.backgroundCiudad = this.add.tileSprite(0, this.scale.height - 40, this.nivel.anchoNivel, 1080, fondo.ciudad).setOrigin(0, 1).setScrollFactor(0).setScale(1);
    if (fondo.tinteLejano) this.backgroundMountain.setTint(fondo.tinteLejano);
    if (fondo.tinteCiudad) this.backgroundCiudad.setTint(fondo.tinteCiudad);
    this.backgroundCesped = this.add.tileSprite(
    0,
    this.scale.height - 40,
    this.nivel.anchoNivel,
    1080,
    fondo.cesped
    )
    .setOrigin(0, 1)
    .setScale(1);

    
    //Instancia y creacion de monumentos
    this.monumentoManager = new Monumento(this, altScale); //Esta escena y la escala
    this.monumentoManager.crearMonumentos(this.nivel.monumentos);


    //__________________CREAR ESCENARIO____________________
    // Imágenes decorativas del nivel (tiendas, edificios, objetos de calle)
    this.nivel.imagenes.forEach(({ key, x, y, escala, depth, flipX }) => {
        const img = this.add.image(x * altScale, this.scale.height - y * altScale, key)
            .setScale(escala * altScale)
            .setOrigin(0.5, 1);
        if (depth !== undefined) img.setDepth(depth);
        if (flipX) img.flipX = true;
    });

    if (this.nivel.rotulo) {
        const { texto, x, y } = this.nivel.rotulo;
        this.add.text(x, this.scale.height - y, texto, {
            fontFamily: 'Bangers', fontSize: '110px', color: '#ffffff', stroke: '#7a1b1b', strokeThickness: 12,
            padding: { left: 10, right: 10, top: 10, bottom: 10 },
        }).setOrigin(0.5, 1);
    }

    // Pivotes repetidos (Sagrada Família) y vallas de obra
    this.nivel.pivotes.forEach(({ inicio, fin }) => this.crearPivote(inicio, fin));
    this.nivel.vallasObra.forEach(({ inicio, fin }) => this.ponerVallasObra(inicio, fin));

   
    

    // Crear grupo de plataformas, incluido el suelo__________________SUELOS_______________________________
    this.platforms = this.physics.add.staticGroup();

this.nivel.bloquesYHuecos.forEach((bloque) => {
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
this.nivel.plataformas.forEach(p => {
    if (p.tipo === 'uno')    this.plataformaDeUno(p.x, p.y);
    else if (p.tipo === 'dos')    this.plataformaDeDos(p.x1, p.y1, p.x2, p.y2);
    else if (p.tipo === 'grande') this.plataformaGrande(p.x, p.y);
});
this.crearPlataformasMoviles(this.nivel.plataformasMoviles);
    

    //this.platforms.body.setSize(140, 70).setOffset(50 * altScale, 50 * altScale);

   

    // __________________________________CREAR ABUELA___________________________________________

    this.abuela = new Abuela(this, this.nivel.jugadorInicio.x, this.nivel.jugadorInicio.y);
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
    this.enemigosManager.crearPalomas(this.nivel.enemigos.palomas);
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
    this.enemigosManager.crearPatinetes(this.nivel.enemigos.patinetes); //Crear patinetes
    // Crear colisiones entre los patinetes y el suelo
    this.physics.add.collider(this.enemigosManager.patinetes, this.platforms);
    this.physics.add.overlap(this.enemigosManager.patinetes, this.player, this.colisionPatinete, null, this); //overlap lanza un evento

    // Habilitar controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.addPointer(3); // permite hasta 4 toques simultáneos
    this.crearBotonesTactiles();
    this.gritoPatineteSound = this.sound.add('gritoPatinete', { volume: 0.5 });

    // __________________________________CACAS__________________________________________

    this.enemigosManager.crearCacas(this.nivel.enemigos.cacas); // Crear cacas

    // Colisiones de cacas con el jugador usando CollisionManager
    this.physics.add.overlap(this.enemigosManager.cacas,this.player,this.collisionManager.colisionCaca.bind(this.collisionManager),null,this); // Manejado por CollisionManager
    this.physics.add.collider(this.enemigosManager.cacas, this.platforms);// Colisiones suelo
    //this.physics.add.overlap(this.enemigosManager.cacas, this.player, colisionCaca, null, this);  //detecta colisiones cacas

    // __________________________________GALLETAS__________________________________________
    // Crear grupo de frascos de galletas
    this.frascosGalletas = this.physics.add.group();

    // Generar frascos de galletas en el nivel
    this.generarFrascosGalletas(this.nivel.recogibles.frascosGalletas);
    

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
        this.destruirPaloma(paloma);
    });

    this.physics.add.overlap(this.galletas, this.enemigosManager.patinetes, (galleta, patinete) => {
        galleta.destroy();
        this.destruirPatinete(patinete);
    }); 

    // Gasta una galleta y la suelta un instante después, cuando la animación tiene el brazo estirado.
    // Devuelve si había galleta que lanzar.
    this.lanzarGalleta = () => {
        if (this.galletasDisponibles <= 0) return false;

        this.seguimiento.galletaLanzada = true;
        this.galletasDisponibles--;
        this.hud.actualizarGalletas(this.galletasDisponibles);
        this.time.delayedCall(GALLETA.retraso, () => this.soltarGalleta());
        return true;
    };
 
    this.crearTexturaRayo();
    this.crearTexturaBola();
    // Bola que crece en la mano de Wukong mientras se carga. Se recoloca en `postupdate`,
    // cuando las físicas ya han movido a la abuela, para que no vaya un fotograma por detrás.
    this.cargaBola = this.add.image(0, 0, 'bolaEnergia').setDepth(1.2).setVisible(false);
    const seguirMano = () => {
        if (!this.cargaBola.visible) return;
        const mano = this.puntoDelSprite(BOLA.mano);
        const direccion = this.player.flipX ? -1 : 1;
        this.cargaBola.setPosition(mano.x + direccion * BOLA.radio * this.cargaBola.scaleX, mano.y);
    };
    this.events.on('postupdate', seguirMano);
    this.events.once('shutdown', () => this.events.off('postupdate', seguirMano));

    //____________________________LUNA_WUKONG___________________________
    // Crear un grupo de físicas para el objeto lunaWukong
    this.lunasWukong = this.physics.add.group({
        allowGravity: true, // Permitir gravedad
        bounceY: 0.5,       // Rebote ligero si cae
        collideWorldBounds: true, // Evitar que salga del mundo
        setDepth: 1
    });

    

    // Posicionar una lunaWukong en una coordenada específica
    this.nivel.recogibles.lunasWukong.forEach(x => this.crearLunaWukong(x, 'wukong'));
    this.nivel.recogibles.lunasCiberneticas.forEach(x => this.crearLunaWukong(x, 'cibernetica'));
    this.nivel.recogibles.lingotesVerdes.forEach(x => this.crearLingoteVerde(x));

    // Recoger objeto
    this.physics.add.overlap(this.player, this.lunasWukong, this.recogerLunaWukong, null, this);

    // Colisiones plataformas
    this.physics.add.collider(this.lunasWukong, this.platforms);
    


    // __________________________________PESETAS__________________________________________
    asegurarTexturaPeseta(this);
    this.pesetas = this.physics.add.group({ allowGravity: false });
    this.crearPesetas(this.nivel.recogibles.pesetas);
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

    this.generarPastillas(this.nivel.recogibles.pastillas); // Genera pastillas en posiciones aleatorias
   
    // Colisiones entre las pastillas y las plataformas
    this.physics.add.collider(this.pastillas, this.platforms);
    this.physics.add.overlap(this.player, this.pastillas, this.recogerPastilla, null, this); //abuela recoje pastilla
    

       
     //__________________________SONIDOS___________________
    // Leer ajustes persistentes
    const ajustes = cargar();
    this.isSoundOn = ajustes.musicaOn && ajustes.efectosOn;
    this.musicaOn = ajustes.musicaOn;
    this.efectosOn = ajustes.efectosOn;
    // this.dificultad ya se leyó arriba, antes de crear enemigos

     this.backgroundSound = this.sound.add(this.nivel.musica, {
        loop: true,
        volume: 0.2,
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
            if (this.abuela.volando) this.vueloSound.play();
        } else {
            this.soundButton.setTexture('soundOff');
            this.backgroundSound.stop();
            this.vueloSound.stop();
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
    this.abuelaMuerteSound = this.sound.add('abuelaMuerte', { volume: 0.6 });
    this.verdeGolpeSound = this.sound.add('abuelaVerdeGolpe', { volume: 0.4 });
    this.verdeExplosionSound = this.sound.add('abuelaVerdeExplosion', { volume: 0.6 });
    // Bajo a propósito: el rayo se dispara muchas veces seguidas
    this.cyborgLaserSound = this.sound.add('cyborgLaser', { volume: 0.3 });
    this.cyborgTransformacionSound = this.sound.add('cyborgTransformacion', { volume: VOLUMEN_TRANSFORMACION_CYBORG });
    // Suena en bucle mientras vuela la Abuela Cibernética. Los sonidos viven más que la escena:
    // hay que pararlo al salir o reiniciar.
    this.vueloSound = this.sound.add('vueloRobot', { volume: 0.2, loop: true });
    this.events.once('shutdown', () => this.vueloSound.stop());


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
        this.actualizarPlataformasMoviles();
        this.btnBajar.setVisible(this.tactilVisible && this.abuela.transformacion === 'cibernetica');
        this.updateParallax();

        if (this.player.x >= this.nivel.finNivel * altScale && !this.nivelCompletado) {
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
        if (this.vueloSound.isPlaying) this.vueloSound.pause();

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
        if (this.vueloSound.isPaused) this.vueloSound.resume();
        this.elementosPausa.forEach(e => e.destroy());
        this.elementosPausa = [];
    }
}

//___________________________________METODOS GAME_________________________________

// Destruye una paloma con su explosión, su grito y sus puntos (por una galleta, un rayo, un puñetazo...)
destruirPaloma(paloma) {
    const explosion = this.add.sprite(paloma.x, paloma.y, 'explosion').setScale(0.5 * altScale);
    explosion.play('efectoExplosion', true);
    if (this.isSoundOn && this.gritoPajaros) {
        const sonidoAleatorio = Phaser.Math.Between(0, this.gritoPajaros.length - 1);
        this.gritoPajaros[sonidoAleatorio].play();
    }
    explosion.on('animationcomplete', () => {
        explosion.destroy();
    });

    paloma.destroy();
    this.puntos += 10;
    this.hud.actualizarPuntos(this.puntos);
    this.contarParaHazana('palomas', 'reinaDelBaston');
    this.comprobarHazanaPuntos();
}

destruirPatinete(patinete) {
    patinete.destroy();
    if (this.isSoundOn && this.gritoPatineteSound) {
        this.gritoPatineteSound.play();
    }
    this.puntos += 25;
    this.hud.actualizarPuntos(this.puntos);
    this.contarParaHazana('patinetes', 'cazapatinetes');
    this.comprobarHazanaPuntos();
}

// Destruye las palomas, patinetes y cacas que toquen el rectángulo (puñetazo y onda de choque de la
// Abuela Verde). Como el rayo y la bola, cuenta como ataque para la hazaña Pacifista.
// Solo cuenta lo que se ve: un enemigo que todavía no ha entrado en pantalla no se toca.
destruirEnemigosEn(zona) {
    const pantalla = this.cameras.main.worldView;
    const dentro = grupo => grupo.getChildren().filter(e => e.active && e.visible
        && Phaser.Geom.Rectangle.Contains(pantalla, e.x, e.y)
        && Phaser.Geom.Intersects.RectangleToRectangle(zona, e.getBounds()));
    const palomas = dentro(this.enemigosManager.palomas);
    const patinetes = dentro(this.enemigosManager.patinetes);
    const cacas = dentro(this.enemigosManager.cacas);
    if (palomas.length + patinetes.length + cacas.length === 0) return;

    this.seguimiento.galletaLanzada = true;
    palomas.forEach(paloma => this.destruirPaloma(paloma));
    patinetes.forEach(patinete => this.destruirPatinete(patinete));
    cacas.forEach(caca => caca.destroy());
}

// Onda de choque de la Abuela Verde al aterrizar en (x, y): un anillo que se abre a ras de suelo,
// una sacudida de cámara y fuera todo lo que pille. Provisional: el anillo se dibuja por código.
ondaDeChoque(x, y, onda) {
    if (!this.textures.exists('ondaChoque')) {
        const g = this.make.graphics({}, false);
        g.lineStyle(10, 0xffffff, 1);
        g.strokeEllipse(100, 30, 180, 40);
        g.generateTexture('ondaChoque', 200, 60);
        g.destroy();
    }
    const anillo = this.add.image(x, y, 'ondaChoque').setDepth(1.2).setTint(0xc8ff9a).setScale(0.3);
    this.tweens.add({
        targets: anillo,
        scaleX: onda.radio * 2 / 180,
        scaleY: 1.6,
        alpha: 0,
        duration: 350,
        onComplete: () => anillo.destroy(),
    });
    this.cameras.main.shake(180, 0.006);
    if (this.isSoundOn) this.verdeExplosionSound.play();

    this.destruirEnemigosEn(new Phaser.Geom.Rectangle(x - onda.radio, y - onda.alto, onda.radio * 2, onda.alto));
}

colisionPaloma(player, paloma) {
    if (this.abuela.destruyeAlContacto(paloma)) {
        this.seguimiento.galletaLanzada = true;
        this.destruirPaloma(paloma);
        return;
    }
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
    if (this.abuela.destruyeAlContacto(patinete)) {
        this.seguimiento.galletaLanzada = true;
        this.destruirPatinete(patinete);
        return;
    }
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
    const bloques = this.nivel.bloquesYHuecos.filter(b => b.ancho !== undefined);
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
    const maxScrollX = this.nivel.anchoNivel - this.scale.width; //Calcula el desplazamiento dependiendo del ancho de la ventana

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
     // Al bajar, la plataforma se le escaparía un instante en cada rebote y la abuela iría dando
     // saltitos: mientras va subida baja exactamente a la velocidad de la plataforma.
     this.physics.add.collider(this.player, this.plataformasMoviles, (player, plataforma) => {
         if (player.body.touching.down && plataforma.body.velocity.y > 0) {
             player.body.velocity.y = plataforma.body.velocity.y;
         }
     });
}

// Plataformas que van y vuelven entre dos puntos. Se mueven con velocidad (no con un tween) para que
// las físicas arrastren a la abuela cuando va subida. `datos` viene del nivel: ver madrid.js.
crearPlataformasMoviles(datos) {
    this.plataformasMoviles = this.physics.add.group({ allowGravity: false, immovable: true });
    datos.forEach(({ x, y, hastaX, hastaY, velocidad }) => {
        const yMundo = this.scale.height - y;
        const plataforma = this.plataformasMoviles.create(x, yMundo, 'plataformasC').setScale(0.6).setDepth(1);
        // Mismo cuerpo que la plataforma grande fija, en píxeles de la imagen sin escalar
        plataforma.body.setSize(834, 25).setOffset(0, 42);
        // Los grupos de físicas crean los cuerpos sin rozamiento, y sin él no arrastraría a quien lleva encima
        plataforma.body.friction.x = 1;
        if (hastaX !== undefined) {
            plataforma.recorrido = { eje: 'x', min: Math.min(x, hastaX), max: Math.max(x, hastaX) };
            plataforma.setVelocityX(hastaX > x ? velocidad : -velocidad);
        } else {
            const hastaYMundo = this.scale.height - hastaY;
            plataforma.recorrido = { eje: 'y', min: Math.min(yMundo, hastaYMundo), max: Math.max(yMundo, hastaYMundo) };
            plataforma.setVelocityY(hastaYMundo > yMundo ? velocidad : -velocidad);
        }
        plataforma.velocidadRecorrido = velocidad;
    });
}

// Da la vuelta a cada plataforma móvil al llegar a un extremo de su recorrido
actualizarPlataformasMoviles() {
    this.plataformasMoviles.getChildren().forEach((plataforma) => {
        const { eje, min, max } = plataforma.recorrido;
        const v = plataforma.velocidadRecorrido;
        if (plataforma[eje] >= max) plataforma.body.velocity[eje] = -v;
        else if (plataforma[eje] <= min) plataforma.body.velocity[eje] = v;
    });
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
        this.abuela.terminarVuelo();
        this.abuela.cancelarCarga();
        this.abuela.restaurarEscala();
        // Restaura el cuerpo físico si viene de Wukong
        this.player.body.setSize(150, 320).setOffset(50 * altScale, 50 * altScale);

        this.hud.actualizarVidas(this.vidas);
        this.physics.pause();
        this.player.setVelocity(0);
        this.abuela.animarMuerte();
        if (this.isSoundOn) this.abuelaMuerteSound.play();

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
    this.abuela.terminarVuelo();
    this.abuela.cancelarCarga();
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

// Textura del rayo dibujada por código; las texturas son globales, se crea una sola vez.
crearTexturaRayo() {
    if (this.textures.exists('rayoCibernetico')) return;

    const g = this.make.graphics({}, false);
    g.fillStyle(0xff0000);
    g.fillRect(0, 0, RAYO.ancho, RAYO.alto);
    g.fillStyle(0xffb0b0);
    g.fillRect(0, RAYO.alto * 0.3, RAYO.ancho, RAYO.alto * 0.4);
    g.generateTexture('rayoCibernetico', RAYO.ancho, RAYO.alto);
    g.clear();
    g.fillStyle(0xff0000, 0.35);
    g.fillCircle(24, 24, 24);
    g.fillStyle(0xff3030, 0.7);
    g.fillCircle(24, 24, 15);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(24, 24, 7);
    g.generateTexture('brilloOjo', 48, 48);
    g.destroy();
}

// Textura de la bola de energía de Wukong, dibujada por código y creada una sola vez.
crearTexturaBola() {
    if (this.textures.exists('bolaEnergia')) return;

    const r = BOLA.radio;
    const g = this.make.graphics({}, false);
    g.fillStyle(0xffd000, 0.4);
    g.fillCircle(r, r, r);
    g.fillStyle(0xffe866, 0.85);
    g.fillCircle(r, r, r * 0.7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r, r, r * 0.4);
    g.generateTexture('bolaEnergia', r * 2, r * 2);
    g.destroy();
}

// Bola de energía de la Abuela Wukong: sale de la mano, no gasta galletas y, como el rayo,
// va en el grupo de las galletas para compartir colisiones y puntos.
// `escala` es el tamaño según lo que se haya cargado: 1 sin cargar, hasta el doble.
mostrarCargaBola(escala) {
    this.cargaBola.setScale(escala).setVisible(true);
}

ocultarCargaBola() {
    this.cargaBola.setVisible(false);
}

// La galleta sale de la mano de la abuela, por delante de ella. La posición se calcula desde los pies
// y el centro del sprite, no desde el fotograma que se esté mostrando, que puede haber cambiado.
soltarGalleta() {
    if (this.abuela.haMuerto) return;
    const p = this.player;
    const direccion = p.flipX ? -1 : 1;
    const x = p.x + direccion * (GALLETA.mano.x - GALLETA.fotograma.ancho / 2) * p.scaleX;
    const y = p.y - (GALLETA.fotograma.alto - GALLETA.mano.y) * p.scaleY;
    const galleta = this.galletas.create(x, y, 'galleta').setScale(0.15 * altScale).setDepth(1.2);
    galleta.setVelocityX(direccion * GALLETA.velocidad * altScale);
    galleta.body.allowGravity = false;

    if (this.isSoundOn && this.lanzarGalletaSound) {
        this.lanzarGalletaSound.play();
    }

    this.time.delayedCall(GALLETA.duracion, () => {
        galleta.destroy();
    });
}

lanzarBolaEnergia(escala) {
    const direccion = this.player.flipX ? -1 : 1;
    const mano = this.puntoDelSprite(BOLA.mano);
    const bola = this.galletas.create(mano.x + direccion * BOLA.radio * escala, mano.y, 'bolaEnergia')
        .setDepth(1.2).setScale(escala);
    bola.setVelocityX(direccion * BOLA.velocidad);
    bola.body.allowGravity = false;

    // Provisional: suena como una galleta
    if (this.isSoundOn && this.lanzarGalletaSound) {
        this.lanzarGalletaSound.play();
    }

    // Es un ataque: también rompe la hazaña Pacifista
    this.seguimiento.galletaLanzada = true;

    this.time.delayedCall(BOLA.duracion, () => {
        bola.destroy();
    });
}

// Rayo de la Abuela Cibernética: no gasta galletas. Va en el grupo de las galletas
// para acertar a palomas y patinetes con las mismas colisiones y los mismos puntos.
// Pasa un punto en píxeles del fotograma actual de la abuela a posición en el mundo,
// teniendo en cuenta hacia dónde mira.
puntoDelSprite(punto) {
    const p = this.player;
    const direccion = p.flipX ? -1 : 1;
    return {
        x: p.x + direccion * (punto.x - p.frame.width / 2) * p.scaleX,
        y: p.y - (p.frame.height - punto.y) * p.scaleY,
    };
}

// Posición del ojo en el mundo según la hoja que se está mostrando
posicionOjo() {
    return this.puntoDelSprite(RAYO.ojos[this.player.texture.key] || RAYO.ojos.abuelaQuietaCibernetica);
}

lanzarRayo() {
    const direccion = this.player.flipX ? -1 : 1;
    const ojo = this.posicionOjo();
    // La cola del rayo empieza en el ojo y se dibuja por delante de la abuela
    const rayo = this.galletas.create(ojo.x + direccion * RAYO.ancho / 2, ojo.y, 'rayoCibernetico')
        .setDepth(1.2);
    rayo.setVelocityX(direccion * RAYO.velocidad);
    rayo.body.allowGravity = false;

    // Destello en el ojo, que acompaña a la abuela mientras se apaga. Se recoloca en `postupdate`,
    // cuando las físicas ya han movido el sprite: en un tween iría un fotograma por detrás al andar.
    const brillo = this.add.image(ojo.x, ojo.y, 'brilloOjo')
        .setDepth(1.3).setScale(0.5).setBlendMode(Phaser.BlendModes.ADD);
    const seguirOjo = () => {
        const actual = this.posicionOjo();
        brillo.setPosition(actual.x, actual.y);
    };
    const soltarOjo = () => this.events.off('postupdate', seguirOjo);
    this.events.on('postupdate', seguirOjo);
    this.events.once('shutdown', soltarOjo);
    this.tweens.add({
        targets: brillo,
        scale: 1.3,
        alpha: 0,
        duration: RAYO.brillo,
        onComplete: () => {
            soltarOjo();
            brillo.destroy();
        },
    });

    if (this.isSoundOn) this.cyborgLaserSound.play();

    // Un rayo es un ataque: también rompe la hazaña Pacifista
    this.seguimiento.galletaLanzada = true;

    this.time.delayedCall(RAYO.duracion, () => {
        rayo.destroy();
    });
}

// Sonido al transformarse: la Cibernética tiene el suyo; las demás, el grito de Wukong
sonarTransformacion(id) {
    if (!this.isSoundOn) return;
    if (id !== 'cibernetica') {
        this.gritoTransformacion.play();
        return;
    }
    // El audio está cortado en seco a los 2 segundos: se apaga poco a poco al final para que no se note
    const sonido = this.cyborgTransformacionSound;
    this.tweens.killTweensOf(sonido);
    sonido.setVolume(VOLUMEN_TRANSFORMACION_CYBORG);
    sonido.play();
    this.tweens.add({ targets: sonido, volume: 0, delay: 1400, duration: 550 });
}

// `transformacion` es la forma que da la luna: 'wukong' o 'cibernetica' (la misma luna, teñida de rojo)
crearLunaWukong(x, transformacion) {
    // Crear la luna en la posición `x` y una posición temporal en `y`
    const luna = this.lunasWukong.create(x * altScale, this.scale.height - 200 * altScale, 'lunaWukong')
        .setScale(0.3 * altScale)
        .setBounce(0.5);

    // Ajustar la posición `y` para que esté sobre una plataforma o el suelo
    luna.body.setSize(300, 300); // Ajustar el cuerpo físico si es necesario
    luna.body.allowGravity = true; // Habilitar gravedad
    luna.setInteractive();
    luna.transformacion = transformacion;
    if (TINTE_LUNA[transformacion]) luna.setTint(TINTE_LUNA[transformacion]);

    // Las animaciones son globales: solo se crea la primera vez
    if (!this.anims.exists('brillarLunaWukong')) {
        this.anims.create({
            key: 'brillarLunaWukong',
            frames: this.anims.generateFrameNumbers('lunaWukong', { start: 0, end: 5 }), // Ajusta los frames disponibles
            frameRate: 8,
            repeat: -1
        });
    }
    luna.play('brillarLunaWukong');

    //console.log(`Luna Wukong creada en X: ${x}`);
}


// El lingote verde transforma en Abuela Verde. Va en el mismo grupo que las lunas para compartir
// con ellas las colisiones y la recogida.
crearLingoteVerde(x) {
    const lingote = this.lunasWukong.create(x * altScale, this.scale.height - 200 * altScale, 'lingoteVerde')
        .setScale(0.25 * altScale)
        .setBounce(0.5);
    // El cuerpo es solo el lingote, sin los rayos de alrededor
    lingote.body.setSize(220, 130).setOffset(30, 155);
    lingote.transformacion = 'verde';

    // Va y vuelve: del lingote apagado al cargado de energía y otra vez al apagado
    if (!this.anims.exists('brillarLingoteVerde')) {
        this.anims.create({
            key: 'brillarLingoteVerde',
            frames: this.anims.generateFrameNumbers('lingoteVerde', { start: 0, end: 4 }),
            frameRate: 6,
            yoyo: true,
            repeat: -1
        });
    }
    lingote.play('brillarLingoteVerde');
}

recogerLunaWukong(player, luna) {
    luna.destroy();
    this.abuela.transformar(luna.transformacion);
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
    // Solo se ve con la Abuela Cibernética: baja en el vuelo y, pulsado dos veces, la deja caer
    this.btnBajar   = this.add.text(w - margen - 275, h - margen - 40, '↓', estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2).setAlpha(0.85).setInteractive();
    this.btnBajar.setVisible(false);

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
    // Mantener lanzar carga la bola de energía de Wukong
    btnLanzar.on('pointerdown', () => { entrada.lanzarMantenido = true; });
    btnLanzar.on('pointerup',   () => { entrada.lanzarMantenido = false; });
    btnLanzar.on('pointerout',  () => { entrada.lanzarMantenido = false; });

    // Vuelo: saltar mantenido sube; el botón de bajar es pulso (doble toque) y hold a la vez
    btnSaltar.on('pointerdown', () => { entrada.arriba = true; });
    btnSaltar.on('pointerup',   () => { entrada.arriba = false; });
    btnSaltar.on('pointerout',  () => { entrada.arriba = false; });
    this.btnBajar.on('pointerdown', () => { entrada.bajar = true; entrada.abajo = true; });
    this.btnBajar.on('pointerup',   () => { entrada.abajo = false; });
    this.btnBajar.on('pointerout',  () => { entrada.abajo = false; });

    // Mostrar al tocar, ocultar al usar teclado
    this.input.on('pointerdown', () => {
        this.botonesMoviles.forEach(b => b.setVisible(true));
        this.tactilVisible = true;
    });
    this.input.keyboard.on('keydown', () => {
        this.botonesMoviles.forEach(b => b.setVisible(false));
        this.tactilVisible = false;
        entrada.izquierda = false;
        entrada.derecha   = false;
        entrada.arriba    = false;
        entrada.abajo     = false;
        entrada.lanzarMantenido = false;
    });
}

}



export default GameScene;
