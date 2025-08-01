import { useEffect, useState } from "react";
import { Chessboard } from "../components/Chessboard/Chessboard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { Chat } from "../components/Chat/Chat";
import { useLocation } from "react-router-dom";
import { VideoCall } from "../components/VideoCall/VideoCall";

const INIT_GAME = "INIT_GAME";
const MOVE = "MOVE";

export const Game = () => {
  const socket = useSocket();
  const location = useLocation();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [color, setColor] = useState<"w" | "b">("w");
  const [winner, setWinner] = useState<null | "w" | "b">(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [roomError, setRoomError] = useState("");

  // Get roomId from query string
  const params = new URLSearchParams(location.search);
  const roomId = params.get("roomId");

  useEffect(() => {
    if (!socket) return;

    // Room join/create logic
    if (roomId) {
      const isCreator = location.state && location.state.created;
      if (isCreator) {
        socket.send(JSON.stringify({ type: "CREATE_ROOM", payload: { roomId } }));
        setWaiting(true);
      } else {
        socket.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomId } }));
        setWaiting(true);
      }
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "ROOM_CREATED") {
        // Wait for another player to join
        setWaiting(true);
      } else if (message.type === "ROOM_JOINED") {
        setWaiting(false);
        setGameStarted(true);
        setRoomError("");
      } else if (message.type === "ROOM_ERROR") {
        setRoomError(message.payload.error);
        setWaiting(false);
        setGameStarted(false);
      }

      if (message.type === INIT_GAME) {
        const newGame = new Chess();
        //setChess(newGame);
        setBoard(newGame.board());
        setGameStarted(true);
        setWinner(null);
        setChatMessages([]); // Clear chat on new game

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
      } else if (message.type === "CHAT") {
        setChatMessages((prev) => [...prev, { sender: message.payload.sender, text: message.payload.text }]);
      }
    };
  }, [socket]);

  const handleSendChat = (text: string) => {
    if (socket && text.trim() !== "") {
      socket.send(
        JSON.stringify({
          type: "CHAT",
          payload: { text },
        })
      );
    }
  };

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
  if (roomError) {
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        {roomError}
      </div>
    );
  }
  if (waiting) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-800 mb-4">Waiting for another player to join...</div>
          {roomId && (
            <div className="text-lg text-gray-600">Room ID: <span className="font-mono text-green-600">{roomId}</span></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="max-w-screen-lg w-full grid grid-cols-8 gap-6">
        {/* Video Call at the top, spanning all columns */}
        <div className="col-span-8 flex justify-center">
          <VideoCall socket={socket} roomId={roomId} isInitiator={!!(location.state && location.state.created)} />
        </div>
        {/* Chat */}
        <div className="col-span-2 bg-white shadow-lg rounded-lg p-4 flex flex-col h-[600px] max-h-[80vh] min-w-[220px]">
          <h2 className="text-lg font-semibold mb-2">Chat</h2>
          <Chat messages={chatMessages} onSend={handleSendChat} color={color} />
        </div>
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
