const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Images
const bg = new Image();
bg.src = "assets/bg.png";

const head = new Image();
head.src = "assets/head.png";

const pipe = new Image();
pipe.src = "assets/pipe.png";

// Sound
const cobraSound = new Audio("assets/cobra.mp3");

// Bird
const bird = {
    x: 80,
    y: 250,
    width: 70,
    height: 70,
    velocity: 0,
    gravity: 0.45,
    jump: -7
};

// Game Variables
let pipes = [];
let score = 0;
let gameOver = false;
let highScore = localStorage.getItem("highScore") || 0;

// Jump
function flap() {
    if (gameOver) return;

    bird.velocity = bird.jump;

    cobraSound.currentTime = 0;
    cobraSound.play();
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap();
});

canvas.addEventListener("click", flap);

// Create Pipe
function createPipe() {

    if (gameOver) return;

    const gap = 140;
    const topHeight = Math.floor(Math.random() * 180) + 80;

    pipes.push({
        x: canvas.width,
        width: 100,
        top: topHeight,
        bottom: topHeight + gap,
        scored: false
    });
}

setInterval(createPipe, 1700);

// ================= UPDATE GAME =================

function update() {

    if (gameOver) {
        drawGameOver();
        return;
    }

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y < 0) bird.y = 0;

    if (bird.y + bird.height >= canvas.height) {
        gameOver = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Pipes
    for (let i = 0; i < pipes.length; i++) {

        let p = pipes[i];

        p.x -= 4;

        // Top Pipe
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.top / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipe, -p.width / 2, -p.top / 2, p.width, p.top);
        ctx.restore();

        // Bottom Pipe
        ctx.drawImage(pipe, p.x, p.bottom, p.width, canvas.height - p.bottom);

        // ===== PERFECT COLLISION =====
        const hit = 18;

        const birdLeft = bird.x + hit;
        const birdRight = bird.x + bird.width - hit;
        const birdTop = bird.y + hit;
        const birdBottom = bird.y + bird.height - hit;

        const pipeLeft = p.x;
        const pipeRight = p.x + p.width;

        if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < p.top || birdBottom > p.bottom)
        ) {
            gameOver = true;
        }

        // Score
        if (!p.scored && p.x + p.width < bird.x) {
            p.scored = true;
            score++;

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }
    }

    // Remove old pipes
    pipes = pipes.filter(p => p.x + p.width > 0);

    // Draw Bird
    ctx.drawImage(head, bird.x, bird.y, bird.width, bird.height);

    // Score
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score : " + score, 20, 40);

    ctx.fillStyle = "yellow";
    ctx.font = "22px Arial";
    ctx.fillText("High : " + highScore, 20, 70);

    requestAnimationFrame(update);
}

// ================= GAME OVER SCREEN =================

function drawGameOver() {

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "42px Arial";
    ctx.fillText("GAME OVER", 70, 220);

    ctx.font = "28px Arial";
    ctx.fillText("Score : " + score, 125, 270);

    ctx.fillText("High : " + highScore, 125, 310);

    ctx.fillStyle = "#ff3333";
    ctx.fillRect(110, 360, 180, 60);

    ctx.fillStyle = "white";
    ctx.font = "26px Arial";
    ctx.fillText("RESTART", 135, 398);
}

// ================= RESTART =================

canvas.addEventListener("click", function () {

    if (gameOver) {
        location.reload();
    }

});

// ================= START GAME =================

Promise.all([
    new Promise(resolve => bg.onload = resolve),
    new Promise(resolve => head.onload = resolve),
    new Promise(resolve => pipe.onload = resolve)
]).then(() => {
    update();
});