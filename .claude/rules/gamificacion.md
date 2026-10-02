---
paths:
  - "js/**/*.js"
  - "src/**/*.js"
---

# Gamificación y diseño de recompensas

Reglas para cualquier cambio que afecte a puntos, vidas, objetos, dificultad, progreso o logros.

## Lo que existe hoy

- **Puntos**: +10 por destruir una paloma con una galleta, +10 también al chocar con ella, −20 al chocar con un patinete. Destruir un patinete no da puntos.
- **Salud** de 0 a 100: paloma −10, caca −15, patinete −30, caer por un hueco la deja en 0. El paracetamol da +20.
- **Vidas**: 3. Al morir se conservan puntos y galletas; el game over lo reinicia todo.
- **Galletas**: 10 al empezar, +10 por frasco.
- **Luna Wukong**: transformación de 60 segundos con doble salto.
- **Dificultad** (Fácil, Medio, Difícil): se elige en Ajustes pero no cambia nada todavía.
- Paracetamoles y frascos aparecen en posiciones aleatorias de todo el nivel, incluidos los huecos del suelo.
- No se guarda nada entre sesiones: ni récord, ni progreso, ni ajustes.

## Principios

- **Respuesta inmediata.** Toda acción del jugador con consecuencias tiene sonido, efecto visual y, si cambia un número, ese número se ve cambiar. Un contador que sube en silencio no recompensa.
- **Recompensa proporcional al riesgo.** Lo difícil o arriesgado da más que lo seguro. Recibir daño nunca debe dar puntos.
- **El peligro se anuncia.** Antes de hacer daño, un enemigo avisa, como la caca que brilla antes de saltar. Sin muertes que el jugador no pudo prever.
- **El azar no castiga.** Los objetos útiles aparecen siempre en sitios alcanzables.
- **Metas a tres plazos.** Corto (el siguiente obstáculo), medio (llegar al monumento o terminar el nivel) y largo (récord, logros, ciudades desbloqueadas).
- **El progreso se conserva.** Récord, logros y ajustes se guardan y se muestran al volver.
- **La dificultad es real y honesta.** Si hay selector, cambia valores concretos y se explica qué cambia.
- **El tema manda.** Las recompensas encajan con una abuela friki en Barcelona: mejor un logro por visitar todos los monumentos que un genérico "100 enemigos".

## Límites éticos

- Sin cajas de botín, monedas de pago, temporizadores de espera, rachas diarias que castigan por faltar ni avisos de urgencia artificial.
- Sin publicidad ni compras salvo petición expresa de Víctor.
- Los logros celebran lo que el jugador hace, no presionan para volver.

## Cómo añadir o cambiar una mecánica

1. Propón antes de programar, en pocas líneas: qué es, qué mejora para el jugador y qué cuesta implementarlo. Espera el visto bueno.
2. Todos los valores de equilibrio (puntos, daño, duraciones, cantidades) van juntos en un único archivo de configuración, no repartidos por las escenas.
3. Cada mecánica se puede probar en menos de un minuto. Si hay que jugar medio nivel para verla, añade un atajo de depuración temporal y quítalo al terminar.
4. Explica en `docs/decisiones.md` por qué se eligió: la justificación de diseño forma parte de la memoria del TFG.

## Ideas pendientes

No las implementes sin que se pidan.

- Récord guardado y mostrado en el menú y al terminar el nivel.
- Combo por encadenar impactos de galleta sin recibir daño.
- Logros temáticos: todos los monumentos vistos, nivel sin daño, nivel sin lanzar galletas.
- Valoración de una a tres estrellas al terminar el nivel según puntos, salud y vidas.
- Coleccionables frikis escondidos en plataformas altas.
- Dificultad aplicada de verdad a velocidad y número de enemigos y al daño recibido.
