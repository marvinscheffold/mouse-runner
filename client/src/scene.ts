import { Obstacle } from "./objects/obstacle";
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

export class Scene {
  width: number;
  height: number;
  difficulty: number = 1;
  timeoutReference: number | null = null;
  obstacles: Obstacle[] = [];
  player: Player;
  score: Score;

  constructor({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;

    clearTimeout(this.timeoutReference || undefined);
    this.difficulty = 1;
    this.obstacles = [];
    this.player = new Player({ name: "Marvin", id: uuidv4() });
    this.score = new Score({
      position: new Point({ x: this.width - 100, y: 45 }),
    });
  }

  build() {
    this.reset();
    this.startObstacleSpawnTimout();
  }

  update({ delta, duration }: { delta: number; duration: number }) {
    if (!this.player || !this.score) throw new Error("Player or score is null");

    const difficulty = Math.max(Math.floor(duration / 10000), 1);
    this.difficulty = difficulty;

    this.score.update(Math.floor(duration / 10));

    this.obstacles.forEach((obstacle) => {
      obstacle.update({
        delta,
        sceneWidth: this.width,
        sceneHeight: this.height,
      });
    });

    this.obstacles = this.obstacles.filter(
      (obstacle) =>
        !(
          obstacle.isOutsideScene({
            sceneWidth: this.width,
            sceneHeight: this.height,
          }) && obstacle.wasInsideScene
        )
    );
  }

  reset() {
    clearTimeout(this.timeoutReference || undefined);
    this.difficulty = 1;
    this.obstacles = [];
    this.player = new Player({ name: "Marvin", id: uuidv4() });
    this.score = new Score({
      position: new Point({ x: this.width - 124, y: 56 }),
    });
  }

  private startObstacleSpawnTimout() {
    this.spawnObstacle();
    this.timeoutReference = setTimeout(() => {
      this.startObstacleSpawnTimout();
    }, 3000 / this.difficulty);
  }

  private spawnObstacle() {
    const width = getRandomNumberBetween(10, 25 * this.difficulty);
    const height = getRandomNumberBetween(10, 25 * this.difficulty);
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
        motionSpeed: (getRandomNumberBetween(10, 15) * this.difficulty) / 150,
        motionDirection: vectorFromOutsideToInside,
        rotationSpeed:
          (getRandomNumberBetween(10, 15) * this.difficulty) / 2500,
        rotationDirection: getRandomBoolean()
          ? "clockwise"
          : "counterclockwise",
        backgroundColor: getRandomColorFromPalett(),
        shapeKind: "rectangle",
        width,
        height,
      })
    );
  }
}
