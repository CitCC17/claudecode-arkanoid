const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const PADDLE_SPEED = 400;

const paddle = { x: 0, y: 560, w: 162, h: 14 };

const keys = { ArrowLeft: false, ArrowRight: false };

function initPaddle() {
  paddle.x = (canvas.width - paddle.w) / 2;
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
  if (keys.ArrowLeft)  paddle.x = Math.max(0, paddle.x - PADDLE_SPEED * dt);
  if (keys.ArrowRight) paddle.x = Math.min(canvas.width - paddle.w, paddle.x + PADDLE_SPEED * dt);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
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
  requestAnimationFrame(loop);
});
