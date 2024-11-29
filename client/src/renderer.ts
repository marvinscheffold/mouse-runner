import { Rectangle } from "./geometry/rectangle";
import { Scene } from "./scene";

export class Renderer {
  canvasContext: CanvasRenderingContext2D;
  constructor({ canvasContext }: { canvasContext: CanvasRenderingContext2D }) {
    this.canvasContext = canvasContext;
  }
  clearScreen() {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height
    );
  }
  renderScene(scene: Scene) {
    this.clearScreen();
    scene.obstacles.forEach((obstacle) => {
      this.renderRectangle({
        rectangle: obstacle.shape,
        backgroundColor: obstacle.backgroundColor,
      });
    });
  }

  renderRectangle({
    rectangle,
    backgroundColor,
  }: {
    rectangle: Rectangle;
    backgroundColor: string;
  }) {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(rectangle.A.x, rectangle.A.y);
    this.canvasContext.lineTo(rectangle.B.x, rectangle.B.y);
    this.canvasContext.lineTo(rectangle.C.x, rectangle.C.y);
    this.canvasContext.lineTo(rectangle.D.x, rectangle.D.y);
    this.canvasContext.fillStyle = backgroundColor;
    this.canvasContext.fill();
    this.canvasContext.closePath();
  }
}
