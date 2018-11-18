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

    chessboardPos(): ChessPosition {
        return Piece.chessboardPos(this.xPos, this.yPos);
    }

    isKing() { return this.kind() === "K"; }

    updatePos(x: number, y: number) {
        this.xPos = x;
        this.yPos = y;
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
    board: (Piece | null)[][];
    whites: Piece[];
    blacks: Piece[];
    oranges: Piece[];


    constructor() {
        this.board = new Array<Array<Piece>>(8);
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array<Piece>(4);
        }
        this.initialSetup();
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

    private removePiece(piece: Piece) {
        let neq = (p: Piece) => p.xPos !== piece.xPos || p.yPos !== piece.yPos;

        switch (piece.color()) {
            case "b": this.blacks = this.blacks.filter(neq); break;
            case "o": this.oranges = this.oranges.filter(neq); break;
            case "w": this.whites = this.whites.filter(neq); break;
        }
    }


    private initialSetup() {
        let whites = [
            new Piece("wP", 0, 1),
            new Piece("wK", 1, 0),
            new Piece("wN", 3, 0),
            new Piece("wB", 4, 0)
        ];
        let blacks = [
            new Piece("bN", 0, 3),
            new Piece("bP", 1, 3),
            new Piece("bK", 1, 2)
        ];
        let oranges = [
            new Piece("oK", 7, 3),
            new Piece("oP", 7, 2),
            new Piece("oB", 6, 2)
        ];


        whites.concat(blacks).concat(oranges).forEach(p => {
            this.board[p.xPos][p.yPos] = p;
        });

        this.whites = whites;
        this.blacks = blacks;
        this.oranges = oranges;
    }
}
