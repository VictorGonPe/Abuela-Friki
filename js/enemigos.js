export default class Enemigos {
    constructor(scene, altScale) {
        this.scene = scene; // Referencia a la escena de Phaser
        this.altScale = altScale; // Escala para ajustar tamaños
        this.enemigos = []; // Array para todos los enemigos
    }

    crearPalomas(cantidad) {
        // Crear grupo de palomas
        this.palomas = this.scene.physics.add.group();
        for (let i = 0; i < cantidad; i++) {
            const x = Phaser.Math.Between(this.scene.scale.width, this.scene.physics.world.bounds.width);
            const y = Phaser.Math.Between(50, this.scene.scale.height * 0.7); // Altura entre 50px y la mitad de la pantalla

            const paloma = this.palomas.create(x, y, 'paloma').setScale(0.3 * this.altScale);
            paloma.play('volar'); // Animación de vuelo
            paloma.body.setAllowGravity(false); // Las palomas no son afectadas por la gravedad
            paloma.setVelocityX(Phaser.Math.Between(-150 * this.altScale, -500 * this.altScale)); // Velocidad inicial
            // Ajustar el cuerpo físico de las palomas
            paloma.body.setSize(paloma.width * 0.7, paloma.height * 0.3).setOffset(paloma.width * 0.07, paloma.height * 0.35); // Ajusta el tamaño/pos para colisiones
        }
        this.enemigos.push({ tipo: 'palomas', grupo: this.palomas });
    }

    actualizarPalomas(scrollX) {
        // Reposicionar palomas si salen de la pantalla
        this.palomas.getChildren().forEach(paloma => {
            if (paloma.x < scrollX - 500) { // Si sale por el lado izquierdo de la cámara
                paloma.x = scrollX + this.scene.scale.width + 50; // Reposicionar fuera del lado derecho
                paloma.y = Phaser.Math.Between(50, this.scene.scale.height * 0.7); // Nueva altura aleatoria
                paloma.setVelocityX(Phaser.Math.Between(-150 * this.altScale, -400 * this.altScale)); // Nueva velocidad
            }
        });
    }

    crearPatinetes(cantidad) {
        this.patinetes = this.scene.physics.add.group();
        for (let i = 0; i < cantidad; i++) {
            const x = Phaser.Math.Between(this.scene.scale.width, this.scene.physics.world.bounds.width);
            const y = this.scene.scale.height - 300 * this.altScale; // Altura fija cercana al suelo
    
            const patinete = this.patinetes.create(x, y, 'patinete').setScale(0.45 * this.altScale);
            patinete.play('moverPatinete');
            patinete.body.setAllowGravity(true); // gravedad
            patinete.setVelocityX(Phaser.Math.Between(-100 * this.altScale, -500 * this.altScale)); // Velocidad inicial
            patinete.body.setSize(patinete.width * 0.8, patinete.height * 0.7).setOffset(patinete.width * 0.1, patinete.height * 0.25); // Reduce el tamaño para colisiones
            
        }
        this.enemigos.push({ tipo: 'patinetes', grupo: this.patinetes }); // Guardar referencia en el array de enemigos
    }

    actualizarPatinetes(scrollX) {
        this.patinetes.getChildren().forEach(patinete => {
            // Si el patinete sale del borde izquierdo, reposicionarlo
            if (patinete.x < scrollX - 650) {
                patinete.x = scrollX + this.scene.scale.width + 50; // Reposicionar a la derecha
                patinete.setVelocityX(Phaser.Math.Between(-100 * this.altScale, -500 * this.altScale)); // Nueva velocidad
            }
        });
    }
    
    
    
    actualizar(scrollX) {
        this.enemigos.forEach(enemigo => {
            if (enemigo.tipo === 'palomas') {
                this.actualizarPalomas(scrollX);
            } else if (enemigo.tipo === 'patinetes') {
                this.actualizarPatinetes(scrollX);
            }
            // Añadir mas tipos de enemigos
        });
    }
    
}
