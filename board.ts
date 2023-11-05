const SQUARE_SIZE = 80;
const LIGHT_SQUARE_COLOR = "#eaddd7";
const DARK_SQUARE_COLOR = "#846358";

const board = document.getElementById("chessboard") as HTMLCanvasElement;
const ctx = board.getContext("2d") as CanvasRenderingContext2D;

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