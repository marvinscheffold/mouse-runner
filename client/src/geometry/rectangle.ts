import { Line } from "./line.js";
import { Point } from "./point.js";
import { getAreaOfTriangle } from "./triangle.js";

export class Rectangle {
  width: number;
  height: number;
  center: Point;
  rotation: number;
  A: Point;
  B: Point;
  C: Point;
  D: Point;
  a: Line;
  b: Line;
  c: Line;
  d: Line;

  constructor({
    center,
    width,
    height,
    rotation,
  }: {
    center: Point;
    width: number;
    height: number;
    rotation: number;
  }) {
    this.width = width;
    this.height = height;
    this.center = center;
    this.rotation = rotation < 0 ? 360 + rotation : rotation;

    this.A = new Point({
      x: center.x - width / 2,
      y: center.y - height / 2,
    }).getRotatedPoint(this.center, this.rotation);
    this.B = new Point({
      x: center.x + width / 2,
      y: center.y - height / 2,
    }).getRotatedPoint(this.center, this.rotation);
    this.C = new Point({
      x: center.x + width / 2,
      y: center.y + height / 2,
    }).getRotatedPoint(this.center, this.rotation);
    this.D = new Point({
      x: center.x - width / 2,
      y: center.y + height / 2,
    }).getRotatedPoint(this.center, this.rotation);

    this.a = new Line(this.A, this.B);
    this.b = new Line(this.B, this.C);
    this.c = new Line(this.C, this.D);
    this.d = new Line(this.D, this.A);
  }

  getArea() {
    return this.width * this.height;
  }

  isPointInside(point: Point) {
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
