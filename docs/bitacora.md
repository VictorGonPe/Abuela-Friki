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
| Palomas: spawning continuo (no instancias fijas) | Fase 4 |
| Paloma roja: vuela rápido, baja en picado hacia la abuela y vuelve a subir | Fase 4 |
| Nueva tabla de puntuación (paloma +10, patinete +25, fin nivel +500…) | Fase 6 |

---

## Fases completadas

| Fase | Commit | Notas |
|---|---|---|
| 0 · Preparar el terreno | ce72e23 | Rama desarrollo, gitignore, CLAUDE.md, docs |
| 1 · Vite y dependencias locales | 588e24b | Vite, Phaser local, ESLint, fuente Bangers local |
| 2 · Resolución fija y estado | 640d7d1 | 1080px fijos, FIT, estado en init(), altScale = 1 |
| 3 · Entrada unificada | pendiente commit | entrada.js, botones táctiles, texto ControlesScene por dispositivo |

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
