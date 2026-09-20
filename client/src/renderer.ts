import { Point } from "./geometry/point";
import { Rectangle } from "./geometry/rectangle";
import { Effects } from "./objects/effects";
import { Obstacle } from "./objects/obstacle";
import { POWER_UP_APPEARANCE, PowerUp } from "./objects/powerUp";
import { Scene } from "./scene";
import { withAlpha } from "./utils/withAlpha";

const SCORE_FONT = "32px Arial";

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

    const phase = scene.effects.elapsed;
    const isBoosted = scene.effects.isActive("booster");
    const isTimeSlowed = scene.effects.isActive("timeMachine");

    if (isTimeSlowed) {
      this.renderSlowMotionField(phase);
    }

    scene.obstacles.forEach((obstacle) => {
      this.renderObstacle({ obstacle, phase });
    });

    scene.powerUps.forEach((powerUp) => {
      this.renderPowerUp({ powerUp, phase });
    });

    if (isTimeSlowed) {
      this.renderSlowMotionVignette(phase);
    }

    if (isBoosted) {
      this.renderPlayerAura({ position: scene.player.position, phase });
    }

    this.renderMouse({
      position: scene.player.position,
      backgroundColor: isBoosted ? POWER_UP_APPEARANCE.booster.color : "white",
      glowColor: isBoosted ? POWER_UP_APPEARANCE.booster.color : undefined,
    });

    this.renderText({
      text: scene.score.toString(),
      position: scene.score.position,
      color: "white",
      font: SCORE_FONT,
    });

    this.renderHighScore(scene);

    this.renderEffectsHud({ effects: scene.effects });
  }

  renderHighScore(scene: Scene) {
    const isNewRecord = scene.highScore.isNewRecord;
    // Right aligned with the trailing digit of the score above it.
    this.canvasContext.save();
    this.canvasContext.font = SCORE_FONT;
    const scoreWidth = this.canvasContext.measureText(
      scene.score.toString()
    ).width;
    this.canvasContext.restore();

    this.renderText({
      text: `${isNewRecord ? "NEW BEST" : "BEST"} ${scene.highScore.toString()}`,
      position: new Point({
        x: scene.score.position.x + scoreWidth,
        y: scene.score.position.y + 22,
      }),
      color: isNewRecord
        ? POWER_UP_APPEARANCE.booster.color
        : "rgba(255, 255, 255, 0.45)",
      font: "bold 13px Arial",
      align: "right",
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

  // The three motion kinds have to be tellable apart at a glance: a straight
  // obstacle is a solid block, a weaving one is hollow, and a hunter glows.
  renderObstacle({ obstacle, phase }: { obstacle: Obstacle; phase: number }) {
    this.canvasContext.save();
    this.traceRectanglePath(obstacle.shape);

    if (obstacle.motionKind === "curved") {
      this.canvasContext.fillStyle = withAlpha(obstacle.backgroundColor, 0.25);
      this.canvasContext.fill();
      this.canvasContext.lineWidth = 2.5;
      this.canvasContext.strokeStyle = obstacle.backgroundColor;
      this.canvasContext.stroke();
    } else if (obstacle.motionKind === "hunting") {
      this.canvasContext.shadowColor = obstacle.backgroundColor;
      this.canvasContext.shadowBlur = 18 + 8 * Math.sin(phase / 160);
      this.canvasContext.fillStyle = obstacle.backgroundColor;
      this.canvasContext.fill();
      // The palette holds reds of its own, the bright edge is what separates a
      // hunter from an ordinary block that happens to be red.
      this.canvasContext.lineWidth = 2;
      this.canvasContext.strokeStyle = "rgba(255, 255, 255, 0.85)";
      this.canvasContext.stroke();
    } else {
      this.canvasContext.fillStyle = obstacle.backgroundColor;
      this.canvasContext.fill();
    }

    this.canvasContext.restore();
  }

  private traceRectanglePath(rectangle: Rectangle) {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(rectangle.A.x, rectangle.A.y);
    this.canvasContext.lineTo(rectangle.B.x, rectangle.B.y);
    this.canvasContext.lineTo(rectangle.C.x, rectangle.C.y);
    this.canvasContext.lineTo(rectangle.D.x, rectangle.D.y);
    this.canvasContext.closePath();
  }

  renderText({
    text,
    position,
    color,
    font,
    align,
  }: {
    text: string;
    position: Point;
    color: string;
    font: string;
    align?: CanvasTextAlign;
  }) {
    this.canvasContext.save();
    this.canvasContext.font = font;
    this.canvasContext.fillStyle = color;
    this.canvasContext.textAlign = align ?? "left";
    this.canvasContext.fillText(text, position.x, position.y);
    this.canvasContext.restore();
  }

  renderMouse({
    position,
    backgroundColor,
    glowColor,
  }: {
    position: Point;
    backgroundColor: string;
    glowColor?: string;
  }) {
    this.canvasContext.save();
    if (glowColor) {
      this.canvasContext.shadowColor = glowColor;
      this.canvasContext.shadowBlur = 18;
    }
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(position.x, position.y);
    this.canvasContext.lineTo(position.x + 28, position.y + 15);
    this.canvasContext.lineTo(position.x + 15, position.y + 17);
    this.canvasContext.lineTo(position.x + 10, position.y + 30);
    this.canvasContext.fillStyle = backgroundColor;
    this.canvasContext.fill();
    this.canvasContext.closePath();
    this.canvasContext.restore();
  }

  renderPowerUp({ powerUp, phase }: { powerUp: PowerUp; phase: number }) {
    const { color } = POWER_UP_APPEARANCE[powerUp.kind];
    const { x, y } = powerUp.position;
    const radius =
      powerUp.radius * (1 + 0.1 * Math.sin(phase / 260 + powerUp.phaseOffset));

    this.canvasContext.save();

    const glow = this.canvasContext.createRadialGradient(
      x,
      y,
      radius * 0.4,
      x,
      y,
      radius * 2.8
    );
    glow.addColorStop(0, withAlpha(color, 0.35));
    glow.addColorStop(1, withAlpha(color, 0));
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, radius * 2.8, 0, Math.PI * 2);
    this.canvasContext.fillStyle = glow;
    this.canvasContext.fill();

    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, radius + 7, 0, Math.PI * 2);
    this.canvasContext.setLineDash([4, 8]);
    this.canvasContext.lineDashOffset = -phase / 40;
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = withAlpha(color, 0.7);
    this.canvasContext.stroke();
    this.canvasContext.setLineDash([]);

    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, radius, 0, Math.PI * 2);
    this.canvasContext.fillStyle = "#11171D";
    this.canvasContext.fill();
    this.canvasContext.lineWidth = 3;
    this.canvasContext.strokeStyle = color;
    this.canvasContext.stroke();

    if (powerUp.kind === "booster") {
      this.renderBoltIcon({ x, y, size: radius * 0.85, color });
    } else {
      this.renderClockIcon({ x, y, size: radius * 0.85, color, phase });
    }

    this.canvasContext.restore();
  }

  renderPlayerAura({ position, phase }: { position: Point; phase: number }) {
    const { color } = POWER_UP_APPEARANCE.booster;
    // The cursor is drawn from its tip towards the bottom right, so the aura is
    // centered on the body of the arrow instead of on the tip.
    const x = position.x + 10;
    const y = position.y + 12;
    const pulse = Math.sin(phase / 220);

    this.canvasContext.save();

    const glow = this.canvasContext.createRadialGradient(x, y, 4, x, y, 54);
    glow.addColorStop(0, withAlpha(color, 0.45));
    glow.addColorStop(0.55, withAlpha(color, 0.16));
    glow.addColorStop(1, withAlpha(color, 0));
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, 54, 0, Math.PI * 2);
    this.canvasContext.fillStyle = glow;
    this.canvasContext.fill();

    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, 30 + 4 * pulse, 0, Math.PI * 2);
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = withAlpha(color, 0.8);
    this.canvasContext.stroke();

    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, 42, 0, Math.PI * 2);
    this.canvasContext.setLineDash([6, 10]);
    this.canvasContext.lineDashOffset = -phase / 26;
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = withAlpha(color, 0.55);
    this.canvasContext.stroke();
    this.canvasContext.setLineDash([]);

    for (let spark = 0; spark < 6; spark++) {
      const angle = phase / 420 + (spark * Math.PI) / 3;
      const distance = 46 + 3 * pulse;
      this.canvasContext.beginPath();
      this.canvasContext.arc(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        2.5,
        0,
        Math.PI * 2
      );
      this.canvasContext.fillStyle = color;
      this.canvasContext.fill();
    }

    this.canvasContext.restore();
  }

  renderSlowMotionField(phase: number) {
    const { width, height } = this.canvasContext.canvas;
    const { color } = POWER_UP_APPEARANCE.timeMachine;

    this.canvasContext.save();
    this.canvasContext.fillStyle = withAlpha(color, 0.06);
    this.canvasContext.fillRect(0, 0, width, height);

    const maxRadius = Math.hypot(width, height) / 2;
    for (let ring = 0; ring < 3; ring++) {
      const progress = (phase / 2600 + ring / 3) % 1;
      this.canvasContext.beginPath();
      this.canvasContext.arc(
        width / 2,
        height / 2,
        progress * maxRadius,
        0,
        Math.PI * 2
      );
      this.canvasContext.lineWidth = 2;
      this.canvasContext.strokeStyle = withAlpha(color, 0.18 * (1 - progress));
      this.canvasContext.stroke();
    }
    this.canvasContext.restore();
  }

  renderSlowMotionVignette(phase: number) {
    const { width, height } = this.canvasContext.canvas;
    const { color } = POWER_UP_APPEARANCE.timeMachine;
    const intensity = 0.28 + 0.06 * Math.sin(phase / 300);

    const vignette = this.canvasContext.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.hypot(width, height) / 2
    );
    vignette.addColorStop(0, withAlpha(color, 0));
    vignette.addColorStop(1, withAlpha(color, intensity));

    this.canvasContext.save();
    this.canvasContext.fillStyle = vignette;
    this.canvasContext.fillRect(0, 0, width, height);
    this.canvasContext.restore();
  }

  renderEffectsHud({ effects }: { effects: Effects }) {
    const panelWidth = 190;
    const panelHeight = 34;

    effects.getActiveKinds().forEach((kind, index) => {
      const { color, label } = POWER_UP_APPEARANCE[kind];
      const x = 24;
      const y = 24 + index * (panelHeight + 10);

      this.canvasContext.save();

      this.renderRoundedRectanglePath({
        x,
        y,
        width: panelWidth,
        height: panelHeight,
        radius: 8,
      });
      this.canvasContext.fillStyle = "rgba(17, 23, 29, 0.75)";
      this.canvasContext.fill();
      this.canvasContext.lineWidth = 1.5;
      this.canvasContext.strokeStyle = withAlpha(color, 0.55);
      this.canvasContext.stroke();

      if (kind === "booster") {
        this.renderBoltIcon({ x: x + 20, y: y + panelHeight / 2, size: 9, color });
      } else {
        this.renderClockIcon({
          x: x + 20,
          y: y + panelHeight / 2,
          size: 9,
          color,
          phase: effects.elapsed,
        });
      }

      this.canvasContext.font = "bold 10px Arial";
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillText(label, x + 38, y + 15);

      this.canvasContext.textAlign = "right";
      this.canvasContext.fillText(
        `${(effects.getRemaining(kind) / 1000).toFixed(1)}s`,
        x + panelWidth - 12,
        y + 15
      );
      this.canvasContext.textAlign = "left";

      const barX = x + 38;
      const barY = y + 21;
      const barWidth = panelWidth - 38 - 12;
      const barHeight = 5;
      this.canvasContext.fillStyle = withAlpha(color, 0.2);
      this.canvasContext.fillRect(barX, barY, barWidth, barHeight);
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(
        barX,
        barY,
        barWidth * effects.getRemainingRatio(kind),
        barHeight
      );

      this.canvasContext.restore();
    });
  }

  private renderBoltIcon({
    x,
    y,
    size,
    color,
  }: {
    x: number;
    y: number;
    size: number;
    color: string;
  }) {
    const points = [
      [0.2, -0.85],
      [-0.45, 0.08],
      [-0.05, 0.08],
      [-0.22, 0.85],
      [0.45, -0.12],
      [0.05, -0.12],
    ];

    this.canvasContext.beginPath();
    points.forEach(([pointX, pointY], index) => {
      const canvasX = x + pointX * size;
      const canvasY = y + pointY * size;
      if (index === 0) {
        this.canvasContext.moveTo(canvasX, canvasY);
      } else {
        this.canvasContext.lineTo(canvasX, canvasY);
      }
    });
    this.canvasContext.closePath();
    this.canvasContext.fillStyle = color;
    this.canvasContext.fill();
  }

  private renderClockIcon({
    x,
    y,
    size,
    color,
    phase,
  }: {
    x: number;
    y: number;
    size: number;
    color: string;
    phase: number;
  }) {
    this.canvasContext.beginPath();
    this.canvasContext.arc(x, y, size * 0.75, 0, Math.PI * 2);
    this.canvasContext.lineWidth = Math.max(1.5, size * 0.16);
    this.canvasContext.strokeStyle = color;
    this.canvasContext.stroke();

    const hands: { angle: number; length: number }[] = [
      { angle: phase / 900, length: size * 0.55 },
      { angle: phase / 5400, length: size * 0.35 },
    ];
    hands.forEach(({ angle, length }) => {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x, y);
      this.canvasContext.lineTo(
        x + Math.cos(angle - Math.PI / 2) * length,
        y + Math.sin(angle - Math.PI / 2) * length
      );
      this.canvasContext.lineWidth = Math.max(1.5, size * 0.14);
      this.canvasContext.strokeStyle = color;
      this.canvasContext.stroke();
    });
  }

  private renderRoundedRectanglePath({
    x,
    y,
    width,
    height,
    radius,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
  }) {
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(x + radius, y);
    this.canvasContext.arcTo(x + width, y, x + width, y + height, radius);
    this.canvasContext.arcTo(x + width, y + height, x, y + height, radius);
    this.canvasContext.arcTo(x, y + height, x, y, radius);
    this.canvasContext.arcTo(x, y, x + width, y, radius);
    this.canvasContext.closePath();
  }
}
