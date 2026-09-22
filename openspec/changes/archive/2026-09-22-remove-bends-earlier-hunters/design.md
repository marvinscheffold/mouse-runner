# Design

## Context

See proposal.md for why curved obstacles go away. Today `scene.ts` rolls three motion kinds. Curved obstacles unlock at score 10000 (`CURVED_OBSTACLE`) and hunters at 20000 (`HUNTING_OBSTACLE`). Hunters are painted `#ff3b5c` and drawn with a glow and a white edge. Straight and curved obstacles take a random color from `getRandomColorFromPalett`. Hunt strength is added to a unit launch heading inside `Obstacle.getCurrentDirection`. `Vector` normalizes on construction, so a strength below 1 cannot reverse that heading.

## Goals / Non-Goals

**Goals:**

- Delete the curved flavour, including the fields and helpers that exist only for it.
- Move the hunter unlock to score 10000 and raise hunt strength to 0.55–0.70.
- Color hunters from the shared palette while keeping the hunter glow and light edge.

**Non-Goals:**

- Raising the hunter spawn chance to cover the curved spawns that disappear.
- Retuning hunter size (`sizeFactor` 0.7) or speed factor (0.55–0.75).
- Changing straight-obstacle motion, power-ups, or the difficulty ramp.

## Decisions

### Delete the curved path instead of leaving it unused

Remove `CURVED_OBSTACLE`, the `"curved"` member of `ObstacleMotionKind`, the sine branch in `getCurrentDirection`, `curveAmplitude`, `curvePeriod`, and `Obstacle.elapsed`. `getRotatedVector` is only used by that branch, so remove it too. The hollow outline in `renderObstacle` goes with the flavour. `withAlpha` stays; other effects use it.

Alternative: keep the curved code and never roll it. That leaves a third flavour in the type and the renderer for no behavior.

### Shift the unlock score and leave the ramp length alone

Set `HUNTING_OBSTACLE.unlockScore` to 10000. Leave `rampScore` at 30000, so chance, speed factor, and strength still take 30000 score to reach their max. Full values therefore arrive at score 40000 instead of 50000, because the ramp starts earlier. `getUnlockedValue` already implements that ramp.

Alternative: shorten `rampScore` so hunters still finish ramping at 50000. That would make the first hunters grow more slowly than they do today, which this change does not ask for.

### Keep the hunter spawn share

Leave `chance` at `{ unlocked: 0.10, max: 0.25 }`. After curves are gone, a late run's special share drops from about 47% (curves plus hunters) to 25% (hunters only). That is the accepted result of not backfilling the curved spawns.

### One palette for every obstacle

Spawn hunters with `getRandomColorFromPalett()`, the same call straight obstacles already use. Delete `HUNTING_OBSTACLE_COLOR`. In `renderObstacle`, keep the hunting branch: shadow blur, palette fill, and the white edge. The edge is what separates a hunter from a straight block that rolled the same color, including the reds already in the palette.

Alternative: draw hunters as solid palette blocks. They would be invisible as hunters until they leaned toward the cursor.

### Raise strength inside the existing pull

Set `HUNTING_OBSTACLE.strength` to `{ unlocked: 0.55, max: 0.70 }`. The direction stays `launch heading + strength * direction toward the cursor`, then `Vector` normalizes the sum. Because both inputs are unit vectors, a strength of 0.70 still cannot point the result backward. Do not multiply strength into `motionSpeed`.

The sideways lean at a perpendicular cursor goes from about 31° (`atan(0.60)`) to about 35° (`atan(0.70)`).

## Risks / Trade-offs

- [Late runs are quieter] → Accepted. Hunter chance is intentionally unchanged.
- [Hunters arrive earlier and pull harder, so the mid-run is sharper] → They stay at 0.7 size and at the slower hunter speed factor, and they still cannot reverse.
- [A palette red can look like the old hunter crimson] → The glow and white edge remain the hunter signal.
- [A strength of 1 or more would let a hunter orbit the cursor] → The new max is 0.70, and the direction math is unchanged.

## Migration Plan

No persisted obstacle state. A running game picks up the new spawns on the next load. Rollback is reverting the three client files.
