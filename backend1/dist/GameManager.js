"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
        //stop the game here 
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            // Handle game initialization
            if (message.type === messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    // Pair the two users and start a new game
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket; // Wait for another user to join
                }
            }
            // Handle move message
            if (message.type === messages_1.MOVE) {
                // Find the game that the current socket belongs to
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    // Make the move for the current player
                    game.makeMove(socket, message.payload.move);
                    // Determine the opponent socket
                    const opponent = game.player1 === socket ? game.player2 : game.player1;
                    // Relay the move to the opponent
                    opponent.send(JSON.stringify({
                        type: messages_1.MOVE,
                        payload: {
                            move: message.payload.move
                        }
                    }));
                }
            }
        });
    }
}
exports.GameManager = GameManager;
