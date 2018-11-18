import { Move, MoveGenerator } from "./Generator";
import { Board, Piece } from "./Board";
import { sleep } from "./Utils";

class App {
    private readonly opponentResponseTimeMs = 2000;
    private gameEnded: boolean = false;
    private turn: Color = "w";

    private chessboard: ChessBoard;
    private boardConfig: ChessConfig;
    private board: Board;

    private moves: Move[];
    private readonly generator: MoveGenerator = new MoveGenerator();

    public start() {
        this.board = new Board(true);
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
            onDrop: this.onDrop,
            onDragStart: this.onDragStart
        };

        this.chessboard = ChessBoard("board", this.boardConfig);
        this.moves = this.generateMoves(this.board, this.turn);
    }

    private beginNewTurn = async () => {
        let nextTurn = this.findNextTurn();
        console.warn("TURN: " + nextTurn);
        this.turn = nextTurn;
        this.moves = this.generateMoves(this.board, nextTurn);

        if (nextTurn !== "w") {   
            // this.moves = this.generateMoves(this.board, nextTurn);
            if (this.moves.length === 0) {
                console.warn("END");
                return;
            }

            let nextMove: Move;
            const beatMoves = this.moves.filter(m => m.beatenPiece !== null);
            if (beatMoves.length === 0) {
                nextMove = this.moves[0];
            } else {
                nextMove = beatMoves.reduce((p, c) => {
                    const pValue = (p.beatenPiece as Piece).value();
                    const cValue = (c.beatenPiece as Piece).value();
                    return pValue > cValue ? p : c;
                });
            }

            await sleep(this.opponentResponseTimeMs);

            this.chessboard.move(`${nextMove.piece.chessboardPos()}-${nextMove.target}`);
            this.board.movePiece(nextMove.piece.chessboardPos(), nextMove.target);
            // this.chessboard.move("e1-f2");

            this.beginNewTurn();

            // for (const move of opponentMoves) {
            //     const boardMove = Board.fromBoard(this.board);
            //     boardMove.movePiece(move.piece.chessboardPos(), move.target);
            // }
        }
    }

    private findNextTurn(): Color {
        switch (this.turn) {
            case "w": return "b";
            case "b": return "o";
            case "o": return "w";
        }
    }

    private onDrop = (source: ChessPosition, target: ChessPosition, piece: ChessPiece,
        newPos: PositionObject, oldPos: PositionObject): void | "snapback" | "trash" => {
        if (Number(target[1]) > 4 || !this.validMove(source, target)) {
            return "snapback";
        }

        this.board.movePiece(source, target);
        this.beginNewTurn();
    }

    private onDragStart = (source: ChessPosition, piece: ChessPiece, position: PositionObject): void | boolean => {
        if (this.turn === "w" && piece[0] !== "w") {
            return false;
        }
    }

    private generateMoves(board: Board, color: Color) {
        const moves = this.generator.generateMoves(board, color);
        const filteredMoves = this.generator.filterOutChecks(board, color, moves);
        return filteredMoves;
    }

    private validMove(source: ChessPosition, dest: ChessPosition) {
        let [x, y] = Piece.arrayPos(source);
        return this.moves.some((move, _, __) => {
            let p = move.piece;
            const moveAllowed = p.xPos === x && p.yPos === y && move.target === dest;
            return moveAllowed;
        });
    }
}


export default new App();
