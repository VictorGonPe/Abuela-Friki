import Phaser from 'phaser';
import { cargar } from '../almacenamiento.js';
import { aplicarHover } from '../ui/botonTexto.js';
import { ECONOMIA } from '../economia.js';

// Lista de hazañas con las conseguidas marcadas. Se abre desde el menú.

class HazanasScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HazanasScene' });
    }

    create() {
        const datos = cargar();
        const centroX = this.scale.width / 2;
        const izquierda = centroX - 500;
        const estilo = { fontFamily: 'Bangers', padding: { left: 10, right: 10, top: 6, bottom: 6 } };

        // Fondo (la textura ya está cargada: a esta escena solo se llega desde el menú)
        this.add.image(centroX, this.scale.height / 2, 'menuBackground').setScale(1.08);
        this.add.rectangle(centroX, this.scale.height / 2, 1100, this.scale.height, 0x000000).setAlpha(0.75);

        this.add.text(centroX, 80, 'Hazañas', { ...estilo, fontSize: '64px', color: '#ffd700' }).setOrigin(0.5);
        this.add.text(centroX, 150, `${datos.hazanas.length} de ${ECONOMIA.hazanas.length} conseguidas`, {
            ...estilo, fontSize: '28px', color: '#cccccc',
        }).setOrigin(0.5);

        ECONOMIA.hazanas.forEach((hazana, i) => {
            const y = 230 + i * 72;
            const conseguida = datos.hazanas.includes(hazana.id);
            const color = conseguida ? '#7CFC00' : '#ffffff';

            this.add.text(izquierda, y, `${conseguida ? '★' : '☆'}  ${hazana.nombre}`, { ...estilo, fontSize: '32px', color }).setOrigin(0, 0.5);
            this.add.text(izquierda + 370, y, hazana.descripcion, { ...estilo, fontSize: '24px', color: '#cccccc' }).setOrigin(0, 0.5);
            this.add.text(centroX + 500, y, conseguida ? 'Conseguida' : `+${hazana.pesetas} pesetas`, {
                ...estilo, fontSize: '26px', color: conseguida ? '#7CFC00' : '#ffd700',
            }).setOrigin(1, 0.5);
        });

        const btnVolver = this.add.text(centroX, 1000, 'Volver', { ...estilo, fontSize: '36px', color: '#ffffff' })
            .setOrigin(0.5).setInteractive();
        aplicarHover(btnVolver);
        btnVolver.on('pointerdown', () => this.scene.start('MenuScene'));
        this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
    }
}

export default HazanasScene;
