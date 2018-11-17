import { Board, Piece } from "./Board";

export class MoveGenerator {
    private board: (Piece | null)[][];

    generateMoves(board: Board, color: Color) {
        this.board = board.board;
        let moves: Move[] = [];

        // TODO: Filter out checks and don't let king stand next to other king

        for (let piece of board.whites) {
            switch (piece.kind()) {
                case "P": moves.push(...this.generatePawn(piece)); break;
                case "K": moves.push(...this.generateKing(piece)); break;
                case "N": moves.push(...this.generateKnight(piece)); break;
                case "B": moves.push(...this.generateBishop(piece)); break;
            }
        }
        return moves;
    }

    private generateKing(piece: Piece) {
        let moves: Move[] = [];
        let x = piece.xPos;
        let y = piece.yPos;

        for (let xP = x - 1; xP <= x + 1; xP++) {
            for (let yP = y - 1; yP <= y + 1; yP++) {
                if (this.canMove(piece, xP, yP) && !this.kingOverlapping(xP, yP, piece.color())) {
                    moves.push({ piece, target: Piece.chessboardPos(xP, yP) });
                }
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

        if (!this.board[x][y]) {
            moves.push({ piece, target: Piece.chessboardPos(x, y) });
        }

        x = piece.xPos - 1;

        if (this.canMove(piece, x, y)) {
            moves.push({ piece, target: Piece.chessboardPos(x, y) });
        }

        x = piece.xPos + 1;
        if (this.canMove(piece, x, y)) {
            moves.push({ piece, target: Piece.chessboardPos(x, y) });
        }

        return moves;
    }

    private generateKnight(piece: Piece) {
        let x = piece.xPos;
        let y = piece.yPos;
        let moves: Move[] = [];

        let jumps: [number, number][] = [
            // up
            [x - 1, y + 2],
            [x + 1, y + 2],
            // right
            [x + 2, y + 1],
            [x + 2, y - 1],
            // down
            [x + 1, y - 2],
            [x - 1, y - 2],
            // left
            [x - 2, y + 1],
            [x - 2, y - 1],
        ];

        for (let [xP, yP] of jumps) {
            if (this.canMove(piece, xP, yP)) {
                moves.push({ piece, target: Piece.chessboardPos(xP, yP) });
            }
        }

        return moves;
    }

    private generateBishop(piece: Piece) {
        let moves: Move[] = [];
        let generateDiagonal = (xOff: number, yOff: number) => {
            let xP = piece.xPos + xOff;
            let yP = piece.yPos + yOff;

            while (this.canMove(piece, xP, yP)) {
                moves.push({ piece, target: Piece.chessboardPos(xP, yP) });
                if (!!this.board[xP][yP]) {
                    break;
                }
                xP += xOff;
                yP += yOff;
            }
        };

        generateDiagonal(1, 1);
        generateDiagonal(1, -1);
        generateDiagonal(-1, 1);
        generateDiagonal(-1, -1);
        return moves;
    }

    private kingOverlapping(x: number, y: number, color: Color) {
        for (let xP = x - 1; xP <= x + 1; xP++) {
            for (let yP = y - 1; yP <= y + 1; yP++) {
                if (!this.withinBoard(xP, yP)) { continue; }
                let k = this.board[xP][yP];
                if (k && k.isKing() && k.color() !== color) {
                    console.log(k);
                    return true;
                }
            }
        }
        return false;
    }


    private canMove(piece: Piece, x: number, y: number): boolean {
        return this.withinBoard(x, y) && this.canBeat(piece, this.board[x][y]);
    }

    private canBeat(piece: Piece, other: (Piece | null)) {
        return !other || (!other.isKing() && other.color() !== piece.color());
    }

    private withinBoard(x: number, y: number) {
        return x >= 0 && x < 8 && y >= 0 && y < 4;
    }
}

export interface Move {
    piece: Piece;
    target: ChessPosition;
}

