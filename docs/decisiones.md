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

## 2026-10-02 · Se borra el código muerto

**Decisión:** se eliminan las colisiones duplicadas de `CollisionManager`, las plataformas móviles que nunca se crean, las zonas táctiles sin usar y el código comentado.

**Por qué:** no se ejecuta y estorba al leer. Sigue disponible en el historial de git.
