import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";

const MOVE = "MOVE";

type ChessboardProps = {
  board: (
    {
      square: Square;
      type: PieceSymbol;
      color: Color;
    } | null
  )[][];
  socket: WebSocket;
  chess: any;
  setBoard: any;
  flipped?: boolean;
};

export const Chessboard = ({
  board,
  socket,
  chess,
  setBoard,
  flipped = false,
}: ChessboardProps) => {
  const [from, setFrom] = useState<null | Square>(null);

  // Proper orientation: when flipped is true, Black is at the bottom
  const rowIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  // Get square name (e.g., 'e4') from row/col indices
  function getSquareName(rowIdx: number, colIdx: number): Square {
    const files = "abcdefgh";
    const ranks = "87654321";
    const file = files[colIdx];
    const rank = ranks[rowIdx];
    return (file + rank) as Square;
  }

  return (
    <div className="border-4 border-gray-800 inline-block">
      {rowIndices.map((rowIdx) => (
        <div key={rowIdx} className="flex">
          {colIndices.map((colIdx) => {
            const square = board[rowIdx][colIdx];
            const squareName = getSquareName(rowIdx, colIdx);
            const isDark = (rowIdx + colIdx) % 2 !== 0;
            const bgColor = isDark ? "bg-green-600" : "bg-green-300";
            const textColor =
              square?.color === "w" ? "text-white" : "text-black";

            return (
              <div
                key={colIdx}
                onClick={() => {
                  if (!from) {
                    setFrom(squareName);
                  } else {
                    const to = squareName;

                    // Send move over WebSocket
                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        payload: {
                          move: {
                            from,
                            to,
                          },
                        },
                      })
                    );

                    // Make the move locally
                    chess.move({ from, to });
                    setFrom(null);
                    setBoard(chess.board());
                    console.log(`Move from ${from} to ${to}`);
                  }
                }}
                className={`w-12 h-12 flex items-center justify-center text-lg font-bold cursor-pointer ${bgColor} ${
                  square ? textColor : ""
                } ${from === squareName ? "ring-4 ring-yellow-400" : ""}`}
              >
                {square ? (
                  <img
                    src={
                      square.color === "w"
                        ? `/${square.type.toUpperCase()} Copy.png`
                        : `/${square.type.toLowerCase()}.png`
                    }
                    alt={square.type}
                    className="w-10 h-10"
                    draggable={false}
                  />
                ) : (
                  ""
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 🔧 Helper to convert row/column to chess square notation
// (Now handled inside the component for flip awareness)
