import type { Color, PieceSymbol, Square } from "chess.js";
import { useState, useRef } from "react";

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
  onDraw?: (reason: string) => void;
  playerColor: Color;
  disabled?: boolean;
};
type PromotionPiece = 'q' | 'r' | 'b' | 'n';
const promotionPieces: PromotionPiece[] = ['q', 'r', 'b', 'n'];

export const Chessboard: React.FC<ChessboardProps> = ({
  board,
  socket,
  chess,
  setBoard,
  flipped = false,
  onDraw,
  playerColor,
  disabled = false,
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [highlighted, setHighlighted] = useState<Square[]>([]);
  const [attackable, setAttackable] = useState<Square[]>([]);
  // Sound refs (must be inside the component function)
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);
  const [showPromotion, setShowPromotion] = useState(false);

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

  // Helper to check if a move is a pawn promotion
  function isPromotionMove(from: Square, to: Square): boolean {
    const piece = chess.get(from);
    if (!piece || piece.type !== 'p') return false;
    const lastRank = piece.color === 'w' ? '8' : '1';
    return to[1] === lastRank;
  }

  function handleSquareClick(square: Square, squareObj: any) {
    if (disabled) return;
    if (chess.turn() !== playerColor) return;
    if (!from) {
      if (squareObj && squareObj.color === playerColor) {
        setFrom(square);
        // Highlight possible moves for this piece
        const moves = chess.moves({ square, verbose: true }) as { to: Square, captured?: string, color: Color }[];
        setHighlighted(moves.map((m) => m.to));
        setAttackable(moves.filter((m) => m.captured).map((m) => m.to));
      }
    } else {
      if (squareObj && squareObj.color === playerColor) {
        setFrom(square);
        // Highlight new piece's moves
        const moves = chess.moves({ square, verbose: true }) as { to: Square, captured?: string, color: Color }[];
        setHighlighted(moves.map((m) => m.to));
        setAttackable(moves.filter((m) => m.captured).map((m) => m.to));
        return;
      }
      // Promotion detection
      if (isPromotionMove(from, square)) {
        setPromotionMove({ from, to: square });
        setShowPromotion(true);
        setHighlighted([]);
        setAttackable([]);
        return;
      }
      // Normal move
      sendMove({ from, to: square });
      setHighlighted([]);
      setAttackable([]);
    }
  }

  function sendMove(move: { from: Square; to: Square; promotion?: PromotionPiece }) {
    // Play move sound
    if (moveSoundRef.current) moveSoundRef.current.currentTime = 0;
    moveSoundRef.current?.play();
    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          move,
        },
      })
    );
    chess.move(move);
  setFrom(null);
  setHighlighted([]);
  setAttackable([]);
  setBoard(chess.board());
  setShowPromotion(false);
  setPromotionMove(null);
    // Check for threefold repetition
    if (chess.isThreefoldRepetition && chess.isThreefoldRepetition()) {
      // Play game over sound
      if (gameoverSoundRef.current) gameoverSoundRef.current.currentTime = 0;
      gameoverSoundRef.current?.play();
      if (typeof onDraw === 'function') {
        onDraw('threefold');
      }
    }
  }

  return (
    <div className="border-4 border-green-400 inline-block rounded-xl shadow-xl chessboard-container relative">
      {/* Audio elements for move and game over */}
      <audio ref={moveSoundRef} src="/move.mp3" preload="auto" />
      <audio ref={gameoverSoundRef} src="/gameover.mp3" preload="auto" />
      {/* Promotion Modal */}
      {showPromotion && promotionMove && (
        <div className="absolute z-50 left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center border-4 border-green-400">
            <div className="mb-3 font-bold text-lg text-black">Choose promotion piece:</div>
            <div className="flex gap-6">
              {promotionPieces.map((piece) => (
                <button
                  key={piece}
                  className="text-4xl p-3 border-2 border-green-600 rounded-lg bg-white hover:bg-green-200 focus:bg-green-300 focus:outline-none shadow-md"
                  style={{ color: '#222', minWidth: 56, minHeight: 56 }}
                  onClick={() => {
                    sendMove({ ...promotionMove, promotion: piece });
                  }}
                >
                  {piece === 'q' && <span style={{color: '#222'}}>♕</span>}
                  {piece === 'r' && <span style={{color: '#222'}}>♖</span>}
                  {piece === 'b' && <span style={{color: '#222'}}>♗</span>}
                  {piece === 'n' && <span style={{color: '#222'}}>♘</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {rowIndices.map((rowIdx) => (
        <div key={rowIdx} className="flex">
          {colIndices.map((colIdx) => {
            const square = board[rowIdx][colIdx];
            const squareName = getSquareName(rowIdx, colIdx);
            const isDark = (rowIdx + colIdx) % 2 !== 0;
            const bgColor = isDark ? "bg-green-700" : "bg-green-300";
            const textColor =
              square?.color === "w" ? "text-white" : "text-black";

            const isHighlighted = highlighted.includes(squareName);
            const isAttackable = attackable.includes(squareName);
            return (
              <div
                key={colIdx}
                onClick={() => handleSquareClick(squareName, square)}
                className={`w-12 h-12 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-150 ${bgColor} ${
                  square ? textColor : ""
                } ${from === squareName ? "ring-4 ring-yellow-400" : ""} ${isAttackable ? "ring-4 ring-red-500" : isHighlighted ? "ring-4 ring-blue-400" : ""} hover:scale-105 hover:z-10 relative`}
                style={{ boxShadow: isDark ? '0 2px 8px rgba(67,233,123,0.10)' : '0 2px 8px rgba(67,233,123,0.05)' }}
              >
                {square ? (
                  <>
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
                    {/* Red overlay for attackable opponent pieces */}
                    {isAttackable && square.color !== playerColor && (
                      <span className="absolute w-8 h-8 rounded-full bg-red-500 opacity-40 pointer-events-none" style={{zIndex:2}}></span>
                    )}
                  </>
                ) : (
                  ""
                )}
                {/* Highlight dot for empty highlighted squares */}
                {!square && isHighlighted && (
                  <span className="w-4 h-4 rounded-full bg-blue-400 opacity-60 inline-block"></span>
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
