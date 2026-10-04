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
        if (this.scene.abuela.escudoActivo) return;
        this.tocandoCaca = true; // Marcar que estamos procesando una colisión
        
        // Reproducir el sonido de colisión si está activado
        if (this.scene.isSoundOn && this.scene.colisionCacaSound) {
            this.scene.colisionCacaSound.play();
        }
        // Reducir la salud del jugador
        const multDif = this.scene.multDificultad || 1;
        this.scene.abuela.salud -= Math.round(15 * multDif);
        if (this.scene.abuela.salud <= 0) {
            this.scene.abuela.salud = 0;
            this.scene.verificaMuerte();
        } else {
            this.scene.time.delayedCall(2000, () => {
                this.tocandoCaca = false;
            });
        }
        this.scene.hud.actualizarSalud(this.scene.abuela.salud);
        // Destruir la caca
        if (caca && caca.body) {
            caca.body.enable = false;
            caca.destroy();
        }
        
    }
    

}
