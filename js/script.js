const itemDataObj = {
  "🥥": ["🫐", "🍓", "🍏", "🍌", "🥭", "🍍", "🍉", "🍈", "🍹"],
};

const scoreValues = {
  "🫐": 1,
  "🍓": 2,
  "🍏": 3,
  "🍌": 4,
  "🥭": 5,
  "🍍": 6,
  "🍉": 7,
  "🍈": 8,
  "🍹": 9,
};

const emojiSequence = itemDataObj["🥥"];
const totalCells = 25;
const maxMoves = 14;
let gameOverScore = 100;

let board = document.getElementById("board");
let score = 0;
let moves = maxMoves;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let touchStartX, touchStartY, touchElement, placeholder;

/* Skapar spelbrädet med celler */
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("draggable", true);
    cell.textContent = emojiSequence[i % emojiSequence.length];

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
  if (score >= gameOverScore) {
    showModal("You Win!");
  } else if (moves <= 0) {
    showModal("Game Over! Try again");
  }
}

function showModal(message) {
  const modal = document.getElementById("gameModal");
  const modalMessage = document.getElementById("modalMessage");
  modalMessage.textContent = message;
  modal.style.display = "block";
}

function hideModal() {
  const modal = document.getElementById("gameModal");
  modal.style.display = "none";
  location.reload();
}

function handleDragStart(event) {
  if (event.target.classList.contains("locked")) return;
  draggedElement = event.target;
  originalContent = draggedElement.textContent;
  originalCell = draggedElement;
  event.dataTransfer.setData("text/plain", draggedElement.textContent);
  draggedElement.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
}

/* Hanterar när ett element släpps på en annan cell och kontrollerar om det är en matchning */
function handleDrop(event) {
  event.preventDefault();
  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetEmoji = event.target.textContent;

  if (draggedEmoji === targetEmoji && draggedElement !== event.target) {
    incrementScore(draggedEmoji);
    moves--;
    document.getElementById("moves").textContent = moves;

    updateEmojisAfterMatch(draggedEmoji, originalCell, event.target);
    checkGameOver();
  } else {
    returnEmojiToOriginalCell();
  }
}

/* Återställer status efter att ett element har släppts */
function handleDragEnd(event) {
  draggedElement.classList.remove("dragging");
  draggedElement = null;
  originalContent = "";
  originalCell = null;
}

/* Hanterar när användaren påbörjar en touch-händelse */
function handleTouchStart(event) {
  if (event.target.classList.contains("locked")) return;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchElement = event.target;
  originalContent = touchElement.textContent;
  originalCell = touchElement;

  touchElement.style.transform = "scale(1.5)";
  touchElement.style.transition = "transform 0.2s ease";

  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  placeholder.textContent = originalContent;
  placeholder.style.position = "absolute";
  placeholder.style.left = `${touch.clientX - offsetX}px`;
  placeholder.style.top = `${touch.clientY - offsetY}px`;
  placeholder.style.pointerEvents = "none";
  placeholder.style.fontSize = "3rem";
  document.body.appendChild(placeholder);

  touchElement.classList.add("dragging");
}

/*Hanterar rörelse av touch-händelse genom att flytta elementet */
function handleTouchMove(event) {
  event.preventDefault();
  if (!touchElement) return;
  const touch = event.touches[0];
  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;
  placeholder.style.left = `${touch.clientX - offsetX}px`;
  placeholder.style.top = `${touch.clientY - offsetY}px`;
}

/*Hanterar när användaren släpper elementet efter touch och kontrollerar om det är en matchning */
function handleTouchEnd(event) {
  if (!touchElement) return;
  const touch = event.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  if (
    dropTarget &&
    dropTarget.classList.contains("cell") &&
    dropTarget !== touchElement
  ) {
    const draggedEmoji = touchElement.textContent;
    const targetEmoji = dropTarget.textContent;

    if (draggedEmoji === targetEmoji) {
      incrementScore(draggedEmoji);
      moves--;
      document.getElementById("moves").textContent = moves;

      updateEmojisAfterMatch(draggedEmoji, originalCell, dropTarget);
      checkGameOver();
    } else {
      returnEmojiToOriginalCell();
    }
  } else {
    returnEmojiToOriginalCell();
  }

  touchElement.style.transform = "scale(1)";
  touchElement.style.transition = "transform 0.2s ease";
  touchElement.classList.remove("dragging");
  touchElement = null;
  document.body.removeChild(placeholder);
}

function returnEmojiToOriginalCell() {
  originalCell.textContent = originalContent;
}

/* Returnerar nästa emoji i sekvensen efter en matchning */
function getNextEmoji(matchedEmoji) {
  const matchedIndex = emojiSequence.indexOf(matchedEmoji);
  return emojiSequence[(matchedIndex + 1) % emojiSequence.length];
}

/* Returnerar en slumpmässig emoji från sekvensen */
function getRandomEmoji() {
  return emojiSequence[Math.floor(Math.random() * emojiSequence.length)];
}

/* Uppdaterar cellernas emojis efter en lyckad matchning */
function updateEmojisAfterMatch(matchedEmoji, firstCell, secondCell) {
  const nextEmoji = getNextEmoji(matchedEmoji);
  if (matchedEmoji === "🍹") {
    firstCell.textContent = getRandomEmoji();
    secondCell.textContent = getRandomEmoji();
  } else {
    firstCell.textContent = nextEmoji;
    secondCell.textContent = getRandomEmoji();
  }
}

/*Ökar spelarens poäng baserat på vilken emoji som matchades */
function incrementScore(matchedEmoji) {
  score += scoreValues[matchedEmoji];
  document.getElementById("score").textContent = score;
  const progressBar = document.getElementById("progress-bar");
  let progress = (score / gameOverScore) * 100;
  progressBar.style.width = progress + "%";
}

function resetGame() {
  hideModal();
  score = 0;
  moves = maxMoves;
  document.getElementById("score").textContent = score;
  document.getElementById("moves").textContent = moves;
  document.getElementById("progress-bar").style.width = "0%";
  createBoard();
}

document.getElementById("resetButton").addEventListener("click", resetGame);
createBoard();
document.getElementById("modalButton").addEventListener("click", hideModal);
document.querySelector(".modal .close").addEventListener("click", hideModal);
window.addEventListener("click", function (event) {
  const modal = document.getElementById("gameModal");
  if (event.target === modal) {
    hideModal();
  }
});
