export class Point {
  x: number;
  y: number;

  constructor({ x, y }: { x: number; y: number }) {
    this.x = x;
    this.y = y;
  }

  getCoordinates() {
    return [this.x, this.y];
  }

  getRotatedPoint(aroundPoint: Point, angle: number) {
    const radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx =
        cos * (this.x - aroundPoint.x) +
        sin * (this.y - aroundPoint.y) +
        aroundPoint.x,
      ny =
        cos * (this.y - aroundPoint.y) -
        sin * (this.x - aroundPoint.x) +
        aroundPoint.y;
    return new Point({ x: nx, y: ny });
  }

  getDistanceToPoint(point: Point) {
    return Math.abs(Math.hypot(point.x - this.x, point.y - this.y));
  }
}
