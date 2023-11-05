const FILES = "abcdefgh";
const PIECE_SYMBOLS = "KQRBNPkqrbnp";
const DEFAULT_POSITION = "RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr";

const board = document.getElementById("chessboard") as HTMLDivElement;
const positionForm = document.getElementById("start-position") as HTMLFormElement;
const positionInput = document.getElementById("fen-string") as HTMLInputElement;

const drawPieces = (fen: string) => {
  console.log("drawBoard");
  let rank = 8;
  let file = 0;
  for (const char of fen) {
    if (char === "/") {
      rank--;
      file = 0;
    } else if ("12345678".includes(char)) {
      file += Number(char);
    } else if (PIECE_SYMBOLS.includes(char)) {
      const square = document.getElementById(`${FILES[file] + rank}`) as HTMLDivElement;
      const isBlackPiece = char === char.toUpperCase();
      const piece = `<img
        class="piece"
        src="./assets/pieces/${(isBlackPiece ? "b" : "w") + char.toUpperCase()}.svg"
        alt="${char}"
        draggable=true>`;
      square.innerHTML += piece;
      file++;
    } else {
      return;
    }
  }
};

const drawBoard = () => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const isLightSquare = (rank + file) % 2 === 0;
      const square = `<div
        id=${FILES[file] + (8 - rank)}
        class="square ${isLightSquare ? "light" : "dark"}"></div>`;
      board.innerHTML += square;
    }
  }
};

const handleSubmit = (e: SubmitEvent) => {
  e.preventDefault();
  const fen = positionInput.value;
  drawPieces(fen);
};

let beingDragged: HTMLImageElement;

const dragPiece = (e: DragEvent) => {
  beingDragged = e.target as HTMLImageElement;
};

const dragOver = (e: DragEvent) => {
  e.preventDefault();
};

const dropPiece = (e: DragEvent) => {
  console.log("drop target=", e.target)
  const square = e.target as HTMLDivElement
  square.append(beingDragged)
};

window.addEventListener("load", drawBoard);
positionForm.addEventListener("submit", handleSubmit);
board.addEventListener("dragstart", dragPiece);
board.addEventListener("dragover", dragOver);
board.addEventListener("drop", dropPiece)