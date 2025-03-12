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




// 🎮 Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.clientHeight; // Instead of window.innerHeight

    player.y = canvas.height - player.height - 10;
    enemies.forEach(enemy => enemy.y = canvas.height - enemy.height - 10);
    powerUps.forEach(powerUp => powerUp.y = canvas.height - powerUp.height - 50);

    console.log(`Canvas Resized: ${canvas.width}x${canvas.height}`);
}





// 🏃 Player Object
let player = {
    x: 30, y: 0, width: 150, height: 150, dy: 0,
    gravity: 0.3, jumpPower: -12, isJumping: false,
    bullets: [], health: 3, scale: 1,
    lastShotTime: 0, shootCooldown: 200 // Cooldown in milliseconds
};
resizeCanvas();






// 🚀 Spawn Functions
function spawnEnemy() {
    if (!isGameOver) {
        enemies.push({ x: canvas.width + Math.random() * 200, y: canvas.height - 150,  // ✅ Enemy को ठीक से ज़मीन पर रखना
            width: 180, height: 150, speed: 3 + Math.random() * 3 });
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
function updateScoreHealth() {
    document.querySelector(".score").innerText = `Score: ${score}`;
    document.querySelector(".health").innerText = `Health: ${player.health}`;
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

    // Update Enemies
    enemies = enemies.filter(enemy => enemy.x + enemy.width > 0);
    enemies.forEach((enemy, i) => {
        enemy.x -= enemy.speed;

        player.bullets.forEach((bullet, j) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x) {
                enemies.splice(i, 1);
                player.bullets.splice(j, 1);
                score += 5;
                updateScoreHealth(); // 🎯 Score update
                sounds.enemyHit.cloneNode().play();
            }
        });

        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x) {
            enemies.splice(i, 1);
            player.health--;
            updateScoreHealth(); // 🏆 Health update
            if (player.health <= 0) {
                isGameOver = true;
                sounds.gameOver.play();
                showGameOverScreen(); // 🔥 Game Over Screen दिखाने के लिए नई function call की
            }
        }
    });


    function showGameOverScreen() {
        const gameOverScreen = document.createElement("div");
        gameOverScreen.id = "gameOverScreen";
        gameOverScreen.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: ${score}</p>
            <button id="restartButton">Restart</button>
        `;

        // 🎨 Styling for Game Over Screen
        gameOverScreen.style.position = "fixed";
        gameOverScreen.style.top = "50%";
        gameOverScreen.style.left = "50%";
        gameOverScreen.style.transform = "translate(-50%, -50%)";
        gameOverScreen.style.background = "rgba(0, 0, 0, 0.8)";
        gameOverScreen.style.color = "white";
        gameOverScreen.style.padding = "20px";
        gameOverScreen.style.borderRadius = "10px";
        gameOverScreen.style.textAlign = "center";
        gameOverScreen.style.fontSize = "24px";
        gameOverScreen.style.zIndex = "1000";

        // 🛠️ Restart Button Styling
        const restartButton = gameOverScreen.querySelector("#restartButton");
        restartButton.style.background = "red";
        restartButton.style.color = "white";
        restartButton.style.padding = "10px 20px";
        restartButton.style.border = "none";
        restartButton.style.borderRadius = "5px";
        restartButton.style.cursor = "pointer";
        restartButton.style.fontSize = "20px";
        restartButton.style.marginTop = "10px";

        document.body.appendChild(gameOverScreen);

        // 🔁 Restart Button Event Listener
        restartButton.addEventListener("click", restartGame);
    }



    function restartGame() {
        document.getElementById("gameOverScreen").remove();
        score = 0;
        player.health = 3;
        isGameOver = false;
        enemies = [];
        powerUps = [];
        player.bullets = [];
        gameLoop();
    }






    // Update PowerUps
    powerUps.forEach((powerUp, i) => {
        powerUp.x -= 4;
        if (player.x < powerUp.x + powerUp.width && player.x + player.width > powerUp.x) {
            player.health++;
            powerUps.splice(i, 1);
            updateScoreHealth(); // 🎯 PowerUp se health badh gayi
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
window.addEventListener("resize", () => {
    resizeCanvas();

    // ✅ Resize होने पर player और enemies नीचे ही रहें
    player.y = canvas.height - player.height - 10;
    enemies.forEach(enemy => {
        enemy.y = canvas.height - 150;
    });
});
resizeCanvas();
gameLoop();