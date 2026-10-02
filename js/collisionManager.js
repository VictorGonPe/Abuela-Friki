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
        
        // Reproducir el sonido de colisión si está activado
        if (this.scene.isSoundOn && this.scene.colisionCacaSound) {
            this.scene.colisionCacaSound.play();
        }
        // Reducir la salud del jugador
        this.scene.salud -= 15;
        if (this.scene.salud <= 0) {
            this.scene.salud = 0;
            this.scene.verificaMuerte(); // Verificar si la salud llegó a cero y activar la lógica de muerte
        } else {
            this.scene.time.delayedCall(2000, () => {
                this.tocandoCaca = false; // Permitir nuevas colisiones
            });
        }
        // Actualizar la barra de salud en pantalla
        this.scene.actualizarBarraSalud(this.scene.salud);
        // Destruir la caca
        if (caca && caca.body) {
            caca.body.enable = false;
            caca.destroy();
        }
        
    }
    

}
