export class Bullet {
  public width = 4;
  public height = 10;
  private readonly baseSpeed = 7;

  constructor(
    public x: number,
    public y: number,
    public speed: number
  ) {
    this.speed *= this.baseSpeed;
  }

  update() {
    this.y += this.speed;
  }

  isActive(canvasHeight: number): boolean {
    return this.y > 0 && this.y < canvasHeight;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.speed < 0 ? '#00ff00' : '#ff0000';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }
}