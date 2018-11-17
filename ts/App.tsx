class App {
    private board: ChessBoard;
    private boardConfig: ChessConfig = {
        draggable: true,
        position: {
            c2: "bB",
            e3: "wK",
            f2: "oQ"
        },
        onDrop: this.onDrop
    };

    public start() {
        this.board = ChessBoard("board", this.boardConfig);
    }

    private onDrop(source: ChessPosition, target: ChessPosition, piece: ChessPiece,
                   newPos: PositionObject, oldPos: PositionObject): void | "snapback" | "trash" {
        if (Number(target[1]) > 4) {
            return "snapback";
        }
    }
}

export default new App();
