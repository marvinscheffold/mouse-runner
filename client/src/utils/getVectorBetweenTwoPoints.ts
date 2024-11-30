import { Point } from "../geometry/point";
import { Vector } from "../geometry/vector";

export function getVectorFromPointAToPointB({
  pointA,
  pointB,
}: {
  pointA: Point;
  pointB: Point;
}) {
  const x = pointB.x - pointA.x;
  const y = pointB.y - pointA.y;
  return new Vector({ x, y });
}
