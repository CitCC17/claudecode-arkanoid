const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const PADDLE_SPEED = 400;

const paddle = { x: 0, y: 560, w: 162, h: 14 };
const ball   = { x: 0, y: 0, w: 16, h: 16, vx: 200, vy: -300 };

let lives = 3;
let score = 0;
let gameState = 'playing';

const keys = { ArrowLeft: false, ArrowRight: false };

function initPaddle() {
  paddle.x = (canvas.width - paddle.w) / 2;
}

function initBall() {
  ball.x = paddle.x + (paddle.w - ball.w) / 2;
  ball.y = paddle.y - ball.h;
  ball.vx = 200;
  ball.vy = -300;
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const mouseX = (e.clientX - rect.left) * scaleX;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, mouseX - paddle.w / 2));
});

document.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});

function update(dt) {
  if (gameState !== 'playing') return;

  // Paddle
  if (keys.ArrowLeft)  paddle.x = Math.max(0, paddle.x - PADDLE_SPEED * dt);
  if (keys.ArrowRight) paddle.x = Math.min(canvas.width - paddle.w, paddle.x + PADDLE_SPEED * dt);

  // Ball movement
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Wall bounces (left, right, top)
  if (ball.x <= 0) { ball.x = 0; ball.vx = Math.abs(ball.vx); }
  if (ball.x + ball.w >= canvas.width) { ball.x = canvas.width - ball.w; ball.vx = -Math.abs(ball.vx); }
  if (ball.y <= 0) { ball.y = 0; ball.vy = Math.abs(ball.vy); }

  // Paddle bounce
  if (
    ball.vy > 0 &&
    ball.x + ball.w > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.y + ball.h >= paddle.y &&
    ball.y + ball.h <= paddle.y + paddle.h + 8
  ) {
    ball.y = paddle.y - ball.h;
    ball.vy = -Math.abs(ball.vy);
  }

  // Ball lost
  if (ball.y > canvas.height) {
    lives--;
    if (lives <= 0) {
      lives = 0;
      gameState = 'gameover';
    } else {
      initBall();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
}

let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  initPaddle();
  initBall();
  requestAnimationFrame(loop);
});
