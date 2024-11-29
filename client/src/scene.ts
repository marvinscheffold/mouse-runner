import { Point } from "./geometry/point";
import { Vector } from "./geometry/vector";
import { Obstacle } from "./objects/obstacle";
import { Player } from "./objects/player";
import { v4 as uuidv4 } from "uuid";

export class Scene {
  width: number;
  height: number;
  players: Player[];
  obstacles: Obstacle[];
  level: number;

  constructor({
    players,
    width,
    height,
  }: {
    players: Player[];
    width: number;
    height: number;
  }) {
    this.players = players;
    this.obstacles = [];
    this.width = width;
    this.height = height;
    this.level = 1;
  }

  startLevel(level: number) {
    this.level = level;
    this.addObstacle();
  }

  update(delta: number) {
    this.obstacles.forEach((obstacle) => {
      obstacle.update(delta);
    });

    this.obstacles = this.obstacles.filter(
      (obstacle) => !isObstacleOutOfView(obstacle, this)
    );
  }

  addObstacle() {
    setTimeout(() => {
      this.obstacles.push(
        new Obstacle({
          id: uuidv4(),
          motionSpeed: 0.22,
          motionDirection: new Vector({ x: 1, y: 1 }),
          rotationSpeed: 0.05,
          rotationDirection: "clockwise",
          backgroundColor: "red",
          shapeKind: "rectangle",
          width: 100,
          height: 100,
          startPosition: new Point({ x: 0, y: 0 }),
        })
      );
      this.addObstacle();
    }, 1000);
  }
}

function isObstacleOutOfView(obstacle: Obstacle, scene: Scene) {
  const { x, y } = obstacle.shape.center;
  return (
    x + obstacle.shape.width / 2 < 0 ||
    x - obstacle.shape.width / 2 > scene.width ||
    y + obstacle.shape.height / 2 < 0 ||
    y - obstacle.shape.height / 2 > scene.height
  );
}
