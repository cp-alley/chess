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

  drawPieces = (fen: string) => {
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
          alt="${pieceId}"
          draggable="true">`);
        $piece.appendTo($square);
        this.currentPosition[FILES[file] + rank] = pieceId;
        file++;
      } else {
        return;
      }
    }
  };

  drawBoard = () => {
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
  };

  getSquareOffsets = () => {
    this.squareOffsets = {};
    const $squares = $(".square");
    for (const square of $squares) {
      const id = $(square).attr("id") as string;
      this.squareOffsets[id] = $(square).offset() as OffsetInterface;
    }
  };

  getSquareByLocation = (x: number, y: number) => {
    for (const square in this.squareOffsets) {
      const sq = this.squareOffsets[square];
      if (
        x >= sq.left &&
        x < sq.left + SQUARE_SIZE &&
        y >= sq.top &&
        y < sq.top + SQUARE_SIZE
      )
        return square;
    }

    return "offboard";
  };

  // selectPiece = (e: JQuery.DragStartEvent) => {
  //   e.preventDefault();
  //   console.log(e)

  //   const squareId = $(e.currentTarget).attr("id")!;
  //   if (!(squareId in this.currentPosition)) return;

  //   const $square = $(`#${squareId}`);
  //   const $piece = $square.children().first();
  //   this.beingDragged = $piece;
  //   this.isDragging = true;

  //   // $(this.beingDragged).css({
  //   //   display: "",
  //   //   position: "absolute",
  //   //   top: e.pageY - SQUARE_SIZE / 2,
  //   //   left: e.pageX - SQUARE_SIZE / 2,
  //   // });
  // };

  // dragPiece = (x: number, y: number) => {
  //   if (this.beingDragged) {
  //     $(this.beingDragged).css({
  //       top: y - SQUARE_SIZE / 2,
  //       left: x - SQUARE_SIZE / 2,
  //     });
  //   }
  // };

  // dropPiece = (x: number, y: number) => {
  //   this.isDragging = false;

  //   this.getSquareOffsets();
  //   const squareId = this.getSquareByLocation(x, y);

  //   if (this.beingDragged) {
  //     $(this.beingDragged).css({
  //       display: "block",
  //       position: "",
  //     });

  //     if (squareId !== "offboard") {
  //       const $square = $(`#${squareId}`);
  //       $square.empty();
  //       $square.append(this.beingDragged);
  //       this.currentPosition[squareId] = $(this.beingDragged).attr(
  //         "id"
  //       ) as string;
  //     }
  //   }
  // };

  // dropPiece = ($square: JQuery<HTMLElement>) => {
  //   this.isDragging = false;

  //   if (this.beingDragged) {
  //     $(this.beingDragged).css({
  //       display: "block",
  //       position: "",
  //     });

  //     $square.empty();
  //     console.log("$square=", $square);
  //     $square.append(this.beingDragged);
  //     const squareId = $square.attr("id") as string;
  //     this.currentPosition[squareId] = $(this.beingDragged).attr(
  //       "id"
  //     ) as string;
  //   }
  // };

  // handleDrag = (e: JQuery.MouseMoveEvent) => {
  //   e.preventDefault();
  //   if (this.isDragging) {
  //     this.dragPiece(e.pageX, e.pageY);
  //   }
  // };

  // stopDrag = (e: JQuery.MouseUpEvent) => {
  //   e.preventDefault();
  //   if (!this.isDragging) return;
  //   // console.log(e);
  //   const $targetSquare = $(e.currentTarget);
  //   this.dropPiece(e.pageX, e.pageY);
  //   // this.dropPiece($targetSquare);
  // };
  dragPiece = (e: JQuery.DragStartEvent) => {
    this.beingDragged = $(e.target) as JQuery<HTMLImageElement>;
  };

  dragOver = (e: JQuery.DragOverEvent) => {
    e.preventDefault();
  };

  dropPiece = (e: JQuery.DropEvent) => {
    const square = $(e.target);
    square.append(this.beingDragged as JQuery<HTMLImageElement>);
  };

  handleSubmit = (e: JQuery.SubmitEvent) => {
    e.preventDefault();
    const fen = $positionInput.val() || DEFAULT_POSITION;
    this.drawPieces(fen);
  };
}

const init = () => {
  console.debug("Board init");
  const newBoard = new Board();
  newBoard.drawBoard();
  $positionForm.on("submit", newBoard.handleSubmit);
  $positionInput.val(DEFAULT_POSITION);
  $board
    .on("dragstart", ".square", newBoard.dragPiece)
    .on("dragover", newBoard.dragOver)
    .on("drop", ".square", newBoard.dropPiece);
};

$(init);
