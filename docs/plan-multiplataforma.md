# Plan de Abuela Friki

De proyecto entregado a juego publicado: arreglar la base, preparar el código para crecer, mejorar y gamificar el juego, llevarlo a iOS y Android con monetización y, después, a Mac y PC. Se mantiene Phaser: Capacitor para móvil y Electron para escritorio.

Este documento lo leen dos lectores: Víctor, para saber qué pedir y cómo comprobarlo, y Claude Code, que ejecuta cada fase.

## Cómo usar este plan

1. Abre la carpeta del proyecto en Visual Studio Code y abre Claude Code. Ejecuta `/context` y comprueba que `CLAUDE.md` aparece en la lista de archivos de memoria.
2. Trabaja **una fase por conversación**. Pega el mensaje de la fase, revisa el plan que te proponga y da el visto bueno.
3. Cuando Claude termine, haz tú la comprobación de «Hecho cuando». Si pasa, pide el commit.
4. Ejecuta `/clear` antes de empezar la fase siguiente, para que no arrastre contexto de la anterior.

Mensaje para cada fase, cambiando el número:

```
Ejecuta la Fase 1 de @docs/plan-multiplataforma.md. Primero lee los archivos
implicados y enséñame tu plan de cambios; no edites nada hasta que te diga
"adelante". Al terminar, verifica el resultado tú mismo en el navegador y
dime qué has comprobado y qué no has podido comprobar.
```

## Vista general

| Etapa | Fases | Resultado |
|---|---|---|
| A · Base técnica | 0 a 3 | El juego se construye, se adapta a cualquier pantalla y se juega con los dedos |
| B · Código para crecer | 4 | Un nivel nuevo es un archivo de datos, no otra escena gigante |
| C · Mejorar y gamificar | 5 a 7 | Assets ligeros, progreso guardado, orbes, tienda y logros |
| D · Móvil | 8 y 9 | El juego instalado en Android y en iPhone |
| E · Monetización y lanzamiento | 10 y 11 | Vídeos recompensados, compra de orbes y publicación en las tiendas |
| F · Escritorio | 12 | Versión de Mac y PC, sin anuncios |
| Continuo | N | Niveles nuevos |

El orden pone el móvil antes que el escritorio porque es donde está la monetización. Las etapas A y B no se pueden saltar: sin ellas el juego no arranca en un móvil y cada nivel nuevo costaría el doble.

## Qué necesitas

| Para | Hace falta |
|---|---|
| Todas las fases | Node.js LTS y git |
| Android | Android Studio. Cuenta de Google Play: ya la tienes |
| iOS | Xcode en el Mac. Cuenta de Apple: ya la tienes |
| Monetización | Cuenta en una red de anuncios, y los acuerdos de pago, datos fiscales y bancarios completados en App Store Connect y Google Play Console |
| PC | Un PC con Windows o GitHub Actions para generar y probar el instalador |

## Diagnóstico del código (2 de octubre de 2026)

### Bloquean el juego en móvil

| Problema | Dónde |
|---|---|
| `createTouchControls` se llama pero no existe: la escena del nivel falla en cualquier dispositivo táctil, incluidos portátiles con pantalla táctil | `js/scenes/GameScene.js:485` |
| La pantalla de título solo avanza con una tecla | `js/scenes/InicioScene.js:30` |
| La intro solo se salta con ESPACIO | `js/scenes/HistoriaInicialScene.js:113` |
| La pantalla de controles solo avanza con ESPACIO | `js/scenes/ControlesScene.js:34` |
| El movimiento solo lee el teclado | `js/scenes/GameScene.js:930-1023` |
| Phaser y la fuente Bangers se descargan de internet | `index.html:7`, `index.html:9`, `css/styles.css:1` |
| Al menos seis spritesheets en uso superan 4096 px de ancho: `abuelaAndar`, `abuelaSalto` y `abuelaAndarWukongPrueba` (7623), `abuelaIdleWukong` (5850), `paracetamol` (5500), `abuelaIdle` (4719) | `assets/` |

### Afectan a todas las plataformas

| Problema | Dónde |
|---|---|
| Tamaños y gravedad calculados una sola vez con `window.innerHeight`; girar o redimensionar descuadra el juego | `js/abuelaFriki.js:21-30` y todas las escenas |
| La escala se aplica a valores que no son píxeles (`setOrigin`) y por duplicado en cuerpos físicos dinámicos (`setOffset`, `setSize`) | `js/scenes/GameScene.js:358`, `:361`, `:1395` |
| Variable `game` inexistente: error en cada cambio de tamaño tras visitar Ajustes | `js/scenes/AjustesScene.js:108` |
| Música, efectos y dificultad de Ajustes no se guardan ni se aplican | `js/scenes/AjustesScene.js:33-93` |
| Estado de la partida en variables de módulo | `js/scenes/GameScene.js:5-50` |
| `scrollY` sin declarar: lee por accidente `window.scrollY` | `js/enemigos.js:32` |
| 103 MB de imágenes. El código carga 84 MB; 51 archivos (23 MB) no se usan, entre ellos duplicados en `assets/Imagenes/` | `assets/` |
| Anchos de fotograma con decimales (313.3 y 345.5) y uno que no divide exacto (362 en una imagen de 7623 px) | `js/scenes/GameScene.js:74`, `:108`, `:109` |
| No hay pantalla de carga: el nivel descarga todas sus imágenes sin mostrar progreso | `js/scenes/GameScene.js:60-176` |

### Ya decidido (detalle en `docs/decisiones.md`)

| Cuestión | Decisión | Se aplica en |
|---|---|---|
| Destino de la intro | Siempre al menú, termine sola o se salte | Fase 3 |
| Puntuación | Paloma +10, patinete +25, daño 0, fin de nivel +500, +100 por vida | Fase 6 |
| Código muerto | Se borra | Fase 4 |

---

# Etapa A · Base técnica

## Fase 0 · Preparar el terreno

**Objetivo:** poder deshacer cualquier cosa.

- Crear la rama `desarrollo` desde el estado actual. Si ya existe una rama de trabajo creada para este plan, se sigue en ella.
- Ampliar `.gitignore`: `node_modules/`, `dist/`, `release/`, `.env*`, `*.keystore`, `*.jks`, `*.p12`, `*.p8`, `*.mobileprovision`, `CLAUDE.local.md`, `.claude/settings.local.json`.
- Comprobar que el juego arranca hoy con un servidor estático y anotar cualquier error de consola como línea base.
- Ejecutar `node tools/revisar-assets.mjs` y guardar la salida: es la foto del punto de partida.

**Hecho cuando:** hay una rama de trabajo, `git status` está limpio y sabes qué errores existían antes de empezar.

## Fase 1 · Vite, dependencias locales y linter

**Objetivo:** que el juego se construya en una carpeta `dist/` autosuficiente, sin depender de internet. Capacitor y Electron empaquetan esa carpeta.

- Crear `package.json` e instalar Vite como dependencia de desarrollo.
- Instalar `phaser@3.55.2` con versión exacta. Añadir `import Phaser from 'phaser'` en cada archivo que lo use y quitar la etiqueta `<script>` del CDN.
- Mover `assets/` a `public/assets/` para que las rutas `'assets/...'` del código sigan valiendo sin cambios. `js/` se queda donde está.
- Poner la fuente Bangers en local y esperar a que esté cargada antes de crear el juego (`document.fonts.load`), para que ningún texto salga con la fuente por defecto.
- Configurar `base: './'` en Vite: dentro de las apps el juego no se sirve desde la raíz de un dominio.
- Añadir ESLint con la regla `no-undef` y un script `npm run lint`. Esa regla habría detectado los tres errores de nombres sin declarar del diagnóstico.
- Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Actualizar `readme.md` y `CLAUDE.md` con los comandos nuevos. Quitar Unity del readme.

**No hacer:** subir Phaser de versión, pasar a TypeScript ni reorganizar el código.

**Hecho cuando:** `npm run build` genera `dist/`; `npm run preview` muestra el juego igual que antes; con el wifi apagado sigue funcionando; `npm run lint` solo señala los errores ya conocidos.

## Fase 2 · Resolución fija y estado de la partida

**Objetivo:** que el juego se vea igual en cualquier pantalla y aguante giros y cambios de tamaño. Es la fase que más líneas toca; pide capturas de antes y después.

Propuesta para evaluar (Claude: valida que encaja con el código antes de aplicarla y explica cualquier alternativa):

- Alto de juego fijo de 1080 px, que es la medida con la que ya está diseñado el nivel. El ancho se calcula al arrancar según la proporción de la pantalla, limitado entre 4:3 y 21:9.
- `Phaser.Scale.FIT` con centrado: Phaser escala el lienzo y el código deja de preocuparse del tamaño real.
- Con alto fijo, `altScale` vale siempre 1. Sustituir `window.innerHeight` por `this.scale.height` y `window.innerWidth` por `this.scale.width`. Esto corrige de paso los casos en que la escala se aplicaba donde no debía.
- Gravedad fija de 980.
- Usar `#gameContainer` como contenedor del juego a pantalla completa, sin el límite de 800 × 600 ni el borde del CSS actual.
- Arreglar el listener de `AjustesScene.js:108` y quitarlo al salir de la escena.
- Pasar el estado de módulo de `GameScene` a propiedades inicializadas en `init()`, manteniendo de forma explícita que puntos y galletas se conservan al perder una vida y se reinician en el game over.
- Declarar `scrollY` en `enemigos.js`.

**No hacer:** cambiar posiciones del nivel, velocidades ni daños.

**Hecho cuando:** el juego se ve igual que antes a 1920 × 1080; se ve correcto a 1280 × 720, 2532 × 1170 (iPhone en horizontal) y 1024 × 768 (iPad); redimensionar la ventana no rompe nada; morir conserva puntos y galletas; la consola no muestra errores.

## Fase 3 · Entrada unificada: teclado y táctil

**Objetivo:** jugar de principio a fin solo con los dedos, y también solo con el teclado.

- Crear un módulo de entrada único que exponga el estado (izquierda, derecha, saltar, lanzar) uniendo teclado y botones táctiles. `GameScene` lo consulta en lugar de leer el teclado.
- Botones en pantalla: izquierda y derecha abajo a la izquierda; saltar y lanzar galleta abajo a la derecha. Semitransparentes, grandes y con margen respecto al borde.
- Activar suficientes punteros para pulsar tres botones a la vez.
- Mostrar los botones al detectar un toque y ocultarlos al usar el teclado.
- Inicio: cualquier tecla o toque. Intro: botón «Saltar» pulsable además de ESPACIO. Controles: texto distinto según el dispositivo, y continuar con toque o tecla.
- La intro lleva siempre al menú, termine sola o se salte.
- Eliminar la llamada a `createTouchControls`.

**Hecho cuando:** con la emulación táctil del navegador se llega del título al final del nivel sin tocar el teclado; con teclado todo sigue igual; se puede andar, saltar y lanzar a la vez.

---

# Etapa B · Código para crecer

## Fase 4 · Niveles como datos

**Objetivo:** que añadir una ciudad sea crear un archivo de datos y sus imágenes. Sigue `.claude/rules/refactorizacion.md`, que tiene los pasos en orden. **Un paso por conversación**, jugando el nivel después de cada uno.

Resumen de los pasos: borrar el código muerto, sacar los datos de Barcelona a `js/niveles/barcelona.js`, manifiesto de assets por nivel con una escena de carga que muestre el progreso, helper de botones, clase para el HUD, clase para la abuela y archivo único de valores de equilibrio.

**No hacer:** cambiar cómo se juega. Al terminar, el nivel tiene que ser indistinguible del de antes.

**Hecho cuando:** `GameScene.js` no contiene posiciones ni nombres de imágenes de Barcelona; existe una pantalla de carga con barra de progreso; crear un nivel de prueba con tres plataformas y un enemigo solo exige un archivo de datos nuevo.

---

# Etapa C · Mejorar y gamificar

## Fase 5 · Assets

**Objetivo:** que ninguna textura falle en móvil y que la app pese mucho menos. El peso importa también para el negocio: cuanto más pesa una app, menos gente termina de descargarla.

- Reorganizar en varias filas los spritesheets que superan 4096 px, con un script. Los fotogramas se numeran por filas, así que las animaciones no cambian. Objetivo: ningún lado por encima de 2048 px cuando sea posible.
- Corregir las imágenes cuyos fotogramas no tienen ancho entero (`patinete`, `caca`, `abuelaAndarWukongPrueba`) y ajustar `frameWidth`.
- Reducir las imágenes que se muestran mucho más pequeñas de lo que miden (`paracetamol` mide 5500 px y se dibuja al 10 %).
- Mover los archivos sin uso fuera de `public/`, a una carpeta `_archivo/`. No borrar nada: Víctor decide.
- Comprimir los PNG sin pérdida visible.
- Añadir `node tools/revisar-assets.mjs` como paso previo del build.

**Hecho cuando:** el script no informa de texturas por encima de 4096 px ni de rutas inexistentes; las animaciones se ven igual que antes, comparando capturas; `dist/` pesa menos de la mitad que al empezar.

## Fase 6 · Guardado, ajustes y puntuación

**Objetivo:** que el juego recuerde al jugador y que los números tengan sentido.

- Módulo de almacenamiento único, con los datos validados al leer y un número de versión para poder cambiar el formato más adelante sin perder partidas.
- Música, efectos y dificultad de Ajustes se guardan y se aplican de verdad.
- Aplicar la tabla de puntuación decidida.
- Récord guardado, visible en el menú y al terminar el nivel.
- Pantalla de fin de nivel de verdad: puntos, bonificaciones y valoración de una a tres estrellas, en lugar del texto «En construcción».
- Colocar paracetamoles y frascos en posiciones alcanzables, no al azar sobre los huecos.

**Hecho cuando:** cerrar y abrir el juego conserva ajustes y récord; la dificultad cambia la partida de forma perceptible; chocar con una paloma ya no suma puntos.

## Fase 7 · Orbes, tienda y logros (sin dinero real)

**Objetivo:** construir el ciclo de ganar y gastar orbes y comprobar que es divertido solo jugando. Los anuncios y las compras llegan en la Fase 10 como dos fuentes más de orbes; si el ciclo no engancha gratis, no lo hará pagando. Sigue `.claude/rules/gamificacion.md`.

Antes de programar, Claude propone y Víctor decide:

- Cuántos orbes da una partida normal y cuánto cuesta cada cosa.
- En qué se gastan. Punto de partida: continuar tras un game over, aspectos de la abuela y objetos de inicio de partida.
- Qué logros hay y cuántos orbes dan.

Después:

- Orbes recogibles en el nivel, contador en el HUD y saldo guardado.
- Escena de tienda accesible desde el menú.
- Logros con aviso en pantalla al conseguirlos.
- Opción de continuar con orbes en la pantalla de game over.

**Hecho cuando:** se pueden ganar orbes jugando, gastarlos en la tienda y ver el efecto; el saldo y las compras sobreviven a cerrar el juego; alguien que no conoce el juego entiende sin explicación para qué sirven los orbes.

---

# Etapa D · Móvil

## Fase 8 · Android con Capacitor

**Objetivo:** el juego instalado en un móvil Android.

- Instalar Capacitor y añadir la plataforma Android, con `dist` como carpeta web.
- Orientación horizontal bloqueada, pantalla completa inmersiva y pantalla siempre encendida durante la partida.
- Botón atrás: pausa o vuelta al menú, nunca cierre directo.
- Pausar juego y audio al ir a segundo plano y reanudar al volver.
- Icono y pantalla de inicio.
- Script `npm run android` que construya, sincronice y abra Android Studio.

**Hecho cuando:** el juego se juega entero en un emulador y en un móvil real, a velocidad fluida, sin conexión, y vuelve bien de segundo plano.

## Fase 9 · iOS con Capacitor

**Objetivo:** el juego instalado en un iPhone y en un iPad.

- Añadir la plataforma iOS y abrir el proyecto en Xcode.
- Solo orientación horizontal, barra de estado oculta.
- Zonas seguras: pasar al juego los márgenes del notch y de la barra inferior, y colocar HUD y botones dentro.
- Ocultar la opción «Pantalla completa» de Ajustes.
- Comprobar que el audio arranca tras el primer toque y vuelve tras una llamada o un cambio de app.
- Script `npm run ios`.

**Hecho cuando:** el juego se juega entero en un iPhone y en un iPad reales, nada queda tapado por el notch y el sonido sobrevive a salir y volver.

---

# Etapa E · Monetización y lanzamiento

## Fase 10 · Vídeos recompensados y compra de orbes

**Objetivo:** añadir las dos fuentes de orbes de pago sin estropear el juego. Sigue `.claude/rules/monetizacion.md` y `.claude/rules/seguridad.md`. Aquí cada cambio se consulta antes.

Decisiones de Víctor antes de empezar:

- Dónde se ofrece un vídeo. Punto de partida: duplicar los orbes al terminar un nivel, continuar tras un game over y un regalo diario.
- Paquetes de orbes y sus precios.
- Público objetivo que se declara en las tiendas, porque condiciona los anuncios permitidos.

Trabajo:

- Módulo de monetización único con implementación simulada para el navegador.
- Vídeos recompensados con una red de anuncios, con identificadores de prueba durante todo el desarrollo.
- Compras de paquetes de orbes a través de las tiendas de Apple y Google.
- Consentimiento de privacidad antes de cargar anuncios, y aviso de seguimiento en iOS.
- Límite diario de vídeos y entrega de orbes solo tras la confirmación del SDK.

**Hecho cuando:** en un dispositivo real, un vídeo de prueba visto entero entrega los orbes y uno cancelado no; una compra de prueba entrega los orbes una sola vez aunque se cierre la app a mitad; sin conexión, el juego funciona y los botones de vídeo y compra se ocultan o avisan; todo el juego se puede terminar sin pagar ni ver vídeos.

## Fase 11 · Publicación en las tiendas

Tareas sobre todo de Víctor; Claude puede preparar textos y listas de comprobación.

- Iconos, capturas y textos de la ficha en los tamaños que pide cada tienda.
- Política de privacidad publicada en una URL, coherente con los SDK de anuncios y compras.
- Formularios de datos de cada tienda y clasificación por edades.
- Productos de compra creados y aprobados en App Store Connect y en Google Play Console.
- Licencias de todo lo que no hayas creado tú: sonidos, música y fuente. Un recurso con licencia «no comercial» no se puede usar en un juego con ingresos. Si hay voces de otras personas, su permiso por escrito.
- Las referencias a personajes de anime y otras obras deben quedarse en guiños: las tiendas rechazan apps con nombres, diseños o audios reconocibles de terceros.
- Paquete firmado para cada tienda, con las claves fuera del repositorio.
- Prueba cerrada con unos cuantos jugadores antes del lanzamiento público: TestFlight en iOS y pruebas internas en Google Play.
- `npm audit` limpio y versión numerada.

Los ingresos de las tiendas tienen consecuencias fiscales. Consúltalo con una gestoría antes de lanzar.

---

# Etapa F · Escritorio

## Fase 12 · Mac y PC con Electron

**Objetivo:** un instalador para Mac y otro para Windows, sin anuncios. Steam no admite juegos cuyo modelo de negocio sean los anuncios, así que en escritorio el juego es de pago o gratuito sin monetización, y los orbes solo se ganan jugando.

- Añadir Electron y electron-builder. Proceso principal en `electron/main.js`, cumpliendo `.claude/rules/seguridad.md`.
- Ventana de 1280 × 720 como mínimo, sin barra de menús, con pantalla completa conmutable. Enlazar la opción «Pantalla completa» de Ajustes.
- La implementación de escritorio del módulo de monetización no ofrece vídeos ni compras, y las pantallas que los muestran se adaptan.
- Scripts: `npm run escritorio:dev` y `npm run escritorio:build`. Salidas en `release/`.
- Mac: `.dmg` firmado y notarizado con la cuenta de Apple.
- Windows: instalador `.exe`, generado y probado en un PC con Windows o con GitHub Actions.

**Hecho cuando:** el `.dmg` se instala y el juego se juega entero sin conexión; lo mismo con el `.exe` en un PC; no aparece ninguna referencia a vídeos ni compras.

---

# Continuo

## Fase N · Un nivel nuevo

Repetible a partir de la Fase 4, una vez por ciudad.

- Antes de programar: tema de la ciudad, monumentos, enemigos propios y qué mecánica nueva aporta el nivel. Un nivel que solo cambia el fondo no da motivos para seguir jugando.
- Archivo de datos del nivel y manifiesto de sus assets.
- Imágenes dentro de los límites de tamaño desde el principio: `node tools/revisar-assets.mjs`.
- Curva de dificultad: el nivel empieza más fácil de lo que terminó el anterior y acaba más difícil.
- Entrada en el selector de niveles, con su condición de desbloqueo.

**Hecho cuando:** el nivel se termina con teclado y con táctil, tiene su récord y sus estrellas, y no ha hecho falta tocar el código de la escena de juego más que para la mecánica nueva.
