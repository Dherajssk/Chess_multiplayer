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
  const [color, setColor] = useState<"w"|"b">("w");
  const [winner, setWinner] = useState<null | "w" | "b">(null);
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === INIT_GAME) {
        setBoard(chess.board());
        console.log("Thisispayload");
        console.log(message.payload);
        console.log(message.payload.color);
        if(message.payload.color==="white"){
          setColor("w");
        }else{
          setColor("b");
        }
        setWinner(null); // Reset winner on new game
        console.log("Game initialized");
      } else if (message.type === MOVE) {
        const move = message.payload;
        chess.move(move);
        setBoard(chess.board());
        console.log("Move received:", message.payload);
      }
      else if(message.type === "GAME_OVER"){
        // message.payload.color contains the winner's color ("w" or "b" or "white"/"black")
        let winColor = message.payload.winner;
        console.log(winColor);
        if (winColor === "white") winColor = "w";
        if (winColor === "black") winColor = "b";
        setWinner(winColor);
      }
    };
  }, [socket]);

  if (!socket) {
    return <div className="text-center text-red-500 text-xl mt-10">Connecting to the server...</div>;
  }
  console.log(color);
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="max-w-screen-lg w-full grid grid-cols-6 gap-6">
        <div className="col-span-4 bg-white shadow-lg rounded-lg p-4 flex flex-col items-center justify-center">
          {winner && (
            <div className="mb-4 text-2xl font-bold text-green-700">
              Game Over! Winner: {winner === "w" ? "White" : "Black"}
            </div>
          )}
          <Chessboard chess={chess} setBoard={setBoard} socket={socket} board={board} flipped={color==="b"}/>
        </div>

        <div className="col-span-2 bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <button
            onClick={() => {
              if (socket) {
                socket.send(JSON.stringify({ type: INIT_GAME }));
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};
