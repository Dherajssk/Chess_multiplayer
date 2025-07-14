import { useEffect, useState } from "react";
import { Chessboard } from "../components/Chessboard/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

const INIT_GAME = "INIT_GAME";
const MOVE = "MOVE";

export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [color, setColor] = useState<"w" | "b">("w");
  const [winner, setWinner] = useState<null | "w" | "b">(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === INIT_GAME) {
        const newGame = new Chess();
        //setChess(newGame);
        setBoard(newGame.board());
        setGameStarted(true);
        setWinner(null);

        if (message.payload.color === "white") {
          setColor("w");
        } else {
          setColor("b");
        }

        console.log("Game initialized");

      } else if (message.type === MOVE) {
        const move = message.payload;
        chess.move(move); // apply to existing chess object
        setBoard(chess.board());
        console.log("Move received:", move);
      } else if (message.type === "GAME_OVER") {
        let winColor = message.payload.winner;
        if (winColor === "white") winColor = "w";
        if (winColor === "black") winColor = "b";
        setWinner(winColor);
        setGameStarted(false);
      }
    };
  }, [socket]);

  // 🔁 Auto-update moves from current chess instance
  const history = chess.history(); // SAN format: ["e4", "e5", "Nf3", "Nc6", ...]
  const groupedMoves: { white: string; black: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    groupedMoves.push({
      white: history[i],
      black: history[i + 1] || "",
    });
  }

  if (!socket) {
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Connecting to the server...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="max-w-screen-lg w-full grid grid-cols-6 gap-6">
        {/* Chessboard */}
        <div className="col-span-4 bg-white shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
          {winner && (
            <div className="mb-4 text-2xl font-bold text-green-700">
              Game Over! Winner: {winner === "w" ? "White" : "Black"}
            </div>
          )}
          <Chessboard
            chess={chess}
            setBoard={setBoard}
            socket={socket}
            board={board}
            flipped={color === "b"}
          />
        </div>

        {/* Sidebar: Play button + Move history */}
        <div className="col-span-2 bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-start w-full">
          <button
            disabled={gameStarted}
            onClick={() => {
              socket?.send(JSON.stringify({ type: INIT_GAME }));
            }}
            className={`w-full mb-4 ${
              gameStarted
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md`}
          >
            {gameStarted ? "Game In Progress" : "Play"}
          </button>

          <div className="w-full text-left">
            <h2 className="text-lg font-semibold mb-2">Move History</h2>
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b">
                  <th className="text-left pr-4">#</th>
                  <th className="text-left pr-4">White</th>
                  <th className="text-left">Black</th>
                </tr>
              </thead>
              <tbody>
                {groupedMoves.map((move, idx) => (
                  <tr key={idx}>
                    <td className="pr-4">{idx + 1}.</td>
                    <td className="pr-4">{move.white}</td>
                    <td>{move.black}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
