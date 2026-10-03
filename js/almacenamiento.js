// Módulo de almacenamiento persistente.
// Guarda y recupera datos del jugador en localStorage con validación.

const CLAVE = 'abuelaFriki';
const VERSION = 1;

const DEFAULTS = {
    version: VERSION,
    record: 0,
    musicaOn: true,
    efectosOn: true,
    dificultad: 1, // 0 = fácil, 1 = medio, 2 = difícil
};

export function cargar() {
    try {
        const raw = localStorage.getItem(CLAVE);
        if (!raw) return { ...DEFAULTS };
        const datos = JSON.parse(raw);
        if (typeof datos !== 'object' || datos === null) return { ...DEFAULTS };

        return {
            version: VERSION,
            record:     typeof datos.record === 'number' && datos.record >= 0 ? Math.floor(datos.record) : DEFAULTS.record,
            musicaOn:   typeof datos.musicaOn === 'boolean' ? datos.musicaOn : DEFAULTS.musicaOn,
            efectosOn:  typeof datos.efectosOn === 'boolean' ? datos.efectosOn : DEFAULTS.efectosOn,
            dificultad: [0, 1, 2].includes(datos.dificultad) ? datos.dificultad : DEFAULTS.dificultad,
        };
    } catch {
        return { ...DEFAULTS };
    }
}

export function guardar(cambios) {
    const actual = cargar();
    const nuevos = { ...actual, ...cambios, version: VERSION };
    try {
        localStorage.setItem(CLAVE, JSON.stringify(nuevos));
    } catch {
        // localStorage lleno o no disponible — el juego sigue funcionando
    }
}
