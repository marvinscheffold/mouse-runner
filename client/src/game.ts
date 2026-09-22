import { Renderer } from "./renderer";
import { Scene } from "./scene";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;

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
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(this.canvas);
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context is null");
    }
    this.canvasContext = context;
    this.fitCanvas();
    window.addEventListener("resize", () => this.fitCanvas());
    this.renderer = new Renderer({ canvasContext: this.canvasContext });
    this.scene = new Scene({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      canvas: this.canvas,
    });
  }

  fitCanvas() {
    const displaySize = Math.min(window.innerWidth, window.innerHeight);
    const pixelRatio = window.devicePixelRatio || 1;
    this.canvas.style.width = `${displaySize}px`;
    this.canvas.style.height = `${displaySize}px`;
    this.canvas.width = Math.round(displaySize * pixelRatio);
    this.canvas.height = Math.round(displaySize * pixelRatio);
    const scale = this.canvas.width / CANVAS_WIDTH;
    this.canvasContext.setTransform(scale, 0, 0, scale, 0, 0);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    // Without this a retry starts with a delta covering the whole game over
    // screen, which teleports the first obstacles across the scene.
    this.lastTime = 0;
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

    if (this.scene.isPlayerHit()) {
      this.end();
      return;
    }

    window.requestAnimationFrame((time) => this.update(time));
  }

  end() {
    this.isRunning = false;
    this.scene.highScore.persist();
  }
}
