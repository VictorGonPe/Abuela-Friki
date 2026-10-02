// Datos del nivel Barcelona.
// Todas las posiciones en píxeles de diseño (altura de referencia 1080 px).
// GameScene aplica altScale al colocarlas; con la resolución fija de Fase 2 altScale = 1.

export const BARCELONA = {
    anchoNivel: 30000,
    finNivel:   29600, // x donde termina el nivel (puerta del Imserso)

    jugadorInicio: { x: 130, y: 320 },

    // Bloques de suelo y huecos. GameScene los recorre para crear el suelo estático.
    bloquesYHuecos: [
        { x: 0,     ancho: 2800 },
        { hueco: 350 },
        { x: 3150,  ancho: 5000 },
        { hueco: 2000 },
        { x: 10150, ancho: 3050 },
        { hueco: 200 },
        { x: 13400, ancho: 3000 },
        { hueco: 250 },
        { x: 16650, ancho: 5000 },
        { hueco: 250 },
        { x: 21900, ancho: 100 },
        { hueco: 200 },
        { x: 22200, ancho: 80 },
        { hueco: 300 },
        { x: 22580, ancho: 120 },
        { hueco: 250 },
        { x: 22950, ancho: 50 },
        { hueco: 300 },
        { x: 23300, ancho: 100 },
        { hueco: 200 },
        { x: 23600, ancho: 6400 },
    ],

    // Plataformas elevadas. tipo 'uno' = una pieza, 'dos' = dos piezas, 'grande' = pieza ancha.
    plataformas: [
        { tipo: 'uno',    x: 550,   y: 320 },
        { tipo: 'uno',    x: 872,   y: 500 },
        { tipo: 'uno',    x: 1120,  y: 500 },
        { tipo: 'dos',    x1: 1510, y1: 700,  x2: 1607,  y2: 700 },
        { tipo: 'dos',    x1: 1903, y1: 700,  x2: 2000,  y2: 700 },
        { tipo: 'dos',    x1: 2210, y1: 505,  x2: 2307,  y2: 505 },
        { tipo: 'dos',    x1: 8300, y1: 330,  x2: 8397,  y2: 330 }, // Agujero 1
        { tipo: 'dos',    x1: 8700, y1: 560,  x2: 8797,  y2: 560 }, // Agujero 2
        { tipo: 'uno',    x: 9120,  y: 800 },
        { tipo: 'uno',    x: 9120,  y: 350 },
        { tipo: 'uno',    x: 9470,  y: 400 },
        { tipo: 'uno',    x: 9720,  y: 620 },
        { tipo: 'uno',    x: 9780,  y: 280 },
        { tipo: 'uno',    x: 10470, y: 310 },
        { tipo: 'uno',    x: 10630, y: 550 },
        { tipo: 'uno',    x: 10860, y: 550 },
        { tipo: 'dos',    x1: 11150, y1: 550, x2: 11247, y2: 550 },
        { tipo: 'dos',    x1: 11600, y1: 500, x2: 11697, y2: 500 },
        { tipo: 'uno',    x: 13750, y: 320 }, // Sagrada Família
        { tipo: 'grande', x: 14250, y: 550 },
    ],

    // Imágenes decorativas. x e y en píxeles de diseño; y se cuenta desde abajo.
    // depth y flipX son opcionales (por defecto: sin depth extra, sin flip).
    imagenes: [
        // Tiendas y edificios
        { key: 'cartelBarcelona', x: 400,   y: 120, escala: 0.5  },
        { key: 'quiosco1',        x: 1000,  y: 140, escala: 0.7  },
        { key: 'tiendaComic1',    x: 1750,  y: 140, escala: 0.6  },
        { key: 'pescaderia1',     x: 2250,  y: 170, escala: 0.57 },
        { key: 'panaderia1',      x: 2870,  y: 140, escala: 0.7  },
        { key: 'carniceria1',     x: 3430,  y: 170, escala: 0.55 },
        { key: 'badulaque1',      x: 3940,  y: 140, escala: 0.6  },
        { key: 'carpinteria1',    x: 4470,  y: 170, escala: 0.55 },
        { key: 'informatica1',    x: 5000,  y: 140, escala: 0.6  },
        { key: 'colegio1',        x: 5600,  y: 180, escala: 0.7  },
        { key: 'heladeria1',      x: 6100,  y: 120, escala: 0.7  },
        { key: 'floristeria1',    x: 7100,  y: 120, escala: 0.7  },
        { key: 'colmado1',        x: 7600,  y: 170, escala: 0.5  },
        { key: 'cafeteria1',      x: 10750, y: 140, escala: 0.6  },
        { key: 'bar1',            x: 11650, y: 140, escala: 0.6  },
        { key: 'carniceria2',     x: 11200, y: 170, escala: 0.6  },
        { key: 'drogueria1',      x: 12110, y: 170, escala: 0.6  },
        { key: 'pasteleria1',     x: 12600, y: 140, escala: 0.6  },
        { key: 'bloque4',         x: 24100, y: 140, escala: 0.9  },
        { key: 'bloque2',         x: 25580, y: 140, escala: 0.9  },
        { key: 'bloque6',         x: 25300, y: 140, escala: 0.5  },
        { key: 'bloque1',         x: 26500, y: 140, escala: 0.8  },
        { key: 'bloque2',         x: 28000, y: 140, escala: 0.8  },
        { key: 'bloque3',         x: 28780, y: 140, escala: 0.8  },
        { key: 'imserso1',        x: 29600, y: 140, escala: 0.8  },
        // Objetos decorativos de calle
        { key: 'senal2',          x: 2750,  y: 115, escala: 0.65 },
        { key: 'cono1',           x: 7960,  y: 120, escala: 0.6  },
        { key: 'vallas4',         x: 8050,  y: 94,  escala: 0.6,  depth: 1.5 },
        { key: 'semaforo1',       x: 10250, y: 115, escala: 0.6  },
        { key: 'buzon1',          x: 10400, y: 120, escala: 0.7,  flipX: true },
        { key: 'tierra1',         x: 12980, y: 90,  escala: 0.5,  depth: 1.5, flipX: true },
        { key: 'bocaIncendios1',  x: 14400, y: 140, escala: 0.5  },
        { key: 'basura2',         x: 13600, y: 120, escala: 0.5  },
        { key: 'basura2',         x: 16200, y: 120, escala: 0.5,  flipX: true },
        // Zona obras (agujeros ~21100)
        { key: 'senal1',          x: 21300, y: 95,  escala: 0.7,  depth: 1.5 },
        { key: 'carretilla1',     x: 21450, y: 130, escala: 0.5  },
        { key: 'cono3',           x: 21590, y: 120, escala: 0.6  },
        { key: 'vallas3',         x: 21650, y: 130, escala: 0.6  },
        { key: 'vallas3',         x: 23600, y: 130, escala: 0.6,  flipX: true },
        { key: 'senal3',          x: 23700, y: 110, escala: 0.6  },
        { key: 'tierra2',         x: 23755, y: 95,  escala: 0.6,  depth: 1.5 },
        { key: 'cono2',           x: 23830, y: 98,  escala: 0.6,  depth: 1.5 },
    ],

    // Rangos de elementos repetidos (se colocan con un bucle en GameScene).
    pivotes:    [{ inicio: 13450, fin: 16350 }], // Pivotes Sagrada Família
    vallasObra: [{ inicio: 21750, fin: 23500 }], // Vallas zona obras

    enemigos: {
        palomas:   15,
        patinetes: 20,
        cacas:     5,
    },

    recogibles: {
        frascosGalletas: 3,
        pastillas:       3,
        lunasWukong:     [10550],
    },
};
