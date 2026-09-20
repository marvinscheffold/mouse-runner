import {
  POWER_UP_DURATION,
  POWER_UP_KINDS,
  PowerUpKind,
  SLOW_MOTION_TIME_SCALE,
} from "./powerUp";

export class Effects {
  elapsed: number = 0;
  private remainingByKind: Record<PowerUpKind, number> = {
    booster: 0,
    timeMachine: 0,
  };

  update(delta: number) {
    this.elapsed += delta;
    POWER_UP_KINDS.forEach((kind) => {
      this.remainingByKind[kind] = Math.max(
        0,
        this.remainingByKind[kind] - delta
      );
    });
  }

  activate(kind: PowerUpKind) {
    this.remainingByKind[kind] = POWER_UP_DURATION;
  }

  isActive(kind: PowerUpKind) {
    return this.remainingByKind[kind] > 0;
  }

  getRemaining(kind: PowerUpKind) {
    return this.remainingByKind[kind];
  }

  getRemainingRatio(kind: PowerUpKind) {
    return this.remainingByKind[kind] / POWER_UP_DURATION;
  }

  getActiveKinds() {
    return POWER_UP_KINDS.filter((kind) => this.isActive(kind));
  }

  getTimeScale() {
    return this.isActive("timeMachine") ? SLOW_MOTION_TIME_SCALE : 1;
  }
}
