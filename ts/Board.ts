export class Piece {
    static readonly a = 97;

    constructor(public piece: ChessPiece, public xPos: number, public yPos: number) {

    }

    color(): Color {
        return this.piece[0] as Color;
    }

    kind(): PieceType {
        return this.piece[1] as PieceType;
    }

    value(): number {
        switch (this.kind()) {
            case "K": return 10000;
            case "N": return 300;
            case "B": return 325;
            case "P": return 100;
        }
    }

    chessboardPos(): ChessPosition {
        return Piece.chessboardPos(this.xPos, this.yPos);
    }

    isKing() { return this.kind() === "K"; }

    updatePos(x: number, y: number) {
        this.xPos = x;
        this.yPos = y;
    }

    copy(): Piece {
        return new Piece(this.piece, this.xPos, this.yPos);
    }

    static chessboardPos(x: number, y: number) {
        return String.fromCharCode(Piece.a + x) + (y + 1) as ChessPosition;
    }

    static arrayPos(pos: ChessPosition) {
        let x = pos.charCodeAt(0) - Piece.a;
        let y = parseInt(pos.charAt(1)) - 1;
        return [x, y];
    }
}

export class Board {
    readonly board: (Piece | null)[][];
    whites: Piece[];
    blacks: Piece[];
    oranges: Piece[];
    whiteKing: Piece;
    blackKing: Piece;
    orangeKing: Piece;

    constructor(withInitialSetup: boolean = false) {
        this.board = new Array<Array<Piece>>(8);
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array<Piece>(4);
            for (let j = 0; j < 4; j++) {
                this.board[i][j] = null;
            }
        }

        if (withInitialSetup) {
            this.initialSetup();
        }
    }

    movePiece(source: ChessPosition, dest: ChessPosition) {
        let [x, y] = Piece.arrayPos(source);
        let [xP, yP] = Piece.arrayPos(dest);

        let piece = this.board[x][y];
        if (piece) {
            this.board[x][y] = null;
            piece.updatePos(xP, yP);

            let opponent = this.board[xP][yP];
            if (opponent) {
                this.removePiece(opponent);
            }
            this.board[xP][yP] = piece;
        }
    }

    setPieces(whites: Piece[], blacks: Piece[], oranges: Piece[]) {
        whites.concat(blacks).concat(oranges).forEach(p => {
            this.board[p.xPos][p.yPos] = p;
        });

        this.whites = whites;
        this.blacks = blacks;
        this.oranges = oranges;

        // For simplicity we assume that kings are always 0-indexed
        this.whiteKing = whites[0];
        this.blackKing = blacks[0];
        this.orangeKing = oranges[0];
    }

    calculatePieceValues(color: Color): number {
        const sumPieceValues = (pieces: Piece[]) => {
            return pieces.reduce((p, c) => {
                return p + c.value();
            }, 0);
        };

        switch (color) {
            case "w": return sumPieceValues(this.whites);
            case "b": return sumPieceValues(this.blacks);
            case "o": return sumPieceValues(this.oranges);
        }
    }

    static fromBoard = (board: Board): Board => {
        const newBoard = new Board(false);

        const whites: Piece[] = board.whites.map(p => p.copy());
        const blacks: Piece[] = board.blacks.map(p => p.copy());
        const oranges: Piece[] = board.oranges.map(p => p.copy());

        newBoard.setPieces(whites, blacks, oranges);
        return newBoard;
    }

    private removePiece(piece: Piece) {
        let neq = (p: Piece) => p.xPos !== piece.xPos || p.yPos !== piece.yPos;

        switch (piece.color()) {
            case "b": this.blacks = this.blacks.filter(neq); break;
            case "o": this.oranges = this.oranges.filter(neq); break;
            case "w": this.whites = this.whites.filter(neq); break;
        }
    }

    private initialSetup() {
        const whiteKing = new Piece("wK", 1, 0);
        const blackKing = new Piece("bK", 1, 2);
        const orangeKing = new Piece("oK", 7, 3);

        const whites = [
            whiteKing,
            new Piece("wP", 0, 1),
            new Piece("wN", 3, 0),
            new Piece("wB", 4, 0)
        ];

        const blacks = [
            blackKing,
            new Piece("bN", 0, 3),
            new Piece("bP", 1, 3)
        ];

        const oranges = [
            orangeKing,
            new Piece("oP", 7, 2),
            // new Piece("oB", 6, 2)
            new Piece("oB", 5, 3)
        ];

        this.setPieces(whites, blacks, oranges);
    }
}
