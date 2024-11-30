import { Renderer } from "./renderer";
import { Scene } from "./scene";

export class Game {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  renderer: Renderer;
  scene: Scene;
  lastTime: number = 0;
  isRunning: boolean = false;
  startTimestamp: number = 0;

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
      width: this.canvas.width,
      height: this.canvas.height,
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTimestamp = new Date().getTime();
    this.scene.build();
    window.requestAnimationFrame((time) => this.update(time));
  }

  update(time: number) {
    if (this.lastTime === 0) this.lastTime = time;
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.scene.update({
      delta,
      duration: new Date().getTime() - this.startTimestamp,
    });
    this.renderer.renderScene(this.scene);

    if (
      this.scene.obstacles.some((obstacle) =>
        obstacle.isPlayerInside(this.scene.player)
      )
    ) {
      this.end();
      return;
    }

    window.requestAnimationFrame((time) => this.update(time));
  }

  end() {
    console.log("end");
    this.isRunning = false;
  }
}
