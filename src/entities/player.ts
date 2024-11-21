export class Player {
  public width = 50;
  public height = 30;
  private readonly speed = 5;
  private engineParticleTimer = 0;

  constructor(
    public x: number,
    public y: number
  ) {}

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight(canvasWidth: number) {
    this.x = Math.min(canvasWidth - this.width, this.x + this.speed);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Ship body
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#00aa00';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 15, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}