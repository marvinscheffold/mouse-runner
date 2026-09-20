import { Vector } from "../geometry/vector";

export function getRotatedVector(vector: Vector, radians: number): Vector {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return new Vector({
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  });
}
