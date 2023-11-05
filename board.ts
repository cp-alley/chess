const SQUARE_SIZE = 80;
const LIGHT_SQUARE_COLOR = "#eaddd7";
const DARK_SQUARE_COLOR = "#846358";
const PIECE_OFFSET = 3;

const board = document.getElementById("chessboard") as HTMLCanvasElement;
const ctx = board.getContext("2d") as CanvasRenderingContext2D;

const drawBoard = () => {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const isLightSquare = (rank + file) % 2 === 0;

      ctx.fillStyle = isLightSquare ? LIGHT_SQUARE_COLOR : DARK_SQUARE_COLOR;
      ctx.fillRect(
        rank * SQUARE_SIZE,
        file * SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
      );
    }
  }
};

const drawPieces = () => {
  const bishop = new Image();
  bishop.addEventListener("load", () => {
    ctx.drawImage(
      bishop,
      4 * SQUARE_SIZE + PIECE_OFFSET,
      0 * SQUARE_SIZE + 2 * PIECE_OFFSET,
      SQUARE_SIZE - 2 * PIECE_OFFSET,
      SQUARE_SIZE - 2 * PIECE_OFFSET);
  });
  bishop.src = "./assets/pieces/bB.svg";
  // const bB = new Path2D("./assets/pieces/bB.svg");
  // console.log(bB)
  // ctx.stroke(bB);
};

window.addEventListener("load", drawBoard);

const START_BUTTON = document.getElementById("start-button") as HTMLButtonElement;
START_BUTTON.addEventListener("click", drawPieces);