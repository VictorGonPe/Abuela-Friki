# Seguridad

Estas reglas valen para todo el proyecto. El juego no necesita red, cuentas ni datos personales, así que la postura por defecto es: nada sale del dispositivo y nada remoto entra en la app.

## Secretos y firmas

- Nunca escribas en el repositorio claves de firma ni credenciales: `.keystore`, `.jks`, `.p12`, `.p8`, `.mobileprovision`, `.env`, contraseñas de tiendas o de Apple/Google.
- Esos archivos viven fuera del repositorio y están en `.gitignore`. Si hace falta uno, pídele a Víctor la ruta; no lo copies dentro del proyecto.
- No muestres secretos en la terminal, en logs ni en mensajes de commit.
- Si ves un secreto ya subido al repositorio, avisa de inmediato: hay que rotarlo, no basta con borrarlo.

## Código del juego

- Nada de `eval`, `new Function` ni `innerHTML` con contenido dinámico.
- Lo que se lee del almacenamiento local (partida guardada, ajustes) es dato no fiable: envuelve `JSON.parse` en `try/catch`, valida tipos y rangos, y usa valores por defecto si algo no cuadra.
- Sin recursos remotos en tiempo de ejecución: ni CDN, ni Google Fonts, ni imágenes por URL. Todo va empaquetado.
- Sin analítica, publicidad, compras ni llamadas de red salvo que Víctor lo pida expresamente. Si se añade algo así, hace falta consentimiento del jugador y política de privacidad antes de publicar.

## Electron

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. Nunca `webSecurity: false`.
- Carga solo archivos locales con `loadFile`. Bloquea la navegación a otras URL y deniega `window.open`.
- Si el juego necesita algo del sistema (guardar partida, pantalla completa), exponlo desde un `preload` con `contextBridge`, función por función. No expongas `ipcRenderer` ni módulos de Node enteros.
- Añade una Content-Security-Policy sin orígenes remotos y comprueba después que el juego sigue cargando imágenes y audio.

## Capacitor

- En producción, sin `server.url` remota, sin `cleartext` y sin comodines en `allowNavigation`.
- Permisos mínimos en `AndroidManifest.xml` e `Info.plist`: el juego no necesita cámara, ubicación, contactos ni micrófono.
- La depuración del WebView queda desactivada en las compilaciones de publicación.

## Dependencias

- Las mínimas posibles. Pregunta antes de añadir una y explica para qué sirve.
- Versiones fijadas y `package-lock.json` en el repositorio.
- Ejecuta `npm audit` antes de cada versión que se vaya a publicar y resume lo que encuentre.

## Operaciones delicadas

- No ejecutes `git push --force`, `git reset --hard`, `git clean` ni borrados masivos sin permiso explícito.
- No borres assets: muévelos a una carpeta de archivo fuera del build y deja que Víctor decida.
