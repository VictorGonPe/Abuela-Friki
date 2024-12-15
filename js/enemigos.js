export default class Enemigos {
    constructor(scene, altScale) {
        this.scene = scene; // Referencia a la escena de Phaser
        this.altScale = altScale; // Escala para ajustar tamaños
        this.enemigos = []; // Array para todos los enemigos
        // Configura las animaciones al crear la clase
        this.configurarAnimaciones();
    }

    crearPalomas(cantidad) {
        // Crear grupo de palomas
        this.palomas = this.scene.physics.add.group();
        for (let i = 0; i < cantidad; i++) {
            const x = Phaser.Math.Between(this.scene.scale.width, this.scene.physics.world.bounds.width);
            const y = Phaser.Math.Between(100, this.scene.scale.height * 0.8 * this.altScale); // Altura entre 50px y la mitad de la pantalla

            const paloma = this.palomas.create(x, y, 'paloma').setScale(0.3 * this.altScale);
            paloma.setDepth(1.5);
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
            if (paloma.x < scrollX - 500|| paloma.y < scrollY ) { // Si sale por el lado izquierdo de la cámara
                paloma.x = scrollX + this.scene.scale.width + 50; // Reposicionar fuera del lado derecho
                paloma.y = Phaser.Math.Between(50, this.scene.scale.height * 0.7); // Nueva altura aleatoria
                paloma.setVelocityX(Phaser.Math.Between(-150 * this.altScale, -400 * this.altScale)); // Nueva velocidad
            }
        });
    }

    crearPatinetes(cantidadInicial) {
        this.patinetes = this.scene.physics.add.group();
    
        // Generar patinetes iniciales
        for (let i = 0; i < cantidadInicial; i++) {
            this.generarPatinete();
        }
    
        // Evento para generar nuevos patinetes periódicamente
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(20000, 40000), // Intervalo aleatorio entre 20 y 40 segundos
            loop: true, // Hacer que el evento se repita
            callback: () => {
                this.generarPatinete(); // Crear un nuevo patinete
            },
        });
    
        // Guardar referencia al grupo en el array de enemigos
        this.enemigos.push({ tipo: 'patinetes', grupo: this.patinetes });
    }
    
    generarPatinete() {
        const x = Phaser.Math.Between(this.scene.cameras.main.scrollX + this.scene.cameras.main.width, this.scene.physics.world.bounds.width); // Posición inicial fuera de la pantalla
        const y = this.scene.scale.height - 300 * this.altScale; // Altura fija cercana al suelo
    
        const patinete = this.patinetes.create(x, y, 'patinete').setScale(0.45 * this.altScale);
        patinete.play('moverPatinete');
        patinete.body.setAllowGravity(true); // Activar gravedad
        patinete.setVelocityX(Phaser.Math.Between(-100 * this.altScale, -500 * this.altScale)); // Velocidad inicial
        patinete.body.setSize(patinete.width * 0.8, patinete.height * 0.7).setOffset(patinete.width * 0.1, patinete.height * 0.25); // Ajustar colisión
    }
    

    actualizarPatinetes(scrollX) {
        this.patinetes.getChildren().forEach(patinete => {
            // Si el patinete sale del borde izquierdo, reposicionarlo
            if (patinete.x < scrollX - 50) {
                patinete.x = scrollX + this.scene.scale.width + 550; // Reposicionar a la derecha
                patinete.setVelocityX(Phaser.Math.Between(-100 * this.altScale, -500 * this.altScale)); // Nueva velocidad
            }
        });
    }


    crearCacas(cantidad) {
        this.cacas = this.scene.physics.add.group(); // Grupo para las cacas
    
        for (let i = 0; i < cantidad; i++) {
            const x = Phaser.Math.Between(this.scene.scale.width, this.scene.physics.world.bounds.width -3000);
            const y = this.scene.scale.height - 400 * this.altScale; // Posición inicial cercana al suelo
    
            const caca = this.cacas.create(x, y, 'caca').setScale(0.2 * this.altScale);
            caca.body.setAllowGravity(true); 
            caca.setBounce(0.2); // Rebote suave al tocar el suelo
            caca.body.setSize(caca.width * 0.8, caca.height * 0.8).setOffset(caca.width * 0.1, caca.height * 0.1);
    
            // Iniciar el ciclo de comportamiento
            this.iniciarCicloCaca(caca);
        }
    
        this.enemigos.push({ tipo: 'cacas', grupo: this.cacas });
    }
    
    iniciarCicloCaca(caca) {
        if (caca && caca.anims) {
            caca.anims.play('cacaBrillando'); // Animación inicial
        }
        this.scene.time.delayedCall(5000, () => {
            if (caca && caca.anims && this.scene.anims.exists('cacaPreparada')) {
                caca.anims.play('cacaPreparada');
            }
            const tiempoPreparacion = Phaser.Math.Between(1000, 10000);
            this.scene.time.delayedCall(tiempoPreparacion, () => {
                if (caca && caca.anims && this.scene.anims.exists('cacaSaltar')) {
                    caca.anims.play('cacaSaltar');
                   
                    // Verificar si la caca está dentro de la vista de la cámara
                    const camera = this.scene.cameras.main;
                    if (
                        caca.x > camera.scrollX && caca.x < camera.scrollX + camera.width && caca.y > camera.scrollY && caca.y < camera.scrollY + camera.height
                    ) {
                        if (this.scene.isSoundOn) {
                            this.scene.cacaSaltoSound.play();
                        }
                    }
                }
                if (caca && caca.body) {
                    caca.body.setAllowGravity(true);
                    caca.setVelocityY(-800 * this.altScale);
                    caca.setVelocityX(Phaser.Math.Between(-100, 100) * this.altScale);
                }
    
                this.scene.time.delayedCall(2000, () => {
                    if (caca && caca.anims && this.scene.anims.exists('cacaCaer')) {
                        caca.anims.play('cacaCaer');
                    }
                    if (caca && caca.body) {
                        //caca.body.setAllowGravity();
                        caca.setVelocity(0, 0);
                    }
                    if (caca) {
                        this.iniciarCicloCaca(caca); // Reinicia el ciclo
                    }
                });
            });
        });
    }
    
    
    
    
    actualizarCacas(scrollX) {
        this.cacas.getChildren().forEach(caca => {
            if (caca && caca.body) { // Verificar que caca y su body existen
                if (caca.x < scrollX - 500) {
                    caca.x = scrollX + this.scene.scale.width + Phaser.Math.Between(500,1000) * this.altScale; // Reposicionar fuera del lado derecho
                    caca.y = this.scene.scale.height - 500 * this.altScale; // Volver cerca del suelo
                    caca.body.setAllowGravity(true); // Reiniciar la gravedad
                    caca.setVelocity(5, 5); // Detener movimiento
                    this.iniciarCicloCaca(caca); // Reiniciar ciclo
                }
            }
        });
    }
    


    configurarAnimaciones() {
        // Verifica si las animaciones ya están creadas para evitar duplicados
        if (!this.scene.anims.exists('cacaQuieta')) {
            this.scene.anims.create({
                key: 'cacaQuieta',
                frames: [{ key: 'caca', frame: 1 }],
                frameRate: 1,
            });
        }
    
        if (!this.scene.anims.exists('cacaBrillando')) {
            this.scene.anims.create({
                key: 'cacaBrillando',
                frames: this.scene.anims.generateFrameNumbers('caca', { start: 1, end: 1 }),
                frameRate: 2,
                repeat: 4, // Brilla durante 5 segundos
            });
        }
    
        if (!this.scene.anims.exists('cacaPreparada')) {
            this.scene.anims.create({
                key: 'cacaPreparada',
                frames: this.scene.anims.generateFrameNumbers('caca', { start: 1, end: 4 }),
                frameRate: 5,
                repeat: -1, // Repite continuamente
            });
        }
    
        if (!this.scene.anims.exists('cacaSaltar')) {
            this.scene.anims.create({
                key: 'cacaSaltar',
                frames: [{ key: 'caca', frame: 5 }],
                frameRate: 1,
            });
        }
    
        if (!this.scene.anims.exists('cacaCaer')) {
            this.scene.anims.create({
                key: 'cacaCaer',
                frames: [{ key: 'caca', frame: 0 }],
                frameRate: 1,
            });
        }
    }
    
    
    
    
    actualizar(scrollX) {
        this.enemigos.forEach(enemigo => {
            if (enemigo.tipo === 'palomas') {
                this.actualizarPalomas(scrollX);
            } else if (enemigo.tipo === 'patinetes') {
                this.actualizarPatinetes(scrollX);
            } else if (enemigo.tipo === 'cacas') {
                this.actualizarCacas(scrollX);
            }
            // Añadir mas tipos de enemigos
        });
    }
    
}  