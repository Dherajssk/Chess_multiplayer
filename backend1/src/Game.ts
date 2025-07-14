import { Chess } from "chess.js";
import { WebSocket } from "ws";
const INIT_GAME="INIT_GAME";
const MOVE="MOVE";
const GAME_OVER="GAME_OVER";
export class Game{
    public player1: WebSocket;
    public player2:WebSocket;
    private board:Chess;
    private starttime:Date;
    public movescount=0;
    constructor(player1:WebSocket,player2:WebSocket){
         this.player1=player1;
         this.player2=player2;
         this.board=new Chess();
         this.starttime=new Date();
         this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color:"white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color:"black"
            }
        }));
    }
    makemove(socket:WebSocket,move:{
        from: string,
        to:string
    }){
        if(this.movescount %2===0 && socket!==this.player1){
            console.log("Player2 is not allowed to move");
            return;
        }
        if(this.movescount %2===1 && socket!==this.player2){
            //console.log(this.board.moves().length);
            console.log("Player1 is not allowed to move");
            return;
        }
        try{
            this.board.move(move);
            this.movescount++;
        }
        catch(e){
            console.log("errorrrrrrrrr");
            console.log(e);
            return;
        }

        if (this.movescount % 2 === 0) {
            //console.log("Going to send move of player2 to player1");
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        } else {
            //console.log("Going to send move of player1 to player2");
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }

        if (this.board.isGameOver()) {
            console.log("Game is over");
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

        
    }
}