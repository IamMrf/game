const gameCanvas = document.getElementById("gameCanvas");
const green = document.getElementById("green");
const scoreBoard = document.getElementById("scoreBoard");
const pauseBtn = document.getElementById("pauseBtn");
const gameOverPopup = document.getElementById("gameOverPopup");
const finalScore = document.getElementById("finalScore");
const bgMusic = document.getElementById("bgMusic");

let redEnemies = [];
let gameOver = false;
let isPaused = false;
let score = 0;
let spawnRate = 1000;
let speedMultiplier = 1.5;
let spawnTimeout;
let gameAnimationFrame;

// Start the background music when the user clicks the screen
function playMusicOnInteraction() {
  // Attempt to play the music
  bgMusic.play().then(() => {
    console.log('Background music started successfully');
  }).catch((error) => {
    console.error("Error playing background music:", error);
    alert("An error occurred while trying to play the music. Please ensure the audio file is accessible.");
  });
  gameCanvas.removeEventListener("click", playMusicOnInteraction); // Remove listener after first interaction
}

gameCanvas.addEventListener("click", playMusicOnInteraction); // Play music on click

function spawnRed() {
  if (gameOver || isPaused) return;
  const red = document.createElement("div");
  red.classList.add("red");
  const edge = Math.floor(Math.random() * 4);
  let x, y;
  switch (edge) {
    case 0:
      x = Math.random() * window.innerWidth;
      y = 0;
      break;
    case 1:
      x = window.innerWidth;
      y = Math.random() * window.innerHeight;
      break;
    case 2:
      x = Math.random() * window.innerWidth;
      y = window.innerHeight;
      break;
    case 3:
      x = 0;
      y = Math.random() * window.innerHeight;
      break;
  }
  red.style.left = `${x}px`;
  red.style.top = `${y}px`;
  gameCanvas.appendChild(red);
  redEnemies.push({ element: red, x: x, y: y });
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function moveReds() {
  const greenX = window.innerWidth / 2;
  const greenY = window.innerHeight / 2;

  redEnemies.forEach((red, index) => {
    const dx = greenX - red.x;
    const dy = greenY - red.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / dist) * speedMultiplier;
    const vy = (dy / dist) * speedMultiplier;

    red.x += vx;
    red.y += vy;

    red.element.style.left = `${red.x}px`;
    red.element.style.top = `${red.y}px`;

    if (distance(red.x, red.y, greenX, greenY) < 40) {
      endGame(); // End game if a red enemy touches the green character
    }
  });
}

function endGame() {
  gameOver = true;
  gameOverPopup.style.display = 'block';
  finalScore.textContent = `Final Score: ${score}`;
  bgMusic.pause();
}

function gameLoop() {
  if (!gameOver && !isPaused) {
    moveReds();
    gameAnimationFrame = requestAnimationFrame(gameLoop);
  }
}

function spawnLoop() {
  if (!gameOver && !isPaused) {
    spawnRed();
    spawnTimeout = setTimeout(spawnLoop, spawnRate);
  }
}

function increaseDifficulty() {
  if (score % 5 === 0 && score !== 0) {
    if (spawnRate > 300) spawnRate -= 50;
    speedMultiplier += 0.2;
  }
}

gameCanvas.addEventListener("click", function (e) {
  redEnemies.forEach((red, index) => {
    const rect = red.element.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      red.element.classList.add("explode");
      setTimeout(() => {
        if (red.element.parentElement) {
          gameCanvas.removeChild(red.element);
        }
      }, 500); // Match this with the duration of the animation (0.5s)

      redEnemies.splice(index, 1);
      score++;
      scoreBoard.textContent = `Score: ${score}`;
      increaseDifficulty();
    }
  });
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  if (isPaused) {
    bgMusic.pause();
    cancelAnimationFrame(gameAnimationFrame);
    clearTimeout(spawnTimeout);
  } else {
    bgMusic.play();
    gameLoop();
    spawnLoop();
  }
});

// Restart the game
function restartGame() {
  gameOver = false;
  isPaused = false;
  score = 0;
  redEnemies = [];
  scoreBoard.textContent = `Score: ${score}`;
  gameOverPopup.style.display = 'none';
  green.style.top = "50%";
  green.style.left = "50%";

  const redElements = document.querySelectorAll(".red");
  redElements.forEach((red) => red.remove());

  bgMusic.currentTime = 0;
  bgMusic.play();

  spawnRate = 1000;
  speedMultiplier = 1.5;

  clearTimeout(spawnTimeout);
  cancelAnimationFrame(gameAnimationFrame);

  gameLoop();
  spawnLoop();
}

gameOverPopup.querySelector("button").addEventListener("click", restartGame);

gameLoop();
spawnLoop();
