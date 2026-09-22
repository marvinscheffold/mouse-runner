# Proposal

## Why

Curved obstacles add a middle flavour the run does not need. Hunters should be the first special obstacle a player meets, painted from the same palette as the blocks they replace, with a slightly stronger pull toward the cursor.

## What Changes

- Remove the curved obstacle flavour. Spawns are only straight or hunting.
- Unlock hunters at score 10 000, the score where curved obstacles unlock today. Hunter chance, speed factor, size factor, and ramp length stay as they are, so a late run has fewer special obstacles once curves are gone.
- Color each hunter from the shared palette. Drop the fixed hunter red (`#ff3b5c`). Keep the glow and white edge so a hunter is still readable against a straight block of the same color.
- Raise hunt strength from 0.45–0.6 to 0.55–0.7. The pull stays below the launch heading, so a hunter still cannot turn around.

## Capabilities

### New Capabilities

- `obstacle-motion`: Which obstacle flavours exist, when hunters appear, how they are colored, and how strongly they pull toward the cursor.

### Modified Capabilities

- None. The project has no specs yet.

## Impact

- `client/src/scene.ts`: drop `CURVED_OBSTACLE`, move the hunter unlock, stop rolling curved spawns, and color hunters from the palette.
- `client/src/objects/obstacle.ts`: drop the curved motion path and the fixed hunter color.
- `client/src/renderer.ts`: drop the hollow curved drawing path. Hunters keep their glow and white edge with a palette fill.
- No tests exist for obstacle motion. No dependencies change.
