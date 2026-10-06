import Phaser from 'phaser';
import entrada from './entrada.js';

const TIEMPO_TRANSFORMACION = 60000;
const VELOCIDAD_VUELO = 300;  // px/s al subir y bajar volando
const DOBLE_PULSACION = 200;  // ms máximos entre dos pulsaciones de abajo para dejarse caer
// Dónde salen el humo en pantalla respecto al origen del sprite (centro, pies) mirando a la derecha:
// los pies juntos del fotograma de vuelo quedan a la izquierda del centro del fotograma.
const HUMO_PIES = { x: -23, y: -4 };

// Animaciones, cuerpo físico y habilidades de cada transformación.
// `vuela`: el segundo salto en el aire la deja flotando en vez de dar un doble salto.
// `rayos`: dispara rayos por el ojo en lugar de galletas, sin gastarlas.
// `offsetIzq` es el offset X del cuerpo al mirar a la izquierda: los fotogramas de la
// cibernética miden lo mismo que los de la abuela normal y necesitan el mismo ajuste.
const TRANSFORMACIONES = {
    wukong: {
        transformar: 'transformWukong', idle: 'idleWukong', andar: 'walkWukong', salto: 'jumpWukong',
        offsetX: 150, offsetIzq: 150, offsetY: 150,
    },
    cibernetica: {
        transformar: 'transformCibernetica', idle: 'idleCibernetica', andar: 'walkCibernetica', salto: 'jumpCibernetica',
        vuelo: 'vueloCibernetica',
        offsetX: 50, offsetIzq: 180, offsetY: 50,
        vuela: true, rayos: true,
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
        this.transformacion = null; // 'wukong' o 'cibernetica' mientras isTransformed es true
        this.volando = false;
        this.ultimoPulsoAbajo = 0;
        this.dobleSalto = false;
        this.saltosRestantes = 2;
        this.saltando = false;
        this.transformacionRestante = TIEMPO_TRANSFORMACION;
        this.haMuerto = false;

        // Crear sprite
        this.sprite = scene.physics.add.sprite(x, y, 'abuelaMovimiento1')
            .setScale(0.4).setOrigin(0.5, 1).setDepth(1);
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

        scene.anims.create({
            key: 'muerte',
            frames: scene.anims.generateFrameNumbers('abuelaMuerte', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
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
        if (scene.cursors.left.isDown || entrada.izquierda) {
            this.sprite.setVelocityX(-300);
            if (isOnGround) this.sprite.anims.play(forma ? forma.andar : 'left', true);
            this.sprite.flipX = true;
            if (forma) {
                this.sprite.body.setOffset(forma.offsetIzq, forma.offsetY);
            } else {
                this.sprite.body.setOffset(180, 50);
            }
        } else if (scene.cursors.right.isDown || entrada.derecha) {
            this.sprite.setVelocityX(300);
            if (isOnGround) this.sprite.anims.play(forma ? forma.andar : 'right', true);
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
                this.sprite.anims.play(forma ? forma.idle : 'abuelaIdle', true);
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
                this.sprite.setVelocityY(-700);
                this.sprite.anims.play(forma ? forma.salto : 'jump', true);
                this.saltosRestantes--;
                this.saltando = true;
            } else if (forma && forma.vuela && this.saltosRestantes > 0) {
                this.empezarVuelo();
            } else if (this.isTransformed && this.saltosRestantes > 0) {
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

        // Lanzar galleta
        if (Phaser.Input.Keyboard.JustDown(scene.keys.lanzarGalleta) || entrada.lanzar) {
            entrada.lanzar = false;
            if (forma && forma.rayos) {
                scene.lanzarRayo();
            } else {
                scene.lanzarGalleta();
            }
        }
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

        this.salud -= cantidad;
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

            this.sprite.once('animationcomplete', (anim) => {
                if (anim.key === forma.transformar) {
                    this.sprite.play(forma.idle, true);
                    if (this.isTransforming) {
                        this.sprite.body.setSize(130, 320).setOffset(forma.offsetX, forma.offsetY);
                    }
                    this.isTransforming = false;
                    this.scene.physics.resume();
                    this.scene.input.enabled = true;
                }
            });
        }
    }

    revertirTransformacion() {
        this.isTransformed = false;
        this.transformacion = null;
        this.terminarVuelo();
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
