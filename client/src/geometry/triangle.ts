import { Point } from "./point";

export function getAreaOfTriangle(A: Point, B: Point, C: Point): number {
  return (
    Math.abs(
      B.x * A.y - A.x * B.y + (C.x * B.y - B.x * C.y) + (A.x * C.y - C.x * A.y)
    ) / 2
  );
}
