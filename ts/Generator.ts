import { Board, Piece } from "./Board";

export class MoveGenerator {
    private board: Board;

    generateMoves(board: Board, color: Color) {
        this.board = board;
        let moves: Move[] = [];

        for (let piece of board.whites) {
            switch (piece.kind()) {
                case "P": moves.push(...this.generatePawn(piece));
            }
        }
        return moves;
    }

    private generatePawn(piece: Piece) {
        let moves: Move[] = [];
        let x = piece.xPos;
        let y = piece.yPos;
        y = piece.color() === "w" ? y + 1 : y - 1;

        if (!this.withinBoard(x, y)) {
            return moves;
        }

        if (!this.board.board[x][y]) {
            moves.push({ piece, target: Piece.chessboardPos(x, y) });
        }

        x = piece.xPos - 1;

        if (this.withinBoard(x, y)) {
            let o = this.board.board[x][y];
            if (this.canBeat(piece, o)) {
                moves.push({ piece, target: Piece.chessboardPos(x, y) });
            }
        }

        x = piece.xPos + 1;
        if (this.withinBoard(x, y)) {
            let o = this.board.board[x][y];
            if (this.canBeat(piece, o)) {
                moves.push({ piece, target: Piece.chessboardPos(x, y) });
            }
        }

        return moves;
    }

    private canBeat(piece: Piece, other: (Piece | null)) {
        return other && !other.isKing() && other.color() !== piece.color();
    }

    private withinBoard(x: number, y: number) {
        return x >= 0 && x < 8 && y >= 0 && y < 4;
    }
}

export interface Move {
    piece: Piece;
    target: ChessPosition;
}

