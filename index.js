import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_SPEED_START = 1; // 1.0
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5; //58
const PLAYER_HEIGHT = 94 / 1.5; //62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: "images/cactus_1.png" },
  { width: 98 / 1.5, height: 100 / 1.5, image: "images/cactus_2.png" },
  { width: 68 / 1.5, height: 70 / 1.5, image: "images/cactus_3.png" },
];

let gamePaused = false;

// Quiz data
const quizQuestions = [
  {
    question: "What is a strong password?",
    options: ["12345", "password", "Long with symbols", "Your name"],
    correct: 3,
  },
  {
    question: "What should you avoid clicking on?",
    options: ["Secure websites", "Phishing links", "Legitimate emails", "Images"],
    correct: 2,
  },
];
let currentQuestionIndex = 0;

function updateProgressBar(score) {
  const progress = (score / 400) * 100;
  document.getElementById("progress-bar").style.width = progress + "%";
}

function showQuiz() {
  gamePaused = true;
  document.getElementById("quiz-modal").style.display = "block";
  const question = quizQuestions[currentQuestionIndex];
  document.getElementById("quiz-question").textContent = question.question;
  const buttons = document.querySelectorAll(".quiz-option");
  question.options.forEach((option, index) => {
    buttons[index].textContent = option;
  });
}

function answerQuestion(selectedOption) {
  const question = quizQuestions[currentQuestionIndex];
  if (selectedOption === question.correct) {
    alert("Correct!");
    resumeGame();
  } else {
    alert("Incorrect! Game Over.");
    reset();
  }
  document.getElementById("quiz-modal").style.display = "none";
  currentQuestionIndex = (currentQuestionIndex + 1) % quizQuestions.length;
}

function resumeGame() {
  gamePaused = false;
}

//Game Objects
let player = null;
let ground = null;
let cactiController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

function createSprites() {
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_AND_CACTUS_SPEED,
    scaleRatio
  );

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_AND_CACTUS_SPEED
  );

  score = new Score(ctx, scaleRatio);
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
//Use setTimeout on Safari mobile rotation otherwise works fine on desktop
window.addEventListener("resize", () => setTimeout(setScreen, 500));

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );

  const screenWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth
  );

  //window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("GAME OVER", x, y);
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameOver = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  gameSpeed = GAME_SPEED_START;
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "grey";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function checkForQuiz(score) {
  console.log("Checking for quiz at score:", score);
  if (score > 0 && score % 40 === 0 && !gamePaused) {
      showQuiz();
  }
}
function showQuiz() {
  gamePaused = true;  // Pause the game
  document.getElementById("quiz-modal").style.display = "block";  // Show quiz modal

  // Load the current quiz question
  const question = quizQuestions[currentQuestionIndex];
  document.getElementById("quiz-question").textContent = question.question;

  // Update buttons with options
  const buttons = document.querySelectorAll(".quiz-option");
  question.options.forEach((option, index) => {
      buttons[index].textContent = option;
  });
}
function gameLoop(currentTime) {
  console.log("Game loop running");
  if (previousTime === null) {
      previousTime = currentTime;
      requestAnimationFrame(gameLoop);
      return;
  }

  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameOver && !waitingToStart && !gamePaused) {
      // Update game objects only if not paused
      ground.update(gameSpeed, frameTimeDelta);
      cactiController.update(gameSpeed, frameTimeDelta);
      player.update(gameSpeed, frameTimeDelta);
      score.update(frameTimeDelta);
      score.update(frameTimeDelta);

      const currentScore = Math.floor(score.score);
      updateProgressBar(currentScore);
      checkForQuiz(currentScore);

      updateGameSpeed(frameTimeDelta);
  }

  if (!gameOver && cactiController.collideWith(player)) {
      gameOver = true;
      setupGameReset();
      score.setHighScore();
  }

  // Draw game objects
  ground.draw();
  cactiController.draw();
  player.draw();
  score.draw();

  if (gameOver) {
      showGameOver();
  }

  if (waitingToStart) {
      showStartGameText();
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });
