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

// Set up the item data and score values using image paths
const itemDataObj = {
  products: [
    imagePaths.blueberry,
    imagePaths.strawberry,
    imagePaths.apple,
    imagePaths.banana,
    imagePaths.mango,
    imagePaths.pineapple,
    imagePaths.watermelon,
    imagePaths.melon,
    imagePaths.drink,
  ],
};

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
console.log("itemDataObj products:", itemDataObj.products);

// Define the sequence based on images
const emojiSequence = itemDataObj["products"];
const totalCells = 25;
const maxMoves = 14;
let gameOverScore = 100;

let board = document.getElementById("board");
let score = 0;
let moves = maxMoves;
let draggedElement = null;
let originalContent = "";
let originalCell = null;
let currentSequenceIndex = 0;
let touchStartX, touchStartY, touchElement, placeholder;

//skapa brädet med 25 celler
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("draggable", true);
    // Ersätt cellens textinnehåll med ett img-element
    const imgElement = document.createElement("img");
    imgElement.src = emojiSequence[i % emojiSequence.length]; // Sätt bildens src till rätt bild från sekvensen
    cell.appendChild(imgElement); // Lägg till img-elementet i cellen

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

// kontrollera om spelet är över
function checkGameOver() {
  console.log(`Checking game over: Score = ${score}, Moves = ${moves}`); // Felsökning: Visa aktuell poäng och antal drag
  if (score >= gameOverScore) {
    console.log("Game won, showing modal");
    showModal("You Win!");
  } else if (moves <= 0) {
    console.log("Game lost");
    showModal("Game Over!  Try again");
  }
}

// Visa modal med ett meddelande
function showModal(message) {
  console.log("Showing modal with message:", message);
  const modal = document.getElementById("gameModal");
  const modalMessage = document.getElementById("modalMessage");
  modalMessage.textContent = message;
  modal.style.display = "block";
}

function hideModal() {
  console.log("Hiding modal and reloading page");
  const modal = document.getElementById("gameModal");
  modal.style.display = "none";
  location.reload();
}

// Startar drag-eventet
// Startar drag-eventet
function handleDragStart(event) {
  if (event.target.classList.contains("locked")) return;
  draggedElement = event.target.closest(".cell");
  originalContent = draggedElement.querySelector("img").src; // Hämta bildens src istället för text
  originalCell = draggedElement;
  event.dataTransfer.setData("text/plain", originalContent);
  draggedElement.classList.add("dragging");
}

// Förhindra standardbeteende för att tillåta drop
function handleDragOver(event) {
  event.preventDefault();
}
// Hantera när ett element släpps på en annan cell och kontrollera om det är en matchning
function handleDrop(event) {
  event.preventDefault();
  const draggedEmoji = event.dataTransfer.getData("text/plain");
  const targetEmoji = event.target.closest(".cell").querySelector("img").src;

  // Kontrollera om matchningen är korrekt och inte är samma cell
  if (
    draggedEmoji === targetEmoji &&
    draggedElement !== event.target.closest(".cell")
  ) {
    incrementScore(draggedEmoji);
    moves--;
    document.getElementById("moves").textContent = moves;

    const nextEmojis = getNextTwoEmojis(draggedEmoji);
    if (nextEmojis) {
      originalCell.querySelector("img").src = nextEmojis[0];
      event.target.closest(".cell").querySelector("img").src = nextEmojis[1];
    }

    checkGameOver();
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

// touch-start händelsen
function handleTouchStart(event) {
  if (event.target.classList.contains("locked")) return;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchElement = event.target.closest(".cell");
  originalContent = touchElement.querySelector("img").src;
  originalCell = touchElement;

  touchElement.style.transform = "scale(1.5)";
  touchElement.style.transition = "transform 0.2s ease";

  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  placeholder = document.createElement("div");
  placeholder.className = "placeholder";
  const placeholderImg = document.createElement("img");
  placeholderImg.src = originalContent;
  placeholder.appendChild(placeholderImg);

  placeholder.style.position = "absolute";
  placeholder.style.left = `${touch.clientX - offsetX}px`;
  placeholder.style.top = `${touch.clientY - offsetY}px`;
  placeholder.style.pointerEvents = "none";
  document.body.appendChild(placeholder);

  touchElement.classList.add("dragging");
}

// touch-move händelsen
function handleTouchMove(event) {
  event.preventDefault();
  if (!touchElement) return;
  const touch = event.touches[0];

  // Använd offset för att centrera frukten under fingret
  const rect = touchElement.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;

  placeholder.style.left = `${touch.clientX - offsetX}px`; // Centrera X
  placeholder.style.top = `${touch.clientY - offsetY}px`; // Centrera Y
}

function handleTouchEnd(event) {
  if (!touchElement) return;
  const touch = event.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  if (
    dropTarget &&
    dropTarget.classList.contains("cell") &&
    dropTarget !== touchElement
  ) {
    const draggedEmoji = touchElement.querySelector("img").src;
    const targetEmoji = dropTarget.querySelector("img").src;

    if (draggedEmoji === targetEmoji) {
      incrementScore(draggedEmoji);
      moves--;
      document.getElementById("moves").textContent = moves;

      const nextEmojis = getNextTwoEmojis(draggedEmoji);
      if (nextEmojis) {
        originalCell.querySelector("img").src = nextEmojis[0];
        dropTarget.querySelector("img").src = nextEmojis[1];
      }
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

  if (placeholder) {
    document.body.removeChild(placeholder);
    placeholder = null;
  }
}

// Återställ emoji om det inte är en matchning
function returnEmojiToOriginalCell() {
  originalCell.querySelector("img").src = originalContent;
}

function getNextTwoEmojis(matchedEmoji) {
  const fileName = matchedEmoji.split("/").pop();
  const matchedIndex = emojiSequence.findIndex((image) =>
    image.includes(fileName)
  );

  // Om `matchedIndex` är -1 (dvs. `matchedEmoji` hittas inte), returnera två slumpmässiga emojis
  if (matchedIndex === -1) {
    console.log("Matched emoji not found in sequence, selecting random emojis");
    return [getRandomEmoji(), getRandomEmoji()];
  }

  let nextEmoji1 = getRandomEmoji();
  let nextEmoji2 = emojiSequence[(matchedIndex + 1) % emojiSequence.length];

  // Om `nextEmoji1` råkar bli samma som `nextEmoji2`, välj en ny `nextEmoji1`
  while (nextEmoji1 === nextEmoji2) {
    console.log("Duplicate emojis found, re-selecting nextEmoji1");
    nextEmoji1 = getRandomEmoji();
  }

  // Specifika regler för vissa emojis
  switch (fileName) {
    case "melon.png":
      nextEmoji1 = getRandomEmoji(); // Slumpmässig emoji
      nextEmoji2 = imagePaths.drink; // Nästa emoji är alltid "drink"
      break;
    case "banana.png":
      nextEmoji1 = getRandomEmoji();
      nextEmoji2 = imagePaths.mango;
      break;
    case "apple.png":
      nextEmoji1 = getRandomEmoji();
      nextEmoji2 = imagePaths.banana;
      break;
  }

  console.log("Next Emojis Selected:", nextEmoji1, nextEmoji2);
  return [nextEmoji1, nextEmoji2];
}

// Returnerar en slumpmässig emoji från sekvensen
function getRandomEmoji() {
  return emojiSequence[Math.floor(Math.random() * emojiSequence.length)];
}

// Hämta två slumpmässiga emojis från sekvensen
function getRandomTwoEmojis() {
  const randomIndex1 = Math.floor(Math.random() * emojiSequence.length);
  let randomIndex2;
  do {
    randomIndex2 = Math.floor(Math.random() * emojiSequence.length);
  } while (randomIndex2 === randomIndex1);
  return [emojiSequence[randomIndex1], emojiSequence[randomIndex2]];
}

function incrementScore(matchedEmoji) {
  const relativePath = `../images/${matchedEmoji.split("/").pop()}`;
  if (!(relativePath in scoreValues)) {
    console.error(
      `Error: ${relativePath} is not defined in scoreValues. Score will not be updated.`
    );
    return;
  }

  const valueToAdd = scoreValues[relativePath];

  if (typeof valueToAdd !== "number" || isNaN(valueToAdd)) {
    console.error(`Invalid score value for ${relativePath}:`, valueToAdd);
    return;
  }

  score += valueToAdd;
  document.getElementById("score").textContent = score;

  const progressBar = document.getElementById("progress-bar");
  let progress = (score / 100) * 100;
  progressBar.style.width = progress + "%";

  console.log(`Score updated: ${score}`);

  if (score >= 100) {
    console.log("Player won, showing modal...");
    showModal("You Win!");
    return;
  }
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
