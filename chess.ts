/*
 * Basic:
 * board state
 * castling rights
 * history of moves (threefold repetition, 50 move rule)
 * check
 * attacked
 * checkmate
 * draw (insuffiecient material, 50 move rule)
 * game over (checkmate, stalemate, draw, threefold repetition, insuff material)
 * stalemate
 * threefold repetition
 * move - legal or illegal
 * move number
 * half moves (50 move rule)
 * legal moves from current position
 * reset board
 * turn
 *
 * Wishlist:
 * Validate FEN string
 * Print ascii position to console
 * Print FEN of position
 */

const PIECES = {
  EMPTY: 0,
  PAWN: 1,
  KNIGHT: 2,
  BISHOP: 3,
  ROOK: 4,
  QUEEN: 5,
  KING: 6,
};
const COLORS = { EMPTY: 0, WHITE: 1, BLACK: 2 };
const PIECE_CODES: Record<string, number> = {
  p: PIECES.PAWN,
  n: PIECES.KNIGHT,
  b: PIECES.BISHOP,
  r: PIECES.ROOK,
  q: PIECES.QUEEN,
  k: PIECES.KING,
};

// prettier-ignore
/**  8x8 chessboard surrounded by sentinel values for offboard checks */
const mailbox = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
  -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
  -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
  -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
  -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
  -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
  -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
];

// prettier-ignore
/** Indexes of valid squares on the 120 board */
const mailbox64 = [
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 33, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
];

/** Chess class to make moves, validate moves, check for end of game */
class Chess {
  board = Array(64);
  turn = "w";
  castling = "KQkq";
  epSquare: string | 0 = 0;
  halfMove = 0;
  move = 1;

  constructor(fen: string = DEFAULT_POSITION) {
    this.parseFen(fen);
  }

  /** Generate game position from a valid FEN string */
  parseFen = (fen: string) => {
    const [position, turn, castling, epSq, halfMoves, moveNumber] =
      fen.split(" ");
    let rank = 7;
    let file = 0;
    let sq = 0;

    // Place pieces on board
    for (const char of position) {
      if (char === "/") {
        rank--;
        file = 0;
      } else if ("12345678".includes(char)) {
        for (let i = 0; i < +char; i++) {
          this.board[sq] = { piece: PIECES.EMPTY, color: COLORS.EMPTY };
          sq++;
          file++;
        }
      } else if (PIECE_SYMBOLS.includes(char)) {
        const color = char === char.toUpperCase() ? COLORS.WHITE : COLORS.BLACK;
        const pieceCode = char.toLowerCase();
        const piece = PIECE_CODES[pieceCode];
        this.board[sq] = { piece, color };
        sq++;
        file++;
      }
    }

    // Set color to go
    this.turn = turn;

    // Set castling rights
    this.castling = castling;

    // Set en passant square
    if (epSq === "-") this.epSquare = 0;
    else this.epSquare = epSq;

    // Set number of half moves
    this.halfMove = Number(halfMoves);

    // Set turn counter
    this.move = Number(moveNumber);
  };
}
