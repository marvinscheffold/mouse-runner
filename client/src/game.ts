import { Renderer } from "./renderer";
import { Scene } from "./scene";

export class Game {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  renderer: Renderer;
  scene: Scene;
  lastTime: number;
  delta: number;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context is null");
    }
    this.canvasContext = context;
    this.renderer = new Renderer({ canvasContext: this.canvasContext });
    this.scene = new Scene({
      players: [],
      width: this.canvas.width,
      height: this.canvas.height,
    });
    this.lastTime = 0;
    this.delta = 0;
  }

  start() {
    window.requestAnimationFrame((time) => this.update(time));
    this.scene.startLevel(1);
  }

  update(time: number) {
    if (this.lastTime === 0) this.lastTime = time;
    this.delta = time - this.lastTime;
    this.lastTime = time;

    this.scene.update(this.delta);
    this.renderer.renderScene(this.scene);

    console.log(this.scene.obstacles.length);

    window.requestAnimationFrame((time) => this.update(time));
  }
}
