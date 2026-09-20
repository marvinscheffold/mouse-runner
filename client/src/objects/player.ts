import { CANVAS_WIDTH } from "../game";
import { Point } from "../geometry/point";

export class Player {
  id: string;
  name: string;
  position: Point;
  constructor({ name, id }: { name: string; id: string }) {
    this.id = id;
    this.name = name;
    this.position = new Point({ x: 0, y: 0 });
    document.addEventListener("mousemove", (event) => {
      this.position = new Point({
        x: event.clientX - (window.innerWidth - CANVAS_WIDTH) / 2,
        y: event.clientY - (window.innerHeight - CANVAS_WIDTH) / 2,
      });
    });
    document.addEventListener("mousedown", (event) => {
      this.position = new Point({
        x: event.clientX - (window.innerWidth - CANVAS_WIDTH) / 2,
        y: event.clientY - (window.innerHeight - CANVAS_WIDTH) / 2,
      });
    });
  }
}
