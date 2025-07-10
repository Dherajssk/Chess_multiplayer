"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const INIT_GAME = "INIT_GAME";
const MOVE = "MOVE";
const GAME_OVER = "game_over";
class Game {
    constructor(player1, player2) {
        this.movescount = 0;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.starttime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    makemove(socket, move) {
        if (this.movescount % 2 === 0 && socket !== this.player1) {
            console.log("return 1stif");
            return;
        }
        if (this.movescount % 2 === 1 && socket !== this.player2) {
            console.log(this.board.moves().length);
            console.log("return 2ndif");
            return;
        }
        try {
            this.board.move(move);
            this.movescount++;
        }
        catch (e) {
            console.log("errorrrrrrrrr");
            console.log(e);
            return;
        }
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }
        if (this.movescount % 2 === 0) {
            console.log("Going to send move of player2 to player1");
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }
        else {
            console.log("Going to send move of player1 to player2");
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }
    }
}
exports.Game = Game;
