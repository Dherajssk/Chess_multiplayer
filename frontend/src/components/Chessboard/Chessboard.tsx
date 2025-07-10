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
  chess:any;
  setBoard:any;
};

export const Chessboard = ({ board, socket,chess,setBoard }: ChessboardProps) => {
  const [from, setFrom] = useState<null | Square>(null);

  return (
    <div className="border-4 border-gray-800 inline-block">
      {board.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            const isDark = (i + j) % 2 === 0;
            const bgColor = isDark ? "bg-green-600" : "bg-green-300";
            const textColor =
              square?.color === "w" ? "text-white" : "text-black";

            const squareName = square?.square ?? getSquareName(i, j);

            return (
              <div
                key={j}
                onClick={() => {
                  if (!from) {
                    setFrom(squareName);
                  } else {
                    const to = squareName;

                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        payload: {
                          move: {
                            from,
                            to,
                          }
                        },
                      })
                    );
                    chess.move({
                      from,
                      to,
                    });
                    setFrom(null);
                    setBoard(chess.board());
                    console.log(`Move from ${from} to ${to}`);
                  }
                }}
                className={`w-12 h-12 flex items-center justify-center text-lg font-bold cursor-pointer ${bgColor} ${square ? textColor : ""
                  } ${from === squareName ? "ring-4 ring-yellow-400" : ""}`}
              >
                {square ? (
                  <img
                    src={
                      square.color === "w"
                        ? `/${square.type.toUpperCase()} Copy.png`
                        : `/${square.type}.png`
                    }
                    alt={square.type}
                    className="w-10 h-10"
                    draggable={false}
                  />
                ) : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 🔧 Helper to convert row/column to chess square notation
function getSquareName(row: number, col: number): Square {
  const files = "abcdefgh"; // columns → a-h
  const ranks = "87654321"; // rows → 8-1
  return (files[col] + ranks[row]) as Square;
}
