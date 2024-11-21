import './style.css';
import { Game } from './game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('No #app element found');
    return;
  }
  
  app.appendChild(canvas);
  new Game(canvas);
});