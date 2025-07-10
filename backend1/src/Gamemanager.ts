import { WebSocket } from "ws";
import { Game } from "./Game";
const INIT_GAME="INIT_GAME";
const MOVE="MOVE";
export class Gamemanager{
    private games: Game[];
    private pendinguser: WebSocket | null;
    private users:WebSocket[];
    constructor(){
        this.games=[];
        this.pendinguser=null;
        this.users=[];
    }
    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addhandler(socket);
    }
    removeuser(socket:WebSocket){
        this.users = this.users.filter(user => user!==socket);
    }
    private addhandler(socket:WebSocket){
        socket.on("message",(data)=>{
           const message = JSON.parse(data.toString());
           console.log("Received message:", message);
           if(message.type === INIT_GAME){
               if(this.pendinguser){
                    console.log("User2 connected");
                    const game=new Game(this.pendinguser,socket);
                    this.games.push(game);
                    this.pendinguser=null;
               }
               else{
                console.log("User1 connected");
                this.pendinguser=socket;
               }
           }
           if(message.type === MOVE){
            console.log("inside move");
               const game=this.games.find(game=> game.player1===socket||game.player2===socket);
               if(game){
                  console.log(message.payload.move);
                  game.makemove(socket,message.payload.move);
               }
               
           }
        })
    }
}