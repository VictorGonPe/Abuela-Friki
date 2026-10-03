import Phaser from 'phaser';
import entrada from './entrada.js';

const TIEMPO_TRANSFORMACION = 60000;

export default class Abuela {
    constructor(scene, x, y) {
        this.scene = scene;

        // Estado
        this.salud = 100;
        this.isInvulnerable = false;
        this.isTransformed = false;
        this.isTransforming = false;
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
    }

    actualizar() {
        if (this.haMuerto || this.isTransforming) {
            this.sprite.setVelocityX(0);
            return;
        }

        const scene = this.scene;
        const isOnGround = this.sprite.body.touching.down;

        if (isOnGround) {
            this.saltosRestantes = 2;
            this.saltando = false;
            this.dobleSalto = false;
        }

        // Movimiento horizontal
        if (scene.cursors.left.isDown || entrada.izquierda) {
            this.sprite.setVelocityX(-300);
            if (isOnGround) this.sprite.anims.play(this.isTransformed ? 'walkWukong' : 'left', true);
            this.sprite.flipX = true;
            if (!this.isTransformed) {
                this.sprite.body.setOffset(180, 50);
            }
        } else if (scene.cursors.right.isDown || entrada.derecha) {
            this.sprite.setVelocityX(300);
            if (isOnGround) this.sprite.anims.play(this.isTransformed ? 'walkWukong' : 'right', true);
            this.sprite.flipX = false;
            if (!this.isTransformed) {
                this.sprite.body.setOffset(50, 50);
            }
        } else {
            this.sprite.setVelocityX(0);
            if (isOnGround) {
                this.sprite.setOrigin(0.5, 1);
                this.sprite.anims.play(this.isTransformed ? 'idleWukong' : 'abuelaIdle', true);
            }
        }

        // Salto
        const quereSaltar = Phaser.Input.Keyboard.JustDown(scene.cursors.up) || (!this.saltando && scene.cursors.up.isDown) || entrada.saltar;
        entrada.saltar = false;
        if (quereSaltar) {
            if (isOnGround) {
                scene.jumpSound.play();
                this.sprite.setVelocityY(-700);
                this.sprite.anims.play(this.isTransformed ? 'jumpWukong' : 'jump', true);
                this.saltosRestantes--;
                this.saltando = true;
            } else if (this.isTransformed && this.saltosRestantes > 0) {
                scene.jumpSound.play();
                this.sprite.setVelocityY(-900);
                this.sprite.anims.play('jumpWukong', true);

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
            scene.lanzarGalleta();
        }
    }

    recibirDano(cantidad) {
        if (this.isInvulnerable) return false;

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

    transformar() {
        this.sprite.body.setSize(130, 150).setOffset(100, 100);
        this.scene.gritoTransformacion.play();

        if (!this.isTransformed) {
            this.isTransformed = true;
            this.isTransforming = true;
            this.transformacionRestante = TIEMPO_TRANSFORMACION;

            this.scene.hud.crearBarraTransformacion();
            this.scene.hud.dibujarBarraTransformacion(this.transformacionRestante, TIEMPO_TRANSFORMACION);

            this.scene.physics.pause();
            this.scene.input.enabled = false;

            this.sprite.play('transformWukong');

            this.sprite.once('animationcomplete', (anim) => {
                if (anim.key === 'transformWukong') {
                    this.sprite.play('idleWukong', true);
                    if (this.isTransforming) {
                        this.sprite.body.setSize(130, 320).setOffset(150, 150);
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
