// Datos del nivel Madrid. Mismo formato que barcelona.js.
// Nivel básico de prueba: usa las imágenes de Barcelona (tiendas, fondos y plataformas) con otro
// cielo y otra luz hasta que haya decorado propio. Lo que aporta es la mecánica: plataformas que
// se mueven para cruzar los huecos.
import { BARCELONA } from './barcelona.js';

export const MADRID = {
    nombre: 'Madrid',
    anchoNivel: 14000,
    finNivel:   13600,

    jugadorInicio: { x: 130, y: 320 },

    // Atardecer: cielo anaranjado y los fondos de Barcelona teñidos
    fondo: {
        cielo: 0xf6a35c,
        velo: { color: 0xff5a00, alpha: 0.12 },
        lejano: 'backgroundMountain', tinteLejano: 0xd9a58c,
        ciudad: 'backgroundCiudad',   tinteCiudad: 0xffc9a3,
        cesped: 'cesped',
    },

    // Letrero provisional con el nombre de la ciudad, hasta que haya un cartel dibujado
    rotulo: { texto: 'MADRID', x: 400, y: 420 },

    monumentos: [],

    bloquesYHuecos: [
        { x: 0,     ancho: 2600 },
        { hueco: 1100 },              // se cruza con una plataforma que va y viene
        { x: 3700,  ancho: 2800 },
        { hueco: 700 },               // se cruza con un ascensor
        { x: 7200,  ancho: 2300 },
        { hueco: 1500 },              // dos plataformas seguidas: hay que cambiar de una a otra
        { x: 11000, ancho: 3000 },
    ],

    plataformas: [
        { tipo: 'uno',    x: 600,   y: 320 },
        { tipo: 'dos',    x1: 950,  y1: 500, x2: 1047, y2: 500 },
        { tipo: 'grande', x: 4600,  y: 330 },
        { tipo: 'uno',    x: 5100,  y: 540 },
        { tipo: 'uno',    x: 7450,  y: 620 },  // a la altura del ascensor arriba
        { tipo: 'dos',    x1: 8200, y1: 330, x2: 8297, y2: 330 },
        { tipo: 'grande', x: 12000, y: 330 },
    ],

    // Plataformas que se mueven. x e y como las fijas (y desde abajo). Van y vuelven entre su
    // posición y `hastaX` (horizontales) o `hastaY` (verticales), a `velocidad` px/s.
    plataformasMoviles: [
        { x: 2900,  y: 300, hastaX: 3400,  velocidad: 140 },
        { x: 6850,  y: 280, hastaY: 620,   velocidad: 110 },
        { x: 9800,  y: 300, hastaX: 10050, velocidad: 120 },
        { x: 10700, y: 300, hastaX: 10450, velocidad: 160 },
    ],

    imagenes: [
        { key: 'cafeteria1',     x: 900,   y: 140, escala: 0.6  },
        { key: 'bar1',           x: 1500,  y: 140, escala: 0.6  },
        { key: 'pasteleria1',    x: 2100,  y: 140, escala: 0.6  },
        { key: 'senal2',         x: 2500,  y: 115, escala: 0.65 },
        { key: 'cono1',          x: 3800,  y: 120, escala: 0.6  },
        { key: 'quiosco1',       x: 4200,  y: 140, escala: 0.7  },
        { key: 'floristeria1',   x: 4900,  y: 120, escala: 0.7  },
        { key: 'colmado1',       x: 5500,  y: 170, escala: 0.5  },
        { key: 'heladeria1',     x: 6050,  y: 120, escala: 0.7  },
        { key: 'semaforo1',      x: 7300,  y: 115, escala: 0.6  },
        { key: 'drogueria1',     x: 7800,  y: 170, escala: 0.6  },
        { key: 'panaderia1',     x: 8400,  y: 140, escala: 0.7  },
        { key: 'buzon1',         x: 8900,  y: 120, escala: 0.7  },
        { key: 'tiendaComic1',   x: 9150,  y: 140, escala: 0.6  },
        { key: 'cono3',          x: 11100, y: 120, escala: 0.6  },
        { key: 'bloque4',        x: 11600, y: 140, escala: 0.9  },
        { key: 'bloque1',        x: 12500, y: 140, escala: 0.8  },
        { key: 'bocaIncendios1', x: 13000, y: 140, escala: 0.5  },
        { key: 'imserso1',       x: 13600, y: 140, escala: 0.8  },
    ],

    pivotes:    [],
    vallasObra: [],

    enemigos: {
        palomas:   { inicial: 2, intervalo: 5000, max: 8 },
        patinetes: 8,
        cacas:     3,
    },

    recogibles: {
        frascosGalletas: 2,
        pastillas:       2,
        lunasWukong:     [8000],
        // Provisionales, para probar las transformaciones en este nivel
        lunasCiberneticas: [1800],
        lingotesVerdes: [1300],
        pesetas: [
            { x: 600,   y: 400 },
            { x: 998,   y: 580 },
            { x: 2000,  y: 190 },
            { x: 3150,  y: 420 }, // sobre el recorrido de la primera plataforma móvil
            { x: 4600,  y: 410 },
            { x: 5100,  y: 620 },
            { x: 6850,  y: 740 }, // en lo alto del ascensor
            { x: 7450,  y: 700 },
            { x: 8248,  y: 410 },
            { x: 9925,  y: 420 }, // sobre las plataformas del hueco largo
            { x: 10575, y: 420 },
            { x: 12000, y: 410 },
            { x: 13200, y: 190 },
        ],
    },

    // De momento carga exactamente lo mismo que Barcelona
    assets: BARCELONA.assets,
};
