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
            { x: 1300, y: 210, key: 'monumento1' }, // Colón
            { x: 3800, y: 210, key: 'monumento2' }, // T.Maphre
            { x: 5430, y: 210, key: 'monumento6' }, //Pedrera
            { x: 12200, y: 215, key: 'monumento3' }, // Sagrada Familia
            { x: 16000, y: 230, key: 'monumento4' }, // Agbar
            { x: 22000, y: 180, key: 'monumento5' }, //Arco triunfo
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
