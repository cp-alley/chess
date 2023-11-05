const FILES = "abcdefgh";

const board = document.getElementById("chessboard") as HTMLDivElement;
const startButton = document.getElementById("start-button") as HTMLButtonElement;

const drawBoard = () => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const isLightSquare = (rank + file) % 2 === 0;
      const square = `<div
        id=${FILES[file]}${8 - rank}
        class="square ${isLightSquare ? "light" : "dark"}"></div>`;
      board.innerHTML += square;
    }
  }
};


window.addEventListener("load", drawBoard);

