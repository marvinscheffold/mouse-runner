# Tasks

## 1. Remove curved motion

- [x] 1.1 In `client/src/objects/obstacle.ts`, drop `"curved"` from `ObstacleMotionKind`, delete `curveAmplitude`, `curvePeriod`, `elapsed`, the sine branch, the `getRotatedVector` import, and `HUNTING_OBSTACLE_COLOR`. Keep hunting as the launch heading plus `huntStrength` times the direction toward the player. Verify `getCurrentDirection` has no curved branch and the file no longer mentions `curved` or `HUNTING_OBSTACLE_COLOR`.
- [x] 1.2 Delete `client/src/utils/getRotatedVector.ts`. Verify no file under `client/src` imports `getRotatedVector`.

## 2. Spawn hunters earlier

- [x] 2.1 In `client/src/scene.ts`, delete `CURVED_OBSTACLE` and the curved roll and speed-factor branch. Set `HUNTING_OBSTACLE.unlockScore` to 10000, leave `rampScore` at 30000, `chance` at 0.10–0.25, `speedFactor` at 0.55–0.75, and `sizeFactor` at 0.7, and set `strength` to `{ unlocked: 0.55, max: 0.70 }`. Verify those values by reading `HUNTING_OBSTACLE` and verify `getMotionKind` returns only `"straight"` or `"hunting"`.
- [x] 2.2 Color every spawned obstacle with `getRandomColorFromPalett` and stop importing `HUNTING_OBSTACLE_COLOR`. Verify `scene.ts` has no `HUNTING_OBSTACLE_COLOR` reference.

## 3. Draw hunters in palette colors

- [x] 3.1 In `client/src/renderer.ts`, remove the curved hollow-outline branch. Keep the hunting glow and white edge, filled with `obstacle.backgroundColor`. Verify `renderObstacle` has no `motionKind === "curved"` branch and the hunting branch still sets `shadowBlur` and a light stroke.

## 4. Confirm the cut

- [x] 4.1 Search `client/src` for `curved`, `curveAmplitude`, `curvePeriod`, `HUNTING_OBSTACLE_COLOR`, and `getRotatedVector` and verify none remain. Run `npm run build --prefix client` and verify the TypeScript check and Vite build succeed.
