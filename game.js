const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function update(dt) {}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  requestAnimationFrame(loop);
});
