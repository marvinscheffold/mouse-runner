import { Point } from "../geometry/point";
import { Vector } from "../geometry/vector";
import { Player } from "./player";

export type PowerUpKind = "booster" | "timeMachine";

export const POWER_UP_KINDS: PowerUpKind[] = ["booster", "timeMachine"];
export const POWER_UP_DURATION = 5000;
export const POWER_UP_RADIUS = 26;
export const SLOW_MOTION_TIME_SCALE = 0.35;

export const POWER_UP_APPEARANCE: Record<
  PowerUpKind,
  { color: string; label: string }
> = {
  booster: { color: "#f9c74f", label: "INVINCIBLE" },
  timeMachine: { color: "#4cc9f0", label: "SLOW MOTION" },
};

export class PowerUp {
  id: string;
  kind: PowerUpKind;
  position: Point;
  radius: number;
  motionSpeed: number;
  motionDirection: Vector;
  phaseOffset: number;
  wasInsideScene: boolean;

  constructor({
    id,
    kind,
    startPosition,
    motionSpeed,
    motionDirection,
    radius,
  }: {
    id: string;
    kind: PowerUpKind;
    startPosition: Point;
    motionSpeed: number;
    motionDirection: Vector;
    radius: number;
  }) {
    this.id = id;
    this.kind = kind;
    this.position = startPosition;
    this.motionSpeed = motionSpeed;
    this.motionDirection = motionDirection;
    this.radius = radius;
    this.phaseOffset = Math.random() * Math.PI * 2;
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
    this.position = new Point({
      x: this.position.x + this.motionDirection.x * this.motionSpeed * delta,
      y: this.position.y + this.motionDirection.y * this.motionSpeed * delta,
    });
    if (this.isInsideScene({ sceneWidth, sceneHeight })) {
      this.wasInsideScene = true;
    }
  }

  isInsideScene({
    sceneWidth,
    sceneHeight,
  }: {
    sceneWidth: number;
    sceneHeight: number;
  }) {
    const { x, y } = this.position;
    return (
      x - this.radius >= 0 &&
      x + this.radius <= sceneWidth &&
      y - this.radius >= 0 &&
      y + this.radius <= sceneHeight
    );
  }

  isOutsideScene({
    sceneWidth,
    sceneHeight,
  }: {
    sceneWidth: number;
    sceneHeight: number;
  }) {
    const { x, y } = this.position;
    return (
      x + this.radius < 0 ||
      x - this.radius > sceneWidth ||
      y + this.radius < 0 ||
      y - this.radius > sceneHeight
    );
  }

  isPlayerInside(player: Player) {
    return this.position.getDistanceToPoint(player.position) <= this.radius;
  }
}
