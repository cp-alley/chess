const BOARD_WIDTH = 640;
const BOARD_HEIGHT = 640;

const board = document.getElementById("chessboard") as HTMLCanvasElement;
const ctx = board.getContext("2d") as CanvasRenderingContext2D;

for (let rank = 0; rank < 7; rank++) {
  for (let file = 0; file < 7; file ++) {
    const isLightSquare = (rank + file) % 2 === 0;

    ctx.fillStyle = isLightSquare ? "white" : "black";
    ctx.fillRect(rank*80,file*80,80,80)
  }
}