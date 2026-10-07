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
  isDead: boolean = false;
  isPointerOverCanvas: boolean = false;
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
    this.renderer = new Renderer({ canvasContext: this.canvasContext });
    this.scene = new Scene({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      canvas: this.canvas,
    });
    this.canvas.addEventListener("mouseenter", () => {
      this.isPointerOverCanvas = true;
      if (!this.isIdle()) return;
      this.renderIdle();
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.isPointerOverCanvas = false;
      if (!this.isIdle()) return;
      this.renderIdle();
    });
    // Registered after the player, so the cursor position is already updated.
    document.addEventListener("mousemove", () => {
      if (!this.isIdle()) return;
      this.renderIdle();
    });
    this.fitCanvas();
    window.addEventListener("resize", () => this.fitCanvas());
  }

  isIdle() {
    return !this.isRunning && !this.isDead;
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
    if (this.isRunning) return;
    if (this.isDead) {
      this.renderDeath();
      return;
    }
    this.renderIdle();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isDead = false;
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
    this.isDead = true;
    this.scene.player.lockMovement();
    this.scene.highScore.persist();
    this.renderDeath();
  }

  renderIdle() {
    this.renderer.clearScreen({
      width: this.scene.width,
      height: this.scene.height,
    });
    this.renderer.renderBackground({
      width: this.scene.width,
      height: this.scene.height,
    });
    if (this.isPointerOverCanvas) {
      this.renderer.renderMouse({
        position: this.scene.player.position,
        backgroundColor: "white",
      });
    }
    this.renderer.renderPrompt({
      text: "Click to play",
      width: this.scene.width,
      height: this.scene.height,
    });
  }

  renderDeath() {
    this.renderer.renderScene(this.scene);
    this.renderer.renderPrompt({
      text: "Click to play again",
      width: this.scene.width,
      height: this.scene.height,
    });
  }
}
