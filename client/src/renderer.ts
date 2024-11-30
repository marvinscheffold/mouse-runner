import { Point } from "./geometry/point";
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
    this.renderBackground();

    scene.obstacles.forEach((obstacle) => {
      this.renderRectangle({
        rectangle: obstacle.shape,
        backgroundColor: obstacle.backgroundColor,
      });
    });
    this.renderText({
      text: scene.score.toString(),
      position: scene.score.position,
      color: "white",
      font: "32px Arial",
    });
  }

  renderBackground() {
    this.canvasContext.fillStyle = "#11171D";
    this.canvasContext.fillRect(
      0,
      0,
      this.canvasContext.canvas.width,
      this.canvasContext.canvas.height
    );
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

  renderText({
    text,
    position,
    color,
    font,
  }: {
    text: string;
    position: Point;
    color: string;
    font: string;
  }) {
    this.canvasContext.font = font;
    this.canvasContext.fillStyle = color;
    this.canvasContext.fillText(text, position.x, position.y);
  }
}
