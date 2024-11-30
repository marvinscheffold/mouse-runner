import { Rectangle } from "../geometry/rectangle";
import { Vector } from "../geometry/vector";
import { Point } from "../geometry/point";
import { Player } from "./player";

export class Obstacle {
  id: string;
  motionSpeed: number;
  motionDirection: Vector;
  rotationSpeed: number;
  rotationDirection: "clockwise" | "counterclockwise";
  shapeKind: "rectangle";
  shape: Rectangle;
  backgroundColor: string;
  wasInsideScene: boolean;

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
    this.wasInsideScene = false;
  }

  update({
    delta,
    sceneWidth,
    sceneHeight,
  }: {
    delta: number;
    sceneWidth: number;
    sceneHeight: number;
  }) {
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
    if (this.isInsideScene({ sceneWidth, sceneHeight })) {
      this.wasInsideScene;
    }
  }

  isInsideScene({
    sceneWidth,
    sceneHeight,
  }: {
    sceneWidth: number;
    sceneHeight: number;
  }) {
    const { x, y } = this.shape.center;
    return (
      x - this.shape.width / 2 >= 0 &&
      x + this.shape.width / 2 <= sceneWidth &&
      y - this.shape.height / 2 >= 0 &&
      y + this.shape.height / 2 <= sceneHeight
    );
  }

  isOutsideScene({
    sceneWidth,
    sceneHeight,
  }: {
    sceneWidth: number;
    sceneHeight: number;
  }) {
    const { x, y } = this.shape.center;
    return (
      x + this.shape.width / 2 < 0 ||
      x - this.shape.width / 2 > sceneWidth ||
      y + this.shape.height / 2 < 0 ||
      y - this.shape.height / 2 > sceneHeight
    );
  }

  isPlayerInside(player: Player) {
    return this.shape.isPointInside(player.position);
  }
}
