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
    gravity: 0.3, jumpPower: -12, isJumping: false,
    bullets: [], health: 3, scale: 1,
    lastShotTime: 0, shootCooldown: 200 // Cooldown in milliseconds
};
resizeCanvas();

// 👾 Enemy & PowerUps
let enemies = [], powerUps = [], score = 0, isGameOver = false;

// 🎮 Load Images with onload to Prevent 'Broken State' Error
const images = {
    player: new Image(),
    enemy: new Image(),
    powerUp: new Image()
};

// Set image sources
images.player.src = "Shooting_player.png";
images.enemy.src = "dianasore.png";
images.powerUp.src = "powerup.png";

// Check if all images are loaded
let imagesLoaded = 0;
const totalImages = Object.keys(images).length;

Object.values(images).forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            console.log("✅ All images loaded successfully!");
            gameLoop();  // Start game only after all images are loaded
        }
    };
    img.onerror = () => {
        console.error(`❌ Error loading image: ${img.src}`);
    };
});


console.log("🔄 Checking image loading...");

images.player.onload = () => console.log("✅ Player image loaded!");
images.enemy.onload = () => console.log("✅ Enemy image loaded!");
images.powerUp.onload = () => console.log("✅ PowerUp image loaded!");

images.player.onerror = () => console.error("❌ Failed to load player image!");
images.enemy.onerror = () => console.error("❌ Failed to load enemy image!");
images.powerUp.onerror = () => console.error("❌ Failed to load power-up image!");



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
    player.bullets = player.bullets.filter(bullet => bullet.x < canvas.width);
    player.bullets.forEach(bullet => bullet.x += 10);

    // Update Enemies
    enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
    enemies.forEach((enemy, i) => {
        enemy.x -= enemy.speed;
        
        player.bullets.forEach((bullet, j) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x) {
                enemies.splice(i, 1);
                player.bullets.splice(j, 1);
                score += 5;
                sounds.enemyHit.cloneNode().play();
            }
        });

        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x) {
            enemies.splice(i, 1);
            player.health--;
            if (player.health <= 0) {
                isGameOver = true;
                sounds.gameOver.play();
                setTimeout(() => location.reload(), 3000); // Auto-restart
            }
        }
    });

    // Update PowerUps
    powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.width > 0);
    powerUps.forEach((powerUp, i) => {
        powerUp.x -= 4;
        if (player.x < powerUp.x + powerUp.width && player.x + player.width > powerUp.x) {
            player.health++;
            powerUps.splice(i, 1);
            sounds.powerUp.cloneNode().play();
        }
    });
}

// 🎨 Draw Game Elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    player.bullets.forEach((bullet, index) => {
        bullet.x += 15;  // 🔥 Increase Speed for Smooth Effect
    
        // 💨 Trail Effect (Optional)
        ctx.fillStyle = "rgb(255, 10, 10)";
        ctx.fillRect(bullet.x - 5, bullet.y, 5, bullet.height);
    
        // 🚀 Bullet Remove if Out of Screen
        if (bullet.x > canvas.width) {
            player.bullets.splice(index, 1);
        }
    });
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
    let currentTime = Date.now();
   

     
    if (currentTime - player.lastShotTime >= player.shootCooldown) {
        player.lastShotTime = currentTime;
        
        // 🔫 Bullet Fire
        player.bullets.push({ x: player.x + player.width, y: player.y + 20, width: 10, height: 5 });
        sounds.bullet.cloneNode().play();

        // 🔥 Smooth Scale Effect
        let scaleUp = 1.1;
        let scaleDown = 1;
        
        let duration = 100; // Animation Duration in ms
        let startTime = performance.now();

        function animateScale(time) {
            let progress = (time - startTime) / duration;
            if (progress < 1) {
                player.scale = scaleUp - (scaleUp - scaleDown) * progress;
                requestAnimationFrame(animateScale);
            } else {
                player.scale = scaleDown;
            }
        }
        requestAnimationFrame(animateScale);
    }

});

// 🕒 Timers
setInterval(spawnEnemy, 2000);
setInterval(spawnPowerUp, 12000);

// 🚀 Start Game
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
gameLoop();