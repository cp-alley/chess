const FILES = "abcdefgh";
const PIECE_SYMBOLS = "KQRBNPkqrbnp";
const DEFAULT_POSITION =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const SQUARE_SIZE = 80;

const $board = $("#chessboard") as JQuery<HTMLDivElement>;
const $positionForm = $("#start-position") as JQuery<HTMLFormElement>;
const $positionInput = $("#fen-string") as JQuery<HTMLInputElement>;

interface OffsetInterface {
  top: number;
  left: number;
}

class Board {
  currentPosition: Record<string, string> = {};
  beingDragged: JQuery<HTMLElement> | null = null;
  isDragging: boolean = false;
  squareOffsets: Record<string, OffsetInterface> = {};

  drawPieces(fen: string) {
    console.debug("drawPieces");
    $(".square").empty();
    let rank = 8;
    let file = 0;
    for (const char of fen) {
      if (char === "/") {
        rank--;
        file = 0;
      } else if ("12345678".includes(char)) {
        file += Number(char);
      } else if (PIECE_SYMBOLS.includes(char)) {
        const $square = $(`#${FILES[file] + rank}`) as JQuery<HTMLDivElement>;
        const isWhitePiece = char === char.toUpperCase();
        const pieceId = (isWhitePiece ? "w" : "b") + char.toUpperCase();
        const $piece = $(`
        <img
          id=${pieceId}
          class="piece"
          src="./assets/pieces/${pieceId}.svg"
          alt="${pieceId}">`);
        $piece.appendTo($square);
        this.currentPosition[FILES[file] + rank] = pieceId;
        file++;
      } else {
        return;
      }
    }
  }

  drawBoard() {
    console.debug("drawBoard");
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
  }

  dragPiece(e: JQuery.DragStartEvent) {
    this.beingDragged = $(e.target) as JQuery<HTMLElement>;
  }

  dragOver(e: JQuery.DragOverEvent) {
    e.preventDefault();
  }

  dropPiece(e: JQuery.DropEvent) {
    const $square = $(e.currentTarget);
    $square.empty();
    this.beingDragged?.parent().empty();
    $square.append(this.beingDragged as JQuery<HTMLElement>);
  }

  handleSubmit(e: JQuery.SubmitEvent) {
    e.preventDefault();
    const fen = $positionInput.val() || DEFAULT_POSITION;
    this.drawPieces(fen);
  }
}

const init = () => {
  console.debug("Board init");
  const newBoard = new Board();
  newBoard.drawBoard();
  $positionForm.on("submit", newBoard.handleSubmit.bind(newBoard));
  $positionInput.val(DEFAULT_POSITION);
  $board
    .on("dragstart", ".square", newBoard.dragPiece.bind(newBoard))
    .on("dragover", newBoard.dragOver)
    .on("drop", ".square", newBoard.dropPiece.bind(newBoard));
};

$(init);
