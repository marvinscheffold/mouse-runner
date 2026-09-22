import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../game";
import { Point } from "../geometry/point";

export class Player {
  id: string;
  name: string;
  position: Point;
  constructor({
    name,
    id,
    canvas,
  }: {
    name: string;
    id: string;
    canvas: HTMLCanvasElement;
  }) {
    this.id = id;
    this.name = name;
    this.position = new Point({ x: 0, y: 0 });
    document.addEventListener("mousemove", (event) => {
      this.position = getScenePosition({ event, canvas });
    });
    document.addEventListener("mousedown", (event) => {
      this.position = getScenePosition({ event, canvas });
    });
  }
}

function getScenePosition({
  event,
  canvas,
}: {
  event: MouseEvent;
  canvas: HTMLCanvasElement;
}) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return new Point({ x: 0, y: 0 });
  }
  return new Point({
    x: (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
    y: (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
  });
}
