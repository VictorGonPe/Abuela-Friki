export default class CollisionManager {
    constructor(scene, player, altScale) {
        this.scene = scene;
        this.player = player;
        this.altScale = altScale;
        this.isTouchingCaca = false; // Controlar colisiones múltiples
        this.isInvulnerable = false; // Controlar invulnerabilidad
    }

    colisionCaca(player, caca) {
        if (this.tocandoCaca) return; // Evitar múltiples colisiones simultáneas
        this.tocandoCaca = true; // Marcar que estamos procesando una colisión
        
        console.log('Colisión con caca detectada');
        console.log('Player:', player);
        console.log('Caca:', caca);

        this.hacerAbuelaInvulnerable();
    
        // Reproducir el sonido de colisión si está activado
        if (this.scene.isSoundOn && this.scene.colisionCacaSound) {
            this.scene.colisionCacaSound.play();
        }
        // Reducir la salud del jugador
        this.scene.salud -= 15;
        if (this.scene.salud < 0) this.scene.salud = 0;
        // Actualizar la barra de salud en pantalla
        this.scene.actualizarBarraSalud(this.scene.salud);
    
        // Revisar si la salud llegó a 0 para aplicar lógica de muerte
        if (this.scene.salud <= 0) {
            console.log('La abuela ha muerto');
            this.scene.physics.pause(); // Detener el juego
    
            // Reproducir animación de muerte
            player.anims.play('muerte', true);
            player.setTint(0xff0000);
    
            // Reiniciar la escena después de un retraso
            this.scene.time.delayedCall(2000, () => {
                this.scene.scene.restart(); // Reiniciar el objeto escena
            });
        } else {
            // Indicar visualmente que el jugador ha sido dañado
            player.setTint(0x964B00);
            this.scene.time.delayedCall(2000, () => {
                player.clearTint();
                this.tocandoCaca = false; // Permitir nuevas colisiones
            });
        }
    
        // Destruir la caca
        if (caca && caca.body) {
            caca.body.enable = false;
            caca.destroy();
        }
    }
    

    colisionPatinete(player, patinete) {
        if (this.isInvulnerable) return; // No aplicar daño si es invulnerable

        console.log('Colisión con patinete');
        if (this.scene.isSoundOn && this.scene.choquePatineteSound) {
            this.scene.choquePatineteSound.play();
        }

        this.scene.salud -= 30;
        if (this.scene.salud < 0) this.scene.salud = 0;
        this.scene.actualizarBarraSalud(this.scene.salud);

        this.scene.puntos -= 20;
        if (this.scene.puntos < 0) this.scene.puntos = 0;
        this.scene.puntosTexto.setText(`Puntos: ${this.scene.puntos}`);

        this.hacerAbuelaInvulnerable();

        if (patinete && patinete.body) {
            patinete.body.enable = false;
            patinete.removeAllListeners();
            patinete.destroy();
        }
    }

    colisionPaloma(player, paloma) {
        if (this.isInvulnerable) return;

        console.log('Colisión con paloma');
        if (this.scene.isSoundOn && this.scene.abuelaGolpeSound) {
            this.scene.abuelaGolpeSound.play();
        }

        this.scene.salud -= 10;
        if (this.scene.salud < 0) this.scene.salud = 0;
        this.scene.actualizarBarraSalud(this.scene.salud);

        const explosion = this.scene.add.sprite(paloma.x, paloma.y, 'explosion')
            .setScale(0.5 * this.altScale);
        explosion.play('efectoExplosion', true);

        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });

        if (this.scene.isSoundOn && this.scene.gritoPajaros) {
            const randomSound = Phaser.Math.Between(0, this.scene.gritoPajaros.length - 1);
            this.scene.gritoPajaros[randomSound].play();
        }

        this.hacerAbuelaInvulnerable();

        if (paloma && paloma.body) {
            paloma.body.enable = false;
            paloma.removeAllListeners();
            paloma.destroy();
        }
    }

    hacerAbuelaInvulnerable() {
        this.isInvulnerable = true;
        this.scene.player.setTint(0xff0000); // Indicar daño
        this.scene.time.delayedCall(2000, () => {
            this.isInvulnerable = false;
            this.scene.player.clearTint();
        });
    }
}
