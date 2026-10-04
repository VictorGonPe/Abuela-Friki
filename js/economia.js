// Valores de equilibrio de la economía de pesetas (Fase 7).
// Todo lo que se gana y lo que cuesta va aquí, no repartido por las escenas.

export const ECONOMIA = {
    pesetaRecogida: 1, // pesetas que da cada moneda recogida en el nivel

    // Recompensas al completar un nivel
    completarNivel: 50,
    bonusEstrellas: [0, 25, 75], // con 1, 2 y 3 estrellas
    bonusPorVida: 10,            // por cada vida conservada

    // Artículos de La Farmacia: consumibles que se gastan al empezar la siguiente partida.
    // El id es también la clave del inventario guardado: no lo cambies sin migrar el guardado.
    farmacia: [
        { id: 'galletasExtra', nombre: 'Galletas extra', descripcion: 'Empiezas con 20 galletas en lugar de 10',    precio: 150 },
        { id: 'escudo',        nombre: 'Escudo inicial', descripcion: '10 segundos sin recibir daño al empezar',    precio: 200 },
        { id: 'vidaExtra',     nombre: 'Vida extra',     descripcion: 'Empiezas con 4 vidas en lugar de 3',         precio: 250 },
    ],
    galletasConExtra: 20,
    vidasConExtra: 4,
    duracionEscudo: 10000, // ms

    // Continuar tras un game over: una sola vez por partida
    continuar: { precio: 100, vidas: 1, salud: 50 },

    // Transformaciones de pago. Precios aprobados el 2026-10-04; todavía no se usan:
    // faltan los sprites y la mecánica. Wukong sigue siendo gratis dentro del nivel.
    // `desbloquear` se paga una vez; `activar`, cada vez que se usa; `tecnica` es la técnica extra.
    transformaciones: [
        { id: 'verde',       nombre: 'Abuela Verde',       desbloquear: 600,  activar: 25, tecnica: 300 },
        { id: 'cibernetica', nombre: 'Abuela Cibernética', desbloquear: 1000, activar: 30, tecnica: 400 },
    ],

    // Hazañas. El id se guarda en el almacenamiento: no lo cambies sin migrar el guardado.
    // `meta` es la cantidad que hay que alcanzar en las que cuentan algo.
    hazanas: [
        { id: 'primeraVictoria',  nombre: 'Primera victoria',  descripcion: 'Termina el nivel',                          pesetas: 100 },
        { id: 'intocable',        nombre: 'Intocable',         descripcion: 'Termina el nivel sin recibir daño',         pesetas: 200 },
        { id: 'pacifista',        nombre: 'Pacifista',         descripcion: 'Termina el nivel sin lanzar galletas',      pesetas: 150 },
        { id: 'turista',          nombre: 'Turista',           descripcion: 'Ve todos los monumentos en una partida',    pesetas: 100 },
        { id: 'reinaDelBaston',   nombre: 'Reina del bastón',  descripcion: 'Derriba 50 palomas en total',               pesetas: 75,  meta: 50 },
        { id: 'cazapatinetes',    nombre: 'Cazapatinetes',     descripcion: 'Derriba 20 patinetes en total',             pesetas: 75,  meta: 20 },
        { id: 'wukongMaestro',    nombre: 'Wukong maestro',    descripcion: 'Transfórmate 5 veces en total',             pesetas: 75,  meta: 5 },
        { id: 'abuelaMillonaria', nombre: 'Abuela millonaria', descripcion: 'Consigue 2000 puntos en una partida',       pesetas: 100, meta: 2000 },
        { id: 'tresEstrellas',    nombre: 'Tres estrellas',    descripcion: 'Termina el nivel con tres estrellas',       pesetas: 150 },
        { id: 'superviviente',    nombre: 'Superviviente',     descripcion: 'Termina el nivel sin perder ninguna vida',  pesetas: 100 },
    ],
};
