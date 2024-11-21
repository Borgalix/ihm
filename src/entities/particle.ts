export class Particle {
  private velocity = {
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 8
  };
  private alpha = 1;
  private readonly FADE_SPEED = 0.02;

  constructor(
    public x: number,
    public y: number,
    private color: string
  ) {}

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.FADE_SPEED;
  }

  isAlive(): boolean {
    return this.alpha > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}