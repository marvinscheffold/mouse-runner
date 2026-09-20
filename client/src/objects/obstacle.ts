import { Rectangle } from "../geometry/rectangle";
import { Vector } from "../geometry/vector";
import { Point } from "../geometry/point";
import { Player } from "./player";
import { getRotatedVector } from "../utils/getRotatedVector";
import { getVectorFromPointAToPointB } from "../utils/getVectorBetweenTwoPoints";

export type ObstacleMotionKind = "straight" | "curved" | "hunting";

export const HUNTING_OBSTACLE_COLOR = "#ff3b5c";

export class Obstacle {
  id: string;
  motionSpeed: number;
  motionDirection: Vector;
  motionKind: ObstacleMotionKind;
  curveAmplitude: number;
  curvePeriod: number;
  huntStrength: number;
  elapsed: number;
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
    motionKind = "straight",
    curveAmplitude = 0,
    curvePeriod = 1,
    huntStrength = 0,
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
    motionKind?: ObstacleMotionKind;
    curveAmplitude?: number;
    curvePeriod?: number;
    huntStrength?: number;
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
    this.motionKind = motionKind;
    this.curveAmplitude = curveAmplitude;
    this.curvePeriod = curvePeriod;
    this.huntStrength = huntStrength;
    this.elapsed = 0;
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
    playerPosition,
  }: {
    delta: number;
    sceneWidth: number;
    sceneHeight: number;
    playerPosition: Point;
  }) {
    this.elapsed += delta;
    const direction = this.getCurrentDirection(playerPosition);

    const newShape = new Rectangle({
      center: new Point({
        x: this.shape.center.x + direction.x * this.motionSpeed * delta,
        y: this.shape.center.y + direction.y * this.motionSpeed * delta,
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
      this.wasInsideScene = true;
    }
  }

  // Both flavours bend the heading around the direction the obstacle was
  // launched in, but neither can turn it around: a curve swings symmetrically
  // to both sides and averages out, and a hunt is a pull that is weaker than
  // the heading it is added to. Every obstacle therefore still crosses the
  // scene and leaves it on the far side instead of circling forever.
  private getCurrentDirection(playerPosition: Point) {
    if (this.motionKind === "curved") {
      const deviation =
        this.curveAmplitude *
        Math.sin((this.elapsed / this.curvePeriod) * Math.PI * 2);
      return getRotatedVector(this.motionDirection, deviation);
    }

    if (this.motionKind === "hunting") {
      // Right on top of the cursor there is no direction to be pulled in.
      if (this.shape.center.getDistanceToPoint(playerPosition) < 1) {
        return this.motionDirection;
      }
      const towardsPlayer = getVectorFromPointAToPointB({
        pointA: this.shape.center,
        pointB: playerPosition,
      });
      return new Vector({
        x: this.motionDirection.x + towardsPlayer.x * this.huntStrength,
        y: this.motionDirection.y + towardsPlayer.y * this.huntStrength,
      });
    }

    return this.motionDirection;
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

  // Obstacles are only dropped once they have been inside the scene, which
  // keeps the ones that are still on their way in. This catches the few that
  // are launched past a corner and never arrive at all.
  isFarOutsideScene({
    sceneWidth,
    sceneHeight,
    margin,
  }: {
    sceneWidth: number;
    sceneHeight: number;
    margin: number;
  }) {
    const { x, y } = this.shape.center;
    return (
      x < -margin ||
      x > sceneWidth + margin ||
      y < -margin ||
      y > sceneHeight + margin
    );
  }

  isPlayerInside(player: Player) {
    return this.shape.isPointInside(player.position);
  }
}
