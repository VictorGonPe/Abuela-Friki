import Phaser from 'phaser';

const altScale = 1; // Altura de diseño fija a 1080px

export default class HUD {
    constructor(scene, { puntos, salud, vidas, galletasDisponibles }) {
        this.scene = scene;

        // Puntos
        this.puntosTexto = scene.add.text(25 * altScale, 12 * altScale, `Puntos: ${puntos}`, {
            fontSize: '30px', fill: '#ffffff', fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setScrollFactor(0).setScale(0.8 * altScale).setDepth(2);

        // Salud
        this.indicadorVida = scene.add.image(15 * altScale, 40 * altScale, 'indicadorVida')
            .setOrigin(0, 0).setScale(0.5 * altScale).setScrollFactor(0).setDepth(2);
        this.barraSalud = scene.add.graphics().setScrollFactor(0).setScale(1 * altScale).setDepth(2);
        this.indicadorVida2 = scene.add.image(15 * altScale, 40 * altScale, 'indicadorVida2')
            .setOrigin(0, 0).setScale(0.5 * altScale).setScrollFactor(0).setDepth(2);
        this.actualizarSalud(salud);

        // Vidas
        this.vidasImagen = scene.add.image(15 * altScale, 190 * altScale, 'vidaIcono')
            .setOrigin(0, 0).setScale(0.6 * altScale).setScrollFactor(0).setDepth(2);
        this.textoVidas = scene.add.text(90 * altScale, 210 * altScale, `${vidas}`, {
            fontSize: '30px', fill: '#ffffff', fontFamily: 'Bangers',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setScrollFactor(0).setScale(0.8 * altScale).setDepth(2);

        // Galletas
        this.galletaIcono = scene.add.image(45 * altScale, 150 * altScale, 'galleta')
            .setScale(0.2 * altScale).setScrollFactor(0).setDepth(2);
        this.galletasTexto = scene.add.text(85 * altScale, 140 * altScale, `${galletasDisponibles}`, {
            fontFamily: 'Bangers', fontSize: '30px', fill: '#ffffff',
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
        }).setScrollFactor(0).setScale(0.8 * altScale).setDepth(2);

        // Barra de transformacion (se crea bajo demanda)
        this.barraTransformacion = null;
    }

    actualizarPuntos(puntos) {
        this.puntosTexto.setText(`Puntos: ${puntos}`);
    }

    actualizarSalud(valor) {
        if (valor < 0) valor = 0;
        if (valor > 100) valor = 100;
        this.barraSalud.clear();
        this.barraSalud.fillStyle(0x000000);
        this.barraSalud.fillRect(80, 63, 140, 25);
        this.barraSalud.fillStyle(0xff0000);
        this.barraSalud.fillRect(80, 63, (140 * valor) / 100, 25);
    }

    actualizarVidas(vidas) {
        this.textoVidas.setText(`${vidas}`);
    }

    actualizarGalletas(cantidad) {
        this.galletasTexto.setText(`${cantidad}`);
    }

    crearBarraTransformacion() {
        this.barraTransformacion = this.scene.add.graphics().setScrollFactor(0).setDepth(2);
    }

    dibujarBarraTransformacion(restante, total) {
        if (!this.barraTransformacion) return;
        const x = 15 * altScale;
        const y = 265 * altScale;
        const anchoBarra = (180 * restante) / total;

        this.barraTransformacion.clear();
        this.barraTransformacion.fillStyle(0x000000);
        this.barraTransformacion.fillRect(x, y, 180, 25);
        this.barraTransformacion.fillStyle(0x0000ff);
        this.barraTransformacion.fillRect(x, y, anchoBarra, 25);
    }

    eliminarBarraTransformacion() {
        if (this.barraTransformacion) {
            this.barraTransformacion.clear();
            this.barraTransformacion = null;
        }
    }
}
