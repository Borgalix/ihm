// Sélectionner le canvas et le contexte
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Charger l'image du joueur
const playerImage = new Image();
playerImage.src = 'vaisseau.png'; // Assurez-vous que l'image est dans le même dossier que le code

// Paramètres du jeu
const playerWidth = 30;
const playerHeight = 30;
const playerSpeed = 2;
const obstacleWidth = 30;
const obstacleHeight = 30;
const obstacleSpeed = 0.5;
const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 7;

// Variables to store enemy bullets

const enemyBulletSpeed = 3;

const initialEnemyShotDelay = 1000; // Délai initial de 5 secondes avant que les ennemis puissent tirer
let gameStartTime = Date.now(); // Heure de début du jeu

let lastEnemyShotTime = 0;  // Temps du dernier tir des ennemis
const enemyGlobalShotDelay = 1000;  // Délai de 1 seconde entre chaque tir global des ennemis (en millisecondes)



// Variables de l'état du jeu
let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height - playerHeight - 10;
let playerDx = 0;
let playerDy = 0;  // Déplacement vertical
let enemyBullets = [];

let obstacles = [];
let bullets = [];
let gameOver = false;



// Fonction pour dessiner le joueur avec l'image
function drawPlayer() {
    ctx.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
}

// Fonction pour dessiner les obstacles
function drawObstacles() {
    ctx.fillStyle = 'red';
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        ctx.fillRect(obs.x, obs.y, obstacleWidth, obstacleHeight);
    }
}

// Fonction pour dessiner les balles
function drawBullets() {
    ctx.fillStyle = 'yellow';
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    }
}

// Fonction pour déplacer le joueur
function movePlayer() {
    playerX += playerDx;
    playerY += playerDy;

    // Limites du joueur : éviter de sortir de l'écran
    if (playerX < 0) playerX = 0;
    if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
    if (playerY < 0) playerY = 0;
    if (playerY + playerHeight > canvas.height) playerY = canvas.height - playerHeight;
}

// Dimensions et espacement des ennemis
const numRows = 3; // Nombre de rangées
const numCols = 8; // Nombre d'ennemis par rangée
const enemySpacingX = 20; // Espacement horizontal entre les ennemis
const enemySpacingY = 20; // Espacement vertical entre les rangées
const enemyStartX = 50; // Position de départ de la première colonne
const enemyStartY = -enemySpacingY * numRows; // Position de départ, juste au-dessus du canvas

let enemiesCanShoot = false; // Indicateur de si les ennemis peuvent tirer

// Variables de génération des vagues d'ennemis
const waveInterval = 20000; // Intervalle de temps entre chaque vague d'ennemis en millisecondes
let lastWaveTime = 0; // Temps de la dernière vague générée
let waveCount = 0; // Compteur de vagues

// Fonction pour générer les ennemis par vague
function generateWave() {
    const currentTime = Date.now();
    
    // Générer une nouvelle vague d'ennemis si l'intervalle est écoulé
    if (currentTime - lastWaveTime >= waveInterval) {
        waveCount++; // Augmenter le compteur de vagues
        generateObstacle(); // Générer les ennemis de la vague

        lastWaveTime = currentTime; // Mettre à jour le temps de la dernière vague générée
    }
}

// Fonction pour générer les ennemis dans une vague
function generateObstacle() {
    const numRows = 3; // Nombre de rangées
    const numCols = 6; // Nombre d'ennemis par rangée
    const enemySpacingX = 30; // Espacement horizontal entre les ennemis
    const enemySpacingY = 30; // Espacement vertical entre les rangées
    const enemyStartX = 40; // Position de départ de la première colonne
    const enemyStartY = (-enemySpacingY * numRows) - (enemySpacingY * numRows); // Position de départ, juste au-dessus du canvas

    // Générer les ennemis pour cette vague
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = enemyStartX + col * (obstacleWidth + enemySpacingX);
            const y = enemyStartY + row * (obstacleHeight + enemySpacingY);

            // Ajouter chaque ennemi avec une position juste hors de l'écran
            obstacles.push({
                x: x,
                y: y,
                lastShotTime: 0, // Réinitialiser le temps de tir
                nextShotInterval: getRandomShotInterval() // Intervalle aléatoire pour le tir
            });
        }
    }
}

// Fonction pour gérer les tirs des ennemis
function handleEnemyShooting() {
    const currentTime = Date.now();

    // Vérifiez si le délai initial est écoulé et si les ennemis peuvent commencer à tirer
    if (currentTime - gameStartTime < initialEnemyShotDelay) {
        return; // Quittez la fonction si le délai initial n'est pas encore écoulé
    }

    // Si le délai global est écoulé (1 seconde entre chaque tir global)
    if (currentTime - lastEnemyShotTime >= enemyGlobalShotDelay) {
        // Permettre aux ennemis de tirer après le délai initial
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            const timeSinceLastShot = currentTime - obs.lastShotTime;

            // Si l'ennemi peut tirer et que le délai global est écoulé, il tire
            if (timeSinceLastShot > obs.nextShotInterval) {
                enemyShoot(obs.x, obs.y);
                obs.lastShotTime = currentTime; // Mise à jour du dernier tir
                obs.nextShotInterval = getRandomShotInterval(); // Nouveau délai de tir
                break;  // Empêche un autre ennemi de tirer en même temps
            }
        }
        
        // Mettre à jour le dernier tir global
        lastEnemyShotTime = currentTime;
    }
}



// Fonction pour mettre à jour le jeu
function updateGame() {
    if (gameOver) {
        showGameOver();
        return;
    }

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gérer le mouvement du joueur et le tir
    handlePlayerMovement();
    handleShooting();

    // Dessiner le joueur, les obstacles, les balles du joueur et les balles des ennemis
    drawPlayer();
    drawObstacles();
    drawBullets();
    drawEnemyBullets();

    // Déplacer les obstacles, les balles du joueur et les balles des ennemis
    moveObstacles();
    moveBullets();
    moveEnemyBullets();

    // Vérifier les collisions entre balles et obstacles
    checkBulletCollisions();

    // Gérer les tirs des ennemis
    handleEnemyShooting();

    // Générer des vagues d'ennemis
    generateWave();

    // Demander à l'animation d'être rafraîchie
    requestAnimationFrame(updateGame);
}

// Fonction pour réinitialiser l'état du jeu
function restartGame() {
    // Réinitialiser les variables du jeu
    playerX = canvas.width / 2 - playerWidth / 2;
    playerY = canvas.height - playerHeight - 10;
    playerDx = 0;
    playerDy = 0;
    obstacles = [];
    bullets = [];
    enemyBullets = [];
    gameOver = false;
    enemiesCanShoot = false; // Réinitialiser l'indicateur de tir des ennemis
    gameStartTime = Date.now(); // Réinitialiser l'heure de début du jeu
    lastWaveTime = 0; // Réinitialiser le temps de la dernière vague générée
    waveCount = 0; // Réinitialiser le compteur de vagues
    generateWave(); // Démarrer immédiatement avec la première vague

    // Retirer l'événement clic pour éviter plusieurs appels
    canvas.removeEventListener('click', restartGame);

    // Redémarrer le jeu
    updateGame();
}

// Fonction pour calculer un intervalle de tir aléatoire pour les ennemis
function getRandomShotInterval() {
    return Math.floor(Math.random() * 5000) + 3000; // Intervalle aléatoire entre 4000 et 6000 ms
}


// Fonction pour gérer le tir des ennemis
function enemyShoot(enemyX, enemyY) {
    // Calculer la direction vers le joueur
    const angle = Math.atan2(playerY - enemyY, playerX - enemyX);
    const dx = Math.cos(angle) * enemyBulletSpeed;
    const dy = Math.sin(angle) * enemyBulletSpeed;

    // Créer une nouvelle balle ennemie et l'ajouter au tableau
    enemyBullets.push({
        x: enemyX + obstacleWidth / 2,
        y: enemyY + obstacleHeight / 2,
        dx: dx,
        dy: dy
    });
}

// Fonction pour déplacer les obstacles
function moveObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.y += obstacleSpeed;

        // Si l'obstacle sort de l'écran, on le retire
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }

        // Vérification de la collision avec le joueur
        if (
            obs.x < playerX + playerWidth &&
            obs.x + obstacleWidth > playerX &&
            obs.y < playerY + playerHeight &&
            obs.y + obstacleHeight > playerY
        ) {
            gameOver = true;
        }
    }
}

// Fonction pour tirer une balle
function shootBullet() {
    bullets.push({
        x: playerX + playerWidth / 2 - bulletWidth / 2,
        y: playerY
    });
}

// Fonction pour déplacer les balles
function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        bullet.y -= bulletSpeed;

        // Retirer la balle si elle sort de l'écran
        if (bullet.y + bulletHeight < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

// Vérification de la collision entre balles et obstacles
function checkBulletCollisions() {
    for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        for (let j = 0; j < obstacles.length; j++) {
            const obs = obstacles[j];
            if (
                bullet.x < obs.x + obstacleWidth &&
                bullet.x + bulletWidth > obs.x &&
                bullet.y < obs.y + obstacleHeight &&
                bullet.y + bulletHeight > obs.y
            ) {
                // Collision détectée, retirer la balle et l'obstacle
                bullets.splice(i, 1);
                obstacles.splice(j, 1);
                i--;
                break;
            }
        }
    }
}

// Fonction pour afficher le message de fin du jeu et le bouton "Rejouer"
function showGameOver() {
    // Vider les balles ennemies en cas de game over
    enemyBullets = []; 

    // Afficher le message de fin
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 80, canvas.height / 2);

    // Afficher le bouton "Rejouer"
    ctx.font = '20px Arial';
    ctx.fillText('Cliquez pour rejouer', canvas.width / 2 - 80, canvas.height / 2 + 40);

    // Activer la fonction de redémarrage sur clic
    canvas.addEventListener('click', restartGame);
}



// Variables to track key states
let keyState = {};

// Update the key state based on keydown and keyup events
document.addEventListener('keydown', function (e) {
    keyState[e.key] = true;
});

document.addEventListener('keyup', function (e) {
    keyState[e.key] = false;
});

// Function to move the player based on key states
function handlePlayerMovement() {
    if (keyState['ArrowLeft']) {
        playerDx = -playerSpeed;
    } else if (keyState['ArrowRight']) {
        playerDx = playerSpeed;
    } else {
        playerDx = 0;
    }
    
    if (keyState['ArrowUp']) {
        playerDy = -playerSpeed;
    } else if (keyState['ArrowDown']) {
        playerDy = playerSpeed;
    } else {
        playerDy = 0;
    }

    // Move the player
    movePlayer();
}

// Variables de gestion du tir
let lastShotTime = 0;
const shotInterval = 500; // Temps en millisecondes entre chaque tir

// Fonction pour gérer le tir lorsque la barre d'espace est maintenue enfoncée
function handleShooting() {
    if (keyState[' '] || keyState['Spacebar']) {  // ' ' pour certains navigateurs, 'Spacebar' pour d'autres
        let currentTime = Date.now();
        if (currentTime - lastShotTime > shotInterval) {
            shootBullet();
            lastShotTime = currentTime;
        }
    }
}




// Function to draw enemy bullets
function drawEnemyBullets() {
    ctx.fillStyle = 'green';
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Function to move enemy bullets
function moveEnemyBullets() {
    for (let i = 0; i < enemyBullets.length; i++) {
        const bullet = enemyBullets[i];
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove the bullet if it goes off the screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }

        // Check for collision with the player
        if (
            bullet.x < playerX + playerWidth &&
            bullet.x > playerX &&
            bullet.y < playerY + playerHeight &&
            bullet.y > playerY
        ) {
            gameOver = true; // End the game if the player is hit
        }
    }
}

let lastObstacleTime = 0;
const obstacleInterval = 3000; // 3 secondes entre chaque appel de génération d'ennemi

// generateObstacle();


// Gérer les entrées du clavier
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
        playerDx = -playerSpeed;
    } else if (e.key === 'ArrowRight') {
        playerDx = playerSpeed;
    } else if (e.key === 'ArrowUp') {
        playerDy = -playerSpeed;
    } else if (e.key === 'ArrowDown') {
        playerDy = playerSpeed;
    } else if (e.key === ' ' || e.keyCode === 32) { // Ajout de la prise en charge du code de la touche espace
        shootBullet(); // Tirer une balle avec la barre d'espace
    }
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        playerDx = 0;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        playerDy = 0;
    }
});

// Démarrer le jeu
updateGame();
