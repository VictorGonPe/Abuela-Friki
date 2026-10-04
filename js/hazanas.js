// Hazañas (logros): desbloqueo y estadísticas acumuladas entre partidas.
// La lista, las metas y las pesetas que dan están en ECONOMIA.hazanas.

import { cargar, guardar } from './almacenamiento.js';
import { ECONOMIA } from './economia.js';

// Desbloquea una hazaña y entrega sus pesetas al saldo.
// Devuelve la hazaña si es nueva, o null si ya estaba conseguida o el id no existe.
export function desbloquearHazana(id) {
    const hazana = ECONOMIA.hazanas.find(h => h.id === id);
    const datos = cargar();
    if (!hazana || datos.hazanas.includes(id)) return null;

    guardar({
        hazanas: [...datos.hazanas, id],
        pesetas: datos.pesetas + hazana.pesetas,
    });
    return hazana;
}

// Suma 1 a una estadística acumulada (palomas, patinetes, transformaciones) y devuelve el total.
export function sumarEstadistica(clave) {
    const estadisticas = { ...cargar().estadisticas };
    estadisticas[clave]++;
    guardar({ estadisticas });
    return estadisticas[clave];
}
