const rows = 16;
const columns = 12;
const gameBoard = document.getElementById("game-board");
const tileColors = ["red", "yellow", "green", "blue", "orange"];

function createBoard() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      gameBoard.appendChild(tile);
    }
  }
}
createBoard();
