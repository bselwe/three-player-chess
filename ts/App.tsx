import { Move, MoveGenerator } from "./Generator";
import { Board, Piece } from "./Board";

class App {
    private chessboard: ChessBoard;
    private boardConfig: ChessConfig;
    private board: Board;

    private moves: Move[];
    private generator: MoveGenerator = new MoveGenerator();

    public start() {
        this.board = new Board();
        let position: PositionObject = {};
        for (let row of this.board.board) {
            for (let piece of row) {
                if (piece) {
                    position[piece.chessboardPos()] = piece.piece;
                }
            }
        }

        this.boardConfig = {
            draggable: true,
            position,
            onDrop: this.onDrop.bind(this)
        };

        this.chessboard = ChessBoard("board", this.boardConfig);
        this.generateMoves();
    }

    private onDrop(source: ChessPosition, target: ChessPosition, piece: ChessPiece,
        newPos: PositionObject, oldPos: PositionObject): void | "snapback" | "trash" {
        if (Number(target[1]) > 4 || !this.validMove(source, target)) {
            return "snapback";
        }
        this.board.movePiece(source, target);
        this.generateMoves();
    }

    private generateMoves() {
        this.moves = this.generator.generateMoves(this.board, "w");
        console.warn(this.moves);
        console.warn(this.board);
    }

    private validMove(source: ChessPosition, dest: ChessPosition) {
        let [x, y] = Piece.arrayPos(source);
        return this.moves.some((move, _, __) => {
            let p = move.piece;
            return p.xPos === x && p.yPos === y && move.target === dest;
        });
    }
}


export default new App();
