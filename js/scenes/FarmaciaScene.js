import Phaser from 'phaser';
import { cargar, guardar } from '../almacenamiento.js';
import { aplicarHover } from '../ui/botonTexto.js';
import { asegurarTexturaPeseta } from '../ui/peseta.js';
import { ECONOMIA } from '../economia.js';

// La Farmacia: tienda donde se gastan las pesetas en objetos de inicio de partida.
// Los artículos y sus precios salen de ECONOMIA.farmacia.

class FarmaciaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FarmaciaScene' });
    }

    create() {
        const datos = cargar();
        const centroX = this.scale.width / 2;
        const estilo = { fontFamily: 'Bangers', padding: { left: 10, right: 10, top: 8, bottom: 8 } };

        // Fondo (la textura ya está cargada: a esta escena solo se llega desde el menú)
        this.add.image(centroX, this.scale.height / 2, 'menuBackground').setScale(1.08);
        this.add.rectangle(centroX, this.scale.height / 2, 1100, this.scale.height, 0x000000).setAlpha(0.75);

        this.add.text(centroX, 110, 'La Farmacia', { ...estilo, fontSize: '64px', color: '#ffd700' }).setOrigin(0.5);
        this.add.text(centroX, 185, 'Gasta tus pesetas en ayudas para la próxima partida', {
            ...estilo, fontSize: '28px', color: '#cccccc',
        }).setOrigin(0.5);

        // Saldo
        asegurarTexturaPeseta(this);
        const saldo = this.add.text(centroX + 20, 255, `${datos.pesetas} pesetas`, {
            ...estilo, fontSize: '40px', color: '#ffd700',
        }).setOrigin(0.5);
        this.add.image(saldo.x - saldo.width / 2 - 22, saldo.y, 'peseta').setScale(0.6);

        ECONOMIA.farmacia.forEach((articulo, i) => this.crearFila(articulo, 380 + i * 170, datos));

        this.add.text(centroX, 900, 'Lo que compres se usa solo al empezar la siguiente partida', {
            ...estilo, fontSize: '24px', color: '#cccccc',
        }).setOrigin(0.5);

        const btnVolver = this.add.text(centroX, 980, 'Volver', { ...estilo, fontSize: '36px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive();
        aplicarHover(btnVolver);
        btnVolver.on('pointerdown', () => this.scene.start('MenuScene'));
        this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
    }

    crearFila(articulo, y, datos) {
        const centroX = this.scale.width / 2;
        const izquierda = centroX - 500;
        const estilo = { fontFamily: 'Bangers', padding: { left: 10, right: 10, top: 8, bottom: 8 } };
        const tienes = datos.inventario[articulo.id];

        this.add.text(izquierda, y - 30, articulo.nombre, { ...estilo, fontSize: '40px', color: '#ffffff' }).setOrigin(0, 0.5);
        this.add.text(izquierda, y + 20, articulo.descripcion, { ...estilo, fontSize: '26px', color: '#cccccc' }).setOrigin(0, 0.5);
        this.add.text(centroX + 150, y - 5, `Tienes: ${tienes}`, {
            ...estilo, fontSize: '28px', color: tienes > 0 ? '#7CFC00' : '#888888',
        }).setOrigin(0.5);

        const falta = articulo.precio - datos.pesetas;
        if (falta > 0) {
            // Sin saldo suficiente: se explica cuánto falta en lugar de un botón que no hace nada
            this.add.text(centroX + 390, y - 5, `${articulo.precio} pesetas\nTe faltan ${falta}`, {
                ...estilo, fontSize: '26px', color: '#888888', align: 'center',
            }).setOrigin(0.5);
            return;
        }

        const btnComprar = this.add.text(centroX + 390, y - 5, `Comprar: ${articulo.precio}`, {
            ...estilo, fontSize: '34px', color: '#ffffff', backgroundColor: '#2e7d32',
        }).setOrigin(0.5).setInteractive();
        aplicarHover(btnComprar);
        btnComprar.on('pointerdown', () => this.comprar(articulo));
    }

    comprar(articulo) {
        // Se vuelve a leer el guardado: es la única fuente fiable del saldo
        const datos = cargar();
        if (datos.pesetas < articulo.precio) return;

        guardar({
            pesetas: datos.pesetas - articulo.precio,
            inventario: { ...datos.inventario, [articulo.id]: datos.inventario[articulo.id] + 1 },
        });

        if (datos.efectosOn && this.cache.audio.exists('cogerGalletas')) {
            this.sound.play('cogerGalletas', { volume: 0.7 });
        }
        this.scene.restart(); // redibuja saldo, cantidades y botones
    }
}

export default FarmaciaScene;
