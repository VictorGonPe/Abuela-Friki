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

## Fase 7 · Pesetas, Farmacia y Hazañas — COMPLETADA salvo aspectos

Diseño aprobado el 2026-10-03 (economía, precios y hazañas).

### Pasos completados
- **Paso 1** — pesetas recogibles en el nivel, contador en el HUD, saldo guardado y visible en el menú, en la victoria y en el game over
- **Paso 2** — recompensas de fin de nivel: +50 por completar, bonus por estrellas (0/25/75) y +10 por vida, con desglose en la pantalla de victoria
- **Paso 3** — La Farmacia (`FarmaciaScene`), accesible desde el menú: galletas extra, escudo inicial y vida extra. Lo comprado se guarda en `inventario` y se gasta solo al empezar la siguiente partida
- **Paso 4** — continuar tras el game over por 100 pesetas, una vez por partida: 1 vida, 50 % de salud, conserva puntos, galletas y monedas recogidas. Empieza desde el principio del nivel, igual que al perder una vida
- **Paso 5** — Hazañas: 10 logros con aviso en pantalla, pesetas directas al saldo y lista en el menú (`HazanasScene`). Sin probar jugando: las acumuladas (palomas, patinetes, transformaciones), Turista, Abuela millonaria y Tres estrellas

- **Cierre** — probado en emulación táctil a 844 × 390 (21:9) y 1024 × 768 (4:3): menú, La Farmacia, Hazañas, compra con toque, objetos aplicados, andar, saltar y lanzar a la vez, recoger peseta y pausa. `CLAUDE.md` actualizado

### Pendiente
- Transformaciones de pago: Abuela Cibernética y Abuela Verde (estilo Hulk). Las dos se prueban gratis con una luna (luna roja en x = 1800, lingote verde en x = 1200) y ya tienen sprites y mecánica; falta cobrarlas con los precios de `ECONOMIA.transformaciones` y quitar la luna y el lingote de prueba. Los aspectos Pirata y Espacial quedan descartados
- **Sonidos de las transformaciones Cibernética y Verde**: hoy son prestados. Cibernética: falta el del rayo (suena como una galleta). Verde: faltan el del puñetazo (galleta) y el de la onda de choque (choque de patinete). Las dos usan el grito de transformación de Wukong
- Probar jugando las hazañas acumuladas, Turista, Abuela millonaria y Tres estrellas, y que el escudo bloquea un golpe
- Prueba del «Hecho cuando»: que alguien que no conoce el juego entienda para qué sirven las pesetas

## Nivel 2 · Madrid (empezado el 2026-10-07)

### Hecho
- La escena de juego lee el nivel de `this.nivel`; Barcelona y Madrid son archivos de datos en `js/niveles/`
- Madrid básico y jugable de principio a fin, con plataformas móviles horizontales y un ascensor
- Botón provisional «Nivel 2: Madrid (prueba)» en el menú

### Por dónde seguir el próximo día
1. Que Víctor juegue Madrid entero y diga qué saltos quedan justos o fáciles y si sobran enemigos (parada en la salida, los patinetes le quitan una vida en pocos segundos).
2. Colocar las imágenes de Madrid según lleguen. Madrid carga hoy `BARCELONA.assets`: cuando tenga imágenes propias necesita su manifiesto, con claves distintas a las de Barcelona (CargaScene no vuelve a cargar una clave que ya existe).
3. Selector de niveles y quitar el botón provisional del menú.

### Imágenes que faltan (estilo y tamaños como los de Barcelona)
- Fondo lejano, unos 1800×1080, que empalme al repetirse: sierra o cielo de Madrid
- Fondo de ciudad, mismo tamaño y repetible: tejados y edificios
- De 4 a 6 monumentos con fondo transparente (Puerta de Alcalá, Cibeles, Oso y Madroño, Palacio Real, Torres Kio, Metrópolis…)
- Cartel de «Madrid» como el de Barcelona (hoy es un texto)
- Plataformas: piezas izquierda, derecha y centro; opcional, una distinta para las que se mueven
- Edificios y tiendas madrileños (churrería, bar de bocadillos de calamares, boca de metro, quiosco…)
- La meta (hoy es el Imserso de Barcelona)
- Opcional: enemigo propio y música del nivel
- Los originales, fuera de `dist/`: `npm run build` borra esa carpeta

### Pendiente de código
- Sin probar: Madrid jugado entero a mano y en táctil
- Récord y estrellas por nivel (hoy el récord es uno solo para los dos)
- Madrid no tiene monumentos, así que no da la hazaña Turista
- Enemigo o detalle propio de Madrid y ajustar la dificultad jugando
- Abuela Verde: sin ver de principio a fin un puñetazo y una onda contra un enemigo real, ni la vuelta al tamaño normal al acabarse el tiempo

## Abuela normal: dibujo nuevo (2026-10-08)

- Las cuatro hojas de la abuela normal ya son las del dibujo nuevo, en PNG transparente: quieta (`abuelaIdle1.png`), andar (`abuelaAndar1.png`), salto (`abuelaSalto1.png`) y muerte (`abuelaMuerte1.png`). Originales y scripts en `_archivo/abuela-originales/`
- Quieta y andar tienen el formato de las anteriores (363×378). La de salto mide 363×410, porque en el aire la abuela ocupa más que de pie
- Como las hojas ya no miden lo mismo de alto, el cuerpo físico de la abuela normal se apoya en la base del fotograma que se muestra (`apoyarCuerpo` en `abuela.js`). Sin eso, al pasar del salto a quieta el cuerpo bajaba unos píxeles, se metía en el suelo y lo atravesaba
- Los dibujos no tienen las mismas proporciones entre hojas (andando la cabeza es más grande respecto al cuerpo). Están igualados por el ancho de la cabeza, que es lo que más se nota: andar sale un 2,5 % más baja y salto y muerte un 2 % más altas
- Muerte: ya no es el mareo en bucle. Son 12 fotogramas de 700×390 a 7 por segundo, una sola vez: 8 dibujos (se asusta, tropieza y cae) y 4 hechos por script con la abuela tumbada cada vez más gris; mientras se pone gris crece hasta 1,4 veces (`MUERTE` en `abuela.js`). Los dos dibujos grises del original no se usan: saltar a ellos se veía brusco
- Quieta traía 14 fotogramas: los dos últimos tienen los pies cortados y no se usan; el decimotercero repite el primero
- Probado en el navegador: quieta, andar a los dos lados, salto y muerte con reinicio y una vida menos
- Las transformaciones (Wukong, Cibernética, Verde) siguen partiendo del dibujo antiguo
- `abuelaAndar.png`, `abuelaIdle.png`, `abuelaSalto.png` y `abuelaMuerte.png` ya no los carga nadie: decidir si se mueven a `_archivo/`
