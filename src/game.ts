import { Player } from './entities/player';
import { Invader } from './entities/invader';
import { Bullet } from './entities/bullet';
import { Particle } from './entities/particle';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private invaders: Invader[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private lastTime = 0;
  private score = 0;
  private gameOver = false;
  private level = 1;
  private invaderFireRate = 0.002;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player(canvas.width / 2, canvas.height - 50);
    this.initInvaders();
    this.setupControls();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private initInvaders() {
    const rows = 4 + Math.min(2, Math.floor(this.level / 2));
    const cols = 8 + Math.min(4, Math.floor(this.level / 3));
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.invaders.push(
          new Invader(
            col * 60 + (this.canvas.width - cols * 60) / 2,
            row * 50 + 50,
            this.level
          )
        );
      }
    }
  }

  private setupControls() {
    const keys = new Set<string>();
    
    window.addEventListener('keydown', (e) => {
      keys.add(e.key);
      if (e.key === ' ') this.shoot();
      if (this.gameOver && e.key === 'Enter') this.restart();
    });

    window.addEventListener('keyup', (e) => {
      keys.delete(e.key);
    });

    // Continuous movement
    setInterval(() => {
      if (keys.has('ArrowLeft')) this.player.moveLeft();
      if (keys.has('ArrowRight')) this.player.moveRight(this.canvas.width);
    }, 16);
  }

  private restart() {
    this.gameOver = false;
    this.score = 0;
    this.level = 1;
    this.invaders = [];
    this.bullets = [];
    this.particles = [];
    this.initInvaders();
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);
  }

  private shoot() {
    if (!this.gameOver) {
      this.bullets.push(new Bullet(
        this.player.x + this.player.width / 2,
        this.player.y,
        -1
      ));
    }
  }

  private createExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  private gameLoop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (!this.gameOver) {
      this.update(deltaTime);
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number) {
    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.update();
      return particle.isAlive();
    });

    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.isActive(this.canvas.height);
    });

    // Invaders shooting
    this.invaders.forEach(invader => {
      if (Math.random() < this.invaderFireRate) {
        this.bullets.push(new Bullet(
          invader.x + invader.width / 2,
          invader.y + invader.height,
          1
        ));
      }
    });

    // Check collisions and update invaders
    this.invaders = this.invaders.filter(invader => {
      invader.update(deltaTime, this.canvas.width);
      
      // Check if invaders reached the bottom
      if (invader.y + invader.height > this.player.y) {
        this.gameOver = true;
      }

      // Check bullet collisions
      for (const bullet of this.bullets) {
        if (bullet.speed < 0 && this.checkCollision(bullet, invader)) {
          this.score += 100 * this.level;
          this.createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2, '#ff0000');
          return false;
        }
      }
      return true;
    });

    // Check player hit
    this.bullets.forEach(bullet => {
      if (bullet.speed > 0 && this.checkCollision(bullet, this.player)) {
        this.gameOver = true;
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00ff00');
      }
    });

    // Level completion
    if (this.invaders.length === 0) {
      this.level++;
      this.invaderFireRate = Math.min(0.008, this.invaderFireRate + 0.001);
      this.initInvaders();
    }
  }

  private checkCollision(bullet: Bullet, target: { x: number, y: number, width: number, height: number }): boolean {
    return bullet.x < target.x + target.width &&
           bullet.x + bullet.width > target.x &&
           bullet.y < target.y + target.height &&
           bullet.y + bullet.height > target.y;
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw game objects
    this.player.draw(this.ctx);
    this.invaders.forEach(invader => invader.draw(this.ctx));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));
    this.particles.forEach(particle => particle.draw(this.ctx));

    // Draw HUD
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Level: ${this.level}`, this.canvas.width - 100, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText('Press ENTER to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      
      this.ctx.textAlign = 'left';
    }
  }
}