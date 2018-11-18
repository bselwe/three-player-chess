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
        if (this.moves.length === 0) {
            console.warn("END");
            alert("END");
            return;
        }

        if (nextTurn !== "w") {
            let nextMove = this.findBestMove();

            await sleep(this.opponentResponseTimeMs);

            if (nextMove !== null) {
                this.chessboard.move(`${nextMove.piece.chessboardPos()}-${nextMove.target}`);
                this.board.movePiece(nextMove.piece.chessboardPos(), nextMove.target);
            }

            this.beginNewTurn();
        }
    }

    private findBestMove = (): (Move | null) => {
        // let bestMove: (Move | null) = null;
        // let bestMoveState: number = 0;

        // for (let move of this.moves) {
        //     let boardCopy = Board.fromBoard(this.board);
        //     boardCopy.movePiece(move.piece.chessboardPos(), move.target);
        //     let nextTurn = this.findNextTurn();
        //     let nextMoves = this.generateMoves(boardCopy, nextTurn);
        //     if (nextMoves.length === 0) {
        //         console.warn("END");
        //         return null;
        //     }

        //     let nextMove: Move;
        //     const beatMoves = nextMoves.filter(m => m.beatenPiece !== null);
        //     if (beatMoves.length === 0) {
        //         nextMove = nextMoves[0];
        //     } else {
        //         nextMove = beatMoves.reduce((p, c) => {
        //             const pValue = (p.beatenPiece as Piece).value();
        //             const cValue = (c.beatenPiece as Piece).value();
        //             return pValue > cValue ? p : c;
        //         });
        //     }

        //     boardCopy.movePiece(nextMove.piece.chessboardPos(), nextMove.target);
        //     let pieceValues = boardCopy.calculatePieceValues(this.turn);
        //     if (pieceValues > bestMoveState) {
        //         bestMove = move;
        //     }
        // }
        return this.shallow(this.board, null, this.turn, this.globalUpper, 2).move;
        // return bestMove;
    }

    shallow(board: Board, move: Move | null, player: Color, bound: number, depth: number): BestMove {
        let moves = this.generateMoves(board, player);

        if (depth === 0 || moves.length === 0) {
            let bounds = {
                "w": board.calculatePieceValues("w"),
                "b": board.calculatePieceValues("b"),
                "o": board.calculatePieceValues("o")
            };
            bounds[player] += this.moveValue(move);
            return { bounds, move };
        }
        let copy = Board.fromBoard(board);
        copy.movePiece(moves[0].piece.chessboardPos(), moves[0].target);

        let best = {
            ...this.shallow(copy, moves[0], this._findNextTurn(player), this.globalUpper, depth - 1),
            move: moves[0]
        };

        for (let next of moves.slice(1)) {
            if (best.bounds[player] >= bound) {
                return best;
            }
            copy = Board.fromBoard(board);
            copy.movePiece(next.piece.chessboardPos(), next.target);

            let current = this.shallow(copy, next, this._findNextTurn(player), this.globalUpper - best.bounds[player], depth - 1);
            if (current.bounds[player] > best.bounds[player]) {
                best = {
                    ...current,
                    move: next
                };
            }
        }
        return best;
        // return { ...best, move };

    }

    moveValue(move: Move | null) {
        if (!move) {
            return 0;
        }
        return (move.beatenPiece && move.beatenPiece.value() || 0) + (move.leadsToCheck && 300);
    }

    readonly globalUpper = 91242424132;


    // Shallow(Node, Player, Bound)
    // IF Node is terminal, RETURN static value
    // Best = Shallow(first Child, next Player, Sum)
    // FOR each remaining Child
    // IF Best[Player] > = Bound, RETURN Best
    // Current = Shallow(Child, next Player, Sum - Best[Player])
    // IF Current[Player] > Best[Player], Best = Current
    // RETURN Best


    private _findNextTurn(color: Color): Color {
        switch (color) {
            case "w": return "b";
            case "b": return "o";
            case "o": return "w";
        }
    }

    private findNextTurn(): Color {
        return this._findNextTurn(this.turn);
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

interface BestMove {
    bounds: { [key in Color]: number; };
    move: Move | null;
}


export default new App();
