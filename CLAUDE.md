# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Juego de Arkanoid en HTML, CSS y JavaScript puro — sin dependencias, cero frameworks. Se abre directamente en el navegador (`open index.html`).

## Desarrollo

No hay paso de build ni servidor requerido. Para probar cambios, abrir `index.html` en el navegador.

## Arquitectura

El juego se desarrolla desde cero con los siguientes activos ya disponibles:

- **`assets/spritesheet-breakout.png`** — spritesheet único con todos los sprites
- **`assets/spritesheet.js`** — define `SPRITES`, `EXPLOSION_FRAMES`, `EXPLOSION_DURATION` y las funciones `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)`, `drawFrame(ctx, frame, x, y, w, h)`
- **`assets/sounds/ball-bounce.mp3`** y **`assets/sounds/break-sound.mp3`** — efectos de sonido

### Sprites disponibles

| Nombre en `drawSprite` | Descripción |
|---|---|
| `paddle` | Paleta (162×14 px en spritesheet) |
| `ball` | Pelota (16×16 px) |
| `block_gray`, `block_red`, `block_yellow`, `block_cyan`, `block_magenta`, `block_hotpink`, `block_green` | Bloques por color |

Las explosiones se animan con `EXPLOSION_FRAMES[color]` (4 frames) y duran `EXPLOSION_DURATION` ms.

## Flujo de trabajo spec-driven

Este proyecto usa desarrollo guiado por specs:

1. **`/spec [descripción]`** — diseña una spec nueva haciendo preguntas antes de escribir código. Guarda el resultado en `specs/NN-slug.md` con estado `Draft`.
2. Cambiar el estado del spec a `Approved` manualmente antes de implementar.
3. **`/spec-impl NN-slug`** — implementa el spec aprobado paso a paso, creando rama `spec-NN-slug` y pausando tras cada paso para revisar el diff.

Las specs viven en `specs/` y siguen la estructura de `.agents/skills/spec/template.md`.
