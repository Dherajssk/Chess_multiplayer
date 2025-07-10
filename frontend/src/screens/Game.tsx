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

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);

      if (message.type === INIT_GAME) {
        //const newGame = new Chess();
        //setChess(newGame);
        setBoard(chess.board());
        console.log("Game initialized");
      } else if (message.type === MOVE) {
        const move = message.payload;
        chess.move(move);
        setBoard(chess.board());
        console.log("Move received:", message.payload);
      }
    };
  }, [socket]);

  if (!socket) {
    return <div className="text-center text-red-500 text-xl mt-10">Connecting to the server...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="max-w-screen-lg w-full grid grid-cols-6 gap-6">
        <div className="col-span-4 bg-white shadow-lg rounded-lg p-4 flex justify-center items-center">
          <Chessboard chess={chess} setBoard={setBoard} socket={socket} board={board} />
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
