# Abuela Friki

**Abuela Friki** es un juego de plataformas en 2D protagonizado por una abuela geek que viaja a través de diferentes ciudades, enfrentándose a desafíos únicos y divertidos, llenos de referencias a la cultura geek.

![Mi imagen](assets/abuelaAndar.png "Sprite Abuela andando")


## Descripción del Proyecto

Abuela Friki es una experiencia nostálgica y humorística que combina elementos de juegos clásicos de plataformas con una narrativa ligera y cómica. Los jugadores podrán controlar a una abuela poco convencional que, a lo largo de la aventura, desbloqueará habilidades especiales inspiradas en personajes icónicos de la cultura geek.

## Características del Juego

- **Plataformas en 2D**: Controles intuitivos y mecánicas clásicas de juegos de plataformas.
- **Transformaciones y Habilidades Especiales**: La abuela puede desbloquear habilidades especiales como "Abuela Sun Wukong", con la cual realiza ataques inspirados en el anime.
- **Estética Retro**: Gráficos en 2D con un estilo visual nostálgico, ideal para jugadores que disfrutan de juegos con una estética retro.
- **Referencias a la Cultura Geek**: El juego está lleno de guiños a la cultura geek, desde movimientos especiales hasta personajes y objetos.
- **Multiplataforma**: Disponible para dispositivos móviles (iOS y Android) y PC.

## Tecnologías Utilizadas

- **Phaser**: Motor de juegos en 2D basado en JavaScript para el desarrollo de la mecánica de plataformas.
- **Unity**: Para empaquetar el juego y facilitar su distribución multiplataforma.
- **Electron**: Empaquetado del juego para distribuirlo en PC (Steam).
- **Adobe Photoshop y Illustrator**: Herramientas de diseño para los gráficos y el arte visual del juego.

## Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/abuela-friki.git
   cd abuela-friki
   
## 2. Ejecuta un Servidor Local para Phaser

Phaser necesita ejecutarse desde un servidor local, ya que algunos navegadores bloquean la ejecución de recursos (como imágenes y sonidos) si se abren directamente desde el sistema de archivos local. A continuación, te muestro algunas opciones para levantar un servidor local.

### Opción 1: Usar Visual Studio Code (VS Code)

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Si no tienes la extensión **Live Server** instalada, instálala desde el Marketplace de VS Code.
3. Haz clic derecho en el archivo `index.html` (o el archivo HTML principal de tu juego) y selecciona **"Open with Live Server"**.
4. Esto iniciará el juego en tu navegador en una dirección local (por ejemplo, [http://127.0.0.1:5500](http://127.0.0.1:5500)).

### Opción 2: Usar MAMP o WAMP

Otra opción es utilizar software como **MAMP** (para macOS) o **WAMP** (para Windows) para crear un servidor local. Estos programas permiten configurar un servidor web en tu computadora, lo cual es útil para proyectos que requieren PHP, bases de datos, o simplemente para ejecutar tu juego localmente.

1. Descarga e instala **MAMP** (si estás en macOS)  o **WAMP** (si estás en Windows).
2. Abre MAMP o WAMP y asegúrate de iniciar los servicios de servidor local.
3. Coloca tu proyecto en la carpeta raíz del servidor local. Para MAMP, suele ser `htdocs`, y para WAMP, suele ser `www`.
4. Abre tu navegador y visita `http://localhost/Abuela-Friki` para ver tu juego en funcionamiento.

Estas opciones te permitirán ejecutar tu juego hecho en Phaser en un entorno local, evitando problemas de bloqueo de recursos en los navegadores.

### Licencia 

- **Este proyecto está bajo la licencia (BY-NC-ND).
