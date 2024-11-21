export class Invader {
  public width = 40;
  public height = 30;
  private moveTimer = 0;
  private direction = 1;
  private readonly baseSpeed = 2;
  private readonly moveInterval = 1000;
  private frame = 0;
  private frameTimer = 0;

  constructor(
    public x: number,
    public y: number,
    private level: number
  ) {}

  update(deltaTime: number, canvasWidth: number) {
    this.moveTimer += deltaTime;
    this.frameTimer += deltaTime;

    if (this.frameTimer > 500) {
      this.frame = 1 - this.frame;
      this.frameTimer = 0;
    }

    if (this.moveTimer > this.moveInterval / (1 + this.level * 0.1)) {
      this.x += this.width * this.direction;
      
      if (this.x <= 0 || this.x + this.width >= canvasWidth) {
        this.direction *= -1;
        this.y += 20;
      }
      
      this.moveTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 8, this.y + 8, 8, 8);
    ctx.fillRect(this.x + 24, this.y + 8, 8, 8);
    
    // Mouth
    ctx.fillStyle = 'white';
    if (this.frame === 0) {
      ctx.fillRect(this.x + 8, this.y + 20, 24, 4);
    } else {
      ctx.fillRect(this.x + 12, this.y + 18, 16, 6);
    }
  }
}