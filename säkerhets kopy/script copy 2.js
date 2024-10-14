// Global variable for image paths
const imagePaths = {
  blueberry: "../images/blueberry.png",
  strawberry: "../images/strawberry.png",
  apple: "../images/apple.png",
  banana: "../images/banana.png",
  mango: "../images/mango.png",
  pineapple: "../images/pineapple.png",
  watermelon: "../images/watermelon.png",
  melon: "../images/melon.png",
  drink: "../images/drink.png",
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
  imagePaths.melon,
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
  [imagePaths.melon]: 8,
  [imagePaths.drink]: 9,
};

const totalCells = 25;
const maxMoves = 14;
let gameOverScore = 100;

let board = document.getElementById("board");
let score = 0;
let moves = maxMoves;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let touchElement = null;
let placeholder = null;

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

function checkGameOver() {
  if (score >= gameOverScore) showModal("You Win!");
  else if (moves <= 0) showModal("Game Over! Try again");
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

// Prevent default to allow drop
function handleDragOver(event) {
  event.preventDefault();
}

// Handle drop event and check for matches
function handleDrop(event) {
  event.preventDefault();
  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetEmoji = event.target.closest(".cell").querySelector("img").src;

  if (
    draggedEmoji === targetEmoji &&
    draggedElement !== event.target.closest(".cell")
  ) {
    incrementScore(draggedEmoji);
    moves--;
    document.getElementById("moves").textContent = moves;

    const nextEmojis = getNextTwoEmojis(draggedEmoji);
    originalCell.querySelector("img").src = nextEmojis[0];
    event.target.closest(".cell").querySelector("img").src = nextEmojis[1];

    checkGameOver();
  } else {
    returnEmojiToOriginalCell();
  }
}

// End drag event and reset variables
function handleDragEnd(event) {
  draggedElement.classList.remove("dragging");
  draggedElement = null;
  originalContent = "";
  originalCell = null;
}

// Return emoji to the original cell if no match
function returnEmojiToOriginalCell() {
  // Show the original image again
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

// Handle touch move event
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

    if (draggedEmoji === targetEmoji) {
      incrementScore(draggedEmoji);
      moves--;
      document.getElementById("moves").textContent = moves;

      const nextEmojis = getNextTwoEmojis(draggedEmoji);
      originalCell.querySelector("img").src = nextEmojis[0];
      touchElement.querySelector("img").src = nextEmojis[1];

      checkGameOver();
    } else {
      returnEmojiToOriginalCell();
    }
  }

  if (placeholder) placeholder.remove();
  if (draggedElement)
    draggedElement.querySelector("img").style.visibility = "visible"; // Show the original image again
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

// Increase score based on the matched emoji
function incrementScore(matchedEmoji) {
  const relativePath = `../images/${matchedEmoji.split("/").pop()}`;
  if (!(relativePath in scoreValues)) return;

  score += scoreValues[relativePath];
  document.getElementById("score").textContent = score;
  document.getElementById("progress-bar").style.width = `${
    (score / gameOverScore) * 100
  }%`;
  if (score >= gameOverScore) showModal("You Win!");
}

// Reset and create a new board
function resetGame() {
  hideModal();
  score = 0;
  moves = maxMoves;
  document.getElementById("score").textContent = score;
  document.getElementById("moves").textContent = moves;
  document.getElementById("progress-bar").style.width = "0%";
  createBoard();
}

// Event listeners for reset button and modal
document.getElementById("resetButton").addEventListener("click", resetGame);
createBoard();
document.getElementById("modalButton").addEventListener("click", hideModal);
document.querySelector(".modal .close").addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("gameModal")) hideModal();
});
