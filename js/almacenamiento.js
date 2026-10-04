// Módulo de almacenamiento persistente.
// Guarda y recupera datos del jugador en localStorage con validación.

const CLAVE = 'abuelaFriki';
const VERSION = 1;

const DEFAULTS = {
    version: VERSION,
    record: 0,
    pesetas: 0, // saldo de pesetas del jugador
    inventario: { galletasExtra: 0, escudo: 0, vidaExtra: 0 }, // objetos comprados en La Farmacia sin usar
    hazanas: [], // ids de las hazañas conseguidas
    estadisticas: { palomas: 0, patinetes: 0, transformaciones: 0 }, // acumulados entre partidas
    musicaOn: true,
    efectosOn: true,
    dificultad: 1, // 0 = fácil, 1 = medio, 2 = difícil
};

// Devuelve un objeto con las mismas claves que `porDefecto` y cantidades enteras >= 0.
// Sirve para el inventario y para las estadísticas.
function validarContadores(contadores, porDefecto) {
    const valido = { ...porDefecto };
    if (typeof contadores !== 'object' || contadores === null) return valido;
    Object.keys(valido).forEach((clave) => {
        if (Number.isInteger(contadores[clave]) && contadores[clave] >= 0) valido[clave] = contadores[clave];
    });
    return valido;
}

function validarHazanas(hazanas) {
    if (!Array.isArray(hazanas)) return [];
    return [...new Set(hazanas.filter(id => typeof id === 'string' && id.length <= 40))].slice(0, 100);
}

function porDefecto() {
    return {
        ...DEFAULTS,
        inventario: { ...DEFAULTS.inventario },
        hazanas: [],
        estadisticas: { ...DEFAULTS.estadisticas },
    };
}

export function cargar() {
    try {
        const raw = localStorage.getItem(CLAVE);
        if (!raw) return porDefecto();
        const datos = JSON.parse(raw);
        if (typeof datos !== 'object' || datos === null) return porDefecto();

        return {
            version: VERSION,
            record:     typeof datos.record === 'number' && datos.record >= 0 ? Math.floor(datos.record) : DEFAULTS.record,
            pesetas:    typeof datos.pesetas === 'number' && datos.pesetas >= 0 ? Math.floor(datos.pesetas) : DEFAULTS.pesetas,
            inventario: validarContadores(datos.inventario, DEFAULTS.inventario),
            hazanas:    validarHazanas(datos.hazanas),
            estadisticas: validarContadores(datos.estadisticas, DEFAULTS.estadisticas),
            musicaOn:   typeof datos.musicaOn === 'boolean' ? datos.musicaOn : DEFAULTS.musicaOn,
            efectosOn:  typeof datos.efectosOn === 'boolean' ? datos.efectosOn : DEFAULTS.efectosOn,
            dificultad: [0, 1, 2].includes(datos.dificultad) ? datos.dificultad : DEFAULTS.dificultad,
        };
    } catch {
        return porDefecto();
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
