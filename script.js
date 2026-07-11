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
    width: 60,
    height: 60,
    velocity: 0,
    gravity: 0.5,
    jump: -6
};

// Pipes
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

document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
        flap();
    }
});

canvas.addEventListener("click", flap);

// Create Pipe
function createPipe() {

    if (gameOver) return;

    const gap = 170;
    const topHeight = Math.floor(Math.random() * 220) + 60;

    pipes.push({
        x: canvas.width,
        width: 80,
        top: topHeight,
        bottom: topHeight + gap,
        scored: false
    });

}

setInterval(createPipe, 1800);

// Update
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

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Background
    ctx.drawImage(bg,0,0,canvas.width,canvas.height);

    // Pipes
    for(let i=0;i<pipes.length;i++){

        let p = pipes[i];
        p.x -= 3;

        // Top Pipe
        ctx.save();
        ctx.translate(p.x + p.width/2, p.top/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(pipe,-p.width/2,-p.top/2,p.width,p.top);
        ctx.restore();

        // Bottom Pipe
        ctx.drawImage(pipe,p.x,p.bottom,p.width,canvas.height-p.bottom);

        // Collision
        if(
            bird.x + bird.width > p.x &&
            bird.x < p.x + p.width &&
            (bird.y < p.top || bird.y + bird.height > p.bottom)
        ){
            gameOver = true;
        }

        // Score
        if(!p.scored && p.x + p.width < bird.x){
            p.scored = true;
            score++;

            if(score > highScore){
                highScore = score;
                localStorage.setItem("highScore",highScore);
            }
        }
    }

    pipes = pipes.filter(p=>p.x+p.width>0);

    // Bird
    ctx.drawImage(head,bird.x,bird.y,bird.width,bird.height);

    // Score
    ctx.fillStyle="white";
    ctx.font="30px Arial";
    ctx.fillText("Score : "+score,20,40);

    ctx.fillStyle="yellow";
    ctx.font="22px Arial";
    ctx.fillText("High : "+highScore,20,70);

    requestAnimationFrame(update);
}

// Game Over
function drawGameOver(){

    ctx.fillStyle="rgba(0,0,0,0.6)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="white";
    ctx.font="40px Arial";
    ctx.fillText("GAME OVER",70,220);

    ctx.font="28px Arial";
    ctx.fillText("Score : "+score,120,270);

    ctx.fillStyle="red";
    ctx.fillRect(110,320,180,60);

    ctx.fillStyle="white";
    ctx.font="24px Arial";
    ctx.fillText("Click Restart",120,360);
}

// Restart
canvas.addEventListener("click",function(){

    if(gameOver){
        location.reload();
    }

});

// Start Game
bg.onload = function(){
    update();
};
