// Módulo de almacenamiento persistente.
// Guarda y recupera datos del jugador en localStorage con validación.

const CLAVE = 'abuelaFriki';
const VERSION = 1;

const DEFAULTS = {
    version: VERSION,
    record: 0,
    pesetas: 0, // saldo de pesetas del jugador
    inventario: { galletasExtra: 0, escudo: 0, vidaExtra: 0 }, // objetos comprados en La Farmacia sin usar
    musicaOn: true,
    efectosOn: true,
    dificultad: 1, // 0 = fácil, 1 = medio, 2 = difícil
};

// Devuelve un inventario con las mismas claves que el de DEFAULTS y cantidades enteras >= 0
function validarInventario(inventario) {
    const valido = { ...DEFAULTS.inventario };
    if (typeof inventario !== 'object' || inventario === null) return valido;
    Object.keys(valido).forEach((id) => {
        if (Number.isInteger(inventario[id]) && inventario[id] >= 0) valido[id] = inventario[id];
    });
    return valido;
}

function porDefecto() {
    return { ...DEFAULTS, inventario: { ...DEFAULTS.inventario } };
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
            inventario: validarInventario(datos.inventario),
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
