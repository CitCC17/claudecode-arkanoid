const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const PADDLE_SPEED = 400;
const BLOCK_COLS = 10;
const BLOCK_ROWS = 6;
const BLOCK_W = 32;
const BLOCK_H = 16;
const BLOCK_COLORS = ['red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];
const BLOCKS_ORIGIN_X = 104;
const BLOCKS_ORIGIN_Y = 80;

const paddle = { x: 0, y: 560, w: 162, h: 14 };
const ball   = { x: 0, y: 0, w: 16, h: 16, vx: 200, vy: -300 };

let blocks = [];
let explosions = [];
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

function initBlocks() {
  blocks = [];
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: BLOCKS_ORIGIN_X + col * BLOCK_W,
        y: BLOCKS_ORIGIN_Y + row * BLOCK_H,
        w: BLOCK_W,
        h: BLOCK_H,
        color: BLOCK_COLORS[row],
        alive: true,
      });
    }
  }
}

function collideAABB(block) {
  return (
    ball.x < block.x + block.w &&
    ball.x + ball.w > block.x &&
    ball.y < block.y + block.h &&
    ball.y + ball.h > block.y
  );
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

  // Block collisions
  for (const block of blocks) {
    if (!block.alive) continue;
    if (collideAABB(block)) {
      block.alive = false;
      explosions.push({ x: block.x, y: block.y, w: block.w, h: block.h, color: block.color, elapsed: 0 });
      score += 10;
      ball.vy = -ball.vy;
      if (blocks.every(b => !b.alive)) gameState = 'win';
      break; // one block per frame
    }
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

function drawOverlay(message) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const block of blocks) {
    if (block.alive) drawSprite(ctx, 'block_' + block.color, block.x, block.y, block.w, block.h);
  }

  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);

  if (gameState === 'playing') {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Score: ' + score, 10, 10);
    const ballSize = 16;
    const ballSpacing = 4;
    for (let i = 0; i < lives; i++) {
      const bx = canvas.width - 10 - (lives - i) * (ballSize + ballSpacing);
      drawSprite(ctx, 'ball', bx, 10, ballSize, ballSize);
    }
  }

  if (gameState === 'gameover') drawOverlay('GAME OVER');
  if (gameState === 'win')      drawOverlay('¡GANASTE!');
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
  initBlocks();
  requestAnimationFrame(loop);
});
