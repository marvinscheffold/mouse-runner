import {
  HUNTING_OBSTACLE_COLOR,
  Obstacle,
  ObstacleMotionKind,
} from "./objects/obstacle";
import { v4 as uuidv4 } from "uuid";
import { Player } from "./objects/player";
import { getRandomPointOutsideScene } from "./utils/getRandomPointOutsideScene";
import { getRandomPointInsideScene } from "./utils/getRandomPointInsideScene";
import { getVectorFromPointAToPointB } from "./utils/getVectorBetweenTwoPoints";
import { getRandomNumberBetween } from "./utils/getRandomNumberBetween";
import { getRandomBoolean } from "./utils/getRandomBoolean";
import { Score } from "./objects/score";
import { Point } from "./geometry/point";
import { getRandomColorFromPalett } from "./utils/getRandomColorFromPalette";
import { PowerUp, POWER_UP_RADIUS, PowerUpKind } from "./objects/powerUp";
import { Effects } from "./objects/effects";
import { HighScore } from "./objects/highScore";
import { getDifficultyProgress } from "./utils/getDifficultyProgress";
import { lerp } from "./utils/lerp";

// The difficulty progress runs from 0 at the start of a run to 1 in a long
// run, every value below is interpolated between its easy and its hard end.
const SPAWN_INTERVAL = { easy: 1500, hard: 280 };
const OBSTACLE_SPEED = { easy: 0.1, hard: 0.42 };
const OBSTACLE_MIN_SIZE = { easy: 12, hard: 20 };
const OBSTACLE_MAX_SIZE = { easy: 34, hard: 95 };
const OBSTACLE_ROTATION = { easy: 0.8, hard: 2.2 };
const INITIAL_OBSTACLE_COUNT = 3;
const OFF_SCENE_CLEANUP_MARGIN = 400;

// Obstacle flavours unlock with the score and then slowly take over a larger
// share of the spawns. Straight ones always stay the majority.
const CURVED_OBSTACLE = {
  unlockScore: 10000,
  rampScore: 25000,
  chance: { unlocked: 0.08, max: 0.22 },
  speedFactor: { unlocked: 0.7, max: 0.88 },
  amplitude: { min: 45, max: 105 },
  // Long compared to the two or three seconds an obstacle needs to cross, so
  // most of them draw a single arc through the scene rather than weaving up
  // and down several times.
  period: { min: 2500, max: 9000 },
};
const HUNTING_OBSTACLE = {
  unlockScore: 20000,
  rampScore: 30000,
  chance: { unlocked: 0.1, max: 0.25 },
  speedFactor: { unlocked: 0.55, max: 0.75 },
  // Weaker than the heading it is added to, so a hunter leans towards the
  // cursor hard without ever being able to turn around and follow it.
  strength: { unlocked: 0.45, max: 0.6 },
  // A big block that also chases is not something a player can dodge.
  sizeFactor: 0.7,
};

export class Scene {
  width: number;
  height: number;
  difficultyProgress: number = 0;
  timeoutReference: number | null = null;
  powerUpTimeoutReference: number | null = null;
  obstacles: Obstacle[] = [];
  powerUps: PowerUp[] = [];
  effects: Effects;
  player: Player;
  score: Score;
  highScore: HighScore;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;

    clearTimeout(this.timeoutReference || undefined);
    this.difficultyProgress = 0;
    this.obstacles = [];
    this.powerUps = [];
    this.effects = new Effects();
    this.player = new Player({ name: "Marvin", id: uuidv4() });
    this.score = new Score({
      position: new Point({ x: this.width - 100, y: 45 }),
    });
    // Survives a reset, it is the only state that outlives a single run.
    this.highScore = new HighScore();
  }

  build() {
    this.reset();
    // A run starts on a field that already has something on it, waiting out an
    // empty scene is the most boring part of the early game.
    for (let i = 1; i < INITIAL_OBSTACLE_COUNT; i++) {
      this.spawnObstacle();
    }
    this.startObstacleSpawnTimout();
    this.startPowerUpSpawnTimeout();
  }

  update({ delta, duration }: { delta: number; duration: number }) {
    if (!this.player || !this.score) throw new Error("Player or score is null");

    this.difficultyProgress = getDifficultyProgress(duration);

    this.score.update(Math.floor(duration / 10));
    this.highScore.submit(this.score.score);

    // Active effects always tick in real time, the scene itself can be slowed
    // down by the time machine.
    this.effects.update(delta);
    const sceneDelta = delta * this.effects.getTimeScale();

    this.obstacles.forEach((obstacle) => {
      obstacle.update({
        delta: sceneDelta,
        sceneWidth: this.width,
        sceneHeight: this.height,
        playerPosition: this.player.position,
      });
    });

    this.powerUps.forEach((powerUp) => {
      powerUp.update({
        delta: sceneDelta,
        sceneWidth: this.width,
        sceneHeight: this.height,
      });
    });

    const collectedPowerUps = this.powerUps.filter((powerUp) =>
      powerUp.isPlayerInside(this.player)
    );
    collectedPowerUps.forEach((powerUp) => this.effects.activate(powerUp.kind));

    this.obstacles = this.obstacles.filter(
      (obstacle) =>
        !obstacle.isFarOutsideScene({
          sceneWidth: this.width,
          sceneHeight: this.height,
          margin: OFF_SCENE_CLEANUP_MARGIN,
        }) &&
        !(
          obstacle.isOutsideScene({
            sceneWidth: this.width,
            sceneHeight: this.height,
          }) && obstacle.wasInsideScene
        )
    );

    this.powerUps = this.powerUps.filter(
      (powerUp) =>
        !collectedPowerUps.includes(powerUp) &&
        !(
          powerUp.isOutsideScene({
            sceneWidth: this.width,
            sceneHeight: this.height,
          }) && powerUp.wasInsideScene
        )
    );
  }

  isPlayerHit() {
    if (this.effects.isActive("booster")) return false;
    return this.obstacles.some((obstacle) =>
      obstacle.isPlayerInside(this.player)
    );
  }

  reset() {
    clearTimeout(this.timeoutReference || undefined);
    clearTimeout(this.powerUpTimeoutReference || undefined);
    this.difficultyProgress = 0;
    this.obstacles = [];
    this.powerUps = [];
    this.effects = new Effects();
    this.player = new Player({ name: "Marvin", id: uuidv4() });
    this.score = new Score({
      position: new Point({ x: this.width - 124, y: 56 }),
    });
    this.highScore.startRun();
  }

  private startObstacleSpawnTimout() {
    this.spawnObstacle();
    // A bit of jitter keeps the spawns from feeling like a metronome, and
    // slowing down time slows down the reinforcements as well.
    const interval =
      (this.lerpByDifficulty(SPAWN_INTERVAL) *
        getRandomNumberBetween(85, 115)) /
      100 /
      this.effects.getTimeScale();
    this.timeoutReference = setTimeout(() => {
      this.startObstacleSpawnTimout();
    }, interval);
  }

  private startPowerUpSpawnTimeout() {
    this.powerUpTimeoutReference = setTimeout(() => {
      this.spawnPowerUp();
      this.startPowerUpSpawnTimeout();
    }, getRandomNumberBetween(6000, 11000));
  }

  private lerpByDifficulty({ easy, hard }: { easy: number; hard: number }) {
    return lerp(easy, hard, this.difficultyProgress);
  }

  // Every property of an unlocked obstacle flavour grows from its value at the
  // unlock score towards its maximum, null means the flavour is still locked.
  private getUnlockedValue(
    { unlockScore, rampScore }: { unlockScore: number; rampScore: number },
    range: { unlocked: number; max: number }
  ) {
    if (this.score.score < unlockScore) return null;
    const ramp = Math.min((this.score.score - unlockScore) / rampScore, 1);
    return lerp(range.unlocked, range.max, ramp);
  }

  private getMotionKind(): ObstacleMotionKind {
    const huntingChance =
      this.getUnlockedValue(HUNTING_OBSTACLE, HUNTING_OBSTACLE.chance) ?? 0;
    const curvedChance =
      this.getUnlockedValue(CURVED_OBSTACLE, CURVED_OBSTACLE.chance) ?? 0;

    const roll = Math.random();
    if (roll < huntingChance) return "hunting";
    if (roll < huntingChance + curvedChance) return "curved";
    return "straight";
  }

  // Straight obstacles are the fastest, then the curved ones, then the
  // hunters, and each flavour speeds up over the course of a run.
  private getMotionSpeedFactor(motionKind: ObstacleMotionKind) {
    if (motionKind === "curved") {
      return (
        this.getUnlockedValue(CURVED_OBSTACLE, CURVED_OBSTACLE.speedFactor) ?? 1
      );
    }
    if (motionKind === "hunting") {
      return (
        this.getUnlockedValue(HUNTING_OBSTACLE, HUNTING_OBSTACLE.speedFactor) ??
        1
      );
    }
    return 1;
  }

  private spawnObstacle() {
    const motionKind = this.getMotionKind();
    const sizeFactor =
      motionKind === "hunting" ? HUNTING_OBSTACLE.sizeFactor : 1;
    const minSize = this.lerpByDifficulty(OBSTACLE_MIN_SIZE) * sizeFactor;
    const maxSize = this.lerpByDifficulty(OBSTACLE_MAX_SIZE) * sizeFactor;
    const width = getRandomNumberBetween(minSize, maxSize);
    const height = getRandomNumberBetween(minSize, maxSize);
    const pointOutsideScene = getRandomPointOutsideScene({
      sceneHeight: this.height,
      sceneWidth: this.width,
      objectWidth: width,
      objectHeight: height,
    });
    const pointInScene = getRandomPointInsideScene({
      sceneHeight: this.height,
      sceneWidth: this.width,
    });
    const vectorFromOutsideToInside = getVectorFromPointAToPointB({
      pointA: pointOutsideScene,
      pointB: pointInScene,
    });

    this.obstacles.push(
      new Obstacle({
        id: uuidv4(),
        startPosition: pointOutsideScene,
        motionSpeed:
          (this.lerpByDifficulty(OBSTACLE_SPEED) *
            getRandomNumberBetween(85, 115) *
            this.getMotionSpeedFactor(motionKind)) /
          100,
        motionDirection: vectorFromOutsideToInside,
        motionKind,
        // The sign decides whether the arc bends to the left or to the right.
        curveAmplitude:
          ((getRandomBoolean() ? 1 : -1) *
            getRandomNumberBetween(
              CURVED_OBSTACLE.amplitude.min,
              CURVED_OBSTACLE.amplitude.max
            )) /
          100,
        curvePeriod: getRandomNumberBetween(
          CURVED_OBSTACLE.period.min,
          CURVED_OBSTACLE.period.max
        ),
        huntStrength:
          this.getUnlockedValue(HUNTING_OBSTACLE, HUNTING_OBSTACLE.strength) ??
          0,
        rotationSpeed:
          (getRandomNumberBetween(10, 15) *
            this.lerpByDifficulty(OBSTACLE_ROTATION)) /
          2500,
        rotationDirection: getRandomBoolean()
          ? "clockwise"
          : "counterclockwise",
        backgroundColor:
          motionKind === "hunting"
            ? HUNTING_OBSTACLE_COLOR
            : getRandomColorFromPalett(),
        shapeKind: "rectangle",
        width,
        height,
      })
    );
  }

  private spawnPowerUp() {
    const kind: PowerUpKind = getRandomBoolean() ? "booster" : "timeMachine";
    const pointOutsideScene = getRandomPointOutsideScene({
      sceneHeight: this.height,
      sceneWidth: this.width,
      objectWidth: POWER_UP_RADIUS * 2,
      objectHeight: POWER_UP_RADIUS * 2,
    });
    const pointInScene = getRandomPointInsideScene({
      sceneHeight: this.height,
      sceneWidth: this.width,
    });
    const vectorFromOutsideToInside = getVectorFromPointAToPointB({
      pointA: pointOutsideScene,
      pointB: pointInScene,
    });

    // Power ups drift slower than obstacles and do not speed up with the
    // difficulty, so they stay catchable in a late game.
    this.powerUps.push(
      new PowerUp({
        id: uuidv4(),
        kind,
        startPosition: pointOutsideScene,
        motionSpeed: getRandomNumberBetween(6, 10) / 120,
        motionDirection: vectorFromOutsideToInside,
        radius: POWER_UP_RADIUS,
      })
    );
  }
}
