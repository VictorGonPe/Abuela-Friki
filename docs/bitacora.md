# Bitácora de trabajo

Registro de estado por fase y pendientes concretos. Se actualiza al terminar cada sesión de trabajo.

---

## Fase 3 · Entrada unificada — COMPLETADA

### Hecho
- `js/entrada.js` creado: objeto de estado compartido (izquierda, derecha, saltar, lanzar)
- `createTouchControls` eliminada de GameScene
- `crearBotonesTactiles()` implementada: 4 botones (izq, der, saltar, lanzar), semitransparentes, con scroll factor 0
- Multi-touch activado: `this.input.addPointer(3)` en GameScene
- Botones se muestran al tocar y se ocultan al usar el teclado
- InicioScene: avanza con toque o cualquier tecla
- HistoriaInicialScene: se salta con toque o ESPACIO; siempre va al menú
- ControlesScene: continúa con toque o ESPACIO

### Pendiente
- **ControlesScene**: mostrar texto distinto según dispositivo. En táctil: describir los botones en pantalla (izq/der abajo izquierda, saltar/lanzar abajo derecha) en lugar de ← → ↑ X.
- **Verificación**: cargar el juego con emulación táctil del navegador y recorrer el flujo completo (Inicio → Historia → Menú → Controles → nivel) sin tocar el teclado. Comprobar que se puede andar, saltar y lanzar a la vez.

### Criterio "hecho cuando" (del plan)
- Con emulación táctil se llega del título al final del nivel sin tocar el teclado
- Con teclado todo sigue igual
- Se puede andar, saltar y lanzar a la vez

---

## Decisiones de diseño pendientes de implementar

| Decisión | Dónde se implementa |
|---|---|
| Nueva tabla de puntuación (paloma +10, patinete +25, fin nivel +500…) | Fase 6 |

---

## Fase 4 · Niveles como datos — EN PROGRESO

### Pasos completados
- **Paso 1** — datos de Barcelona a `js/niveles/barcelona.js` (commit 3bf3316)
- **Paso 2** — manifiesto de assets + CargaScene con barra de progreso (commit incluido en rama)
- **Paso 3** — helper `aplicarHover` en `js/ui/botonTexto.js`; 5 bloques duplicados eliminados en MenuScene y GameScene (commit dca8876)
- **Paso 4** — estado de módulo a propiedades de la escena (`this`); ~40 variables migradas, variables muertas eliminadas (commit a2f0c5c)

- **Paso 5** — HUD extraído a `js/ui/hud.js`; GameScene conserva `actualizarBarraSalud` como wrapper (commit 0e3786b)
- **Paso 5b** — Palomas: spawning continuo como patinetes; `barcelona.js` usa config `{ inicial, intervalo, max }` (commit 04ac0ef)
- **Paso 5c** — Paloma roja: variante con tint, más rápida, picado hacia la Y del jugador (commit 455c411)

### Pasos pendientes (uno por conversación)
6. Extraer la abuela (movimiento, salto, transformación, daño) a una clase
7. Código muerto: preguntar a Víctor antes de borrar `colisionPatinete`, `colisionPaloma` y las plataformas móviles

---

## Fases completadas

| Fase | Commit | Notas |
|---|---|---|
| 0 · Preparar el terreno | ce72e23 | Rama desarrollo, gitignore, CLAUDE.md, docs |
| 1 · Vite y dependencias locales | 588e24b | Vite, Phaser local, ESLint, fuente Bangers local |
| 2 · Resolución fija y estado | 640d7d1 | 1080px fijos, FIT, estado en init(), altScale = 1 |
| 3 · Entrada unificada | 3bf3316 | entrada.js, botones táctiles, texto ControlesScene por dispositivo |

---

## Fases siguientes (resumen)

| Fase | Objetivo |
|---|---|
| 4 · Niveles como datos | Barcelona en un archivo de datos; pantalla de carga; GameScene sin posiciones hardcoded |
| 5 · Assets | Spritesheets < 4096px; comprimir; mover assets sin uso a _archivo/ |
| 6 · Guardado y puntuación | localStorage validado; ajustes que se aplican; tabla de puntos nueva; récord |
| 7 · Orbes, tienda y logros | Ciclo de ganar/gastar orbes solo jugando |
| 8 · Android | Capacitor, orientación bloqueada, segundo plano |
| 9 · iOS | Capacitor, notch, audio tras llamada |
| 10 · Monetización | Vídeos recompensados, compra de orbes |
| 11 · Publicación | Fichas de tienda, firmas, prueba cerrada |
| 12 · Escritorio | Electron, Mac y PC, sin anuncios |

---

## Fase 7 · Pesetas, Farmacia y Hazañas — EN PROGRESO

Diseño aprobado el 2026-10-03 (economía, precios y hazañas).

### Pasos completados
- **Paso 1** — pesetas recogibles en el nivel, contador en el HUD, saldo guardado y visible en el menú, en la victoria y en el game over
- **Paso 2** — recompensas de fin de nivel: +50 por completar, bonus por estrellas (0/25/75) y +10 por vida, con desglose en la pantalla de victoria
- **Paso 3** — La Farmacia (`FarmaciaScene`), accesible desde el menú: galletas extra, escudo inicial y vida extra. Lo comprado se guarda en `inventario` y se gasta solo al empezar la siguiente partida
- **Paso 4** — continuar tras el game over por 100 pesetas, una vez por partida: 1 vida, 50 % de salud, conserva puntos, galletas y monedas recogidas. Empieza desde el principio del nivel, igual que al perder una vida
- **Paso 5** — Hazañas: 10 logros con aviso en pantalla, pesetas directas al saldo y lista en el menú (`HazanasScene`). Sin probar jugando: las acumuladas (palomas, patinetes, transformaciones), Turista, Abuela millonaria y Tres estrellas

### Pasos pendientes
6. Aspectos de la abuela (Pirata y Espacial): faltan los sprites
7. Cerrar la fase: probar en táctil y en 4:3 / 21:9, y actualizar `CLAUDE.md`
