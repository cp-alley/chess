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

interface Piece {
  type: number;
  color: number;
}

type Position = (Piece | null)[]

interface Move {
  from: number;
  to: number;
  flag: "normal" | "capture" | "promotion" | "castle" | "bigPawn" | "enPassant";
}

enum PieceType {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
  Empty
}

enum Color {
  White,
  Black
}

const PIECE_CODES: Record<string, number> = {
  p: PieceType.Pawn,
  n: PieceType.Knight,
  b: PieceType.Bishop,
  r: PieceType.Rook,
  q: PieceType.Queen,
  k: PieceType.King,
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

/** Maps piece to boolean value if it is a sliding piece */
const slidingPieces = [false, false, true, true, true, false]

/** Maps piece to number of available directions to move */
const pieceDirections = [0, 8, 4, 4, 8, 8]

/** Maps piece to offsets for a move */
const pieceOffsets = [
  [],
  [-21, -19, -12, -8, 8, 12, 19, 21],
  [-11, -9, 9, 11],
  [-10, -1, 1, 10],
  [-11, -10, -9, -1, 1, 9, 10, 11],
  [-11, -10, -9, -1, 1, 9, 10, 11]
]

/** Chess class to make moves, validate moves, check for end of game */
class Chess {
  board: Position = Array(64);
  turn: Color.White | Color.Black = Color.White;
  castling: string = "KQkq";
  epSquare: string | 0 = 0;
  halfMove: number = 0;
  move: number = 1;

  constructor(fen: string = DEFAULT_POSITION) {
    this.parseFen(fen);
  }

  /** Convert mailbox index to mailbox64 index */
  private mailboxToMailbox64(mailboxIndex: number): number {
    return mailbox64[mailboxIndex];
  }

  /** Convert mailbox64 index to mailbox index */
  private mailbox64toMailbox(mailbox64Index: number): number {
    return mailbox64.indexOf(mailbox64Index);
  }

  /** Get the piece at a given square */
  private getPieceAt(square: number): Piece | null {
    return this.board[square];
  }

  /** Set the piece at a given square */
  private setPieceAt(square: number, piece: Piece | null) {
    this.board[square] = piece;
  }

  /** Generate all legal moves for the current position */
  private generateLegalMoves(): Move[] {
    // Iterate through board to find pieces of current player's color
    // For each piece:
    // - If pawn: Move forward 1 or 2, diagonals if occupied by opposing
    // - If non-sliding piece: Calculate each of squares piece can move to
    // - If sliding piece: Calculate each square in each available direction until hits piece
    // * Special moves: big pawn move, en passant, promotion, castle
    const legalMoves: Move[] = [];

    for (let square = 0; square < 64; square++) {
      const piece = this.getPieceAt(square);

      if (piece && piece.color === this.turn) {
        if (piece.type === PieceType.Pawn) {

        }

        else if (!slidingPieces[piece.type]) {

        }

        else if (slidingPieces[piece.type]) {

        }
      }
    }

    return legalMoves;
  }

  /** Check if a move is legal */
  private isLegalMove(move: Move): boolean {
    return true;
  }

  /** Check if target square is attacked by a piece of opposing color */
  private isAttacked(square: number, color: number): boolean {
    return false;
  }

  makeMove(move: Move): boolean {
    return true;
  }

  undoMove(): void {

  }

  /** Parse FEN components and update game state */
  private parseFen(fen: string): void {
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
          // this.board[sq] = { type: PIECES.EMPTY, color: COLORS.EMPTY };
          this.setPieceAt(sq, { type: PieceType.Empty, color: PieceType.Empty });
          sq++;
          file++;
        }
      } else if (PIECE_SYMBOLS.includes(char)) {
        const color = char === char.toUpperCase() ? Color.White : Color.Black;
        const pieceCode = char.toLowerCase();
        const type = PIECE_CODES[pieceCode];
        // this.board[sq] = { type, color };
        this.setPieceAt(sq, { type, color });
        sq++;
        file++;
      }
    }

    // Set color to go
    this.turn = turn === "w" ? Color.White : Color.Black;

    // Set castling rights
    this.castling = castling;

    // Set en passant square
    if (epSq === "-") this.epSquare = 0;
    else this.epSquare = epSq;

    // Set number of half moves
    this.halfMove = Number(halfMoves);

    // Set turn counter
    this.move = Number(moveNumber);
  }

  /** Generate FEN string representing the current position */
  getFen(): string {
    return "";
  }
}
