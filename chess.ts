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

type Position = Piece[];

interface Move {
  from: number;
  to: number;
  flag: MoveFlag;
}

enum PieceType {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
  Empty,
}

enum Color {
  White,
  Black,
}

enum MoveFlag {
  Normal,
  Capture,
  Promotion,
  Castle,
  EnPassant,
  Pawn,
  BigPawn,
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
const slidingPieces = [false, false, true, true, true, false];

/** Maps piece to number of available directions to move */
const pieceDirections = [0, 8, 4, 4, 8, 8];

/** Maps piece to offsets for a move */
const pieceOffsets = [
  [],
  [-21, -19, -12, -8, 8, 12, 19, 21],
  [-11, -9, 9, 11],
  [-10, -1, 1, 10],
  [-11, -10, -9, -1, 1, 9, 10, 11],
  [-11, -10, -9, -1, 1, 9, 10, 11],
];

/** Chess class to make moves, validate moves, check for end of game */
class Chess {
  board: Position = Array(64).fill({
    type: PieceType.Empty,
    color: PieceType.Empty,
  });
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

  /** Convert square in algebraic notation to array index */
  private algebraicToIndex(square: string): number | null {
    if (square.length !== 2 || !/[a-h][1-8]/i.test(square)) {
      return null;
    }

    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - Number(square[1]);

    // Calculate index
    const index = rank * 8 + file;

    return index;
  }

  /** Get the piece at a given square */
  private getPieceAt(square: number): Piece {
    return this.board[square];
  }

  /** Set the piece at a given square */
  private setPieceAt(square: number, piece: Piece) {
    this.board[square] = piece;
  }

  /** Generate all pseudo-legal moves for the current position */
  private generateMoves(): Move[] {
    const moves: Move[] = [];

    // Piece and pawn moves
    for (let square = 0; square < 64; square++) {
      const piece = this.getPieceAt(square);

      if (piece.color === this.turn) {
        if (piece.type !== PieceType.Pawn) {
          for (let i = 0; i < pieceDirections[piece.type]; i++) {
            // For all directions
            for (let j = square; ; ) {
              j = mailbox[mailbox64[j] + pieceOffsets[piece.type][i]]; // Next square along ray
              if (j === -1) break; // off-board
              const targetPiece = this.getPieceAt(j);
              if (targetPiece.type !== PieceType.Empty) {
                if (targetPiece.color !== this.turn) {
                  moves.push({ from: square, to: j, flag: MoveFlag.Capture });
                }
                break;
              }
              moves.push({ from: square, to: j, flag: MoveFlag.Normal });
              if (!slidingPieces[piece.type]) break; // Continue for sliding pieces, next direction for non-sliding
            }
          }
        } else {
          // pawn moves
          const direction = piece.color === Color.White ? -1 : 1;
          const startRank = piece.color === Color.White ? 6 : 1;
          let targetSquare = square + 7 * direction;

          if (this.turn === Color.White) {
            // Left diagonal, right diagonal, space ahead (2 space ahead)
            if (
              mailbox[mailbox64[square - 11]] !== -1 &&
              this.getPieceAt(square - 9)?.color === Color.Black
            ) {
              moves.push({
                from: square,
                to: square - 9,
                flag: MoveFlag.Capture,
              });
            }
            if (
              mailbox[mailbox64[square - 9]] !== -1 &&
              this.getPieceAt(square - 7)?.color === Color.Black
            ) {
              moves.push({
                from: square,
                to: square - 7,
                flag: MoveFlag.Capture,
              });
            }
            if (this.getPieceAt(square - 8)?.type === PieceType.Empty) {
              moves.push({ from: square, to: square - 8, flag: MoveFlag.Pawn });
              if (
                square >= 48 &&
                this.getPieceAt(square - 16)?.type === PieceType.Empty
              ) {
                moves.push({
                  from: square,
                  to: square - 16,
                  flag: MoveFlag.BigPawn,
                });
              }
            }
          } else {
            if (
              mailbox[mailbox64[square + 11]] !== -1 &&
              this.getPieceAt(square + 9)?.color === Color.White
            ) {
              moves.push({
                from: square,
                to: square + 9,
                flag: MoveFlag.Capture,
              });
            }
            if (
              mailbox[mailbox64[square + 9]] !== -1 &&
              this.getPieceAt(square + 7)?.color === Color.White
            ) {
              moves.push({
                from: square,
                to: square + 7,
                flag: MoveFlag.Capture,
              });
            }
            if (this.getPieceAt(square + 8)?.type === PieceType.Empty) {
              moves.push({ from: square, to: square + 8, flag: MoveFlag.Pawn });
              if (
                square <= 15 &&
                this.getPieceAt(square + 16)?.type === PieceType.Empty
              ) {
                moves.push({
                  from: square,
                  to: square + 16,
                  flag: MoveFlag.BigPawn,
                });
              }
            }
          }
        }
      }
    }

    // Castling moves
    if (this.turn === Color.White) {
      if (this.castling.includes("K")) {
        moves.push({ from: 60, to: 62, flag: MoveFlag.Castle });
      }
      if (this.castling.includes("Q")) {
        moves.push({ from: 60, to: 58, flag: MoveFlag.Castle });
      }
    } else {
      if (this.castling.includes("k")) {
        moves.push({ from: 4, to: 6, flag: MoveFlag.Castle });
      }
      if (this.castling.includes("q")) {
        moves.push({ from: 4, to: 2, flag: MoveFlag.Castle });
      }
    }

    // En passant moves
    if (this.epSquare) {
      const index = this.algebraicToIndex(this.epSquare);
      if (index) {
        if (this.turn === Color.White) {
          if (
            mailbox[mailbox64[index - 11]] !== -1 &&
            this.getPieceAt(index - 9).color === Color.Black &&
            this.getPieceAt(index - 9).type === PieceType.Pawn
          ) {
            moves.push({
              from: index,
              to: index - 9,
              flag: MoveFlag.EnPassant,
            });
          }
          if (
            mailbox[mailbox64[index - 9]] !== -1 &&
            this.getPieceAt(index - 7).color === Color.Black &&
            this.getPieceAt(index - 7).type === PieceType.Pawn
          ) {
            moves.push({
              from: index,
              to: index - 7,
              flag: MoveFlag.EnPassant,
            });
          }
        } else {
          if (
            mailbox[mailbox64[index + 11]] !== -1 &&
            this.getPieceAt(index + 9).color === Color.Black &&
            this.getPieceAt(index + 9).type === PieceType.Pawn
          ) {
            moves.push({
              from: index,
              to: index + 9,
              flag: MoveFlag.EnPassant,
            });
          }
          if (
            mailbox[mailbox64[index + 9]] !== -1 &&
            this.getPieceAt(index + 7).color === Color.Black &&
            this.getPieceAt(index + 7).type === PieceType.Pawn
          ) {
            moves.push({
              from: index,
              to: index + 7,
              flag: MoveFlag.EnPassant,
            });
          }
        }
      } else {
        console.debug("Invalid en passant square format in FEN string");
      }
    }

    return moves;
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

  undoMove(): void {}

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
          this.setPieceAt(sq, {
            type: PieceType.Empty,
            color: PieceType.Empty,
          });
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
