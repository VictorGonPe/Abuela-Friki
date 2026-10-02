---
paths:
  - "js/**/*.js"
  - "src/**/*.js"
  - "index.html"
  - "css/**/*.css"
  - "electron/**"
  - "capacitor.config.*"
---

# Multiplataforma

El mismo código tiene que funcionar en iOS, Android, Mac y PC. Estas reglas evitan que un cambio pensado para una plataforma rompa otra.

## Entrada

- Toda acción se puede hacer con teclado y con pantalla táctil. Nada avanza solo con una tecla ni solo con un toque.
- Las escenas no leen el teclado directamente: consultan un único módulo de entrada que une teclado, táctil y, más adelante, mando.
- Los efectos al pasar el ratón son un adorno: en táctil no existen, así que nada puede depender de ellos.
- Los textos de ayuda se adaptan al dispositivo. "Pulsa ESPACIO" no tiene sentido en un móvil.
- El juego necesita varios dedos a la vez (moverse, saltar y lanzar): configura suficientes punteros activos en Phaser.
- Los botones táctiles son grandes, quedan dentro de la zona segura y no tapan a la abuela ni el HUD.

## Pantalla

- Móvil solo en horizontal, bloqueado en la configuración nativa de cada plataforma.
- Respeta las zonas seguras (notch, isla dinámica, barra de gestos): HUD y botones dentro del margen.
- El juego debe verse bien entre 4:3 (iPad) y 21:9 (móviles alargados). Comprueba esos dos extremos además de 16:9.
- `this.scale.startFullscreen()` no funciona en el WebView de iPhone: oculta esa opción en móvil, donde la app ya ocupa toda la pantalla.

## Assets

- Ninguna textura supera los 4096 px de lado; el objetivo es 2048. Los spritesheets largos se reorganizan en varias filas: Phaser numera los fotogramas por filas, así que los índices de las animaciones no cambian.
- Rutas de assets relativas, sin `/` inicial: dentro de las apps el juego no se sirve desde la raíz de un dominio.
- Solo se empaqueta lo que el código carga. Antes de añadir una imagen, comprueba su tamaño en píxeles y en megas.
- Audio en MP3. Vigila que el sonido vuelva correctamente al regresar de segundo plano, sobre todo en iOS.

## Ciclo de vida de la app

- Al pasar a segundo plano, el juego y el audio se pausan; al volver, se reanudan sin perder la partida.
- En Android, el botón atrás pausa o vuelve al menú; no cierra la app de golpe.
- El juego funciona sin conexión.

## Separación del código

- El código del juego no importa Electron ni Capacitor directamente. Lo específico de cada plataforma (guardar datos, pantalla completa, botón atrás) pasa por un único módulo de plataforma con una implementación web por defecto.
- Las carpetas nativas (`android/`, `ios/`, `electron/`) no contienen lógica del juego.
- El guardado pasa por un único módulo de almacenamiento, no por `localStorage` repartido por las escenas.

## Verificación

Un cambio de entrada, pantalla o assets no está terminado hasta probarlo, como mínimo, en navegador de escritorio con teclado y en emulación táctil. Antes de cerrar una fase del plan, también en un dispositivo o emulador real de cada plataforma afectada.
