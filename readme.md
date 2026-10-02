# Abuela Friki

Juego de plataformas 2D protagonizado por una abuela geek que recorre Barcelona esquivando palomas, patinetes y cacas, lanza galletas y se transforma en personajes de la cultura geek.

## Tecnologías

- **Phaser 3.55.2** — motor de juego
- **Vite** — build y servidor de desarrollo
- **Capacitor** — empaquetado para iOS y Android (Fase 8-9)
- **Electron** — empaquetado para Mac y PC (Fase 12)

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo (http://localhost:5173)
npm run build        # compilar en dist/
npm run preview      # previsualizar dist/ en local
npm run lint         # comprobar errores de código
node tools/revisar-assets.mjs   # comprobar tamaño y uso de assets
```

## Estructura

```
index.html              Entrada del juego
css/styles.css          Estilos de la página
js/abuelaFriki.js       Configuración de Phaser y lista de escenas
js/scenes/              Una escena por archivo
js/enemigos.js          Palomas, patinetes y cacas
js/collisionManager.js  Gestión de colisiones
js/monumento.js         Monumentos con parallax
public/assets/          Imágenes y sonidos
docs/                   Plan de desarrollo y registro de decisiones
tools/                  Scripts de apoyo
```

## Licencia

BY-NC-ND — Víctor González Pérez, 2024-2025
