const FILES = "abcdefgh";
const PIECE_SYMBOLS = "KQRBNPkqrbnp";
const DEFAULT_POSITION = "RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr";
const SQUARE_SIZE = 80;

const $board = $("#chessboard") as JQuery<HTMLDivElement>;
const positionForm = document.getElementById("start-position") as HTMLFormElement;
const positionInput = document.getElementById("fen-string") as HTMLInputElement;

class Board {
  currentPosition: Record<string, string> = {};
  beingDragged: HTMLImageElement | null = null;

  drawPieces = (fen: string) => {
    console.debug("drawPieces");
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
        alt="${char}">`;
        square.innerHTML += piece;
        this.currentPosition[FILES[file] + rank] = char;
        file++;
      } else {
        return;
      }
    }
  };

  drawBoard = () => {
    console.debug("drawBoard")
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isLightSquare = (rank + file) % 2 === 0;
        const $square = $(`
          <div
          id=${FILES[file] + (8 - rank)}
          class="square ${isLightSquare ? "light" : "dark"}">
          </div>`);
        $board.append($square);
      }
    }
  };

  handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const fen = positionInput.value;
    this.drawPieces(fen);
  };



  selectPiece = (e: JQuery.MouseDownEvent) => {
    const squareId = $(e.currentTarget).attr("id")!;
    if (!(squareId in this.currentPosition)) return;


    const $square = $(`#${squareId}`)
    const $piece = $square.children().first()
    this.dragPiece($square, $piece, e.pageX, e.pageY);
  };

  dragPiece = (square:JQuery<HTMLElement>, piece:JQuery<HTMLElement>, x:number, y:number) => {
    console.debug("dragging", square, piece, x, y)
    $(square).empty()
    $(piece).css({
      top: y - SQUARE_SIZE / 2,
      left: x - SQUARE_SIZE / 2
    })
  };
  // const dragOver = (e: DragEvent) => {
  //   e.preventDefault();
  // };

  // const dropPiece = (e: DragEvent) => {
  //   console.log("drop target=", e.target)
  //   const square = e.target as HTMLDivElement
  //   square.append(beingDragged)
  // };

}

const init = () => {
  const newBoard = new Board
  newBoard.drawBoard();
  positionForm.addEventListener("submit", newBoard.handleSubmit);
  $board.on("mousedown", ".square", newBoard.selectPiece);
  // $board.addEventListener("dragover", dragOver);
  // $board.addEventListener("drop", dropPiece)
}

$(init)