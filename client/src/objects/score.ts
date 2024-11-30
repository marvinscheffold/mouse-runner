import { Point } from "../geometry/point";

export class Score {
  position: Point;
  score: number;
  constructor({ position }: { position: Point }) {
    this.score = 0;
    this.position = position;
  }
  toString() {
    return this.score.toString().padStart(5, "0");
  }
  update(score: number) {
    this.score = score;
  }
}
