export default class Plataformas {
    constructor(scene, altScale) {
        this.scene = scene; // Referencia a la escena de Phaser
        this.altScale = altScale; // Escala para ajustar tamaños
        this.platforms = this.scene.physics.add.staticGroup(); // Grupo de plataformas estáticas
        this.movingPlatforms = []; // Array para plataformas móviles
    }

    // Crear el suelo
    crearSuelo(width, height, key) {
        this.platforms.create(width / 2, height - 50 * this.altScale, key)
            .setDisplaySize(width, 140 * this.altScale)
            .refreshBody();
    }

    // Crear plataformas estáticas
    crearPlataformaEstatica(x, y, key, scale = 1) {
        this.platforms.create(x * this.altScale, y * this.altScale, key)
            .setScale(scale * this.altScale)
            .refreshBody();
    }

    // Crear plataformas móviles
    crearPlataformaMovil(x, y, key, scale = 1, velocityX = 100) {
        const platform = this.scene.physics.add.sprite(x * this.altScale, y * this.altScale, key)
            .setScale(scale * this.altScale)
            .refreshBody();
    
        if (platform && platform.body) {
            platform.body.setImmovable(true);
            platform.body.setAllowGravity(false);
            platform.body.setVelocityX(velocityX * this.altScale);
            console.log('Plataforma móvil creada:', platform); // Asegúrate de que se crean correctamente
            this.movingPlatforms.push(platform);
        } else {
            console.error('Error al crear plataforma móvil:', platform); // Error al crear la plataforma
        }
    }
    
    
    
    

    // Método para configurar todo el escenario
    configurarEscenario() {
        // Crear el suelo
        this.crearSuelo(this.scene.scale.width, this.scene.scale.height, 'suelo');

        // Crear plataformas estáticas
        this.crearPlataformaEstatica(300, 800, 'plataformasL', 0.45);
        this.crearPlataformaEstatica(360, 800, 'plataformasC', 0.45);
        this.crearPlataformaEstatica(420, 800, 'plataformasR', 0.45);

        this.crearPlataformaEstatica(700, 850, 'plataformasL', 0.45);
        this.crearPlataformaEstatica(760, 850, 'plataformasC', 0.45);
        this.crearPlataformaEstatica(816, 850, 'plataformasC', 0.45);
        this.crearPlataformaEstatica(872, 850, 'plataformasC', 0.45);
        this.crearPlataformaEstatica(930, 850, 'plataformasR', 0.45);

        // Crear plataformas móviles
        this.crearPlataformaMovil(455, 630, 'plataformasL', 0.45, 100);
        this.crearPlataformaMovil(515, 630, 'plataformasC', 0.45, 100);
        this.crearPlataformaMovil(575, 630, 'plataformasR', 0.45, 100);
    }

    // Actualizar plataformas móviles para que cambien de dirección
    actualizarPlataformasMoviles(limiteIzq, limiteDer) {
        this.movingPlatforms.forEach(platform => {
            if (platform.x >= limiteDer * this.altScale) {
                platform.setVelocityX(-100 * this.altScale);
            } else if (platform.x <= limiteIzq * this.altScale) {
                platform.setVelocityX(100 * this.altScale);
            }
        });
    }
}

