import { Point } from "../geometry/point";

export class Oponent {
  id: string;
  position: Point;
  name: string;
  constructor({
    position,
    name,
    id,
  }: {
    position: Point;
    name: string;
    id: string;
  }) {
    this.id = id;
    this.position = position;
    this.name = name;
  }
  updatePosition(newPosition: Point) {
    this.position = newPosition;
  }
}
