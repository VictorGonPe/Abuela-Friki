import Phaser from 'phaser';
import entrada from './entrada.js';

const TIEMPO_TRANSFORMACION = 60000;
const VELOCIDAD_ANDAR = 300;   // px/s; las formas con `velocidad` usan la suya
const BASE_CUERPO = 328;      // px del fotograma desde lo alto del cuerpo físico de la abuela normal hasta la base
// Muerte: los primeros fotogramas son la caída; los últimos, la abuela tumbada volviéndose gris,
// y mientras tanto crece hasta `escalaFinal` veces su tamaño.
const MUERTE = { caida: 8, gris: 4, fotogramasPorSegundo: 7, escalaFinal: 1.4 };
const ESCALA_BASE = 0.4;      // escala del sprite de la abuela; las formas con `escala` la multiplican
const VELOCIDAD_VUELO = 300;  // px/s al subir y bajar volando
const DOBLE_PULSACION = 200;  // ms máximos entre dos pulsaciones de abajo para dejarse caer
const POSTURA_DISPARO = 250;  // ms que Wukong mantiene el brazo estirado al soltar una bola
const TIEMPO_CARGA = 1000;    // ms manteniendo lanzar para que la bola llegue a su tamaño máximo
const ESCALA_CARGA_MAX = 2;   // tamaño de la bola totalmente cargada respecto a la normal
// Dónde salen el humo en pantalla respecto al origen del sprite (centro, pies) mirando a la derecha:
// los pies juntos del fotograma de vuelo quedan a la izquierda del centro del fotograma.
const HUMO_PIES = { x: -23, y: -4 };

// Animaciones, cuerpo físico y habilidades de cada transformación.
// `vuela`: el segundo salto en el aire la deja flotando en vez de dar un doble salto.
// `rayos`: dispara rayos por el ojo en lugar de galletas, sin gastarlas.
// `disparo`: animación con el brazo estirado; suelta bolas de energía por la mano, sin gastar galletas.
//            Manteniendo lanzar la bola se carga y crece; sale al soltar.
// `escala`: tamaño respecto a la abuela normal; crece durante la animación de transformación.
// `velocidad`: px/s andando, si no es la normal. `dano`: parte del daño que recibe (0.5 = la mitad).
// `saltoVariable`: no hay doble salto; sube a `velocidad` px/s mientras se mantiene saltar, como mucho `mantener` ms.
// `golpe`: lanzar da un puñetazo en vez de tirar galletas. Destruye lo que haya hasta `alcance` px por delante
//          entre `inicio` y `fin` ms de la animación, sin recibir daño de eso.
// `onda`: al aterrizar cayendo a más de `caidaMinima` px/s destruye lo que haya a `radio` px a cada lado
//         y hasta `alto` px sobre el suelo. Cayendo, lo que toca también se destruye sin hacerle daño;
//         `gracia` son los ms tras aterrizar en que eso sigue valiendo.
// `centrado`: el personaje va en el centro de todos sus fotogramas, aunque midan distinto: el offset
//             del cuerpo se calcula con el fotograma que se está mostrando.
// `offsetIzq` es el offset X del cuerpo al mirar a la izquierda: los fotogramas de la
// cibernética miden lo mismo que los de la abuela normal y necesitan el mismo ajuste.
const TRANSFORMACIONES = {
    wukong: {
        transformar: 'transformWukong', idle: 'idleWukong', andar: 'walkWukong', salto: 'jumpWukong',
        disparo: 'disparoWukong',
        offsetX: 150, offsetIzq: 150, offsetY: 150,
    },
    cibernetica: {
        transformar: 'transformCibernetica', idle: 'idleCibernetica', andar: 'walkCibernetica', salto: 'jumpCibernetica',
        vuelo: 'vueloCibernetica',
        offsetX: 50, offsetIzq: 180, offsetY: 50,
        vuela: true, rayos: true,
    },
    // Con la velocidad y el tiempo de salto de abajo, manteniendo saltar llega casi al borde de arriba de la pantalla.
    verde: {
        transformar: 'transformVerde', idle: 'idleVerde', andar: 'walkVerde', salto: 'jumpVerde',
        offsetX: 116, offsetIzq: 116, offsetY: 56, // los de la hoja de andar; `centrado` los ajusta en las demás
        centrado: true,
        escala: 1.5,
        velocidad: 270,
        dano: 0.5,
        saltoVariable: { velocidad: 800, mantener: 540 },
        golpe: { animacion: 'golpeVerde', inicio: 170, fin: 420, alcance: 150 },
        onda: { radio: 260, alto: 220, caidaMinima: 400, gracia: 250 },
    },
};

export default class Abuela {
    constructor(scene, x, y) {
        this.scene = scene;

        // Estado
        this.salud = 100;
        this.isInvulnerable = false;
        this.escudoActivo = false;
        this.isTransformed = false;
        this.isTransforming = false;
        this.transformacion = null; // clave de TRANSFORMACIONES mientras isTransformed es true
        this.volando = false;
        this.ultimoPulsoAbajo = 0;
        this.posturaHasta = 0; // hasta cuándo (reloj de la escena) se mantiene la postura de disparo
        this.cargando = false;
        this.inicioCarga = 0;
        this.subiendoHasta = 0; // hasta cuándo el salto variable sigue subiendo si se mantiene saltar
        this.inicioGolpe = -Infinity; // cuándo empezó el último puñetazo
        this.velocidadCaida = 0; // velocidad vertical del fotograma anterior, para saber con qué fuerza aterriza
        this.aplastaHasta = 0;   // hasta cuándo, tras aterrizar, lo que toca se destruye sin hacerle daño
        this.dobleSalto = false;
        this.saltosRestantes = 2;
        this.saltando = false;
        this.transformacionRestante = TIEMPO_TRANSFORMACION;
        this.haMuerto = false;

        // Crear sprite
        this.sprite = scene.physics.add.sprite(x, y, 'abuelaMovimiento1')
            .setScale(ESCALA_BASE).setOrigin(0.5, 1).setDepth(1);
        this.sprite.body.setSize(130, 320).setOffset(50, 70);
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);

        // Cámara sigue al jugador
        scene.cameras.main.startFollow(this.sprite);

        this.crearAnimaciones();
        this.crearHumo();
    }

    // Estela de humo del vuelo de la Abuela Cibernética. El emisor se crea una vez, parado,
    // y se enciende y apaga al empezar y terminar el vuelo. La textura se dibuja por código.
    crearHumo() {
        const scene = this.scene;
        if (!scene.textures.exists('humo')) {
            const g = scene.make.graphics({}, false);
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(32, 32, 32);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(32, 32, 22);
            g.generateTexture('humo', 64, 64);
            g.destroy();
        }

        this.humo = scene.add.particles('humo').setDepth(0.9).createEmitter({
            follow: this.sprite,
            followOffset: { x: HUMO_PIES.x, y: HUMO_PIES.y },
            speedX: { min: -25, max: 25 },
            speedY: { min: 60, max: 160 },
            lifespan: 900,
            frequency: 45,
            scale: { start: 0.4, end: 1.3 },
            alpha: { start: 0.9, end: 0 },
            tint: 0xb5b5b5,
            on: false,
        });
    }

    crearAnimaciones() {
        const scene = this.scene;

        scene.anims.create({
            key: 'left',
            frames: scene.anims.generateFrameNumbers('abuelaMovimiento1', { start: 0, end: 20 }),
            frameRate: 30,
            repeat: -1
        });

        scene.anims.create({
            key: 'abuelaIdle',
            frames: scene.anims.generateFrameNumbers('abuelaQuieta', { start: 0, end: 12 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'right',
            frames: scene.anims.generateFrameNumbers('abuelaMovimiento1', { start: 0, end: 20 }),
            frameRate: 30,
            repeat: -1
        });

        scene.anims.create({
            key: 'jump',
            frames: scene.anims.generateFrameNumbers('abuelaMovimiento2', { start: 4, end: 10 }),
            frameRate: 14,
            repeat: 0
        });

        // Se asusta, tropieza, cae y se va quedando gris: una sola vez, y aguanta el último fotograma
        // hasta que la escena se reinicia (2 segundos después de morir)
        scene.anims.create({
            key: 'muerte',
            frames: scene.anims.generateFrameNumbers('abuelaMuerte', { start: 0, end: MUERTE.caida + MUERTE.gris - 1 }),
            frameRate: MUERTE.fotogramasPorSegundo,
            repeat: 0
        });

        scene.anims.create({
            key: 'transformWukong',
            frames: scene.anims.generateFrameNumbers('abuelaTWukong', { start: 0, end: 8 }),
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: 'idleWukong',
            frames: scene.anims.generateFrameNumbers('abuelaQuietaWukong', { start: 0, end: 12 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkWukong',
            frames: scene.anims.generateFrameNumbers('abuelaMov1Wukong', { start: 0, end: 20 }),
            frameRate: 30,
            repeat: -1
        });

        scene.anims.create({
            key: 'jumpWukong',
            frames: scene.anims.generateFrameNumbers('abuelaMov2Wukong', { start: 0, end: 6 }),
            frameRate: 14,
            repeat: 0
        });

        // Provisional: el último fotograma del salto, que es el que tiene el brazo estirado
        scene.anims.create({
            key: 'disparoWukong',
            frames: scene.anims.generateFrameNumbers('abuelaMov2Wukong', { start: 6, end: 6 }),
            frameRate: 1,
            repeat: -1
        });

        // Abuela Cibernética (sprites provisionales): mismas hojas y fotogramas que la abuela normal
        scene.anims.create({
            key: 'transformCibernetica',
            frames: scene.anims.generateFrameNumbers('abuelaTCibernetica', { start: 0, end: 8 }),
            frameRate: 8,
            repeat: 0
        });

        scene.anims.create({
            key: 'idleCibernetica',
            frames: scene.anims.generateFrameNumbers('abuelaQuietaCibernetica', { start: 0, end: 12 }),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkCibernetica',
            frames: scene.anims.generateFrameNumbers('abuelaMov1Cibernetica', { start: 0, end: 20 }),
            frameRate: 30,
            repeat: -1
        });

        scene.anims.create({
            key: 'jumpCibernetica',
            frames: scene.anims.generateFrameNumbers('abuelaMov2Cibernetica', { start: 4, end: 10 }),
            frameRate: 14,
            repeat: 0
        });

        // Un solo fotograma: la de quieta con los pies juntos
        scene.anims.create({
            key: 'vueloCibernetica',
            frames: scene.anims.generateFrameNumbers('abuelaVueloCibernetica', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });

        // Abuela Verde: va más despacio que las otras para que se vea crecer
        scene.anims.create({
            key: 'transformVerde',
            frames: scene.anims.generateFrameNumbers('abuelaTVerde', { start: 0, end: 4 }),
            frameRate: 4,
            repeat: 0
        });

        // Más lenta que las otras de andar: la hoja repite un paso corto de unos 5 fotogramas
        scene.anims.create({
            key: 'walkVerde',
            frames: scene.anims.generateFrameNumbers('abuelaMov1Verde', { start: 0, end: 19 }),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'jumpVerde',
            frames: scene.anims.generateFrameNumbers('abuelaMov2Verde', { start: 0, end: 6 }),
            frameRate: 14,
            repeat: 0
        });

        scene.anims.create({
            key: 'golpeVerde',
            frames: scene.anims.generateFrameNumbers('abuelaGolpeVerde', { start: 0, end: 4 }),
            frameRate: 12,
            repeat: 0
        });

        scene.anims.create({
            key: 'idleVerde',
            frames: scene.anims.generateFrameNumbers('abuelaQuietaVerde', { start: 0, end: 11 }),
            frameRate: 4,
            repeat: -1
        });
    }

    // Animación de muerte. Cuando ya está tumbada y empieza a ponerse gris, crece poco a poco.
    animarMuerte() {
        const msPorFotograma = 1000 / MUERTE.fotogramasPorSegundo;
        this.sprite.anims.play('muerte', true);
        this.scene.tweens.add({
            targets: this.sprite,
            scale: ESCALA_BASE * MUERTE.escalaFinal,
            delay: MUERTE.caida * msPorFotograma,
            duration: MUERTE.gris * msPorFotograma,
        });
    }

    // Animaciones de andar y de quieta: esperan a que termine la postura de disparo
    animar(clave) {
        if (this.scene.time.now < this.posturaHasta) return;
        this.sprite.anims.play(clave, true);
    }

    actualizar() {
        if (this.haMuerto || this.isTransforming) {
            this.sprite.setVelocityX(0);
            return;
        }

        const scene = this.scene;
        const isOnGround = this.sprite.body.touching.down;
        const forma = this.isTransformed ? TRANSFORMACIONES[this.transformacion] : null;

        if (isOnGround) {
            this.saltosRestantes = 2;
            this.saltando = false;
            this.dobleSalto = false;
        }

        // Movimiento horizontal
        const velocidad = (forma && forma.velocidad) || VELOCIDAD_ANDAR;
        if (scene.cursors.left.isDown || entrada.izquierda) {
            this.sprite.setVelocityX(-velocidad);
            if (isOnGround) this.animar(forma ? forma.andar : 'left');
            this.sprite.flipX = true;
            if (forma) {
                this.sprite.body.setOffset(forma.offsetIzq, forma.offsetY);
            } else {
                this.sprite.body.setOffset(180, 50);
            }
        } else if (scene.cursors.right.isDown || entrada.derecha) {
            this.sprite.setVelocityX(velocidad);
            if (isOnGround) this.animar(forma ? forma.andar : 'right');
            this.sprite.flipX = false;
            if (forma) {
                this.sprite.body.setOffset(forma.offsetX, forma.offsetY);
            } else {
                this.sprite.body.setOffset(50, 50);
            }
        } else {
            this.sprite.setVelocityX(0);
            if (isOnGround) {
                this.sprite.setOrigin(0.5, 1);
                this.animar(forma ? forma.idle : 'abuelaIdle');
            }
        }

        // Salto
        const quereSaltar = Phaser.Input.Keyboard.JustDown(scene.cursors.up) || (!this.saltando && scene.cursors.up.isDown) || entrada.saltar;
        entrada.saltar = false;
        const pulsoAbajo = Phaser.Input.Keyboard.JustDown(scene.cursors.down) || entrada.bajar;
        entrada.bajar = false;

        if (this.volando) {
            this.actualizarVuelo(forma, pulsoAbajo, isOnGround);
        } else if (quereSaltar) {
            if (isOnGround) {
                scene.jumpSound.play();
                this.sprite.setVelocityY(forma && forma.saltoVariable ? -forma.saltoVariable.velocidad : -700);
                if (forma && forma.saltoVariable) this.subiendoHasta = scene.time.now + forma.saltoVariable.mantener;
                this.sprite.anims.play(forma ? forma.salto : 'jump', true);
                this.saltosRestantes--;
                this.saltando = true;
            } else if (forma && forma.vuela && this.saltosRestantes > 0) {
                this.empezarVuelo();
            } else if (this.isTransformed && !forma.saltoVariable && this.saltosRestantes > 0) {
                scene.jumpSound.play();
                this.sprite.setVelocityY(-900);
                this.sprite.anims.play(forma.salto, true);

                const emisorParticulas = scene.add.particles('particulas').createEmitter({
                    x: this.sprite.x,
                    y: this.sprite.y,
                    speed: { min: -100, max: 100 },
                    lifespan: 500,
                    quantity: 1,
                    scale: { start: 1, end: 0 },
                }).setScale(0.3);

                emisorParticulas.startFollow(this.sprite);

                scene.time.delayedCall(1000, () => {
                    emisorParticulas.stop();
                    emisorParticulas.manager.destroy();
                });

                this.saltosRestantes--;
            }
        }

        if (Phaser.Input.Keyboard.JustUp(scene.cursors.up)) {
            this.saltando = false;
        }

        if (!forma) this.apoyarCuerpo();
        if (forma && forma.saltoVariable) this.actualizarSaltoVariable(forma.saltoVariable);
        if (forma && forma.onda) this.actualizarOnda(forma.onda, isOnGround);
        if (forma && forma.centrado) this.centrarCuerpo();

        // Lanzar: galleta, rayo, bola de energía o puñetazo según la forma
        const pulsoLanzar = Phaser.Input.Keyboard.JustDown(scene.keys.lanzarGalleta) || entrada.lanzar;
        entrada.lanzar = false;
        if (forma && forma.golpe) {
            this.actualizarGolpe(forma.golpe, pulsoLanzar);
        } else if (forma && forma.disparo) {
            const mantenido = scene.keys.lanzarGalleta.isDown || entrada.lanzarMantenido;
            this.actualizarCarga(forma, pulsoLanzar, mantenido);
        } else if (pulsoLanzar) {
            if (forma && forma.rayos) {
                scene.lanzarRayo();
            } else {
                scene.lanzarGalleta();
            }
        }
    }

    // Salto variable: sigue subiendo a velocidad fija mientras se mantiene saltar, hasta agotar el tiempo
    // o darse con algo por arriba. Al soltar, la gravedad hace el resto.
    actualizarSaltoVariable(salto) {
        const scene = this.scene;
        if (scene.time.now >= this.subiendoHasta) return;
        const mantenido = scene.cursors.up.isDown || entrada.arriba;
        if (mantenido && !this.sprite.body.blocked.up) {
            this.sprite.setVelocityY(-salto.velocidad);
        } else {
            this.subiendoHasta = 0;
        }
    }

    // Onda de choque al aterrizar con fuerza. Se compara con la velocidad del fotograma anterior
    // porque al tocar el suelo Arcade ya la ha cambiado por el rebote.
    actualizarOnda(onda, isOnGround) {
        if (isOnGround && this.velocidadCaida > onda.caidaMinima) {
            this.aplastaHasta = this.scene.time.now + onda.gracia;
            this.scene.ondaDeChoque(this.sprite.x, this.sprite.y, onda);
        }
        this.velocidadCaida = isOnGround ? 0 : this.sprite.body.velocity.y;
    }

    // Puñetazo: mientras dura manda su animación, y en su tramo activo destruye lo que tenga delante
    actualizarGolpe(golpe, pulsoLanzar) {
        const scene = this.scene;
        let transcurrido = scene.time.now - this.inicioGolpe;
        if (pulsoLanzar && transcurrido > golpe.fin) {
            this.inicioGolpe = scene.time.now;
            transcurrido = 0;
            this.sprite.anims.play(golpe.animacion, true);
            this.posturaHasta = scene.time.now + golpe.fin;
            if (scene.isSoundOn && scene.lanzarGalletaSound) scene.lanzarGalletaSound.play();
        }
        if (transcurrido >= golpe.inicio && transcurrido <= golpe.fin) {
            const cuerpo = this.sprite.body;
            const x = this.sprite.flipX ? cuerpo.center.x - golpe.alcance : cuerpo.center.x;
            scene.destruirEnemigosEn(new Phaser.Geom.Rectangle(x, cuerpo.top, golpe.alcance, cuerpo.height));
        }
    }

    // ¿Está dando un puñetazo hacia ese lado? `x` es la posición de lo que la toca
    golpeaHacia(golpe, x) {
        const transcurrido = this.scene.time.now - this.inicioGolpe;
        if (transcurrido < golpe.inicio || transcurrido > golpe.fin) return false;
        return this.sprite.flipX ? x <= this.sprite.x : x >= this.sprite.x;
    }

    // Lo que la toca se destruye, sin hacerle daño, si está cayendo, si acaba de aterrizar
    // o si lo alcanza con el puño. Solo en las formas que aplastan (la Abuela Verde).
    destruyeAlContacto(enemigo) {
        const forma = this.isTransformed ? TRANSFORMACIONES[this.transformacion] : null;
        if (!forma || this.haMuerto) return false;
        if (forma.golpe && this.golpeaHacia(forma.golpe, enemigo.x)) return true;
        if (!forma.onda) return false;
        const cayendo = !this.sprite.body.touching.down && this.sprite.body.velocity.y > 0;
        return cayendo || this.scene.time.now < this.aplastaHasta;
    }

    // Daño que recibe de verdad según la forma
    ajustarDano(cantidad) {
        const forma = this.isTransformed ? TRANSFORMACIONES[this.transformacion] : null;
        return forma && forma.dano ? Math.round(cantidad * forma.dano) : cantidad;
    }

    // Abuela normal: el cuerpo físico se mide desde arriba del fotograma, y la hoja de salto es más alta
    // que las de andar y quieta. Sin esto, al cambiar de hoja el cuerpo bajaría unos píxeles de golpe,
    // se metería en el suelo y lo atravesaría.
    apoyarCuerpo() {
        const cuerpo = this.sprite.body;
        cuerpo.setOffset(cuerpo.offset.x, this.sprite.frame.height - BASE_CUERPO);
    }

    // Deja el cuerpo físico centrado y apoyado en la base del fotograma actual (formas `centrado`)
    centrarCuerpo() {
        const sprite = this.sprite;
        sprite.body.setOffset(sprite.frame.width / 2 - sprite.body.sourceWidth / 2, sprite.frame.height - sprite.body.sourceHeight - 2);
    }

    // Bola de energía de Wukong: empieza a cargarse al pulsar lanzar, crece mientras se mantiene
    // y sale al soltar. Un toque corto lanza la bola de tamaño normal.
    actualizarCarga(forma, pulsoLanzar, mantenido) {
        const scene = this.scene;
        if (!this.cargando && (pulsoLanzar || mantenido)) {
            this.cargando = true;
            this.inicioCarga = scene.time.now;
        }
        if (!this.cargando) return;

        // La postura va primero: la bola se coloca donde queda la mano en ese fotograma
        this.sprite.anims.play(forma.disparo, true);
        this.posturaHasta = scene.time.now + POSTURA_DISPARO;

        const carga = Math.min((scene.time.now - this.inicioCarga) / TIEMPO_CARGA, 1);
        const escala = 1 + carga * (ESCALA_CARGA_MAX - 1);
        if (mantenido) {
            scene.mostrarCargaBola(escala);
        } else {
            this.cancelarCarga();
            scene.lanzarBolaEnergia(escala);
        }
    }

    // Deja de cargar sin lanzar nada (al soltar, al morir o al cambiar de forma)
    cancelarCarga() {
        this.cargando = false;
        this.scene.ocultarCargaBola();
    }

    // Vuelo de la Abuela Cibernética: flota sin gravedad hasta tocar el suelo,
    // pulsar abajo dos veces seguidas o acabarse la transformación.
    empezarVuelo() {
        this.volando = true;
        this.saltosRestantes = 0;
        this.ultimoPulsoAbajo = 0;
        this.sprite.body.allowGravity = false;
        this.sprite.setVelocityY(0);
        this.humo.start();
        if (this.scene.isSoundOn) this.scene.vueloSound.play();
    }

    terminarVuelo() {
        this.volando = false;
        this.sprite.body.allowGravity = true;
        this.humo.stop();
        this.scene.vueloSound.stop();
    }

    actualizarVuelo(forma, pulsoAbajo, isOnGround) {
        const scene = this.scene;
        let velocidadY = 0;
        if (scene.cursors.up.isDown || entrada.arriba) velocidadY = -VELOCIDAD_VUELO;
        else if (scene.cursors.down.isDown || entrada.abajo) velocidadY = VELOCIDAD_VUELO;
        this.sprite.setVelocityY(velocidadY);
        this.sprite.anims.play(forma.vuelo, true);
        // El humo sale de los pies, que cambian de lado al girarse
        this.humo.followOffset.x = this.sprite.flipX ? -HUMO_PIES.x : HUMO_PIES.x;

        if (pulsoAbajo) {
            const esDoble = scene.time.now - this.ultimoPulsoAbajo < DOBLE_PULSACION;
            this.ultimoPulsoAbajo = scene.time.now;
            if (esDoble) this.terminarVuelo();
        }
        if (isOnGround) this.terminarVuelo();
    }

    recibirDano(cantidad) {
        if (this.isInvulnerable || this.escudoActivo) return false;

        this.salud -= this.ajustarDano(cantidad);
        if (this.salud < 0) this.salud = 0;

        this.isInvulnerable = true;
        const sprite = this.sprite;
        const scene = this.scene;

        for (let i = 0; i < 5; i++) {
            scene.time.delayedCall(200 * i, () => {
                sprite.visible = !sprite.visible;
            });
        }
        scene.time.delayedCall(1000, () => {
            sprite.visible = true;
            this.isInvulnerable = false;
        });

        return true;
    }

    // Escudo comprado en La Farmacia: ningún enemigo hace daño mientras dura. Caer por un hueco sí mata.
    activarEscudo(duracion) {
        this.escudoActivo = true;
        this.sprite.setTint(0x66ccff);
        this.scene.time.delayedCall(duracion, () => {
            this.escudoActivo = false;
            this.sprite.clearTint();
        });
    }

    // `id` es una clave de TRANSFORMACIONES. Coger una luna de otra transformación
    // estando ya transformada cambia de forma y reinicia el tiempo.
    transformar(id) {
        const forma = TRANSFORMACIONES[id];
        // Si llega volando o cargando una bola, eso es de la forma anterior: se corta aquí
        this.terminarVuelo();
        this.cancelarCarga();
        this.sprite.body.setSize(130, 150).setOffset(100, 100);
        this.scene.gritoTransformacion.play();

        if (!this.isTransformed || this.transformacion !== id) {
            this.isTransformed = true;
            this.isTransforming = true;
            this.transformacion = id;
            this.transformacionRestante = TIEMPO_TRANSFORMACION;

            if (!this.scene.hud.barraTransformacion) this.scene.hud.crearBarraTransformacion();
            this.scene.hud.dibujarBarraTransformacion(this.transformacionRestante, TIEMPO_TRANSFORMACION);

            this.scene.physics.pause();
            this.scene.input.enabled = false;

            this.sprite.play(forma.transformar);

            // Crece (o encoge, si viene de una forma más grande) mientras dura la animación
            const escala = ESCALA_BASE * (forma.escala || 1);
            this.scene.tweens.add({
                targets: this.sprite,
                scale: escala,
                duration: this.scene.anims.get(forma.transformar).duration,
            });

            // Se escucha el final de esta animación en concreto: con 'animationcomplete' a secas,
            // si acabara antes otra animación el juego se quedaría parado para siempre.
            this.sprite.once('animationcomplete-' + forma.transformar, () => {
                this.sprite.play(forma.idle, true);
                if (this.isTransforming) {
                    this.sprite.body.setSize(130, 320).setOffset(forma.offsetX, forma.offsetY);
                    if (forma.centrado) this.centrarCuerpo();
                }
                this.isTransforming = false;
                this.scene.physics.resume();
                this.scene.input.enabled = true;
            });
        }
    }

    // Vuelve al tamaño de la abuela normal (al acabarse la transformación o al morir)
    restaurarEscala() {
        this.sprite.setScale(ESCALA_BASE);
    }

    revertirTransformacion() {
        this.isTransformed = false;
        this.transformacion = null;
        this.restaurarEscala();
        this.terminarVuelo();
        this.cancelarCarga();
        this.sprite.setTexture('abuelaMovimiento1');
        this.sprite.play('abuelaIdle');
        this.sprite.body.setSize(130, 320).setOffset(50, 50);
        this.scene.hud.eliminarBarraTransformacion();
        this.transformacionRestante = TIEMPO_TRANSFORMACION;
    }

    actualizarTransformacion(delta) {
        if (!this.isTransformed || !this.scene.hud.barraTransformacion) return;

        this.transformacionRestante -= delta;
        if (this.transformacionRestante <= 0) {
            this.transformacionRestante = 0;
            this.revertirTransformacion();
        }

        this.scene.hud.dibujarBarraTransformacion(this.transformacionRestante, TIEMPO_TRANSFORMACION);
    }
}
