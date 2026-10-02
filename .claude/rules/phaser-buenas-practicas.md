---
paths:
  - "js/**/*.js"
  - "src/**/*.js"
---

# Buenas prácticas con Phaser 3.55

Aplican al código nuevo y al que toques. No reescribas código existente solo para cumplirlas: eso es refactorización y tiene sus propias reglas.

## Estado y ciclo de vida de las escenas

- El estado de la partida va en propiedades de la escena o en `this.registry`, no en variables `let`/`var` de módulo. Las variables de módulo sobreviven a `scene.restart()` y provocan errores difíciles de ver.
- Inicializa el estado en `init()`, no en el constructor: el constructor se ejecuta una sola vez y `init()` en cada arranque de la escena.
- Lo que comparten varias escenas (sonido activado, dificultad, récord) va en `this.registry`.
- Las animaciones son globales al juego. Créalas una vez y protégelas con `if (!this.anims.exists('clave'))`, porque la escena se reinicia en cada muerte.
- Si registras un listener en algo que vive más que la escena (`this.game`, `this.scale`, `this.registry`, `window`), quítalo en el evento `shutdown`. Usa `this.events.once('shutdown', ...)`.

## Bucle de juego

- `update()` no crea objetos ni llama a `this.add.*`. Lo que aparece y desaparece a menudo (galletas, explosiones, partículas) sale de un grupo reutilizable con `group.get()` y vuelve a él con `setActive(false).setVisible(false)`.
- El movimiento que dependa del tiempo usa `delta`, no cuenta fotogramas.
- Antes de usar un objeto dentro de un `delayedCall` o del final de un tween, comprueba que sigue activo: la escena puede haberse reiniciado mientras tanto.

## Tamaños y físicas

- No leas `window.innerWidth` ni `window.innerHeight` dentro de las escenas. Usa `this.scale.width` y `this.scale.height`.
- La escala solo se aplica a medidas en píxeles. `setOrigin` va de 0 a 1 y no se escala.
- En cuerpos dinámicos de Arcade, `body.setSize` y `body.setOffset` se expresan en píxeles del fotograma sin escalar: Phaser ya aplica la escala del sprite. Multiplicarlos otra vez por la escala la aplica dos veces. En cuerpos estáticos, tras `refreshBody()`, las medidas sí son píxeles de mundo.
- Los fotogramas de un spritesheet tienen ancho y alto enteros. Si la división no es exacta, hay que corregir la imagen, no poner decimales en `frameWidth`.

## Legibilidad

- Los números de jugabilidad (velocidades, daño, tiempos, puntos) van como constantes con nombre, agrupadas, no sueltos por el código.
- Un método hace una cosa. Si pasa de unas 40 líneas, probablemente son dos.
- Nada de `console.log` en el código que se entrega. Para depurar, usa una constante `DEPURACION` y bórralo al terminar.
- Comenta el porqué, no lo que ya dice el código. No dejes código comentado: para eso está git.
- Un nombre sin declarar falla en ejecución o coge por accidente una global del navegador. Ya ha pasado tres veces: `createTouchControls` y `game` lanzan error, y `scrollY` en `enemigos.js` lee sin querer `window.scrollY`. Declara todo con `const` o `let` e importa lo que uses.

## Texto y audio

- La fuente Bangers debe estar cargada antes de crear el primer texto; si no, Phaser lo dibuja con la fuente por defecto y no lo corrige después.
- Todo sonido respeta el ajuste de sonido compartido. No reproduzcas audio sin comprobarlo.
