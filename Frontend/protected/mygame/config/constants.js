const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const FIELD_W = 700;
const FIELD_H = 500;
const PADDLE_W = 12;
const PADDLE_H = 110;
const PADDLE_SPEED = 380; // px/s
const BALL_R = 10;
const BALL_SPEED = 380;
const MAX_BOUNCE_ANGLE = Math.PI * 0.42;

const left  = { x: 16, y: (FIELD_H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H };
const right = { x: FIELD_W - 16 - PADDLE_W, y: (FIELD_H - PADDLE_H) / 2, w: PADDLE_W, h: PADDLE_H };
const ball  = { x: FIELD_W / 2, y: FIELD_H / 2, r: BALL_R, vx: 0, vy: 0 };

const keys = { KeyW:false, KeyS:false, ArrowUp:false, ArrowDown:false };

canvas.width = FIELD_W;
canvas.height = FIELD_H;

let last = performance.now();
let state = 'ready'; // 'ready' | 'playing' | 'failed' | 'gameOver'

let scoreL = 0;
let scoreR = 0;
let WIN_COINS = 3;
let winner = null;

let backgroundMusic = new Audio('mygame/audio/backgroundMusic.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

let crashMusic = new Audio('mygame/audio/crashMusic.mp3')
crashMusic.currentTime = 0;
crashMusic.volume = 0.3;

let gameOverMusic = new Audio ('mygame/audio/gameOverMusic.mp3');
gameOverMusic.volume = 0.3;
gameOverMusic.loop = false;

let missFailed = new Audio ('mygame/audio/missFailed.mp3');
missFailed.currentTime = 0;
missFailed.volume = 0.3;


// --- Input
document.addEventListener('keydown', (e) => {
  if (['KeyW','KeyS','ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();

  if (e.code in keys) keys[e.code] = true;

  if (e.code === 'Space') {
    if (state === 'gameOver') {          // neues Match nach Game Over
      scoreL = 0;
      scoreR = 0;
      winner = null;
      state = 'ready';
    }
    if (state !== 'playing') serve();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

// --- Helpers
function clearField() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPaddle(x, y, w, h) {
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, r) {
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = '#333';
  ctx.setLineDash([10, 12]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(FIELD_W / 2, 0);
  ctx.lineTo(FIELD_W / 2, FIELD_H);
  ctx.stroke();
  ctx.setLineDash([]);
}

function clampPaddle(p) {
  if (p.y < 0) p.y = 0;
  if (p.y + p.h > FIELD_H) p.y = FIELD_H - p.h;
}

// --- Game logic
function update(dt) {
  // paddles
  const vyL = (keys.KeyW ? -PADDLE_SPEED : 0) + (keys.KeyS ? PADDLE_SPEED : 0);
  left.y += vyL * dt;
  clampPaddle(left);

  const vyR = (keys.ArrowUp ? -PADDLE_SPEED : 0) + (keys.ArrowDown ? PADDLE_SPEED : 0);
  right.y += vyR * dt;
  clampPaddle(right);

  if (state !== 'playing') return;

  // ball move
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // top/bottom bounce
  if (ball.y - ball.r <= 0) {
    ball.y = ball.r;
    ball.vy *= -1;
  }
  if (ball.y + ball.r >= FIELD_H) {
    ball.y = FIELD_H - ball.r;
    ball.vy *= -1;
  }

  // left side: hit or miss
  if (ball.x - ball.r <= left.x + left.w) {
    const within = ball.y >= left.y && ball.y <= left.y + left.h;
    if (within) {
      const rel = (ball.y - (left.y + left.h / 2)) / (left.h / 2); // -1..+1
      const bounce = rel * MAX_BOUNCE_ANGLE;
      const speed  = Math.hypot(ball.vx, ball.vy) * 1.03;
      ball.vx =  Math.cos(bounce) * speed; // to right
      ball.vy =  Math.sin(bounce) * speed;
      ball.x  =  left.x + left.w + ball.r + 0.01;
      crashMusic.play();
    } else {
      scoreR++;           // Rechts bekommt den Punkt
      if (scoreR >= WIN_COINS) {  // R gewinnt
        winner = 'R';
        state  = 'gameOver';
         backgroundMusic.pause();
         backgroundMusic.currentTime = 0;
         gameOverMusic.play();
      } else {
        state = 'failed';
        missFailed.play();
      }
    }
  }

  // right side: hit or miss
  if (ball.x + ball.r >= right.x) {
    const within = ball.y >= right.y && ball.y <= right.y + right.h;
    if (within) {
      const rel = (ball.y - (right.y + right.h / 2)) / (right.h / 2);
      const bounce = rel * MAX_BOUNCE_ANGLE;
      const speed  = Math.hypot(ball.vx, ball.vy) * 1.03;
      ball.vx = -Math.cos(bounce) * speed; // to left
      ball.vy =  Math.sin(bounce) * speed;
      ball.x  =  right.x - ball.r - 0.01;
      crashMusic.play();
    } else {
      scoreL++;                 // Links bekommt den Punkt
      if (scoreL >= WIN_COINS) {  // L gewinnt
        winner = 'L';
        state  = 'gameOver';
        backgroundMusic.pause();  
        backgroundMusic.currentTime = 0;  
        gameOverMusic.play();
      } else {
        state = 'failed';
        missFailed.play();
      }
    }
  }
}

function serve() {
  // center ball
  ball.x = FIELD_W / 2;
  ball.y = FIELD_H / 2;

  // random direction/angle
  const dir = Math.random() < 0.5 ? -1 : 1;
  const angle = (Math.random() * 0.5 - 0.25); // ~ -0.25..0.25 rad
  ball.vx = Math.cos(angle) * BALL_SPEED * dir;
  ball.vy = Math.sin(angle) * BALL_SPEED;

  state = 'playing';

  backgroundMusic.play();

}

// --- Render
function draw() {
  clearField();
  drawCenterLine();
  drawPaddle(left.x,  left.y,  left.w,  left.h);
  drawPaddle(right.x, right.y, right.w, right.h);
  drawBall(ball.x, ball.y, ball.r);

  // score
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${scoreL} : ${scoreR}`, FIELD_W / 2, 12);

  // messages
  ctx.textAgameoverlign = 'center';
  ctx.textBaseline = 'middle';

  if (state === 'ready') {
    ctx.font = '26px Arial';
    ctx.fillStyle = '#1bad69';
    ctx.fillText('Drücke die Leertaste, um das Spiel zu starten', FIELD_W/2, FIELD_H/2);
  }

  if (state === 'failed') {
    ctx.font = '23px Arial';
    ctx.fillStyle = '#10a1bb';
    ctx.fillText('Punkt! Drücke Leertaste für den nächsten Aufschlag', FIELD_W/2, FIELD_H/2);
  }

  if (state === 'gameOver') {
    ctx.font = '26px Arial';
    ctx.fillStyle = '#ffca28';
    const text =
      winner === 'L' ? 'Spiel vorbei – Links gewinnt!' :
      winner === 'R' ? 'Spiel vorbei – Rechts gewinnt!' :
      'Spiel vorbei!';
    ctx.fillText(text, FIELD_W/2, FIELD_H/2 - 24);

    ctx.font = '18px Arial';
    ctx.fillText('Leertaste: Neues Match', FIELD_W/2, FIELD_H/2 + 16);
  }
}

// --- Loop
function loop(t) {
  const dt = Math.min(0.033, (t - last) / 1000);
  last = t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
