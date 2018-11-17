class App {
    private chessboard: ChessBoard;
    private boardConfig: ChessConfig;
    public start() {
        let board = new Board();
        let position: PositionObject = {};
        for (let row of board.board) {
            for (let piece of row) {
                if (piece) {
                    position[piece.chessboardPos()] = piece.type;
                }
            }
        }

        this.boardConfig = {
            draggable: true,
            position,
            onDrop: this.onDrop
        };

        this.chessboard = ChessBoard("board", this.boardConfig);
    }

    private onDrop(source: ChessPosition, target: ChessPosition, piece: ChessPiece,
        newPos: PositionObject, oldPos: PositionObject): void | "snapback" | "trash" {
        if (Number(target[1]) > 4) {
            return "snapback";
        }
    }
}

class Piece {
    static readonly a = 97;

    constructor(public type: ChessPiece, public xPos: number, public yPos: number) {

    }

    color() {
        return this.type[0];
    }

    kind() {
        return this.type[1];
    }

    chessboardPos(): ChessPosition {
        return String.fromCharCode(Piece.a + this.xPos) + (this.yPos + 1) as ChessPosition;
    }
}


class Board {
    board: (Piece | null)[][];

    constructor() {
        this.board = new Array<Array<Piece>>(8);
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array<Piece>(4);
        }
        this.initialSetup();
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
            new Piece("bK", 0, 2)
        ];
        let oranges = [
            new Piece("oK", 7, 3),
            new Piece("oP", 7, 2),
            new Piece("oB", 6, 2)
        ];


        whites.concat(blacks).concat(oranges).forEach(p => {
            this.board[p.xPos][p.yPos] = p;
        });
    }
}


export default new App();
