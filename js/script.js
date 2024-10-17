// Global variable for image paths
const imagePaths = {
  blueberry: "https://content.adoveodemo.com/1727183549946_purple-candy.png",
  strawberry: "https://content.adoveodemo.com/1727183591584_red-special.png",
  apple: "https://content.adoveodemo.com/1729086289157_par.png",
  banana: "https://clipground.com/images/png-banana-8.png",
  mango: "https://content.adoveodemo.com/1727183570118_blue-special.png",
  pineapple: "https://content.adoveodemo.com/1727183544758_yellow-special.png",
  watermelon: "https://content.adoveodemo.com/1727183563661_green-special.png",
  drink: "https://content.adoveodemo.com/1727183584324_color-bomb.png",
};

// Array with all image paths for the game

const emojiSequence = [
  imagePaths.blueberry,
  imagePaths.strawberry,
  imagePaths.apple,
  imagePaths.banana,
  imagePaths.mango,
  imagePaths.pineapple,
  imagePaths.watermelon,
  imagePaths.drink,
];

// Score values for each image
const scoreValues = {
  [imagePaths.blueberry]: 1,
  [imagePaths.strawberry]: 2,
  [imagePaths.apple]: 3,
  [imagePaths.banana]: 4,
  [imagePaths.mango]: 5,
  [imagePaths.pineapple]: 6,
  [imagePaths.watermelon]: 7,
  [imagePaths.drink]: 9,
};

const totalCells = 25;
const MaxMovesAndGoalScore = 20;

let board = document.getElementById("board");
let score = 0;
let moves = MaxMovesAndGoalScore;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let touchElement = null;
let placeholder = null;
let gameMode = "Version1"; // Default version

const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const goalsSection = document.getElementById("goalsSection");
const movesSection = document.getElementById("movesSection");

const moveButton = document.getElementById("Limited_number_of_moves");
moveButton.addEventListener("click", () => {
  gameMode = "Version 1";
  resetGameVersion1();
});

const scoreButton = document.getElementById("Unlimited_number_of_moves");
scoreButton.addEventListener("click", () => {
  gameMode = "Version2";
  initVersion2();
});

function switchGameMode() {
  if (gameMode === "Version 1") {
    initVersion2();
    gameMode = "Version2";
    console.log("Switched to Version2: Unlimited Moves");
  } else {
    resetGameVersion1();
    gameMode = "Version 1";
    console.log("Switched to Version 1: Limited Moves");
  }
}

const nrOfGols = document.getElementById("goalsSection");
nrOfGols.innerHTML = "Goals: " + MaxMovesAndGoalScore;
const nrOfMoves = document.getElementById("moves");
nrOfMoves.innerHTML = MaxMovesAndGoalScore;

if (gameMode === "Version1") {
  nrOfGols.style.display = "none";
} else {
  nrOfGols.style.display = "block";
}
function resetGameVersion1() {
  gameMode = "Version1";
  score = 0;
  moves = MaxMovesAndGoalScore;
  scoreDisplay.textContent = score;
  movesDisplay.textContent = moves;

  movesSection.style.display = "block";
  goalsSection.style.display = "none";

  createBoard();
}
// Create game board with random images in each cell
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("draggable", true);
    const imgElement = document.createElement("img");
    imgElement.src = getRandomEmoji();
    cell.appendChild(imgElement);

    cell.addEventListener("dragstart", handleDragStart);
    cell.addEventListener("dragover", handleDragOver);
    cell.addEventListener("drop", handleDrop);
    cell.addEventListener("dragend", handleDragEnd);

    cell.addEventListener("touchstart", handleTouchStart);
    cell.addEventListener("touchmove", handleTouchMove);
    cell.addEventListener("touchend", handleTouchEnd);

    board.appendChild(cell);
  }
}
function initVersion2() {
  gameMode = "Version2";
  score = 0;
  moves = Infinity;

  movesSection.style.display = "none";
  goalsSection.style.display = "block";

  scoreDisplay.textContent = score;
  document.getElementById("progress-bar").style.width = "0%";

  createBoard();
}

function checkGameOver() {
  if (gameMode === "Version1") {
    if (moves <= 0)
      showModal(
        `Game Over! You scored ${score} points in ${MaxMovesAndGoalScore} moves. Try again!`
      );
  } else if (gameMode === "Version2") {
    if (score >= MaxMovesAndGoalScore)
      showModal(`Congratulations! You reached ${score} points! You Win!`);
  }
}

function showModal(message) {
  const modal = document.getElementById("gameModal");
  document.getElementById("modalMessage").textContent = message;
  modal.style.display = "block";
}

function hideModal() {
  document.getElementById("gameModal").style.display = "none";
  location.reload();
}

function handleDragStart(event) {
  draggedElement = event.target.closest(".cell");
  originalContent = draggedElement.querySelector("img").src;
  originalCell = draggedElement;
  event.dataTransfer.setData("text/plain", originalContent);
  draggedElement.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
}
function handleDrop(event) {
  event.preventDefault();
  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetCell = event.target.closest(".cell");
  const targetEmoji = targetCell.querySelector("img").src;

  // Använd bara filnamnet för jämförelse
  const draggedEmojiFile = draggedEmoji.split("/").pop();
  const targetEmojiFile = targetEmoji.split("/").pop();

  if (draggedEmojiFile === targetEmojiFile && draggedElement !== targetCell) {
    incrementScore(draggedEmoji);
    moves--;
    document.getElementById("moves").textContent = moves;
    draggedElement.classList.add("matched");
    targetCell.classList.add("matched");

    const nextEmojis = getNextTwoEmojis(draggedEmoji);
    originalCell.querySelector("img").src = nextEmojis[0];
    targetCell.querySelector("img").src = nextEmojis[1];

    checkGameOver();

    setTimeout(() => {
      if (draggedElement) {
        draggedElement.classList.remove("matched");
      }
      if (targetCell) {
        targetCell.classList.remove("matched");
      }
    }, 1500);
  } else {
    returnEmojiToOriginalCell();
  }
}

function handleDragEnd(event) {
  draggedElement.classList.remove("dragging");
  draggedElement = null;
  originalContent = "";
  originalCell = null;
}

// Return img to the original cell if no match
function returnEmojiToOriginalCell() {
  originalCell.querySelector("img").style.visibility = "visible";
}

function handleTouchStart(event) {
  const touch = event.touches[0];
  draggedElement = document
    .elementFromPoint(touch.clientX, touch.clientY)
    .closest(".cell");
  originalContent = draggedElement.querySelector("img").src;
  originalCell = draggedElement;
  draggedElement.querySelector("img").style.visibility = "hidden"; // Hide the original image in cell

  // Create visual copy of the element being dragged
  placeholder = createPlaceholder(originalContent);
  document.body.appendChild(placeholder);
  movePlaceholder(touch.clientX, touch.clientY);
}

function handleTouchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  movePlaceholder(touch.clientX, touch.clientY);
  touchElement = document
    .elementFromPoint(touch.clientX, touch.clientY)
    .closest(".cell");
}

// Handle touch end event
function handleTouchEnd(event) {
  if (touchElement && touchElement !== originalCell) {
    const draggedEmoji = originalContent;
    const targetEmoji = touchElement.querySelector("img").src;

    if (draggedEmoji.trim() === targetEmoji.trim()) {
      console.log("Match found!");
      incrementScore(draggedEmoji);
      moves--;
      document.getElementById("moves").textContent = moves;

      const nextEmojis = getNextTwoEmojis(draggedEmoji);
      originalCell.querySelector("img").src = nextEmojis[0];
      touchElement.querySelector("img").src = nextEmojis[1];

      draggedElement.classList.add("matched");
      touchElement.classList.add("matched");
      checkGameOver();
    } else {
      returnEmojiToOriginalCell();
      console.log("No match found.");
    }
  }

  if (placeholder) placeholder.remove();
  if (draggedElement)
    draggedElement.querySelector("img").style.visibility = "visible";
  draggedElement = null;
  touchElement = null;
  placeholder = null;
}

// Create a visual placeholder for the dragged element
function createPlaceholder(src) {
  const placeholder = document.createElement("img");
  placeholder.src = src;
  placeholder.style.position = "absolute";
  placeholder.style.width = "50px";
  placeholder.style.height = "50px";
  placeholder.style.pointerEvents = "none";
  return placeholder;
}

function movePlaceholder(x, y) {
  placeholder.style.left = `${x - placeholder.width / 2}px`;
  placeholder.style.top = `${y - placeholder.height / 2}px`;
}

// Get the next two emojis based on the matched emoji
function getNextTwoEmojis(matchedEmoji) {
  const fileName = matchedEmoji.split("/").pop();
  const matchedIndex = emojiSequence.findIndex((image) =>
    image.includes(fileName)
  );
  if (matchedIndex === -1) return [getRandomEmoji(), getRandomEmoji()];

  let nextEmoji1 = getRandomEmoji();
  let nextEmoji2 = emojiSequence[(matchedIndex + 1) % emojiSequence.length];
  while (nextEmoji1 === nextEmoji2) nextEmoji1 = getRandomEmoji();

  if (fileName === "melon.png") nextEmoji2 = imagePaths.drink;
  return [nextEmoji1, nextEmoji2];
}

function getRandomEmoji() {
  return emojiSequence[Math.floor(Math.random() * emojiSequence.length)];
}

function incrementScore(matchedEmoji) {
  const emojiFileName = matchedEmoji.split("/").pop();
  if (!Object.keys(scoreValues).some((path) => path.includes(emojiFileName)))
    return;
  score +=
    scoreValues[
      Object.keys(scoreValues).find((path) => path.includes(emojiFileName))
    ];
  document.getElementById("score").textContent = score;

  document.getElementById("progress-bar").style.width = `${
    (score / MaxMovesAndGoalScore) * 100
  }%`;

  checkGameOver();
}

function resetGameVersion2() {
  score = 0;
  moves = Infinity;
  document.getElementById("score").textContent = score;
  document.getElementById("progress-bar").style.width = "0%";

  const movesSection = document.getElementById("movesSection");
  const goalsSection = document.getElementById("goalsSection");

  if (movesSection) movesSection.style.display = "none";
  if (goalsSection) goalsSection.style.display = "block";

  createBoard();
}

// Function call to start Version2 game manually
//initVersion2();

function resetGame() {
  location.reload();
}

// Event listeners for reset button and modal
createBoard();
document.getElementById("modalButton").addEventListener("click", hideModal);
document.querySelector(".modal .close").addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("gameModal")) hideModal();
});
