declare var ChessBoard: {
    (boardName: string): ChessBoard;
    (boardName: string, config: ChessConfig): ChessBoard;
};

type ChessPosition = "a1" | "a2" | "a2" | "a4" |
                     "b1" | "b2" | "b3" | "b4" |
                     "c1" | "c2" | "c3" | "c4" |
                     "d1" | "d2" | "d3" | "d4" |
                     "e1" | "e2" | "e3" | "e4" |
                     "f1" | "f2" | "f3" | "f4" |
                     "g1" | "g2" | "g3" | "g4" |
                     "h1" | "h2" | "h3" | "h4";

type WhitePiece = "wK"  /*| "wQ" | "wR" */| "wB" | "wN" | "wP";
type BlackPiece = "bK"  /*| "bQ" | "bR" */| "bB" | "bN" | "bP";
type OrangePiece = "oK" /*| "oQ" | "oR" */| "oB" | "oN" | "oP";
type ChessPiece = WhitePiece | BlackPiece | OrangePiece;

type PositionObject = { [key in ChessPosition]?: ChessPiece };

interface ChessBoard {
    // Use the position method to retrieve the current position of the board (without parameters).
    // Use the position method to set the board position (with parameters).
    readonly position: (position?: PositionObject, animate?: boolean) => PositionObject | void;

    // Use the clear method to remove all the pieces from the board.
    readonly clear: (animate?: boolean) => void;

    // Use the move method to make one or more moves on the board.
    // Parameter example: b1-c2
    readonly move: (move: string) => void;

    // Use the destroy method to kill the board and remove it from the DOM.
    readonly destroy: () => void;

    // Use the resize method to recalculate and redraw the board based on the size of it's parent element.
    readonly resize: () => void;
}

interface ChessConfig {
    readonly draggable?: boolean;
    readonly dropOffBoard?: "snapback" | "trash";
    readonly position?: PositionObject;
    readonly showNotation?: boolean;
    readonly showErrors?: false | "console" | "alert" | ((errorCode: number, error: string) => void);
    readonly appearSpeed?: number;
    readonly moveSpeed?: number;
    readonly snapbackSpeed?: number;
    readonly snapSpeed?: number;
    readonly trashSpeed?: number;

    // The onChange event fires when the board position changes.
    readonly onChange?: (oldPos: PositionObject, newPos: PositionObject) => void;

    // The onDragStart event fires every time a piece is picked up.
    // Prevent the drag action by returning false.
    readonly onDragStart?: (source: ChessPosition, piece: ChessPiece, position: PositionObject) => void | boolean;

    // The onDragMove event fires every time a piece changes location.
    readonly onDragMove?: (newLocation: ChessPosition, oldLocation: ChessPosition, source: ChessPosition,
                           piece: ChessPiece, position: PositionObject) => void;

    // The onDrop event fires every time a piece is dropped.
    // If "snapback" is returned, the dragged piece will return to it's source square.
    // If "trash" is returned, the dragged piece will be removed.
    readonly onDrop?: (source: ChessPosition, target: ChessPosition, piece: ChessPiece,
                       newPos: PositionObject, oldPos: PositionObject) => void | "snapback" | "trash";

    // The onSnapbackEnd event fires after a piece has snapped back to it's original square.
    readonly onSnapbackEnd?: (piece: ChessPiece, square: ChessPosition, position: PositionObject) => void;

    // The onMoveEnd event fires at the end of animations when the board position changes.
    readonly onMoveEnd?: (oldPos: PositionObject, newPos: PositionObject) => void;
}
