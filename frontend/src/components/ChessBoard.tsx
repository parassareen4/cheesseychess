import { Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({
  board,
  socket,
  setBoard,
  chess,
}: {
  chess: any;
  setBoard: any;
  board: (
    | {
        square: Square;
        type: PieceSymbol;
        color: Color;
      }
    | null
  )[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<null | Square>(null);

  useEffect(() => {
    // Listen for incoming messages from the socket
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === MOVE) {
        const { from, to } = message.payload.move;

        // Handle the move safely
        try {
          const moveResult = chess.move({ from, to });

          if (moveResult) {
            setBoard(chess.board());
          } else {
            console.error("Invalid move received:", from, to);
          }
        } catch (error) {
          console.error("Error processing move:", error);
        }
      }
    };

    // Cleanup the event listener on component unmount
    return () => {
      socket.onmessage = null;
    };
  }, [socket, chess, setBoard]);

  return (
    <div className="text-white-200">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squarerep = String.fromCharCode(97 + j) + (8 - i) as Square; // Correct square representation

              return (
                <div
                  onClick={() => {
                    if (!from) {
                      // Set the "from" square
                      setFrom(squarerep);
                    } else {
                      try {
                        // Attempt to move locally first
                        const moveResult = chess.move({
                          from,
                          to: squarerep,
                        });

                        if (moveResult) {
                          // Move is valid, send it to the server
                          socket.send(
                            JSON.stringify({
                              type: MOVE,
                              payload: {
                                move: {
                                  from,
                                  to: squarerep,
                                },
                              },
                            })
                          );

                          // Update the local board
                          setBoard(chess.board());
                        } else {
                          console.error("Invalid move:", from, squarerep);
                        }
                      } catch (error) {
                        console.error("Error processing move:", error);
                      } finally {
                        // Always reset the "from" state after an attempt
                        setFrom(null);
                      }
                    }
                  }}
                  key={j}
                  className={`w-16 h-16 ${
                    (i + j) % 2 === 0 ? "bg-green-500" : "bg-white"
                  }`} // Corrected the className template
                >
                  <div className="w-full justify-center flex h-full">
                    <div className="h-full justify-center flex flex-col">
                      {square ? (
                        <img
                          className="w-10"
                          src={`/${
                            square.color === "b"
                              ? square.type
                              : square.type.toUpperCase()
                          }.png`}
                          alt={`${square.color} ${square.type}`}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
