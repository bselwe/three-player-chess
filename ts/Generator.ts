import { Board, Piece } from "./Board";

export class MoveGenerator {
    private board: (Piece | null)[][];

    generateMoves(board: Board, color: Color, withKingAsTarget: boolean = false) {
        const [pieces, king, opponents] = this.getPiecesForColor(board, color);
        this.board = board.board;
        let moves: Move[] = [];

        for (let piece of pieces) {
            switch (piece.kind()) {
                case "P": moves.push(...this.generatePawn(piece)); break;
                case "K": moves.push(...this.generateKing(piece)); break;
                case "N": moves.push(...this.generateKnight(piece)); break;
                case "B": moves.push(...this.generateBishop(piece)); break;
            }
        }

        if (!withKingAsTarget) {
            moves = moves.filter(m => m.beatenPiece === null || (m.beatenPiece !== null && !m.beatenPiece.isKing()));
        }

        // this.updateMoveLeadsToCheck(board, color, moves);

        return moves;
    }

    filterOutChecks(board: Board, color: Color, moves: Move[]) {
        let filteredMoves: Move[] = [];
        const [opponentOne, opponentTwo]: [Color, Color] = color === "w" ? ["b", "o"] :
            (color === "b" ? ["w", "o"] : ["w", "b"]);

        for (const move of moves) {
            const boardMove = Board.fromBoard(board);
            boardMove.movePiece(move.piece.chessboardPos(), move.target);

            const opponentOneMoves = this.generateMoves(boardMove, opponentOne, true);
            const opponentTwoMoves = this.generateMoves(boardMove, opponentTwo, true);
            const opponentsMoves = opponentOneMoves.concat(opponentTwoMoves);

            if (!opponentsMoves.some(m =>
                m.beatenPiece !== null && m.beatenPiece.isKing() && m.beatenPiece.color() === color)) {
                filteredMoves.push(move);
            }
        }

        return filteredMoves;
    }

    updateMoveLeadsToCheck(board: Board, color: Color, moves: Move[]) {
        for (let move of moves) {
            let boardCopy = Board.fromBoard(board);
            boardCopy.movePiece(move.piece.chessboardPos(), move.target);
            let nextMoves = this.generateMoves(boardCopy, color, true);
        
            move.leadsToCheck = nextMoves.some(m => m.beatenPiece && m.beatenPiece.isKing() || false);
        }
    }

    private generateKing(piece: Piece) {
        let moves: Move[] = [];
        let x = piece.xPos;
        let y = piece.yPos;

        for (let xP = x - 1; xP <= x + 1; xP++) {
            for (let yP = y - 1; yP <= y + 1; yP++) {
                if (this.canMove(piece, xP, yP) && !this.kingOverlapping(xP, yP, piece.color())) {
                    moves.push(this.createMove(piece, xP, yP));
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
            moves.push(this.createMove(piece, x, y));
        }

        x = piece.xPos - 1;
        if (this.canMove(piece, x, y) && this.board[x][y]) {
            moves.push(this.createMove(piece, x, y));
        }

        x = piece.xPos + 1;
        if (this.canMove(piece, x, y) && this.board[x][y]) {
            moves.push(this.createMove(piece, x, y));
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
                moves.push(this.createMove(piece, xP, yP));
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
                moves.push(this.createMove(piece, xP, yP));
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
        // return !other || (!other.isKing() && other.color() !== piece.color());
        return !other || (other.color() !== piece.color());
    }

    private withinBoard(x: number, y: number) {
        return x >= 0 && x < 8 && y >= 0 && y < 4;
    }

    private createMove(piece: Piece, x: number, y: number) {
        return {
            piece,
            target: Piece.chessboardPos(x, y),
            beatenPiece: this.board[x][y],
            leadsToCheck: false
        };
    }

    private getPiecesForColor(board: Board, color: Color): [Piece[], Piece, Piece[]] {
        const pieces = color === "w" ? board.whites :
            (color === "b" ? board.blacks : board.oranges);

        const king = color === "w" ? board.whiteKing :
            (color === "b" ? board.blackKing : board.orangeKing);

        const opponents = color === "w" ? board.blacks.concat(board.oranges) :
            (color === "b" ? board.whites.concat(board.oranges) : board.whites.concat(board.blacks));

        return [pieces, king, opponents];
    }
}

export interface Move {
    piece: Piece;
    target: ChessPosition;
    beatenPiece: Piece | null;
    leadsToCheck: Boolean;
}

