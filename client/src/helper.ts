import { Obstacle } from "./objects/obstacle";

export function isObstacleOutOfView(
  obstacle: Obstacle,
  canvas: HTMLCanvasElement
) {
  const { x, y } = obstacle.shape.center;
  return (
    x + obstacle.shape.width / 2 < 0 ||
    x - obstacle.shape.width / 2 > canvas.width ||
    y + obstacle.shape.height / 2 < 0 ||
    y - obstacle.shape.height / 2 > canvas.height
  );
}
