const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const cellSize = 6;
const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const speedMs = 45;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyMap = {
  KeyW: ["p1", "up"],
  KeyS: ["p1", "down"],
  KeyA: ["p1", "left"],
  KeyD: ["p1", "right"],
  ArrowUp: ["p2", "up"],
  ArrowDown: ["p2", "down"],
  ArrowLeft: ["p2", "left"],
  ArrowRight: ["p2", "right"],
};

const opposite = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

let grid;
let players;
let running;
let timer;

function createPlayer(name, color, glow, x, y, direction) {
  return {
    name,
    color,
    glow,
    x,
    y,
    direction,
    alive: true,
  };
}

function resetGame() {
  grid = Array.from({ length: rows }, () => Array(cols).fill(0));

  players = {
    p1: createPlayer("Jugador 1", "#20ccff", "rgba(32, 204, 255, 0.8)", 10, Math.floor(rows / 2), "right"),
    p2: createPlayer("Jugador 2", "#ff9b3a", "rgba(255, 155, 58, 0.8)", cols - 11, Math.floor(rows / 2), "left"),
  };

  running = true;
  statusEl.textContent = "¡En marcha!";
  clearInterval(timer);
  timer = setInterval(gameLoop, speedMs);
  draw();
}

function insideGrid(x, y) {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

function markTrail(player) {
  if (!insideGrid(player.x, player.y)) {
    return;
  }
  grid[player.y][player.x] = player === players.p1 ? 1 : 2;
}

function tryMove(player) {
  if (!player.alive) {
    return;
  }

  const dir = DIRECTIONS[player.direction];
  const nx = player.x + dir.x;
  const ny = player.y + dir.y;

  if (!insideGrid(nx, ny)) {
    player.alive = false;
    return;
  }

  if (grid[ny][nx] !== 0) {
    player.alive = false;
    return;
  }

  player.x = nx;
  player.y = ny;
}

function drawGrid() {
  ctx.fillStyle = "#03050d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const cell = grid[y][x];
      if (cell === 0) {
        continue;
      }

      const isP1 = cell === 1;
      ctx.fillStyle = isP1 ? "#1dc9ff" : "#ff9333";
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function drawBike(player) {
  if (!player.alive) {
    return;
  }

  const px = player.x * cellSize;
  const py = player.y * cellSize;

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = player.glow;
  ctx.fillStyle = player.color;
  ctx.fillRect(px, py, cellSize, cellSize);
  ctx.restore();
}

function draw() {
  drawGrid();
  drawBike(players.p1);
  drawBike(players.p2);
}

function endRound() {
  running = false;
  clearInterval(timer);

  const p1Alive = players.p1.alive;
  const p2Alive = players.p2.alive;

  if (p1Alive && !p2Alive) {
    statusEl.textContent = "¡Jugador 1 gana!";
  } else if (p2Alive && !p1Alive) {
    statusEl.textContent = "¡Jugador 2 gana!";
  } else {
    statusEl.textContent = "Empate por choque.";
  }
}

function gameLoop() {
  if (!running) {
    return;
  }

  markTrail(players.p1);
  markTrail(players.p2);

  tryMove(players.p1);
  tryMove(players.p2);

  if (!players.p1.alive || !players.p2.alive) {
    draw();
    endRound();
    return;
  }

  draw();
}

window.addEventListener("keydown", (event) => {
  const mapped = keyMap[event.code];
  if (!mapped || !running) {
    return;
  }

  event.preventDefault();

  const [id, nextDir] = mapped;
  const player = players[id];
  if (opposite[player.direction] === nextDir) {
    return;
  }

  player.direction = nextDir;
});

restartBtn.addEventListener("click", resetGame);

resetGame();
