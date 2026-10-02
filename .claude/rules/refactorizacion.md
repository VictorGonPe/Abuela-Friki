---
paths:
  - "js/**/*.js"
  - "src/**/*.js"
---

# Refactorización

Refactorizar es cambiar la forma del código sin cambiar lo que hace el juego. Como no hay tests automáticos, la única red de seguridad es ir en pasos pequeños y jugar después de cada uno.

## Cuándo

- Solo cuando Víctor lo pida o cuando sea imprescindible para la tarea en curso. Si ves algo mejorable mientras haces otra cosa, anótalo y propónlo al final; no lo arregles de paso.
- Nunca en la misma tarea ni en el mismo commit que un cambio de comportamiento o una funcionalidad nueva.

## Cómo

1. Antes de empezar, describe en dos o tres líneas qué vas a mover y qué no va a cambiar.
2. Un movimiento por paso: extraer una clase, mover un bloque de datos, renombrar una cosa.
3. Después de cada paso, carga el juego y comprueba: arranca sin errores en consola, la abuela anda, salta y lanza galletas, los tres tipos de enemigo hacen daño, morir resta una vida y conserva puntos y galletas, la luna activa la transformación y el nivel se puede terminar.
4. Un commit por paso, con un mensaje que diga qué se movió.

## Qué no se toca durante una refactorización

- Números de jugabilidad: velocidades, gravedad, daño, tiempos, posiciones del nivel.
- Claves de assets y de animaciones.
- El orden en que se crean los objetos en `create()`, salvo que sea el objetivo del paso: el orden decide qué se dibuja encima cuando dos objetos comparten profundidad.

## Objetivos, por orden de valor

`GameScene.js` concentra casi todo. Este es el orden recomendado, de menor a mayor riesgo:

1. Sacar los datos del nivel (tiendas, objetos, bloques de suelo, plataformas) a un archivo de datos, por ejemplo `js/niveles/barcelona.js`. Así un segundo nivel no exige otra escena de 1500 líneas.
2. Sacar la lista de carga de `preload()` a un manifiesto de assets.
3. Un helper para los botones de texto: el efecto de pasar el ratón está copiado cinco veces entre `MenuScene` y `GameScene`.
4. Pasar el estado de módulo a propiedades de la escena inicializadas en `init()`. Cuidado: hoy los puntos y las galletas se conservan al morir precisamente porque son variables de módulo; ese comportamiento hay que mantenerlo de forma explícita.
5. Extraer el HUD (puntos, salud, vidas, galletas, barra de transformación) a una clase.
6. Extraer la abuela (movimiento, salto, transformación, daño) a una clase.
7. Código muerto: `colisionPatinete` y `colisionPaloma` de `CollisionManager` no se usan, y las plataformas móviles (`movingPlatformL/C/R`) nunca se crean. Pregunta antes de borrarlo.

## Límites

- Sin dependencias nuevas, sin TypeScript y sin patrones nuevos (ECS, inyección de dependencias, máquinas de estado genéricas) salvo petición expresa. Víctor tiene que poder explicar la arquitectura en la defensa del TFG.
- Si un paso obliga a tocar más de tres archivos, es demasiado grande: divídelo.
