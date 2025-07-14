import { WebSocket } from "ws";
import { Game } from "./Game";
const INIT_GAME="INIT_GAME";
const MOVE="MOVE";
const CREATE_ROOM = "CREATE_ROOM";
const JOIN_ROOM = "JOIN_ROOM";
const ROOM_CREATED = "ROOM_CREATED";
const ROOM_JOINED = "ROOM_JOINED";
const ROOM_ERROR = "ROOM_ERROR";

export class Gamemanager{
    private games: Game[];
    private pendinguser: WebSocket | null;
    private users:WebSocket[];
    private rooms: { [roomId: string]: { host: WebSocket, guest?: WebSocket } } = {};
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
        // Remove from rooms if present
        for (const roomId in this.rooms) {
            if (this.rooms[roomId].host === socket) {
                delete this.rooms[roomId];
            } else if (this.rooms[roomId].guest === socket) {
                delete this.rooms[roomId].guest;
            }
        }
    }
    private addhandler(socket:WebSocket){
        socket.on("message",(data)=>{
           const message = JSON.parse(data.toString());
           console.log("Received message:", message);
          // Relay WebRTC signaling messages
          const SIGNAL_TYPES = ["VIDEO_OFFER", "VIDEO_ANSWER", "VIDEO_ICE"];
          if (SIGNAL_TYPES.includes(message.type)) {
              const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
              if (game) {
                  const target = (game.player1 === socket) ? game.player2 : game.player1;
                  target.send(JSON.stringify(message));
              }
              return;
          }
          // Room creation
          if (message.type === CREATE_ROOM) {
              // Use provided roomId if present, else generate one
              const roomId = message.payload && message.payload.roomId ? message.payload.roomId : Math.random().toString(36).substr(2, 8);
              this.rooms[roomId] = { host: socket };
              socket.send(JSON.stringify({ type: ROOM_CREATED, payload: { roomId } }));
              return;
          }
          // Room joining
          if (message.type === JOIN_ROOM) {
              const { roomId } = message.payload;
              const room = this.rooms[roomId];
              if (!room) {
                  socket.send(JSON.stringify({ type: ROOM_ERROR, payload: { error: "Room not found" } }));
                  return;
              }
              if (room.guest) {
                  socket.send(JSON.stringify({ type: ROOM_ERROR, payload: { error: "Room full" } }));
                  return;
              }
              room.guest = socket;
              // Notify both players
              room.host.send(JSON.stringify({ type: ROOM_JOINED, payload: { roomId, role: "host" } }));
              room.guest.send(JSON.stringify({ type: ROOM_JOINED, payload: { roomId, role: "guest" } }));
              // Start the game for both
              const game = new Game(room.host, room.guest);
              this.games.push(game);
              delete this.rooms[roomId];
              return;
          }
           if(message.type === INIT_GAME){
              // Old quick match logic (keep for fallback/testing)
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
           // Handle chat messages
           if(message.type === "CHAT") {
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
        })
    }
}