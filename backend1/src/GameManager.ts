import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";



export class GameManager{
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor(){
        this.games =[];
        this.pendingUser= null;
        this.users =[];

    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandler(socket);

    }
    
    removeUser(socket: WebSocket){
        this.users = this.users.filter(user=>user!==socket);
       //stop the game here 

    }

    private addHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
    
            // Handle game initialization
            if (message.type === INIT_GAME) {
                if (this.pendingUser) {
                    // Pair the two users and start a new game
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                } else {
                    this.pendingUser = socket; // Wait for another user to join
                }
            }
    
            // Handle move message
            if (message.type === MOVE) {
                // Find the game that the current socket belongs to
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    // Make the move for the current player
                    game.makeMove(socket, message.payload.move);
    
                    // Determine the opponent socket
                    const opponent = game.player1 === socket ? game.player2 : game.player1;
    
                    // Relay the move to the opponent
                    opponent.send(JSON.stringify({
                        type: MOVE,
                        payload: {
                            move: message.payload.move
                        }
                    }));
                }
            }
        });
    }
    
}    