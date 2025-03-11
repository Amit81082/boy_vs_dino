// 🎯 Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔊 Load Sounds
const bulletSound = new Audio("bulletsound.mp3");
const enemyHitSound = new Audio("dinograwlsound.mp3");
const gameOverSound = new Audio("gameover.mp3");
const powerUpSound = new Audio("powerupsound.mp3");

// ⚡ Preload sounds for better performance
bulletSound.preload = "auto";
enemyHitSound.preload = "auto";
gameOverSound.preload = "auto";
powerUpSound.preload = "auto";

// 🎮 Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = window.innerHeight - 160;
    enemies.forEach(enemy => enemy.y = window.innerHeight - 160);
    powerUps.forEach(powerUp => powerUp.y = window.innerHeight - 160);
}

// 🏃 Player Object (Size Increased)
let player = {
    x: 30,
    y: window.innerHeight - 160,
    width: 150,  // Increased from 120 to 150
    height: 150, // Increased from 120 to 150
    dy: 0,
    gravity: 0.5,
    jumpPower: -12,
    isJumping: false,
    bullets: [],
    health: 3,
    hovered: false
};

// 👾 Enemy & PowerUps Storage
let enemies = [];
let powerUps = [];
let score = 0;
let gameOver = false;

// 🎮 Load Images
const playerImage = new Image();
playerImage.src = "Shooting_player.png";
const enemyImage = new Image();
enemyImage.src = "dianasore.png";
const powerUpImage = new Image();
powerUpImage.src = "powerUp.png";

// 🚀 Spawn Enemy (Size Increased)
function spawnEnemy() {
    let speed = Math.random() > 0.5 ? 5 + Math.random() * 3 : 3 + Math.random() * 2;
    enemies.push({
        x: canvas.width + Math.random() * 200,
        y: window.innerHeight - 160,
        width: 180,  // Increased from 150 to 180
        height: 150, // Increased from 120 to 150
        speed
    });
}

// ⚡ Spawn Power-Up
function spawnPowerUp() {
    powerUps.push({
        x: canvas.width + Math.random() * 200,
        y: window.innerHeight - 160,
        width: 20,
        height: 20,
        effect: "health"
    });
}

let playerScale = 1; // Default scale

// 🏃 Draw Player
function drawPlayer() {
    ctx.save();
    ctx.globalAlpha = player.hovered ? 0.7 : 1;
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(playerScale, playerScale);
    ctx.drawImage(playerImage, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawEnemy(enemy) {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawPowerUp(powerUp) {
    ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
}

function drawRect(obj, color) {
    ctx.fillStyle = color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

// 🔄 Update Game State
function update() {
    if (gameOver) return;

    // Gravity and Jump Logic
    player.dy += player.gravity;
    player.y += player.dy;
    if (player.y > window.innerHeight - 160) {
        player.y = window.innerHeight - 160;
        player.dy = 0;
        player.isJumping = false;
    }

    // Bullet Movement
    player.bullets.forEach((bullet, index) => {
        bullet.x += 8;
        if (bullet.x > canvas.width) player.bullets.splice(index, 1);
    });

    // Enemy Collision
    enemies.forEach((enemy, index) => {
        enemy.x -= enemy.speed;
        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
            score--;
        }

        // Bullet Collision with Enemy
        player.bullets.forEach((bullet, bIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemies.splice(index, 1);
                player.bullets.splice(bIndex, 1);
                score += 5;
                let hitSFX = enemyHitSound.cloneNode();
                hitSFX.play();
            }
        });

        // Player Collision with Enemy
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            enemies.splice(index, 1);
            player.health--;
            if (player.health <= 0) gameOver = true;
            gameOverSound.play();
        }
    });

    // Power-Up Collision
    powerUps.forEach((powerUp, index) => {
        powerUp.x -= 4;
        if (powerUp.x + powerUp.width < 0) powerUps.splice(index, 1);

        if (
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y
        ) {
            if (powerUp.effect === "health") player.health += 1;
            powerUps.splice(index, 1);
            let powerUpSFX = powerUpSound.cloneNode();
            powerUpSFX.play();
        }
    });
}

// 🎨 Draw Game Elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    player.bullets.forEach(bullet => drawRect(bullet, "yellow"));
    enemies.forEach(enemy => drawEnemy(enemy));
    powerUps.forEach(powerUp => drawPowerUp(powerUp));
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("Health: " + player.health, 10, 60);
}

// 🎮 Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 🕹️ Controls
window.addEventListener("keydown", function (e) {
    if (e.code === "Space" && !player.isJumping) {
        player.dy = player.jumpPower;
        player.isJumping = true;
    }
});

// 🎯 Click on Player to Shoot
canvas.addEventListener("click", function (e) {
    if (
        e.clientX >= player.x &&
        e.clientX <= player.x + player.width &&
        e.clientY >= player.y &&
        e.clientY <= player.y + player.height
    ) {
        playerScale = 1.2;
        setTimeout(() => { playerScale = 1; }, 300);
        player.bullets.push({ x: player.x + player.width, y: player.y + 20, width: 10, height: 5 });
        let bulletSFX = bulletSound.cloneNode();
        bulletSFX.play();
    }
});

// 🎮 Mobile Swipe for Power-Up Collection
document.addEventListener("touchend", (event) => {
    if (event.changedTouches[0].clientY - touchStartY > 50) {
        powerUps.forEach((powerUp, index) => {
            if (Math.abs(player.x - powerUp.x) < 100) {
                player.health += 1;
                powerUps.splice(index, 1);
                let powerUpSFX = powerUpSound.cloneNode();
                powerUpSFX.play();
            }
        });
    }
});

// 🕒 Timers
setInterval(spawnEnemy, 2000);
setInterval(spawnPowerUp, 14000);

// 🚀 Start Game
gameLoop();
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
