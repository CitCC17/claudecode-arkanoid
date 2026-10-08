# 04 — Sacudida de pantalla al destruir bloques

- **Estado:** Aprobado
- **Dependencias:** 02-animacion-explosion-bloques, 03-sonidos-y-niveles
- **Objetivo:** Sacudir todo el canvas brevemente al destruir un bloque, con una sacudida más fuerte al romper el último bloque del nivel.

---

## Alcance

### Dentro del spec

- Al destruir un bloque, todo el canvas (juego, HUD y overlays) tiembla durante 120 ms con una amplitud máxima de 3 px
- Al destruir el último bloque de un nivel, la sacudida es el doble de fuerte: 6 px durante 240 ms
- La amplitud decae linealmente hasta 0 a lo largo de la duración
- Si llega un golpe nuevo mientras otro sigue activo, la sacudida se reinicia y se queda con la mayor amplitud y duración de las dos (no se suman)
- La explosión del spritesheet (spec 02) y los sonidos (spec 03) se mantienen sin cambios
- Durante la pausa la sacudida se congela y no se aplica, para que el overlay de botones quede quieto
- La sacudida del último bloque del nivel 5 se ve completa sobre el overlay "¡Completaste el juego!"

### Fuera del alcance

- Partículas, fragmentos, destello del bloque o puntos flotantes
- Sacudida al perder una vida o al rebotar en paredes o paddle
- Opción para desactivar la sacudida o respetar `prefers-reduced-motion`
- Cambios en colisiones, puntuación o niveles

---

## Modelo de datos

Constantes nuevas en `game.js`, junto a las demás constantes:

```js
const SHAKE_BLOCK       = { amplitude: 3, duration: 120 }; // px, ms — bloque normal
const SHAKE_LEVEL_CLEAR = { amplitude: 6, duration: 240 }; // px, ms — último bloque del nivel
```

Variable de estado nueva, junto a `explosions`:

```js
let shake = {
  amplitude, // px — amplitud máxima del golpe actual (0 = sin sacudida)
  duration,  // ms — duración total del golpe actual
  elapsed,   // ms transcurridos desde el inicio (igual que en `explosions`)
};
```

- Valor inicial: `{ amplitude: 0, duration: 0, elapsed: 0 }`.
- La sacudida está activa mientras `elapsed < duration`.
- Amplitud efectiva en cada frame: `amplitude × (1 − elapsed / duration)`, es decir, decae linealmente.
- El desplazamiento de cada frame es aleatorio en X e Y, dentro de `±amplitud efectiva`. No se guarda en el estado.
- `loadLevel()` no reinicia `shake`, para que la sacudida del último bloque siga visible al cargar el siguiente nivel.
- No se persiste nada entre sesiones.

---

## Plan de implementación

1. **Constantes y estado**: declarar `SHAKE_BLOCK` y `SHAKE_LEVEL_CLEAR` junto a las demás constantes, y `let shake = { amplitude: 0, duration: 0, elapsed: 0 }` junto a `explosions` en `game.js`. El juego sigue funcionando igual.

2. **Función `startShake(config)`**: recibe `SHAKE_BLOCK` o `SHAKE_LEVEL_CLEAR`.
   - Si hay una sacudida activa (`elapsed < duration`), toma el máximo de amplitud y de duración entre la actual y la nueva.
   - Si no hay ninguna activa, usa los valores de `config`.
   - En los dos casos reinicia `elapsed = 0`.
   - Todavía nadie la llama.

3. **Disparar la sacudida al destruir un bloque**: en `update(dt)`, justo después de `breakSound.cloneNode().play()`:
   - Si todos los bloques quedaron con `alive: false`, llamar `startShake(SHAKE_LEVEL_CLEAR)`.
   - Si no, llamar `startShake(SHAKE_BLOCK)`.
   - Esto va antes de `loadLevel()` y antes del cambio a `'win'`.

4. **Avanzar el tiempo de la sacudida**: al inicio de `update(dt)`, **antes** del `if (gameState !== 'playing') return`, sumar `shake.elapsed += dt * 1000` mientras siga activa. Así decae también en el estado `'win'`. Como `update()` no se llama en pausa, ahí queda congelada.

5. **Aplicar la sacudida en `draw()`**:
   - Después de pintar el fondo negro, hacer `ctx.save()` y, si la sacudida está activa y `isPaused === false`, `ctx.translate(dx, dy)` con `dx` y `dy` aleatorios en `±amplitud efectiva`.
   - Al final de `draw()`, después de los overlays, hacer `ctx.restore()`.
   - El fondo se pinta **sin** desplazar, para que no queden franjas del frame anterior en los bordes.

---

## Criterios de aceptación

- [ ] Al destruir un bloque que no es el último del nivel, el canvas tiembla durante 120 ms con un desplazamiento máximo de 3 px
- [ ] Al destruir el último bloque de un nivel, el canvas tiembla durante 240 ms con un desplazamiento máximo de 6 px
- [ ] El desplazamiento se reduce hasta 0 al terminar la sacudida y el canvas queda en su posición original
- [ ] Romper dos bloques seguidos reinicia la sacudida sin superar los 3 px (o 6 px si uno era el último del nivel)
- [ ] Al pausar durante una sacudida, el overlay de pausa se ve quieto y sus botones responden al clic
- [ ] Al reanudar la pausa, la sacudida continúa desde donde se quedó
- [ ] Al romper el último bloque del nivel 5, la sacudida se ve sobre el overlay "¡Completaste el juego!" y luego se detiene
- [ ] No aparecen franjas ni restos del frame anterior en los bordes del canvas durante la sacudida
- [ ] La explosión del spritesheet y `break-sound.mp3` siguen funcionando igual que antes
- [ ] El score, las vidas y el avance de nivel no cambian respecto al comportamiento previo
- [ ] El juego carga sin errores en la consola

---

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
| --- | --- | --- | --- |
| Efectos de destrucción | Solo sacudida de pantalla | Partículas, fragmentos, destello, puntos flotantes | Mantener el spec chico; cada efecto puede ir en su propio spec |
| Intensidad | Sutil: 3 px / 120 ms | Media (6 px / 200 ms), fuerte (10 px / 300 ms) | Se nota el golpe sin cansar en niveles con muchos bloques |
| Evento especial | Último bloque del nivel al doble (6 px / 240 ms) | Sacudida al perder vida | Premia completar el nivel; perder vida no es un evento de destrucción |
| Golpes seguidos | Reiniciar y quedarse con el máximo | Sumar intensidades con tope | Nunca se descontrola y no necesita un tope arbitrario |
| Qué se sacude | Todo el canvas con `ctx.translate()` | Todo menos HUD y overlays; CSS `transform` en el `<canvas>` | Un solo punto de cambio en `draw()`, sin tocar `index.html` ni el CSS |
| Fondo | Se pinta antes del `translate` | Se pinta desplazado | Evita franjas del frame anterior en los bordes |
| Pausa | Sacudida congelada y no aplicada | Seguir sacudiendo en pausa | El overlay queda quieto y sus botones son fáciles de pulsar |
| Estado `'win'` | La sacudida se actualiza antes del `return` de `update()` | Dejar el `return` primero | Si no, la sacudida final quedaría congelada sobre el overlay |
| Accesibilidad (`prefers-reduced-motion`) | Fuera de este spec | Implementarla ahora | No se pidió; queda anotada para un spec futuro |

---

## Qué NO incluye este spec

- Partículas, fragmentos, destello o puntos flotantes al destruir bloques
- Sacudida al perder una vida o al rebotar
- Opción para desactivar la sacudida o soporte de `prefers-reduced-motion`

Cada uno de estos, si llega, va en su propio spec.
