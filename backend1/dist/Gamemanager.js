"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gamemanager = void 0;
const Game_1 = require("./Game");
const INIT_GAME = "INIT_GAME";
const MOVE = "MOVE";
class Gamemanager {
    constructor() {
        this.games = [];
        this.pendinguser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addhandler(socket);
    }
    removeuser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }
    addhandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log("Received message:", message);
            if (message.type === INIT_GAME) {
                if (this.pendinguser) {
                    console.log("User2 connected");
                    const game = new Game_1.Game(this.pendinguser, socket);
                    this.games.push(game);
                    this.pendinguser = null;
                }
                else {
                    console.log("User1 connected");
                    this.pendinguser = socket;
                }
            }
            if (message.type === MOVE) {
                console.log("inside move");
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    console.log(message.payload.move);
                    game.makemove(socket, message.payload.move);
                }
            }
            // Handle chat messages
            if (message.type === "CHAT") {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    const chatMsg = {
                        type: "CHAT",
                        payload: {
                            sender: socket === game.player1 ? "white" : "black",
                            text: message.payload.text
                        }
                    };
                    game.player1.send(JSON.stringify(chatMsg));
                    game.player2.send(JSON.stringify(chatMsg));
                }
            }
        });
    }
}
exports.Gamemanager = Gamemanager;
