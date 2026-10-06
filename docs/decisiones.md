# Registro de decisiones

Una entrada por decisión técnica o de diseño relevante: qué se decidió, por qué y qué alternativas se descartaron. Dos o tres líneas bastan. Evita volver a discutir lo ya decidido y explica el porqué a quien llegue después, incluido Claude en una conversación nueva.

## 2026-10-02 · Mantener Phaser y empaquetar en lugar de cambiar de motor

**Decisión:** el juego sigue en Phaser 3. Se empaqueta con Capacitor para iOS y Android y con Electron para Mac y PC.

**Por qué:** las cuatro plataformas salen del mismo código ya escrito. Pasar a Unity o Godot obligaría a rehacer el juego entero.

**Descartado:** Unity (no empaqueta juegos hechos en Phaser) y Tauri para escritorio (más ligero, pero usa el navegador de cada sistema y el juego puede verse distinto entre Mac y Windows).

## 2026-10-02 · Fijar Phaser en la versión 3.55.2

**Decisión:** no actualizar Phaser durante la adaptación multiplataforma.

**Por qué:** el doble salto usa `createEmitter`, eliminado en Phaser 3.60. Actualizar añadiría una migración sin relación con el objetivo.

## 2026-10-02 · El proyecto pasa de TFG a producto comercial

**Decisión:** el TFG está entregado. El juego se sigue desarrollando para publicarlo y obtener ingresos, con más niveles en el futuro.

**Consecuencia:** el código se reorganiza para crecer (niveles como datos), y el orden del plan pone el móvil por delante del escritorio, porque es donde está la monetización.

## 2026-10-02 · Modelo de monetización: gratis con orbes

**Decisión:** en móvil el juego es gratis. Los orbes se ganan jugando y, además, viendo vídeos recompensados o comprándolos.

**Por qué:** permite llegar a más jugadores y deja pagar a quien quiera, sin cerrar el juego a quien no paga.

**Límites:** solo vídeos voluntarios, sin anuncios forzados, sin cajas de botín, y el juego se puede terminar sin pagar. En escritorio no hay anuncios porque Steam no los admite como modelo de negocio.

## 2026-10-02 · La intro siempre lleva al menú

**Decisión:** tanto si la intro termina sola como si se salta, el destino es el menú principal.

**Por qué:** antes, dejarla terminar llevaba directo al nivel sin pasar por el menú ni por la pantalla de controles, y saltarla llevaba al menú. El mismo destino en los dos casos es lo que espera el jugador, y el menú es donde estarán la tienda, los ajustes y el selector de niveles.

## 2026-10-02 · Nueva tabla de puntuación

**Decisión:** paloma destruida +10, patinete destruido +25, recibir daño 0, terminar el nivel +500 y +100 por cada vida conservada.

**Por qué:** antes chocar con una paloma daba los mismos puntos que destruirla, y destruir un patinete, el enemigo más peligroso, no daba nada. Ahora se premia la habilidad y el riesgo, y el daño se castiga solo con salud. Son valores de partida, para ajustar jugando.

## 2026-10-02 · Palomas: spawning continuo y variante rápida

**Decisión:** las palomas no son instancias fijas. Se generan en oleadas o de forma continua para que nunca desaparezcan todas del nivel. Se añade una variante con tono rojo y mayor velocidad (enemigo más difícil, igual que el patinete respecto a la caca).

**Por qué:** si el jugador destruye todas las palomas al principio, el nivel queda sin ese obstáculo el resto de la partida. La variante roja añade variedad sin necesitar un enemigo nuevo completo.

**Comportamiento de la variante roja:** vuela rápido en horizontal y, de vez en cuando, baja en picado hacia la posición Y de la abuela; al llegar cerca vuelve a su altura de vuelo. **Pendiente:** definir frecuencia de spawn, velocidad y trigger del picado. Se implementa en la Fase 4 (o antes si afecta al equilibrio).

## 2026-10-02 · Bug: traspasa suelo según tamaño de pantalla

**Causa:** `setOrigin` se multiplica por `altScale` en `GameScene.js:358`, lo que descuadra el cuerpo físico respecto al sprite. Al transformarse, el sprite de Wukong es más alto (470 px vs 378 px) y el origen no se recalcula, dejando a la abuela ligeramente hundida en el suelo.

**Solución:** Fase 2 (resolución fija, `altScale` siempre 1). Hasta entonces no tocar los valores de origen y tamaño de cuerpo físico sin comprobar en varias resoluciones.

## 2026-10-02 · Se borra el código muerto

**Decisión:** se eliminan las colisiones duplicadas de `CollisionManager`, las plataformas móviles que nunca se crean, las zonas táctiles sin usar y el código comentado.

**Por qué:** no se ejecuta y estorba al leer. Sigue disponible en el historial de git.

## 2026-10-04 · Pesetas: se ingresan al acabar la partida

**Decisión:** las pesetas recogidas en el nivel se cuentan aparte durante la partida y pasan al saldo guardado al terminar (victoria o game over). Salir al menú o reiniciar desde la pausa las pierde. Al perder una vida se conservan y las monedas ya recogidas no reaparecen.

**Por qué:** si se guardaran al recogerlas, bastaría reiniciar una y otra vez para recoger siempre las primeras monedas. Así las pesetas premian jugar la partida hasta el final, se gane o se pierda.

**Detalles:** 18 monedas en posiciones fijas y alcanzables (`recogibles.pesetas` en `barcelona.js`), 1 peseta cada una (`js/economia.js`). La moneda se dibuja por código (`js/ui/peseta.js`) hasta que haya un sprite definitivo.

## 2026-10-04 · Los objetos de La Farmacia se usan solos

**Decisión:** galletas extra, escudo y vida extra se compran en La Farmacia, se guardan en el inventario y se gastan automáticamente (uno de cada tipo) al empezar la siguiente partida. No hay pantalla para elegir cuáles usar.

**Por qué:** es lo más fácil de entender y de mantener. Si más adelante hay muchos objetos, se puede añadir una selección antes de la partida.

**Detalles:** el escudo es un estado aparte de la invulnerabilidad tras un golpe (`escudoActivo` en `Abuela`), protege también de las cacas y no evita morir al caer por un hueco.

## 2026-10-04 · Hazañas: pesetas directas al saldo

**Decisión:** al conseguir una hazaña sus pesetas se guardan en el saldo en ese momento, aunque la partida no termine. Las hazañas de «termina el nivel sin…» cuentan toda la partida, incluidas las vidas anteriores. Turista se consigue al haber tenido en pantalla los seis monumentos en una misma partida.

**Por qué:** una hazaña solo se consigue una vez, así que no se puede repetir reiniciando, y perderla por salir al menú sería un castigo sin sentido. La lista y los valores están en `ECONOMIA.hazanas`.

## 2026-10-04 · Transformaciones en lugar de aspectos

**Decisión:** La Farmacia no venderá aspectos (Pirata, Espacial). Lo que se desbloquea con pesetas son dos transformaciones nuevas: Abuela Cibernética y Abuela Verde (estilo Hulk), además de Wukong.

**Por qué:** una transformación cambia cómo se juega; un aspecto solo cambia el dibujo. Pendiente: sprites, y concretar mecánica y precios antes de programar.

## 2026-10-04 · Precios en tres escalones, medidos en partidas

**Decisión:** los consumibles y continuar cuestan 1–2 partidas (100–250 pesetas, como estaban). Desbloquear la Abuela Verde cuesta 600 y la Cibernética 1000; sus técnicas extra, 300 y 400; activar una transformación, 25 y 30 cada vez. Están en `ECONOMIA.transformaciones`.

**Por qué:** una partida normal da unas 110 pesetas. Con los precios anteriores (120 y 150) las dos transformaciones se compraban tras la primera victoria y no quedaba nada por lo que ahorrar. Ahora lo barato enseña a comprar en la primera o segunda partida, las hazañas (1125 en total, una sola vez) pagan más o menos la primera transformación, y la segunda pide seguir jugando, que es donde encajarán los vídeos y los paquetes de la Fase 10.

**Límites:** ninguna transformación de pago es necesaria para terminar un nivel, y sin ofertas con cuenta atrás ni precios que cambian. Son valores de partida: se revisan jugando y cuando haya más niveles. El precio en dinero real se decide en la Fase 10 con la misma medida (cuántas partidas ahorra cada paquete).

## 2026-10-06 · Abuela Cibernética de prueba con luna roja

**Decisión:** la Cibernética entra en el nivel con sprites provisionales y una luna roja (la de Wukong teñida) en x = 1800. Dura 60 segundos como Wukong y cuenta para la hazaña de transformaciones.

**Por qué:** sirve para ver los sprites en movimiento antes de decidir su mecánica propia. La luna está cerca del inicio para probarla en segundos. Es gratis solo mientras se prueba: la versión definitiva se desbloquea y se activa con pesetas (`ECONOMIA.transformaciones`) y esta luna se quitará.

**Detalles:** los originales (JPEG con fondo blanco) están en `_archivo/cyborg-originales/`; a `public/assets/trans/cyborg/` van como PNG con transparencia y con el mismo tamaño de fotograma que la abuela normal (363×378), así comparten cuerpo físico. Cada forma tiene sus animaciones y offsets en `TRANSFORMACIONES` (`js/abuela.js`).

## 2026-10-06 · Mecánica de la Abuela Cibernética: vuelo y rayos

**Decisión:** en lugar del doble salto, el segundo salto en el aire la deja flotando: arriba y abajo la mueven, y deja de volar al tocar el suelo, al pulsar abajo dos veces seguidas o al acabarse la transformación. En lugar de galletas dispara rayos rojos por el ojo, que no gastan galletas y valen lo mismo que una galleta al acertar.

**Por qué:** así cada transformación cambia cómo se juega (Wukong salta más; la Cibernética vuela y dispara sin límite), que es lo que justifica pagarla. Un rayo cuenta como ataque y rompe la hazaña Pacifista, para que no se consiga gratis.

**Detalles:** las habilidades son marcas en `TRANSFORMACIONES` (`vuela`, `rayos`) en `js/abuela.js`; los valores del rayo están en `RAYO` (`GameScene.js`). En táctil aparece un botón ↓ solo con la Cibernética. El doble toque de abajo cuenta si hay menos de 200 ms entre los dos (`DOBLE_PULSACION`), para que no se dispare al bajar a toquecitos. Mientras vuela suena `sonidoRobot.mp3` en bucle, usa un fotograma con los pies juntos (`abuelaVueloCyborg.png`, sacado del de quieta) y el humo le sale de los pies. El rayo nace en el ojo, por delante de la abuela, con un destello. Provisional: rayo, destello y humo se dibujan por código y el rayo suena como una galleta.

## 2026-10-06 · Wukong lanza bolas de energía

**Decisión:** transformada en Wukong, lanzar ya no tira galletas: estira el brazo y suelta una bola de energía por la mano. No gasta galletas, dura lo que la transformación y al acertar vale lo mismo que una galleta. Como el rayo, cuenta como ataque para la hazaña Pacifista.

**Por qué:** igual que la Cibernética, cada transformación tiene su propio ataque sin munición. La bola es más lenta que el rayo (900 frente a 1600 px/s) y llega algo más lejos; los valores están en `BOLA` (`GameScene.js`).

**Carga:** manteniendo lanzar la bola crece en la mano hasta el doble de tamaño en 1 segundo (`TIEMPO_CARGA`, `ESCALA_CARGA_MAX` en `abuela.js`) y sale al soltar; un toque corto lanza la normal. La bola grande solo acierta más fácil: da los mismos puntos.

**Detalles:** provisional: la postura es el último fotograma de la hoja de salto (el brazo con el bastón hacia delante), se mantiene 250 ms (`POSTURA_DISPARO`), la bola se dibuja por código y suena como una galleta. Falta un sprite propio con el brazo estirado.
