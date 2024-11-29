import { Line } from "./line.js";
import { Point } from "./point.js";
import { getAreaOfTriangle } from "./triangle.js";

export class Rectangle {
  center: Point;
  width: number;
  height: number;
  A: Point;
  B: Point;
  C: Point;
  D: Point;
  a: Line;
  b: Line;
  c: Line;
  d: Line;

  constructor(
    center: Point,
    width: number = 1,
    height: number = 1,
    rotation: number = 0
  ) {
    this.center = center;
    this.width = width;
    this.height = height;
    const rotationPositive = rotation < 0 ? 360 + rotation : rotation;
    this.A = new Point(
      center.x - width / 2,
      center.y - height / 2
    ).getRotatedPoint(this.center, rotationPositive);
    this.B = new Point(
      center.x + width / 2,
      center.y - height / 2
    ).getRotatedPoint(this.center, rotationPositive);
    this.C = new Point(
      center.x + width / 2,
      center.y + height / 2
    ).getRotatedPoint(this.center, rotationPositive);
    this.D = new Point(
      center.x - width / 2,
      center.y + height / 2
    ).getRotatedPoint(this.center, rotationPositive);

    this.a = new Line(this.A, this.B);
    this.b = new Line(this.B, this.C);
    this.c = new Line(this.C, this.D);
    this.d = new Line(this.D, this.A);
  }

  getArea() {
    return this.width * this.height;
  }

  getSides() {
    return [this.a, this.b, this.c, this.d];
  }

  istPointOnRectangle(point: Point) {
    const areaAPD = getAreaOfTriangle(this.A, point, this.D);
    const areaDPC = getAreaOfTriangle(this.D, point, this.C);
    const areaCPB = getAreaOfTriangle(this.C, point, this.B);
    const areaPBA = getAreaOfTriangle(this.B, point, this.A);

    if (areaAPD + areaDPC + areaCPB + areaPBA > this.getArea()) {
      return false;
    }

    return true;
  }
}
