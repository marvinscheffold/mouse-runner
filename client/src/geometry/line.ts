import { Point } from "./point.ts";

export class Line {
  point1: Point;
  point2: Point;

  constructor(point1: Point, point2: Point) {
    this.point1 = point1;
    this.point2 = point2;
  }

  getPoints() {
    return [this.point1.getCoordinates(), this.point2.getCoordinates()];
  }

  isPointOnLine(point: Point) {
    if (!point) return false;
    if (
      this.point1.getDistanceToPoint(point) +
        this.point2.getDistanceToPoint(point) ===
      this.point1.getDistanceToPoint(this.point2)
    ) {
      return true;
    }
    return false;
  }
}
