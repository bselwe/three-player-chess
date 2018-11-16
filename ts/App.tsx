class App {
    private boardConfig = {
        draggable: true,
        position: "start"
    };

    public start() {
        ChessBoard("board", this.boardConfig);
    }
}

export default new App();
