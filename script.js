// 🎯 Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 🔊 Load Sounds
const sounds = {
    bullet: new Audio("bulletsound.mp3"),
    enemyHit: new Audio("dinograwlsound.mp3"),
    gameOver: new Audio("gameover.mp3"),
    powerUp: new Audio("powerupsound.mp3")
};
Object.values(sounds).forEach(sound => { sound.preload = "auto"; sound.volume = 0.5; });

// 🎮 Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height - player.height - 20;
}

// 🏃 Player Object
let player = {
    x: 30, y: 0, width: 150, height: 150, dy: 0,
    gravity: 0.5, jumpPower: -12, isJumping: false,
    bullets: [], health: 3, scale: 1
};
resizeCanvas();

// 👾 Enemy & PowerUps
let enemies = [], powerUps = [], score = 0, isGameOver = false;

// 🎮 Load Images
const images = {
    player: new Image(), enemy: new Image(), powerUp: new Image()
};
images.player.src = "Shooting_player.png";
images.enemy.src = "dianasore.png";
images.powerUp.src = "powerUp.png";

// 🚀 Spawn Functions
function spawnEnemy() {
    if (!isGameOver) {
        enemies.push({ x: canvas.width + Math.random() * 200, y: canvas.height - 160, width: 180, height: 150, speed: 3 + Math.random() * 3 });
    }
}
function spawnPowerUp() {
    if (!isGameOver) {
        powerUps.push({ x: canvas.width + Math.random() * 200, y: canvas.height - 160, width: 30, height: 30, effect: "health" });
    }
}

// 🏃 Draw Functions
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(player.scale, player.scale);
    ctx.drawImage(images.player, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

// 🔄 Update Game State
function update() {
    if (isGameOver) return;

    player.dy += player.gravity;
    player.y += player.dy;
    if (player.y > canvas.height - player.height - 20) {
        player.y = canvas.height - player.height - 20;
        player.dy = 0;
        player.isJumping = false;
    }
    
    // Update Bullets
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        let bullet = player.bullets[i];
        bullet.x += 10;
        if (bullet.x > canvas.width) player.bullets.splice(i, 1);
    }
    
    // Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        enemy.x -= enemy.speed;
        if (enemy.x + enemy.width < 0) enemies.splice(i, 1);
        
        // Collision with Bullets
        for (let j = player.bullets.length - 1; j >= 0; j--) {
            let bullet = player.bullets[j];
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x) {
                enemies.splice(i, 1);
                player.bullets.splice(j, 1);
                score += 5;
                sounds.enemyHit.cloneNode().play();
                break;
            }
        }
        
        // Collision with Player
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x) {
            enemies.splice(i, 1);
            player.health--;
            if (player.health <= 0) {
                isGameOver = true;
                sounds.gameOver.play();
            }
        }
    }
    
    // Update PowerUps
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];
        powerUp.x -= 4;
        if (player.x < powerUp.x + powerUp.width && player.x + player.width > powerUp.x) {
            player.health++;
            powerUps.splice(i, 1);
            sounds.powerUp.cloneNode().play();
        }
    }
}

// 🎨 Draw Game Elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    player.bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, 10, 5));
    enemies.forEach(enemy => ctx.drawImage(images.enemy, enemy.x, enemy.y, enemy.width, enemy.height));
    powerUps.forEach(powerUp => ctx.drawImage(images.powerUp, powerUp.x, powerUp.y, powerUp.width, powerUp.height));
    
    ctx.fillStyle = "yellow";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillStyle = "red";
    ctx.fillText(`Health: ${player.health}`, 20, 70);
}

// 🎮 Game Loop
function gameLoop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

// 🕹️ Controls
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !player.isJumping) {
        player.dy = player.jumpPower;
        player.isJumping = true;
    }
});
canvas.addEventListener("click", () => {
    player.bullets.push({ x: player.x + player.width, y: player.y + 20, width: 10, height: 5 });
    sounds.bullet.cloneNode().play();
});

// 🕒 Timers
setInterval(spawnEnemy, 2000);
setInterval(spawnPowerUp, 12000);

// 🚀 Start Game
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
gameLoop();
