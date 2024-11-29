import { Rectangle } from "../geometry/rectangle";
import { Vector } from "../geometry/vector";
import { Point } from "../geometry/point";

export class Obstacle {
  id: string;
  motionSpeed: number;
  motionDirection: Vector;
  rotationSpeed: number;
  rotationDirection: "clockwise" | "counterclockwise";
  shapeKind: "rectangle";
  shape: Rectangle;
  backgroundColor: string;

  constructor({
    id,
    motionSpeed,
    motionDirection,
    rotationSpeed,
    rotationDirection,
    backgroundColor,
    shapeKind,
    width,
    height,
    startPosition,
  }: {
    id: string;
    motionSpeed: number;
    motionDirection: Vector;
    rotationSpeed: number;
    rotationDirection: "clockwise" | "counterclockwise";
    backgroundColor: string;
    shapeKind: "rectangle";
    width: number;
    height: number;
    startPosition: Point;
  }) {
    this.id = id;
    this.motionSpeed = motionSpeed;
    this.motionDirection = motionDirection;
    this.rotationSpeed = rotationSpeed;
    this.rotationDirection = rotationDirection;
    this.backgroundColor = backgroundColor;
    this.shapeKind = shapeKind;
    this.shape = new Rectangle({
      center: startPosition,
      width: width,
      height: height,
      rotation: 0,
    });
  }

  update(delta: number) {
    const newShape = new Rectangle({
      center: new Point({
        x:
          this.shape.center.x +
          this.motionDirection.x * this.motionSpeed * delta,
        y:
          this.shape.center.y +
          this.motionDirection.y * this.motionSpeed * delta,
      }),
      width: this.shape.width,
      height: this.shape.height,
      rotation:
        this.rotationDirection === "clockwise"
          ? this.shape.rotation + this.rotationSpeed * delta
          : this.shape.rotation - this.rotationSpeed * delta,
    });
    this.shape = newShape;
  }
}
