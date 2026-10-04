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
};
