const FILES = "abcdefgh";
const PIECE_SYMBOLS = "KQRBNPkqrbnp";
const DEFAULT_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const SQUARE_SIZE = 80;

const $board = $("#chessboard") as JQuery<HTMLDivElement>;
const positionForm = document.getElementById("start-position") as HTMLFormElement;
const positionInput = document.getElementById("fen-string") as HTMLInputElement;

interface OffsetInterface {
  top: number,
  left: number
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
        const square = document.getElementById(`${FILES[file] + rank}`) as HTMLDivElement;
        const isWhitePiece = char === char.toUpperCase();
        const piece = `<img
        class="piece"
        src="./assets/pieces/${(isWhitePiece ? "w" : "b") + char.toUpperCase()}.svg"
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
    this.squareOffsets = {}
    const $squares = $(".square")
    for (const square of $squares) {
      const id = $(square).attr("id") as string
      this.squareOffsets[id] = $(square).offset() as OffsetInterface
    }
  }

  getSquareByLocation = (x: number, y: number) => {
    for (const square in this.squareOffsets) {
      const sq = this.squareOffsets[square]
      if (
        x >= sq.left &&
        x < sq.left + SQUARE_SIZE &&
        y >= sq.top &&
        y < sq.top + SQUARE_SIZE) return square
    }

    return "offboard"
  }

  selectPiece = (e: JQuery.MouseDownEvent) => {
    const squareId = $(e.currentTarget).attr("id")!;
    if (!(squareId in this.currentPosition)) return;

    const $square = $(`#${squareId}`);
    const $piece = $square.children().first();
    this.beingDragged = $piece;
    this.isDragging = true;
    $(this.beingDragged).css({
      display: "",
      position: "absolute",
      top: e.pageY - SQUARE_SIZE / 2,
      left: e.pageX - SQUARE_SIZE / 2
    });
  };

  dragPiece = (x: number, y: number) => {
    if (this.beingDragged) {
      $(this.beingDragged).css({
        top: y - SQUARE_SIZE / 2,
        left: x - SQUARE_SIZE / 2
      });
    }
  };

  dropPiece = (x: number, y: number) => {
    this.isDragging = false;

    this.getSquareOffsets()
    const squareId = this.getSquareByLocation(x,y)

    if (this.beingDragged) {
      $(this.beingDragged).css({
        display: "block",
        position: "",
      });

      if (squareId !== "offboard") {
        const $square = $(`#${squareId}`);
        $square.empty();
        $square.append(this.beingDragged);
        this.currentPosition[squareId] = $(this.beingDragged).attr("alt") as string
      }
    }
  };

  handleDrag = (e: JQuery.MouseMoveEvent) => {
    if (this.isDragging) {
      this.dragPiece(e.pageX, e.pageY);
    }
  };

  stopDrag = (e: JQuery.MouseUpEvent) => {
    if (!this.isDragging) return;
    this.dropPiece(e.pageX, e.pageY);
  };

  dragOver = (e: JQuery.MouseDownEvent) => {
    e.preventDefault();
  };

  // const dropPiece = (e: DragEvent) => {
  //   console.log("drop target=", e.target)
  //   const square = e.target as HTMLDivElement
  //   square.append(beingDragged)
  // };

  handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const fen = positionInput.value;
    this.drawPieces(fen);
  };
}

const init = () => {
  const newBoard = new Board;
  newBoard.drawBoard();
  positionForm.addEventListener("submit", newBoard.handleSubmit);
  $board
    .on("mousedown", ".square", newBoard.selectPiece)
    .on("mousemove", newBoard.handleDrag)
    .on("mouseup", newBoard.stopDrag)
    .on("mousedown mousemove", newBoard.dragOver);
  // $board.addEventListener("dragover", dragOver);
  // $board.addEventListener("drop", dropPiece)
};

$(init);