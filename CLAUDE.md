# Abuela Friki

Juego de plataformas 2D de Víctor González Pérez. La abuela Carmen recorre Barcelona esquivando palomas, patinetes y cacas, lanza galletas y se transforma en "Abuela Wukong".

Nació como TFG, ya entregado. Ahora es un **producto comercial en desarrollo**: se va a mejorar, gamificar y publicar en iOS y Android con monetización (vídeos recompensados y compra de orbes), y después en Mac y PC. Habrá más niveles en el futuro, así que el código tiene que quedar preparado para crecer.

El plan por fases y el diagnóstico del código están en `docs/plan-multiplataforma.md`: léelo antes de empezar cualquier trabajo. Las decisiones ya tomadas están en `docs/decisiones.md`.

## Stack

- **Phaser 3.55.2, versión exacta.** No la subas sin que Víctor lo pida: el código usa `this.add.particles(...).createEmitter(...)`, que se eliminó en Phaser 3.60. Usa siempre la API y la documentación de 3.55.
- JavaScript con módulos ES. Vite como bundler (`package.json` presente desde la Fase 1).
- Phaser se importa como módulo ES: `import Phaser from 'phaser'` en cada archivo que lo use.
- Físicas Arcade. No uses Matter.
- Empaquetado previsto: Capacitor para iOS y Android, Electron para Mac y PC. No se cambia de motor.

## Ejecutar y verificar

- `npm run dev` — servidor de desarrollo en `http://localhost:5173`.
- `npm run build` — compila en `dist/`. `npm run preview` sirve `dist/` en local.
- `npm run lint` — comprueba errores; solo deben aparecer los dos errores conocidos (`game` en AjustesScene y `createTouchControls` en GameScene).
- Verificar un cambio significa cargar el juego, recorrer el flujo afectado y comprobar que la consola no tiene errores. Con el MCP de Playwright (`.mcp.json`) puedes abrirlo y hacer capturas tú mismo.
- Hazlo antes de dar una tarea por terminada. Si no has podido verificar algo, dilo claramente en lugar de darlo por bueno.
- Para probar el táctil en escritorio usa la emulación de dispositivo del navegador.
- `node tools/revisar-assets.mjs` lista las texturas demasiado grandes y los assets que nadie carga.

## Estructura

```
index.html              Entrada del juego (Vite la procesa)
css/styles.css          Estilos de la página
js/abuelaFriki.js       Configuración de Phaser y lista de escenas
js/scenes/              Una escena por archivo; la clave de escena es el nombre de la clase
  InicioScene.js          Pantalla de título
  HistoriaInicialScene.js Intro narrada (3 imágenes y audio)
  MenuScene.js            Menú principal
  ControlesScene.js       Pantalla de controles
  GameScene.js            Nivel 1 (Barcelona): ~1470 líneas, casi toda la lógica
  AjustesScene.js         Ajustes (todavía no se guardan ni se aplican)
js/enemigos.js          Clase Enemigos: palomas, patinetes y cacas
js/collisionManager.js  Clase CollisionManager: solo se usa colisionCaca
js/monumento.js         Clase Monumento: monumentos con parallax
public/assets/          Imágenes y sonidos (103 MB)
docs/                   Plan y registro de decisiones
tools/                  Scripts de apoyo
```

Flujo de escenas: Inicio → HistoriaInicial → Menu → Controles → Game. Ajustes se abre desde Menu.

## Convenciones del código

- **Idioma: español** en identificadores, comentarios, textos del juego y mensajes de commit. Respóndele a Víctor en español.
- Clases en PascalCase, una por archivo, con `export default`. Variables y métodos en camelCase.
- **Coordenadas de diseño a 1080 px de alto.** Hoy cada medida se multiplica por `altScale = window.innerHeight / 1080`, y la vertical se cuenta desde abajo: `window.innerHeight - y * altScale`. La Fase 2 del plan sustituye esto por una resolución fija; hasta entonces sigue el patrón existente y no mezcles los dos sistemas.
- El nivel mide 30000 px de diseño de ancho y termina en x = 29600.
- Profundidades (`depth`): 1 jugador, enemigos y plataformas · 1.5 primer plano (vallas, palomas) · 2 HUD · 3 pantalla de game over · 10 textos sobre todo lo demás.
- Las claves de assets y animaciones se referencian en varios archivos: no las renombres sin buscar todos los usos.
- El estado compartido entre escenas (sonido, vidas) se guarda hoy con `this.data` de GameScene.

## Trampas conocidas

Borra cada punto de esta lista cuando quede resuelto.

- ~~`createTouchControls` se llama en `GameScene.js:485` pero no está definida en ningún sitio~~ — resuelto en Fase 3.
- ~~Inicio, HistoriaInicial y Controles solo avanzan con teclado~~ — resuelto en Fase 3.
- El estado de la partida (`puntos`, `salud`, `galletasDisponibles`, `isTransformed`…) vive en variables de módulo al principio de `GameScene.js`. `scene.restart()` no las reinicia, y eso hoy se aprovecha para conservar puntos y galletas al perder una vida. Tenlo en cuenta antes de mover nada.
- Todo se calcula una sola vez con `window.innerHeight` al cargar. Cambiar el tamaño de la ventana o girar el dispositivo descuadra el juego. En pantallas pequeñas la abuela traspasa el suelo al andar.
- Al transformarse en Wukong el sprite cambia de 378 px a 470 px de alto y el origen no se recalcula: la abuela queda ligeramente hundida en el suelo. Se corrige en Fase 2 junto con el resto del sistema de escala.
- `AjustesScene.js:108` usa una variable `game` que no existe en ese módulo: lanza un error en cada cambio de tamaño después de visitar Ajustes.
- Las palomas son instancias fijas: si se destruyen todas al principio no aparecen más. Pendiente: spawning continuo y variante rápida con tono rojo (ver `docs/decisiones.md`).
- Al menos seis spritesheets en uso superan los 4096 px de ancho, el límite de textura de muchos móviles.

## Forma de trabajar

- **Código pensado para crecer, pero sencillo.** Vienen más niveles, una tienda y monetización: separa datos de lógica y evita duplicar, sin montar arquitecturas que el juego todavía no necesita. Víctor mantiene el proyecto solo y tiene que entender todo lo que se añade.
- Cambios pequeños, uno por commit. No hagas commit ni push si no se te pide.
- Pregunta antes de: borrar o mover assets, añadir dependencias, cambiar valores de jugabilidad ya equilibrados, subir la versión de Phaser, añadir mecánicas nuevas o tocar cualquier cosa relacionada con dinero real (anuncios, compras, precios).
- El código muerto se puede borrar sin preguntar, en un commit propio.
- No mezcles refactorización con cambios de comportamiento en la misma tarea.
- Anota las decisiones técnicas y de diseño relevantes en `docs/decisiones.md`: qué se decidió y por qué, en dos o tres líneas.
- Al terminar una fase del plan, actualiza este archivo: comandos, estructura y trampas resueltas.
