export class Vector {
  x: number;
  y: number;

  constructor({ x, y }: { x: number; y: number }) {
    const length = Math.sqrt(x * x + y * y);
    this.x = x / length;
    this.y = y / length;
  }
}
