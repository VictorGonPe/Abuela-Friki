export default class Monumento {
    constructor(scene, altScale) {
        this.scene = scene; // Escena de Phaser
        this.altScale = altScale; // Escala para adaptar tamaños
        this.monumentos = []; // Array para guardar los monumentos
        this.lastScrollX = 0; // Última posición del scroll de la cámara
    }

    crearMonumentos() {
        // Coordenadas y datos para los monumentos
        const monumentosData = [
            { x: 1100, y: 140, key: 'monumento1' },
            { x: 2100, y: 90, key: 'monumento2' },
            { x: 3100, y: 140, key: 'monumento3' },
            { x: 4100, y: 130, key: 'monumento4' },
            { x: 5100, y: 130, key: 'monumento5' },
        ];

        // Crear los monumentos basados en los datos
        monumentosData.forEach(data => {
            const monumento = this.scene.add.image(
                data.x * this.altScale,
                this.scene.scale.height - data.y * this.altScale,
                data.key
            )
            .setOrigin(0.5, 1)
            .setScale(0.8 * this.altScale);
            this.monumentos.push(monumento); // Guardar referencia al monumento
        });
    }

    actualizar(scrollX) {
        // Calcular la diferencia incremental del scroll
        const deltaScrollX = scrollX - this.lastScrollX;
        // Mover cada monumento según el delta del scroll (efecto parallax)
        this.monumentos.forEach(monumento => {
            monumento.x -= deltaScrollX * -0.2; // Ajuste de desplazamiento negativo/ no esta en 1 plano
        });
        // Actualizar la posición previa del scroll
        this.lastScrollX = scrollX;
    }
}
